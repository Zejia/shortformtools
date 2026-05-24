const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const compact = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const presets = {
  US: { label: "United States", currency: "USD", rate: 0.03, flat: 0.25, symbol: "$" },
  UK: { label: "United Kingdom", currency: "GBP", rate: 0.04, flat: 0.2, symbol: "£" },
  CA: { label: "Canada domestic / US orders", currency: "CAD", rate: 0.03, flat: 0.25, symbol: "$" },
  CA_INTL: { label: "Canada international", currency: "CAD", rate: 0.04, flat: 0.25, symbol: "$" },
  AU: { label: "Australia domestic", currency: "AUD", rate: 0.03, flat: 0.25, symbol: "$" },
  AU_INTL: { label: "Australia international", currency: "AUD", rate: 0.04, flat: 0.25, symbol: "$" },
  EU: { label: "EU common Etsy Payments rate", currency: "EUR", rate: 0.04, flat: 0.3, symbol: "€" },
  CUSTOM: { label: "Custom", currency: "USD", rate: 0.03, flat: 0.25, symbol: "$" }
};

function byId(id) {
  return document.getElementById(id);
}

function val(id) {
  const raw = byId(id)?.value ?? 0;
  return Number(String(raw).replaceAll(",", "")) || 0;
}

function bool(id) {
  return Boolean(byId(id)?.checked);
}

function text(id, value) {
  const el = byId(id);
  if (el) el.textContent = value;
}

function currencyFormatter(currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 });
}

function pct(value) {
  return `${compact.format(value)}%`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function currentPreset() {
  const key = byId("countryPreset")?.value || "US";
  return presets[key] || presets.US;
}

function readInputs(overrides = {}) {
  const preset = currentPreset();
  const customPayment = byId("countryPreset")?.value === "CUSTOM";
  return {
    preset,
    price: "price" in overrides ? overrides.price : val("itemPrice"),
    quantity: Math.max(1, val("quantity") || 1),
    shippingCharged: val("shippingCharged"),
    giftWrapCharged: val("giftWrapCharged"),
    itemCost: val("itemCost"),
    shippingCost: val("shippingCost"),
    packagingCost: val("packagingCost"),
    laborCost: val("laborCost"),
    adSpend: val("adSpend"),
    discountRate: clamp(val("discountRate"), 0, 100) / 100,
    discountFixed: val("discountFixed"),
    taxCollected: val("taxCollected"),
    listingUnits: Math.max(0, val("listingUnits")),
    paymentRate: (customPayment ? val("paymentRate") : preset.rate * 100) / 100,
    paymentFlat: customPayment ? val("paymentFlat") : preset.flat,
    offsiteRate: val("offsiteRate") / 100,
    currencyConversion: bool("currencyConversion"),
    regulatoryRate: val("regulatoryRate") / 100,
    digitalMode: bool("digitalMode")
  };
}

function calculate(inputs) {
  const itemSubtotal = inputs.price * inputs.quantity;
  const rawDiscount = itemSubtotal * inputs.discountRate + inputs.discountFixed;
  const discount = clamp(rawDiscount, 0, itemSubtotal);
  const itemRevenue = itemSubtotal - discount;
  const shippingRevenue = inputs.shippingCharged;
  const giftWrapRevenue = inputs.giftWrapCharged;
  const sellerRevenue = itemRevenue + shippingRevenue + giftWrapRevenue;
  const orderTotalForFees = sellerRevenue;
  const orderTotalWithTax = orderTotalForFees + inputs.taxCollected;
  const listingFee = 0.2 * inputs.listingUnits;
  const transactionFee = 0.065 * orderTotalForFees;
  const paymentFee = inputs.paymentRate * orderTotalWithTax + inputs.paymentFlat;
  const offsiteAdsFee = inputs.offsiteRate * orderTotalWithTax;
  const conversionFee = inputs.currencyConversion ? 0.025 * orderTotalForFees : 0;
  const regulatoryFee = inputs.regulatoryRate * orderTotalForFees;
  const platformFees = listingFee + transactionFee + paymentFee + offsiteAdsFee + conversionFee + regulatoryFee;
  const productCost = inputs.itemCost * inputs.quantity;
  const operatingCost = productCost + inputs.shippingCost + inputs.packagingCost + inputs.laborCost + inputs.adSpend;
  const totalCost = platformFees + operatingCost;
  const profit = sellerRevenue - totalCost;
  const margin = sellerRevenue > 0 ? (profit / sellerRevenue) * 100 : 0;
  const feeRate = sellerRevenue > 0 ? (platformFees / sellerRevenue) * 100 : 0;
  const costRate = sellerRevenue > 0 ? (operatingCost / sellerRevenue) * 100 : 0;

  return {
    itemSubtotal,
    discount,
    itemRevenue,
    sellerRevenue,
    orderTotalWithTax,
    listingFee,
    transactionFee,
    paymentFee,
    offsiteAdsFee,
    conversionFee,
    regulatoryFee,
    platformFees,
    productCost,
    operatingCost,
    totalCost,
    profit,
    margin,
    feeRate,
    costRate,
    effectivePaymentRate: inputs.paymentRate * 100
  };
}

function findBreakEvenPrice(baseInputs) {
  let low = 0;
  let high = Math.max(10, baseInputs.price * 3, baseInputs.itemCost * 4 + baseInputs.shippingCost + 20);
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const result = calculate({ ...baseInputs, price: mid });
    if (result.profit >= 0) high = mid;
    else low = mid;
  }
  return high;
}

function health(result) {
  if (result.profit < 0) return ["Losing money", "bad"];
  if (result.margin < 10) return ["Thin margin", "warn"];
  if (result.margin < 25) return ["Workable", "ok"];
  return ["Healthy", "good"];
}

function renderBreakdown(result, fmt) {
  const rows = [
    ["Listing fees", result.listingFee],
    ["Transaction fee", result.transactionFee],
    ["Payment processing", result.paymentFee],
    ["Offsite Ads", result.offsiteAdsFee],
    ["Currency conversion", result.conversionFee],
    ["Regulatory fee", result.regulatoryFee],
    ["Product and fulfillment cost", result.operatingCost]
  ];
  const container = byId("feeBreakdown");
  if (!container) return;
  container.innerHTML = rows
    .map(([label, amount]) => `<div class="break-row"><span>${label}</span><strong>${fmt.format(amount)}</strong></div>`)
    .join("");
}

function scenario(label, inputs, patch = {}) {
  const merged = { ...inputs, ...patch };
  const result = calculate(merged);
  return { label, result, inputs: merged };
}

function renderScenarios(inputs, fmt) {
  const scenarios = [
    scenario("Current setup", inputs),
    scenario("No discount", inputs, { discountRate: 0, discountFixed: 0 }),
    scenario("Offsite ad sale", inputs, { offsiteRate: inputs.offsiteRate || 0.15 }),
    scenario("Raise price 10%", inputs, { price: inputs.price * 1.1 })
  ];
  const container = byId("scenarioRows");
  if (!container) return;
  container.innerHTML = scenarios
    .map(({ label, result }) => {
      const [status, tone] = health(result);
      return `<tr>
        <td>${label}</td>
        <td>${fmt.format(result.profit)}</td>
        <td>${pct(result.margin)}</td>
        <td>${fmt.format(result.platformFees)}</td>
        <td><span class="status ${tone}">${status}</span></td>
      </tr>`;
    })
    .join("");
}

function renderRecommendations(inputs, result, breakEven, fmt) {
  const notes = [];
  if (result.profit < 0) {
    notes.push(`You are below break-even. At the current cost structure, the item price needs to be about ${fmt.format(breakEven)} before this order stops losing money.`);
  }
  if (inputs.offsiteRate >= 0.12 && result.margin < 20) {
    notes.push("Offsite Ads materially changes the order economics. Consider separate pricing for promoted listings or a minimum margin rule before running discounts.");
  }
  if (inputs.discountRate > 0.15 && result.margin < 20) {
    notes.push("The discount is doing more damage than it appears because Etsy fees still apply after shipping and payment processing.");
  }
  if (inputs.shippingCharged < inputs.shippingCost) {
    notes.push("Shipping is subsidized on this order. That can help conversion, but it should be visible in your pricing model.");
  }
  if (result.feeRate > 20) {
    notes.push("Platform fees are taking more than 20% of seller revenue. Check payment country, Offsite Ads, and currency conversion assumptions.");
  }
  if (!notes.length) {
    notes.push("This setup looks usable. Keep a saved scenario for discounted orders and another for Offsite Ads so you do not price from the best case only.");
  }
  const list = byId("insightsList");
  if (list) list.innerHTML = notes.map((item) => `<li>${item}</li>`).join("");
}

function exportCsv(inputs, result) {
  const rows = [
    ["Metric", "Value"],
    ["Item price", inputs.price],
    ["Quantity", inputs.quantity],
    ["Seller revenue", result.sellerRevenue],
    ["Discount", result.discount],
    ["Platform fees", result.platformFees],
    ["Operating cost", result.operatingCost],
    ["Net profit", result.profit],
    ["Profit margin", result.margin],
    ["Fee rate", result.feeRate]
  ];
  return rows.map((row) => row.join(",")).join("\n");
}

function readDigitalBreakEvenInputs() {
  return {
    upfrontCost: Math.max(0, val("digitalUpfrontCost")),
    monthlyCost: Math.max(0, val("digitalMonthlyCost")),
    paybackMonths: Math.max(1, val("digitalPaybackMonths") || 1),
    expectedSales: Math.max(0, val("digitalExpectedSales"))
  };
}

function digitalBreakEvenPlan(baseInputs, recoveryInputs, patch = {}) {
  const inputs = { ...baseInputs, ...patch, digitalMode: true };
  const result = calculate(inputs);
  const costToRecover = recoveryInputs.upfrontCost + recoveryInputs.monthlyCost * recoveryInputs.paybackMonths;
  const salesToRecover = result.profit > 0 ? Math.ceil(costToRecover / result.profit) : Infinity;
  const monthlyProfit = result.profit * recoveryInputs.expectedSales - recoveryInputs.monthlyCost;
  const monthsToRecover = monthlyProfit > 0 && recoveryInputs.upfrontCost > 0
    ? recoveryInputs.upfrontCost / monthlyProfit
    : (recoveryInputs.upfrontCost > 0 ? Infinity : 0);

  return {
    inputs,
    result,
    costToRecover,
    salesToRecover,
    monthlyProfit,
    monthsToRecover
  };
}

function digitalStatus(plan) {
  if (plan.result.profit <= 0) return ["No break-even", "bad"];
  if (plan.monthlyProfit <= 0) return ["Not recovered monthly", "bad"];
  if (plan.monthsToRecover > 6) return ["Slow payback", "warn"];
  if (plan.monthsToRecover > 3) return ["Workable", "ok"];
  return ["Fast payback", "good"];
}

function salesLabel(value) {
  return Number.isFinite(value) ? compact.format(value) : "N/A";
}

function monthsLabel(value) {
  return Number.isFinite(value) ? compact.format(value) : "N/A";
}

function renderDigitalBreakEvenRows(baseInputs, recoveryInputs, fmt) {
  const rows = [
    ["Current digital listing", digitalBreakEvenPlan(baseInputs, recoveryInputs)],
    ["20% launch coupon", digitalBreakEvenPlan(baseInputs, recoveryInputs, { discountRate: 0.2 })],
    ["Offsite Ads stress", digitalBreakEvenPlan(baseInputs, recoveryInputs, { offsiteRate: baseInputs.offsiteRate || 0.15 })],
    ["Price raised $2", digitalBreakEvenPlan(baseInputs, recoveryInputs, { price: baseInputs.price + 2 })]
  ];
  const container = byId("digitalBreakEvenRows");
  if (!container) return;
  container.innerHTML = rows
    .map(([label, plan]) => {
      const [status, tone] = digitalStatus(plan);
      return `<tr>
        <td>${label}</td>
        <td>${fmt.format(plan.result.profit)}</td>
        <td>${salesLabel(plan.salesToRecover)}</td>
        <td>${fmt.format(plan.monthlyProfit)}</td>
        <td><span class="status ${tone}">${status}</span></td>
      </tr>`;
    })
    .join("");
}

function renderDigitalBreakEvenInsights(plan, recoveryInputs, fmt) {
  const notes = [];
  if (plan.result.profit <= 0) {
    notes.push("This listing does not produce positive profit per sale under the current assumptions. Raise price, reduce per-sale support cost, or remove discount/ad stress before estimating payback.");
  } else {
    notes.push(`${salesLabel(plan.salesToRecover)} sales are needed to recover ${fmt.format(plan.costToRecover)} across the ${compact.format(recoveryInputs.paybackMonths)} month payback window.`);
  }
  if (plan.monthlyProfit <= 0) {
    notes.push("Expected monthly sales do not cover monthly tool costs after Etsy fees and support cost.");
  } else if (Number.isFinite(plan.monthsToRecover)) {
    notes.push(`At ${compact.format(recoveryInputs.expectedSales)} expected monthly sales, the upfront cost pays back in about ${monthsLabel(plan.monthsToRecover)} months.`);
  }
  if (plan.result.profit > 0 && plan.salesToRecover > recoveryInputs.expectedSales * recoveryInputs.paybackMonths) {
    notes.push("The required break-even sales exceed your expected sales in the target window. Consider a higher price, a bundle, or a lower launch-cost plan.");
  }
  if (plan.result.feeRate > 20) {
    notes.push("Fees are a large share of this low-ticket digital order, so small price changes can move payback faster than they appear.");
  }

  const list = byId("digitalBreakEvenInsights");
  if (list) list.innerHTML = notes.map((item) => `<li>${item}</li>`).join("");
}

function exportDigitalBreakEvenCsv(plan, recoveryInputs) {
  const rows = [
    ["Metric", "Value"],
    ["Item price", plan.inputs.price],
    ["Profit per sale", plan.result.profit],
    ["Profit margin percent", plan.result.margin],
    ["One-time design and launch cost", recoveryInputs.upfrontCost],
    ["Monthly tool cost", recoveryInputs.monthlyCost],
    ["Target payback months", recoveryInputs.paybackMonths],
    ["Expected monthly sales", recoveryInputs.expectedSales],
    ["Cost to recover", plan.costToRecover],
    ["Sales needed to break even", Number.isFinite(plan.salesToRecover) ? plan.salesToRecover : "N/A"],
    ["Monthly profit after tools", plan.monthlyProfit],
    ["Months to recover upfront", Number.isFinite(plan.monthsToRecover) ? plan.monthsToRecover : "N/A"]
  ];
  return rows.map((row) => row.join(",")).join("\n");
}

function calculateDigitalBreakEven() {
  const tool = document.querySelector("[data-tool='digital-break-even']");
  if (!tool) return;
  const baseInputs = readInputs();
  const recoveryInputs = readDigitalBreakEvenInputs();
  const fmt = currencyFormatter(baseInputs.preset.currency);
  const plan = digitalBreakEvenPlan(baseInputs, recoveryInputs);
  const [status, tone] = digitalStatus(plan);

  text("digitalBreakEvenSales", salesLabel(plan.salesToRecover));
  text("digitalProfitPerSale", fmt.format(plan.result.profit));
  text("digitalCostToRecover", fmt.format(plan.costToRecover));
  text("digitalMonthlyProfit", fmt.format(plan.monthlyProfit));
  text("digitalMonthsToRecover", monthsLabel(plan.monthsToRecover));
  text("digitalBreakEvenStatus", status);
  text("digitalBreakEvenFormula", `Break-even sales = (${fmt.format(recoveryInputs.upfrontCost)} one-time cost + ${fmt.format(recoveryInputs.monthlyCost)} monthly tools x ${compact.format(recoveryInputs.paybackMonths)} months) / ${fmt.format(plan.result.profit)} profit per sale = ${salesLabel(plan.salesToRecover)} sales.`);

  const statusEl = byId("digitalBreakEvenStatus");
  if (statusEl) statusEl.className = `status ${tone}`;

  renderDigitalBreakEvenRows(baseInputs, recoveryInputs, fmt);
  renderDigitalBreakEvenInsights(plan, recoveryInputs, fmt);

  window.currentDigitalBreakEvenReport = {
    baseInputs,
    recoveryInputs,
    plan,
    csv: exportDigitalBreakEvenCsv(plan, recoveryInputs),
    fmtCurrency: baseInputs.preset.currency
  };
}

function bindDigitalBreakEven() {
  const tool = document.querySelector("[data-tool='digital-break-even']");
  if (!tool) return;
  tool.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", calculateDigitalBreakEven);
    input.addEventListener("change", calculateDigitalBreakEven);
  });

  byId("copyDigitalBreakEven")?.addEventListener("click", async () => {
    const report = window.currentDigitalBreakEvenReport;
    if (!report) return;
    const fmt = currencyFormatter(report.fmtCurrency);
    const summary = `Etsy digital product break-even plan
Profit per sale: ${fmt.format(report.plan.result.profit)}
Cost to recover: ${fmt.format(report.plan.costToRecover)}
Sales needed to break even: ${salesLabel(report.plan.salesToRecover)}
Expected monthly sales: ${compact.format(report.recoveryInputs.expectedSales)}
Monthly profit after tools: ${fmt.format(report.plan.monthlyProfit)}
Months to recover upfront: ${monthsLabel(report.plan.monthsToRecover)}`;
    await navigator.clipboard.writeText(summary);
    text("copyDigitalBreakEven", "Copied");
    setTimeout(() => text("copyDigitalBreakEven", "Copy break-even plan"), 1200);
  });

  byId("downloadDigitalBreakEvenCsv")?.addEventListener("click", () => {
    const report = window.currentDigitalBreakEvenReport;
    if (!report) return;
    const blob = new Blob([report.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "etsy-digital-product-break-even.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  calculateDigitalBreakEven();
}

function readTargetGoal() {
  return {
    mode: byId("targetMode")?.value || "margin",
    margin: clamp(val("targetMargin"), 0, 90),
    profit: Math.max(0, val("targetProfit"))
  };
}

function targetReached(result, goal) {
  if (goal.mode === "profit") return result.profit >= goal.profit;
  return result.margin >= goal.margin && result.profit >= 0;
}

function findTargetPrice(baseInputs, goal) {
  let low = 0;
  let high = Math.max(10, baseInputs.price * 2, baseInputs.itemCost * baseInputs.quantity * 4 + baseInputs.shippingCost + 20);
  let highResult = calculate({ ...baseInputs, price: high });

  for (let i = 0; i < 24 && !targetReached(highResult, goal); i += 1) {
    low = high;
    high *= 1.8;
    highResult = calculate({ ...baseInputs, price: high });
    if (high > 100000) break;
  }

  if (!targetReached(highResult, goal)) {
    return { price: high, result: highResult, solved: false };
  }

  for (let i = 0; i < 70; i += 1) {
    const mid = (low + high) / 2;
    const result = calculate({ ...baseInputs, price: mid });
    if (targetReached(result, goal)) high = mid;
    else low = mid;
  }

  const price = Math.ceil(high * 100) / 100;
  return { price, result: calculate({ ...baseInputs, price }), solved: true };
}

function renderTargetScenarios(inputs, goal, solved, fmt) {
  const rows = [
    ["Solved price", solved.price, calculate({ ...inputs, price: solved.price })],
    ["10% lower", solved.price * 0.9, calculate({ ...inputs, price: solved.price * 0.9 })],
    ["10% higher", solved.price * 1.1, calculate({ ...inputs, price: solved.price * 1.1 })],
    ["Offsite Ads stress", solved.price, calculate({ ...inputs, price: solved.price, offsiteRate: inputs.offsiteRate || 0.15 })]
  ];
  const container = byId("targetScenarioRows");
  if (!container) return;
  container.innerHTML = rows
    .map(([label, price, result]) => {
      const [status, tone] = targetReached(result, goal) ? ["Meets target", "good"] : health(result);
      return `<tr>
        <td>${label}</td>
        <td>${fmt.format(price)}</td>
        <td>${fmt.format(result.profit)}</td>
        <td>${pct(result.margin)}</td>
        <td><span class="status ${tone}">${status}</span></td>
      </tr>`;
    })
    .join("");
}

function renderTargetInsights(inputs, goal, solved, breakEven, fmt) {
  const currentResult = calculate(inputs);
  const notes = [];
  if (!solved.solved) {
    notes.push("The requested target is too aggressive for the current fee and discount assumptions. Lower the target, reduce costs, or remove the ad/discount stress test.");
  } else if (solved.price > inputs.price * 1.25) {
    notes.push(`The target price is more than 25% above the current item price. Consider whether the product needs a bundle, stronger photos, or clearer value framing before raising price.`);
  } else if (solved.price < inputs.price) {
    notes.push("The current item price already clears this target under the entered assumptions. Use the lower scenario table to decide how much discount room you have.");
  } else {
    notes.push("This target looks reachable from the current price structure. Save this as the minimum before launching a coupon or ad test.");
  }
  if (inputs.offsiteRate >= 0.12) {
    notes.push("Offsite Ads are included in the target. That makes the suggested price more conservative, which is useful for promoted listings.");
  }
  if (inputs.shippingCharged < inputs.shippingCost) {
    notes.push("Shipping is subsidized. The solver is pushing that gap into item price, so check whether buyers will accept the total price.");
  }
  notes.push(`Break-even sits around ${fmt.format(breakEven)}; the target price adds profit buffer above that floor.`);

  const list = byId("targetInsights");
  if (list) list.innerHTML = notes.map((item) => `<li>${item}</li>`).join("");

  return currentResult;
}

function exportTargetCsv(inputs, goal, solved, breakEven) {
  const rows = [
    ["Metric", "Value"],
    ["Goal mode", goal.mode],
    ["Target margin percent", goal.margin],
    ["Target profit", goal.profit],
    ["Current item price", inputs.price],
    ["Suggested item price", solved.price],
    ["Expected profit", solved.result.profit],
    ["Expected margin", solved.result.margin],
    ["Break-even item price", breakEven],
    ["Platform fees at target", solved.result.platformFees],
    ["Operating cost", solved.result.operatingCost],
    ["Offsite Ads percent", inputs.offsiteRate * 100],
    ["Discount percent", inputs.discountRate * 100]
  ];
  return rows.map((row) => row.join(",")).join("\n");
}

function updateFormula(inputs, result, fmt) {
  const formula = `Profit = ${fmt.format(result.sellerRevenue)} revenue - ${fmt.format(result.platformFees)} Etsy/payment fees - ${fmt.format(result.operatingCost)} product, shipping, labor, packaging and ad cost = ${fmt.format(result.profit)}.`;
  text("formulaLine", formula);
}

function calculateAndRender() {
  const inputs = readInputs();
  const fmt = currencyFormatter(inputs.preset.currency);
  const result = calculate(inputs);
  const breakEven = findBreakEvenPrice(inputs);
  const [status, tone] = health(result);

  text("currencyLabel", inputs.preset.currency);
  text("netProfit", fmt.format(result.profit));
  text("sellerRevenue", fmt.format(result.sellerRevenue));
  text("totalFees", fmt.format(result.platformFees));
  text("totalCosts", fmt.format(result.operatingCost));
  text("profitMargin", pct(result.margin));
  text("feeRate", pct(result.feeRate));
  text("breakEvenPrice", fmt.format(breakEven));
  text("statusLabel", status);
  text("paymentPresetText", `${inputs.preset.label}: ${pct(inputs.paymentRate * 100)} + ${fmt.format(inputs.paymentFlat)}`);

  const statusEl = byId("statusLabel");
  if (statusEl) statusEl.className = `status ${tone}`;
  const meter = byId("profitMeter");
  if (meter) meter.style.setProperty("--value", `${clamp(result.margin, 0, 45) / 45 * 100}%`);

  renderBreakdown(result, fmt);
  renderScenarios(inputs, fmt);
  renderRecommendations(inputs, result, breakEven, fmt);
  updateFormula(inputs, result, fmt);

  window.currentReport = { inputs, result, csv: exportCsv(inputs, result), fmtCurrency: inputs.preset.currency };
  calculateDigitalBreakEven();
}

function bindCalculator() {
  const tool = document.querySelector("[data-tool='etsy-calculator']");
  if (!tool) return;

  tool.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", calculateAndRender);
    input.addEventListener("change", calculateAndRender);
  });

  byId("countryPreset")?.addEventListener("change", () => {
    const preset = currentPreset();
    if (byId("countryPreset").value !== "CUSTOM") {
      byId("paymentRate").value = compact.format(preset.rate * 100);
      byId("paymentFlat").value = preset.flat;
    }
    calculateAndRender();
  });

  byId("digitalMode")?.addEventListener("change", () => {
    if (bool("digitalMode")) {
      byId("shippingCharged").value = 0;
      byId("shippingCost").value = 0;
      byId("packagingCost").value = 0;
    }
    calculateAndRender();
  });

  byId("copySummary")?.addEventListener("click", async () => {
    const report = window.currentReport;
    if (!report) return;
    const fmt = currencyFormatter(report.fmtCurrency);
    const summary = `Etsy order estimate
Revenue: ${fmt.format(report.result.sellerRevenue)}
Fees: ${fmt.format(report.result.platformFees)}
Costs: ${fmt.format(report.result.operatingCost)}
Net profit: ${fmt.format(report.result.profit)}
Margin: ${pct(report.result.margin)}`;
    await navigator.clipboard.writeText(summary);
    text("copySummary", "Copied");
    setTimeout(() => text("copySummary", "Copy summary"), 1200);
  });

  byId("downloadCsv")?.addEventListener("click", () => {
    const report = window.currentReport;
    if (!report) return;
    const blob = new Blob([report.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "etsy-profit-estimate.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.preset;
      if (type === "digital") {
        byId("itemPrice").value = 8;
        byId("quantity").value = 1;
        byId("itemCost").value = 0.35;
        byId("shippingCharged").value = 0;
        byId("shippingCost").value = 0;
        byId("packagingCost").value = 0;
        byId("digitalMode").checked = true;
      }
      if (type === "pod") {
        byId("itemPrice").value = 24;
        byId("quantity").value = 1;
        byId("itemCost").value = 13.4;
        byId("shippingCharged").value = 4.99;
        byId("shippingCost").value = 4.99;
        byId("packagingCost").value = 0;
        byId("digitalMode").checked = false;
      }
      if (type === "discount") {
        byId("discountRate").value = 20;
        byId("offsiteRate").value = 15;
      }
      calculateAndRender();
    });
  });

  document.querySelectorAll("[data-coupon-rate]").forEach((button) => {
    button.addEventListener("click", () => {
      byId("discountRate").value = button.dataset.couponRate || 0;
      calculateAndRender();
      document.querySelectorAll("[data-coupon-rate]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
    });
  });

  calculateAndRender();
}

function calculateTargetAndRender() {
  const inputs = readInputs();
  const goal = readTargetGoal();
  const fmt = currencyFormatter(inputs.preset.currency);
  const solved = findTargetPrice(inputs, goal);
  const breakEven = findBreakEvenPrice(inputs);
  const currentResult = renderTargetInsights(inputs, goal, solved, breakEven, fmt);
  const [status, tone] = solved.solved ? health(solved.result) : ["Needs manual review", "bad"];
  const displayStatus = solved.solved && targetReached(solved.result, goal) ? status : "Needs manual review";

  text("currencyLabel", inputs.preset.currency);
  text("paymentPresetText", `${inputs.preset.label}: ${pct(inputs.paymentRate * 100)} + ${fmt.format(inputs.paymentFlat)}`);
  text("targetPriceResult", solved.solved ? fmt.format(solved.price) : "No safe price");
  text("targetExpectedProfit", fmt.format(solved.result.profit));
  text("targetExpectedMargin", pct(solved.result.margin));
  text("breakEvenPrice", fmt.format(breakEven));
  text("currentPriceGap", fmt.format(solved.price - inputs.price));
  text("totalFees", fmt.format(solved.result.platformFees));
  text("totalCosts", fmt.format(solved.result.operatingCost));
  text("statusLabel", displayStatus);

  const statusEl = byId("statusLabel");
  if (statusEl) statusEl.className = `status ${solved.solved ? tone : "bad"}`;
  const meter = byId("profitMeter");
  if (meter) meter.style.setProperty("--value", `${clamp(solved.result.margin, 0, 45) / 45 * 100}%`);

  const goalText = goal.mode === "profit" ? `${fmt.format(goal.profit)} profit` : `${pct(goal.margin)} margin`;
  text("formulaLine", `To target ${goalText}, price around ${fmt.format(solved.price)}. At that price, estimated revenue is ${fmt.format(solved.result.sellerRevenue)}, fees are ${fmt.format(solved.result.platformFees)}, operating costs are ${fmt.format(solved.result.operatingCost)}, and profit is ${fmt.format(solved.result.profit)}.`);

  renderTargetScenarios(inputs, goal, solved, fmt);
  window.currentTargetReport = {
    inputs,
    goal,
    solved,
    breakEven,
    currentResult,
    csv: exportTargetCsv(inputs, goal, solved, breakEven),
    fmtCurrency: inputs.preset.currency
  };
}

function bindTargetPrice() {
  const tool = document.querySelector("[data-tool='etsy-target-price']");
  if (!tool) return;

  tool.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", calculateTargetAndRender);
    input.addEventListener("change", calculateTargetAndRender);
  });

  byId("countryPreset")?.addEventListener("change", () => {
    const preset = currentPreset();
    if (byId("countryPreset").value !== "CUSTOM") {
      byId("paymentRate").value = compact.format(preset.rate * 100);
      byId("paymentFlat").value = preset.flat;
    }
    calculateTargetAndRender();
  });

  byId("digitalMode")?.addEventListener("change", () => {
    if (bool("digitalMode")) {
      byId("shippingCharged").value = 0;
      byId("shippingCost").value = 0;
      byId("packagingCost").value = 0;
    }
    calculateTargetAndRender();
  });

  document.querySelectorAll("[data-target-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.targetPreset;
      if (type === "digital") {
        byId("itemPrice").value = 9;
        byId("targetMargin").value = 45;
        byId("targetProfit").value = 5;
        byId("itemCost").value = 0.5;
        byId("shippingCharged").value = 0;
        byId("shippingCost").value = 0;
        byId("packagingCost").value = 0;
        byId("laborCost").value = 1.5;
        byId("digitalMode").checked = true;
      }
      if (type === "physical") {
        byId("itemPrice").value = 28;
        byId("targetMargin").value = 30;
        byId("targetProfit").value = 10;
        byId("itemCost").value = 8.75;
        byId("shippingCharged").value = 4.99;
        byId("shippingCost").value = 4.25;
        byId("packagingCost").value = 0.85;
        byId("laborCost").value = 3;
        byId("digitalMode").checked = false;
      }
      if (type === "offsite") {
        byId("discountRate").value = 15;
        byId("offsiteRate").value = 15;
        byId("targetMargin").value = 25;
      }
      calculateTargetAndRender();
    });
  });

  byId("copyTargetSummary")?.addEventListener("click", async () => {
    const report = window.currentTargetReport;
    if (!report) return;
    const fmt = currencyFormatter(report.fmtCurrency);
    const goalText = report.goal.mode === "profit" ? `${fmt.format(report.goal.profit)} profit` : `${pct(report.goal.margin)} margin`;
    const summary = `Etsy target price plan
Goal: ${goalText}
Current item price: ${fmt.format(report.inputs.price)}
Suggested item price: ${fmt.format(report.solved.price)}
Expected profit: ${fmt.format(report.solved.result.profit)}
Expected margin: ${pct(report.solved.result.margin)}
Break-even item price: ${fmt.format(report.breakEven)}`;
    await navigator.clipboard.writeText(summary);
    text("copyTargetSummary", "Copied");
    setTimeout(() => text("copyTargetSummary", "Copy price plan"), 1200);
  });

  byId("downloadTargetCsv")?.addEventListener("click", () => {
    const report = window.currentTargetReport;
    if (!report) return;
    const blob = new Blob([report.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "etsy-price-target.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  calculateTargetAndRender();
}

function readBundleInputs(overrides = {}) {
  const preset = currentPreset();
  const customPayment = byId("countryPreset")?.value === "CUSTOM";
  const items = [1, 2, 3].map((index) => ({
    name: byId(`bundleItem${index}Name`)?.value || `Item ${index}`,
    price: val(`bundleItem${index}Price`),
    cost: val(`bundleItem${index}Cost`),
    units: Math.max(0, val(`bundleItem${index}Units`))
  }));
  const retailSubtotal = items.reduce((sum, item) => sum + item.price * item.units, 0);
  const productCost = items.reduce((sum, item) => sum + item.cost * item.units, 0);
  const discountRate = clamp(val("bundleDiscountRate"), 0, 95) / 100;
  const overridePrice = val("bundlePriceOverride");

  return {
    preset,
    items,
    retailSubtotal,
    productCost,
    itemRevenue: "itemRevenue" in overrides
      ? overrides.itemRevenue
      : (overridePrice > 0 ? overridePrice : retailSubtotal * (1 - discountRate)),
    discountRate,
    overridePrice,
    shippingCharged: val("bundleShippingCharged"),
    shippingCost: val("bundleShippingCost"),
    packagingCost: val("bundlePackagingCost"),
    laborCost: val("bundleLaborCost"),
    adSpend: val("bundleAdSpend"),
    taxCollected: val("bundleTaxCollected"),
    listingUnits: Math.max(0, val("bundleListingUnits")),
    paymentRate: (customPayment ? val("paymentRate") : preset.rate * 100) / 100,
    paymentFlat: customPayment ? val("paymentFlat") : preset.flat,
    offsiteRate: ("offsiteRate" in overrides ? overrides.offsiteRate : val("bundleOffsiteRate") / 100),
    currencyConversion: bool("bundleCurrencyConversion"),
    regulatoryRate: val("bundleRegulatoryRate") / 100
  };
}

function calculateBundle(inputs) {
  const itemRevenue = Math.max(0, inputs.itemRevenue);
  const sellerRevenue = itemRevenue + inputs.shippingCharged;
  const orderTotalWithTax = sellerRevenue + inputs.taxCollected;
  const listingFee = 0.2 * inputs.listingUnits;
  const transactionFee = 0.065 * sellerRevenue;
  const paymentFee = inputs.paymentRate * orderTotalWithTax + inputs.paymentFlat;
  const offsiteAdsFee = inputs.offsiteRate * orderTotalWithTax;
  const conversionFee = inputs.currencyConversion ? 0.025 * sellerRevenue : 0;
  const regulatoryFee = inputs.regulatoryRate * sellerRevenue;
  const platformFees = listingFee + transactionFee + paymentFee + offsiteAdsFee + conversionFee + regulatoryFee;
  const operatingCost = inputs.productCost + inputs.shippingCost + inputs.packagingCost + inputs.laborCost + inputs.adSpend;
  const profit = sellerRevenue - platformFees - operatingCost;
  const margin = sellerRevenue > 0 ? (profit / sellerRevenue) * 100 : 0;
  const buyerSavings = Math.max(0, inputs.retailSubtotal - itemRevenue);
  const savingsRate = inputs.retailSubtotal > 0 ? (buyerSavings / inputs.retailSubtotal) * 100 : 0;

  return {
    itemRevenue,
    sellerRevenue,
    buyerSavings,
    savingsRate,
    listingFee,
    transactionFee,
    paymentFee,
    offsiteAdsFee,
    conversionFee,
    regulatoryFee,
    platformFees,
    operatingCost,
    profit,
    margin
  };
}

function findBundleBreakEven(inputs) {
  let low = 0;
  let high = Math.max(10, inputs.retailSubtotal * 1.5, inputs.productCost * 4 + inputs.shippingCost + 20);
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    const result = calculateBundle({ ...inputs, itemRevenue: mid });
    if (result.profit >= 0) high = mid;
    else low = mid;
  }
  return Math.ceil(high * 100) / 100;
}

function findMaxBundleDiscount(inputs) {
  if (inputs.retailSubtotal <= 0) return 0;
  let low = 0;
  let high = 0.95;
  for (let i = 0; i < 50; i += 1) {
    const mid = (low + high) / 2;
    const result = calculateBundle({ ...inputs, itemRevenue: inputs.retailSubtotal * (1 - mid) });
    if (result.profit >= 0) low = mid;
    else high = mid;
  }
  return low * 100;
}

function renderBundleRows(inputs, fmt) {
  const rows = [
    ["Current bundle", inputs.itemRevenue, calculateBundle(inputs)],
    ["No bundle discount", inputs.retailSubtotal, calculateBundle({ ...inputs, itemRevenue: inputs.retailSubtotal })],
    ["10% lower bundle price", inputs.itemRevenue * 0.9, calculateBundle({ ...inputs, itemRevenue: inputs.itemRevenue * 0.9 })],
    ["Offsite Ads stress", inputs.itemRevenue, calculateBundle({ ...inputs, offsiteRate: inputs.offsiteRate || 0.15 })]
  ];
  const container = byId("bundleScenarioRows");
  if (!container) return;
  container.innerHTML = rows
    .map(([label, price, result]) => {
      const [status, tone] = health(result);
      return `<tr>
        <td>${label}</td>
        <td>${fmt.format(price)}</td>
        <td>${fmt.format(result.profit)}</td>
        <td>${pct(result.margin)}</td>
        <td><span class="status ${tone}">${status}</span></td>
      </tr>`;
    })
    .join("");
}

function renderBundleInsights(inputs, result, breakEven, maxDiscount, baseline, fmt) {
  const notes = [];
  if (result.profit < 0) {
    notes.push(`This bundle is below break-even. Raise the bundle price to about ${fmt.format(breakEven)} or reduce cost before promoting it.`);
  } else if (result.margin < 15) {
    notes.push("The bundle works, but the margin is thin. Treat this as a conversion bundle, not a paid-ad bundle.");
  } else {
    notes.push("This bundle has enough room to test as a higher-average-order-value offer.");
  }
  if (result.profit < baseline.profit) {
    notes.push(`The bundle earns ${fmt.format(baseline.profit - result.profit)} less than selling the same items at full retail. Make sure the conversion lift is worth that tradeoff.`);
  }
  if (inputs.overridePrice > 0) {
    notes.push("A fixed bundle price is overriding the percent discount. Clear it if you want the discount field to control price.");
  }
  notes.push(`Maximum break-even discount is about ${pct(maxDiscount)} before the bundle turns unprofitable under these assumptions.`);

  const list = byId("bundleInsights");
  if (list) list.innerHTML = notes.map((item) => `<li>${item}</li>`).join("");
}

function exportBundleCsv(inputs, result, breakEven, maxDiscount) {
  const rows = [
    ["Metric", "Value"],
    ["Retail subtotal", inputs.retailSubtotal],
    ["Bundle item revenue", result.itemRevenue],
    ["Buyer savings", result.buyerSavings],
    ["Seller revenue", result.sellerRevenue],
    ["Platform fees", result.platformFees],
    ["Operating cost", result.operatingCost],
    ["Net profit", result.profit],
    ["Profit margin", result.margin],
    ["Break-even bundle price", breakEven],
    ["Maximum break-even discount percent", maxDiscount]
  ];
  inputs.items.forEach((item) => {
    rows.push([`${item.name} units`, item.units]);
    rows.push([`${item.name} retail`, item.price]);
    rows.push([`${item.name} cost`, item.cost]);
  });
  return rows.map((row) => row.join(",")).join("\n");
}

function calculateBundleAndRender() {
  const inputs = readBundleInputs();
  const fmt = currencyFormatter(inputs.preset.currency);
  const result = calculateBundle(inputs);
  const baseline = calculateBundle({ ...inputs, itemRevenue: inputs.retailSubtotal });
  const breakEven = findBundleBreakEven(inputs);
  const maxDiscount = findMaxBundleDiscount(inputs);
  const [status, tone] = health(result);

  text("currencyLabel", inputs.preset.currency);
  text("paymentPresetText", `${inputs.preset.label}: ${pct(inputs.paymentRate * 100)} + ${fmt.format(inputs.paymentFlat)}`);
  text("bundlePriceResult", fmt.format(result.itemRevenue));
  text("bundleProfit", fmt.format(result.profit));
  text("bundleMargin", pct(result.margin));
  text("bundleSavings", `${fmt.format(result.buyerSavings)} (${pct(result.savingsRate)})`);
  text("bundleBreakEven", fmt.format(breakEven));
  text("bundleMaxDiscount", pct(maxDiscount));
  text("bundleFees", fmt.format(result.platformFees));
  text("bundleCosts", fmt.format(result.operatingCost));
  text("bundleStatusLabel", status);

  const statusEl = byId("bundleStatusLabel");
  if (statusEl) statusEl.className = `status ${tone}`;
  const meter = byId("profitMeter");
  if (meter) meter.style.setProperty("--value", `${clamp(result.margin, 0, 45) / 45 * 100}%`);

  text("bundleFormulaLine", `Bundle profit = ${fmt.format(result.sellerRevenue)} seller revenue - ${fmt.format(result.platformFees)} Etsy/payment fees - ${fmt.format(result.operatingCost)} product, shipping, labor, packaging and ad cost = ${fmt.format(result.profit)}.`);
  renderBundleRows(inputs, fmt);
  renderBundleInsights(inputs, result, breakEven, maxDiscount, baseline, fmt);

  window.currentBundleReport = {
    inputs,
    result,
    breakEven,
    maxDiscount,
    csv: exportBundleCsv(inputs, result, breakEven, maxDiscount),
    fmtCurrency: inputs.preset.currency
  };
}

function bindBundlePricing() {
  const tool = document.querySelector("[data-tool='etsy-bundle-pricing']");
  if (!tool) return;

  tool.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", calculateBundleAndRender);
    input.addEventListener("change", calculateBundleAndRender);
  });

  byId("countryPreset")?.addEventListener("change", () => {
    const preset = currentPreset();
    if (byId("countryPreset").value !== "CUSTOM") {
      byId("paymentRate").value = compact.format(preset.rate * 100);
      byId("paymentFlat").value = preset.flat;
    }
    calculateBundleAndRender();
  });

  document.querySelectorAll("[data-bundle-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.bundlePreset;
      if (type === "digital") {
        byId("bundleItem1Name").value = "Printable planner";
        byId("bundleItem1Price").value = 9;
        byId("bundleItem1Cost").value = 0.3;
        byId("bundleItem2Name").value = "Tracker sheet";
        byId("bundleItem2Price").value = 7;
        byId("bundleItem2Cost").value = 0.2;
        byId("bundleItem3Name").value = "Bonus template";
        byId("bundleItem3Price").value = 5;
        byId("bundleItem3Cost").value = 0.15;
        byId("bundleDiscountRate").value = 25;
        byId("bundleShippingCharged").value = 0;
        byId("bundleShippingCost").value = 0;
        byId("bundlePackagingCost").value = 0;
        byId("bundleLaborCost").value = 1.5;
      }
      if (type === "physical") {
        byId("bundleItem1Name").value = "Sticker pack";
        byId("bundleItem1Price").value = 6;
        byId("bundleItem1Cost").value = 1.1;
        byId("bundleItem2Name").value = "Mini print";
        byId("bundleItem2Price").value = 12;
        byId("bundleItem2Cost").value = 3.2;
        byId("bundleItem3Name").value = "Greeting card";
        byId("bundleItem3Price").value = 5;
        byId("bundleItem3Cost").value = 1;
        byId("bundleDiscountRate").value = 15;
        byId("bundleShippingCharged").value = 4.99;
        byId("bundleShippingCost").value = 4.25;
        byId("bundlePackagingCost").value = 0.9;
        byId("bundleLaborCost").value = 3;
      }
      if (type === "offsite") {
        byId("bundleDiscountRate").value = 20;
        byId("bundleOffsiteRate").value = 15;
      }
      byId("bundlePriceOverride").value = 0;
      calculateBundleAndRender();
    });
  });

  byId("copyBundleSummary")?.addEventListener("click", async () => {
    const report = window.currentBundleReport;
    if (!report) return;
    const fmt = currencyFormatter(report.fmtCurrency);
    const summary = `Etsy bundle pricing plan
Retail subtotal: ${fmt.format(report.inputs.retailSubtotal)}
Bundle price: ${fmt.format(report.result.itemRevenue)}
Buyer savings: ${fmt.format(report.result.buyerSavings)}
Net profit: ${fmt.format(report.result.profit)}
Margin: ${pct(report.result.margin)}
Break-even bundle price: ${fmt.format(report.breakEven)}
Max break-even discount: ${pct(report.maxDiscount)}`;
    await navigator.clipboard.writeText(summary);
    text("copyBundleSummary", "Copied");
    setTimeout(() => text("copyBundleSummary", "Copy bundle plan"), 1200);
  });

  byId("downloadBundleCsv")?.addEventListener("click", () => {
    const report = window.currentBundleReport;
    if (!report) return;
    const blob = new Blob([report.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "etsy-bundle-pricing.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  calculateBundleAndRender();
}

function readAdsInputs() {
  const preset = currentPreset();
  const customPayment = byId("countryPreset")?.value === "CUSTOM";
  return {
    preset,
    price: val("adsItemPrice"),
    quantity: Math.max(1, val("adsQuantity") || 1),
    shippingCharged: val("adsShippingCharged"),
    giftWrapCharged: 0,
    itemCost: val("adsItemCost"),
    shippingCost: val("adsShippingCost"),
    packagingCost: val("adsPackagingCost"),
    laborCost: val("adsLaborCost"),
    adSpend: 0,
    discountRate: clamp(val("adsDiscountRate"), 0, 100) / 100,
    discountFixed: 0,
    taxCollected: val("adsTaxCollected"),
    listingUnits: Math.max(0, val("adsListingUnits")),
    paymentRate: (customPayment ? val("paymentRate") : preset.rate * 100) / 100,
    paymentFlat: customPayment ? val("paymentFlat") : preset.flat,
    offsiteRate: val("adsOffsiteRate") / 100,
    currencyConversion: bool("adsCurrencyConversion"),
    regulatoryRate: val("adsRegulatoryRate") / 100,
    digitalMode: false,
    conversionRate: Math.max(0.1, val("adsConversionRate")) / 100,
    averageCpc: Math.max(0, val("adsAverageCpc")),
    monthlyBudget: Math.max(0, val("adsMonthlyBudget")),
    targetMargin: clamp(val("adsTargetMargin"), 0, 80)
  };
}

function roasLabel(value) {
  if (!Number.isFinite(value) || value <= 0) return "N/A";
  return `${compact.format(value)}x`;
}

function calculateAdsPlan(inputs) {
  const baseResult = calculate(inputs);
  const clicksPerOrder = inputs.conversionRate > 0 ? 1 / inputs.conversionRate : Infinity;
  const currentAdSpendPerOrder = inputs.averageCpc * clicksPerOrder;
  const profitAfterAds = baseResult.profit - currentAdSpendPerOrder;
  const breakEvenSpend = Math.max(0, baseResult.profit);
  const targetProfit = baseResult.sellerRevenue * (inputs.targetMargin / 100);
  const targetAdSpend = Math.max(0, baseResult.profit - targetProfit);
  const maxCpc = Number.isFinite(clicksPerOrder) && clicksPerOrder > 0 ? breakEvenSpend / clicksPerOrder : 0;
  const targetCpc = Number.isFinite(clicksPerOrder) && clicksPerOrder > 0 ? targetAdSpend / clicksPerOrder : 0;
  const breakEvenRoas = breakEvenSpend > 0 ? baseResult.sellerRevenue / breakEvenSpend : Infinity;
  const targetRoas = targetAdSpend > 0 ? baseResult.sellerRevenue / targetAdSpend : Infinity;
  const currentRoas = currentAdSpendPerOrder > 0 ? baseResult.sellerRevenue / currentAdSpendPerOrder : Infinity;
  const ordersFromBudget = currentAdSpendPerOrder > 0 ? inputs.monthlyBudget / currentAdSpendPerOrder : 0;
  const revenueFromBudget = ordersFromBudget * baseResult.sellerRevenue;
  const profitFromBudget = ordersFromBudget * profitAfterAds;

  return {
    baseResult,
    clicksPerOrder,
    currentAdSpendPerOrder,
    profitAfterAds,
    breakEvenSpend,
    targetProfit,
    targetAdSpend,
    maxCpc,
    targetCpc,
    breakEvenRoas,
    targetRoas,
    currentRoas,
    ordersFromBudget,
    revenueFromBudget,
    profitFromBudget
  };
}

function adsStatus(profitAfterAds, targetProfit) {
  if (profitAfterAds < 0) return ["Losing money", "bad"];
  if (profitAfterAds < targetProfit) return ["Below target", "warn"];
  return ["Ad-safe", "good"];
}

function renderAdsScenarios(inputs, plan, fmt) {
  const rows = [
    ["Current CPC", inputs.averageCpc, inputs.conversionRate],
    ["Conversion down 20%", inputs.averageCpc, inputs.conversionRate * 0.8],
    ["CPC up 20%", inputs.averageCpc * 1.2, inputs.conversionRate],
    ["Target-margin CPC", plan.targetCpc, inputs.conversionRate],
    ["Break-even CPC", plan.maxCpc, inputs.conversionRate]
  ];
  const container = byId("adsScenarioRows");
  if (!container) return;
  container.innerHTML = rows
    .map(([label, cpc, conversionRate]) => {
      const clicksPerOrder = conversionRate > 0 ? 1 / conversionRate : Infinity;
      const adSpendPerOrder = cpc * clicksPerOrder;
      const profitAfterAds = plan.baseResult.profit - adSpendPerOrder;
      const roas = adSpendPerOrder > 0 ? plan.baseResult.sellerRevenue / adSpendPerOrder : Infinity;
      const [status, tone] = adsStatus(profitAfterAds, plan.targetProfit);
      return `<tr>
        <td>${label}</td>
        <td>${fmt.format(cpc)}</td>
        <td>${fmt.format(adSpendPerOrder)}</td>
        <td>${roasLabel(roas)}</td>
        <td>${fmt.format(profitAfterAds)}</td>
        <td><span class="status ${tone}">${status}</span></td>
      </tr>`;
    })
    .join("");
}

function renderAdsInsights(inputs, plan, fmt) {
  const notes = [];
  if (plan.baseResult.profit <= 0) {
    notes.push("This listing has no profit cushion before ads. Fix price, costs or fees before buying traffic.");
  } else if (plan.profitAfterAds < 0) {
    notes.push(`The current CPC implies ${fmt.format(plan.currentAdSpendPerOrder)} ad cost per order, which is above the ${fmt.format(plan.breakEvenSpend)} break-even allowance.`);
  } else if (plan.profitAfterAds < plan.targetProfit) {
    notes.push(`Current ads are profitable but below the ${pct(inputs.targetMargin)} target margin. Try to get CPC near ${fmt.format(plan.targetCpc)} or improve conversion.`);
  } else {
    notes.push("The current CPC and conversion assumptions clear the target profit margin. This is a safer setup to budget-test.");
  }
  if (inputs.conversionRate < 0.02) {
    notes.push("Conversion is under 2%. Listing improvements may raise max CPC faster than lowering bids alone.");
  }
  if (plan.breakEvenRoas > 4) {
    notes.push("Break-even ROAS is high, so the listing needs unusually efficient traffic. Watch campaign search terms and pause weak clicks quickly.");
  }
  if (inputs.offsiteRate > 0) {
    notes.push("Optional Offsite Ads are included, making this a conservative combined-ad stress test.");
  }
  notes.push(`At the current CPC, ${fmt.format(inputs.monthlyBudget)} budget implies about ${compact.format(plan.ordersFromBudget)} orders and ${fmt.format(plan.profitFromBudget)} profit after ads.`);

  const list = byId("adsInsights");
  if (list) list.innerHTML = notes.map((item) => `<li>${item}</li>`).join("");
}

function exportAdsCsv(inputs, plan) {
  const rows = [
    ["Metric", "Value"],
    ["Item price", inputs.price],
    ["Seller revenue per order", plan.baseResult.sellerRevenue],
    ["Profit before Etsy Ads", plan.baseResult.profit],
    ["Conversion rate percent", inputs.conversionRate * 100],
    ["Average CPC", inputs.averageCpc],
    ["Ad spend per order", plan.currentAdSpendPerOrder],
    ["Profit after ads per order", plan.profitAfterAds],
    ["Break-even ad spend per order", plan.breakEvenSpend],
    ["Break-even ROAS", Number.isFinite(plan.breakEvenRoas) ? plan.breakEvenRoas : "N/A"],
    ["Target ROAS", Number.isFinite(plan.targetRoas) ? plan.targetRoas : "N/A"],
    ["Maximum break-even CPC", plan.maxCpc],
    ["Target-margin CPC", plan.targetCpc],
    ["Monthly budget", inputs.monthlyBudget],
    ["Estimated orders from budget", plan.ordersFromBudget],
    ["Estimated revenue from budget", plan.revenueFromBudget],
    ["Estimated profit from budget", plan.profitFromBudget]
  ];
  return rows.map((row) => row.join(",")).join("\n");
}

function calculateAdsAndRender() {
  const inputs = readAdsInputs();
  const fmt = currencyFormatter(inputs.preset.currency);
  const plan = calculateAdsPlan(inputs);
  const [status, tone] = adsStatus(plan.profitAfterAds, plan.targetProfit);

  text("currencyLabel", inputs.preset.currency);
  text("paymentPresetText", `${inputs.preset.label}: ${pct(inputs.paymentRate * 100)} + ${fmt.format(inputs.paymentFlat)}`);
  text("adsBreakEvenSpend", fmt.format(plan.breakEvenSpend));
  text("adsBreakEvenRoas", roasLabel(plan.breakEvenRoas));
  text("adsTargetRoas", roasLabel(plan.targetRoas));
  text("adsMaxCpc", fmt.format(plan.maxCpc));
  text("adsSpendPerOrder", fmt.format(plan.currentAdSpendPerOrder));
  text("adsProfitAfterAds", fmt.format(plan.profitAfterAds));
  text("adsOrdersFromBudget", compact.format(plan.ordersFromBudget));
  text("adsRevenueFromBudget", fmt.format(plan.revenueFromBudget));
  text("adsStatusLabel", status);

  const statusEl = byId("adsStatusLabel");
  if (statusEl) statusEl.className = `status ${tone}`;
  const meter = byId("profitMeter");
  if (meter) meter.style.setProperty("--value", `${clamp(plan.profitAfterAds / Math.max(plan.baseResult.sellerRevenue, 1) * 100, 0, 45) / 45 * 100}%`);

  text("adsFormulaLine", `Before ads, this listing keeps ${fmt.format(plan.baseResult.profit)} profit. At ${pct(inputs.conversionRate * 100)} conversion and ${fmt.format(inputs.averageCpc)} CPC, ad cost is ${fmt.format(plan.currentAdSpendPerOrder)} per order, leaving ${fmt.format(plan.profitAfterAds)} profit after ads.`);
  renderAdsScenarios(inputs, plan, fmt);
  renderAdsInsights(inputs, plan, fmt);

  window.currentAdsReport = {
    inputs,
    plan,
    csv: exportAdsCsv(inputs, plan),
    fmtCurrency: inputs.preset.currency
  };
}

function bindAdsRoas() {
  const tool = document.querySelector("[data-tool='etsy-ads-roas']");
  if (!tool) return;

  tool.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", calculateAdsAndRender);
    input.addEventListener("change", calculateAdsAndRender);
  });

  byId("countryPreset")?.addEventListener("change", () => {
    const preset = currentPreset();
    if (byId("countryPreset").value !== "CUSTOM") {
      byId("paymentRate").value = compact.format(preset.rate * 100);
      byId("paymentFlat").value = preset.flat;
    }
    calculateAdsAndRender();
  });

  document.querySelectorAll("[data-ads-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.adsPreset;
      if (type === "handmade") {
        byId("adsItemPrice").value = 32;
        byId("adsShippingCharged").value = 4.99;
        byId("adsItemCost").value = 9.5;
        byId("adsShippingCost").value = 4.5;
        byId("adsPackagingCost").value = 0.9;
        byId("adsLaborCost").value = 3;
        byId("adsConversionRate").value = 3;
        byId("adsAverageCpc").value = 0.35;
      }
      if (type === "digital") {
        byId("adsItemPrice").value = 12;
        byId("adsShippingCharged").value = 0;
        byId("adsItemCost").value = 0.4;
        byId("adsShippingCost").value = 0;
        byId("adsPackagingCost").value = 0;
        byId("adsLaborCost").value = 1.5;
        byId("adsConversionRate").value = 4;
        byId("adsAverageCpc").value = 0.22;
      }
      if (type === "thin") {
        byId("adsItemPrice").value = 21;
        byId("adsShippingCharged").value = 0;
        byId("adsItemCost").value = 11.5;
        byId("adsShippingCost").value = 4.75;
        byId("adsPackagingCost").value = 0.85;
        byId("adsLaborCost").value = 2.5;
        byId("adsConversionRate").value = 2;
        byId("adsAverageCpc").value = 0.4;
      }
      calculateAdsAndRender();
    });
  });

  byId("copyAdsSummary")?.addEventListener("click", async () => {
    const report = window.currentAdsReport;
    if (!report) return;
    const fmt = currencyFormatter(report.fmtCurrency);
    const summary = `Etsy Ads ROAS plan
Revenue per order: ${fmt.format(report.plan.baseResult.sellerRevenue)}
Profit before ads: ${fmt.format(report.plan.baseResult.profit)}
Break-even ad spend/order: ${fmt.format(report.plan.breakEvenSpend)}
Break-even ROAS: ${roasLabel(report.plan.breakEvenRoas)}
Target ROAS: ${roasLabel(report.plan.targetRoas)}
Max CPC: ${fmt.format(report.plan.maxCpc)}
Profit after ads/order: ${fmt.format(report.plan.profitAfterAds)}`;
    await navigator.clipboard.writeText(summary);
    text("copyAdsSummary", "Copied");
    setTimeout(() => text("copyAdsSummary", "Copy ad plan"), 1200);
  });

  byId("downloadAdsCsv")?.addEventListener("click", () => {
    const report = window.currentAdsReport;
    if (!report) return;
    const blob = new Blob([report.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "etsy-ads-roas-plan.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  calculateAdsAndRender();
}

function readRefundInputs() {
  const preset = currentPreset();
  const customPayment = byId("countryPreset")?.value === "CUSTOM";
  return {
    preset,
    price: val("refundItemPrice"),
    quantity: Math.max(1, val("refundQuantity") || 1),
    shippingCharged: val("refundShippingCharged"),
    giftWrapCharged: 0,
    itemCost: val("refundItemCost"),
    shippingCost: val("refundOriginalShippingCost"),
    packagingCost: val("refundPackagingCost"),
    laborCost: val("refundLaborCost"),
    adSpend: 0,
    discountRate: clamp(val("refundDiscountRate"), 0, 100) / 100,
    discountFixed: 0,
    taxCollected: val("refundTaxCollected"),
    listingUnits: Math.max(0, val("refundListingUnits")),
    paymentRate: (customPayment ? val("paymentRate") : preset.rate * 100) / 100,
    paymentFlat: customPayment ? val("paymentFlat") : preset.flat,
    offsiteRate: val("refundOffsiteRate") / 100,
    currencyConversion: bool("refundCurrencyConversion"),
    regulatoryRate: val("refundRegulatoryRate") / 100,
    digitalMode: false,
    refundPercent: clamp(val("refundPercent"), 0, 100) / 100,
    refundShippingAmount: val("refundShippingAmount"),
    returnShippingCost: val("refundReturnShippingCost"),
    resaleRecovery: val("refundResaleRecovery"),
    feeCreditRate: clamp(val("refundFeeCreditRate"), 0, 100) / 100,
    restockLaborCost: val("refundRestockLaborCost"),
    replacementItemCost: val("refundReplacementItemCost"),
    replacementShippingCost: val("refundReplacementShippingCost"),
    replacementPackagingCost: val("refundReplacementPackagingCost"),
    replacementLaborCost: val("refundReplacementLaborCost")
  };
}

function calculateRefundPlan(inputs) {
  const original = calculate(inputs);
  const refundItemAmount = original.itemRevenue * inputs.refundPercent;
  const refundAmount = clamp(refundItemAmount + inputs.refundShippingAmount, 0, original.sellerRevenue);
  const refundShare = original.sellerRevenue > 0 ? clamp(refundAmount / original.sellerRevenue, 0, 1) : 0;
  const eligibleFees = Math.max(0, original.platformFees - original.listingFee);
  const feeCredit = eligibleFees * refundShare * inputs.feeCreditRate;
  const returnExtraCost = inputs.returnShippingCost + inputs.restockLaborCost;
  const afterReturnProfit = original.profit - refundAmount + feeCredit - returnExtraCost + inputs.resaleRecovery;
  const replacementCost = inputs.replacementItemCost + inputs.replacementShippingCost + inputs.replacementPackagingCost + inputs.replacementLaborCost;
  const replacementProfit = original.profit - replacementCost - inputs.restockLaborCost;
  const replacementWithReturnProfit = replacementProfit - inputs.returnShippingCost + inputs.resaleRecovery;
  let low = 0;
  let high = original.sellerRevenue;
  for (let i = 0; i < 50; i += 1) {
    const mid = (low + high) / 2;
    const midShare = original.sellerRevenue > 0 ? mid / original.sellerRevenue : 0;
    const midCredit = eligibleFees * midShare * inputs.feeCreditRate;
    const midProfit = original.profit - mid + midCredit - returnExtraCost + inputs.resaleRecovery;
    if (midProfit >= 0) low = mid;
    else high = mid;
  }
  const maxSafeRefund = Math.min(original.sellerRevenue, low);

  return {
    original,
    refundItemAmount,
    refundAmount,
    refundShare,
    eligibleFees,
    feeCredit,
    returnExtraCost,
    afterReturnProfit,
    returnLoss: original.profit - afterReturnProfit,
    replacementCost,
    replacementProfit,
    replacementWithReturnProfit,
    replacementLoss: original.profit - replacementProfit,
    maxSafeRefund
  };
}

function refundStatus(profit) {
  if (profit < 0) return ["Creates loss", "bad"];
  if (profit < 5) return ["Thin recovery", "warn"];
  return ["Protected", "good"];
}

function refundScenario(label, finalProfit, refund, extraCost, feeCredit) {
  return { label, finalProfit, refund, extraCost, feeCredit };
}

function renderRefundScenarios(inputs, plan, fmt) {
  const halfRefund = plan.original.itemRevenue * 0.5;
  const halfCredit = plan.eligibleFees * (plan.original.sellerRevenue > 0 ? halfRefund / plan.original.sellerRevenue : 0) * inputs.feeCreditRate;
  const noReturnProfit = plan.original.profit - plan.refundAmount + plan.feeCredit;
  const rows = [
    refundScenario("Current refund + return", plan.afterReturnProfit, plan.refundAmount, plan.returnExtraCost - inputs.resaleRecovery, plan.feeCredit),
    refundScenario("Refund only", noReturnProfit, plan.refundAmount, 0, plan.feeCredit),
    refundScenario("50% item refund", plan.original.profit - halfRefund + halfCredit, halfRefund, 0, halfCredit),
    refundScenario("Replacement only", plan.replacementProfit, 0, plan.replacementCost + inputs.restockLaborCost, 0),
    refundScenario("Replacement + returned resale", plan.replacementWithReturnProfit, 0, plan.replacementCost + plan.returnExtraCost - inputs.resaleRecovery, 0)
  ];
  const container = byId("refundScenarioRows");
  if (!container) return;
  container.innerHTML = rows
    .map((row) => {
      const [status, tone] = refundStatus(row.finalProfit);
      return `<tr>
        <td>${row.label}</td>
        <td>${fmt.format(row.refund)}</td>
        <td>${fmt.format(row.extraCost)}</td>
        <td>${fmt.format(row.feeCredit)}</td>
        <td>${fmt.format(row.finalProfit)}</td>
        <td><span class="status ${tone}">${status}</span></td>
      </tr>`;
    })
    .join("");
}

function renderRefundInsights(inputs, plan, fmt) {
  const notes = [];
  if (plan.afterReturnProfit < 0) {
    notes.push(`The current return plan turns the order negative. The maximum break-even refund is about ${fmt.format(plan.maxSafeRefund)} after fee credits, return cost and resale recovery.`);
  } else if (plan.afterReturnProfit < plan.original.profit * 0.35) {
    notes.push("This resolution preserves the relationship but gives up most of the original profit. Consider whether a partial refund would solve the same buyer problem.");
  } else {
    notes.push("This resolution still protects a reasonable amount of the original profit.");
  }
  if (inputs.returnShippingCost > 0 && inputs.resaleRecovery <= 0) {
    notes.push("Seller-paid return shipping with no resale recovery is the hardest version of the math. Build that risk into pricing if it happens often.");
  }
  if (plan.replacementProfit < plan.afterReturnProfit) {
    notes.push("The replacement option is more expensive than the refund/return path under these assumptions.");
  } else {
    notes.push("Replacement keeps more profit than the refund/return path here, assuming the buyer accepts it and no extra refund is needed.");
  }
  if (inputs.feeCreditRate < 1) {
    notes.push("The fee credit field is below 100%, so the calculator is intentionally conservative about reimbursed fees.");
  }

  const list = byId("refundInsights");
  if (list) list.innerHTML = notes.map((item) => `<li>${item}</li>`).join("");
}

function exportRefundCsv(inputs, plan) {
  const rows = [
    ["Metric", "Value"],
    ["Original seller revenue", plan.original.sellerRevenue],
    ["Original profit", plan.original.profit],
    ["Refund amount", plan.refundAmount],
    ["Estimated fee credit", plan.feeCredit],
    ["Return shipping paid by seller", inputs.returnShippingCost],
    ["Restock/support labor", inputs.restockLaborCost],
    ["Resale recovery", inputs.resaleRecovery],
    ["Profit after refund and return", plan.afterReturnProfit],
    ["Return scenario loss", plan.returnLoss],
    ["Replacement cost", plan.replacementCost],
    ["Replacement profit", plan.replacementProfit],
    ["Replacement loss", plan.replacementLoss],
    ["Max refund to break even", plan.maxSafeRefund]
  ];
  return rows.map((row) => row.join(",")).join("\n");
}

function calculateRefundAndRender() {
  const inputs = readRefundInputs();
  const fmt = currencyFormatter(inputs.preset.currency);
  const plan = calculateRefundPlan(inputs);
  const [status, tone] = refundStatus(plan.afterReturnProfit);

  text("currencyLabel", inputs.preset.currency);
  text("paymentPresetText", `${inputs.preset.label}: ${pct(inputs.paymentRate * 100)} + ${fmt.format(inputs.paymentFlat)}`);
  text("refundAfterReturnProfit", fmt.format(plan.afterReturnProfit));
  text("refundOriginalProfit", fmt.format(plan.original.profit));
  text("refundAmountResult", fmt.format(plan.refundAmount));
  text("refundFeeCredit", fmt.format(plan.feeCredit));
  text("refundReturnLoss", fmt.format(plan.returnLoss));
  text("refundReplacementProfit", fmt.format(plan.replacementProfit));
  text("refundReplacementLoss", fmt.format(plan.replacementLoss));
  text("refundMaxSafe", fmt.format(plan.maxSafeRefund));
  text("refundStatusLabel", status);

  const statusEl = byId("refundStatusLabel");
  if (statusEl) statusEl.className = `status ${tone}`;
  const meter = byId("profitMeter");
  if (meter) meter.style.setProperty("--value", `${clamp(plan.afterReturnProfit / Math.max(plan.original.sellerRevenue, 1) * 100, 0, 45) / 45 * 100}%`);

  text("refundFormulaLine", `Refund result = ${fmt.format(plan.original.profit)} original profit - ${fmt.format(plan.refundAmount)} refund + ${fmt.format(plan.feeCredit)} fee credit - ${fmt.format(plan.returnExtraCost)} return/support cost + ${fmt.format(inputs.resaleRecovery)} resale recovery = ${fmt.format(plan.afterReturnProfit)}.`);
  renderRefundScenarios(inputs, plan, fmt);
  renderRefundInsights(inputs, plan, fmt);

  window.currentRefundReport = {
    inputs,
    plan,
    csv: exportRefundCsv(inputs, plan),
    fmtCurrency: inputs.preset.currency
  };
}

function bindRefundLoss() {
  const tool = document.querySelector("[data-tool='etsy-refund-loss']");
  if (!tool) return;

  tool.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", calculateRefundAndRender);
    input.addEventListener("change", calculateRefundAndRender);
  });

  byId("countryPreset")?.addEventListener("change", () => {
    const preset = currentPreset();
    if (byId("countryPreset").value !== "CUSTOM") {
      byId("paymentRate").value = compact.format(preset.rate * 100);
      byId("paymentFlat").value = preset.flat;
    }
    calculateRefundAndRender();
  });

  document.querySelectorAll("[data-refund-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.refundPreset;
      if (type === "full") {
        byId("refundPercent").value = 100;
        byId("refundShippingAmount").value = byId("refundShippingCharged")?.value || 0;
        byId("refundReturnShippingCost").value = 4.5;
        byId("refundResaleRecovery").value = 12;
      }
      if (type === "partial") {
        byId("refundPercent").value = 30;
        byId("refundShippingAmount").value = 0;
        byId("refundReturnShippingCost").value = 0;
        byId("refundResaleRecovery").value = 0;
      }
      if (type === "replacement") {
        byId("refundPercent").value = 0;
        byId("refundShippingAmount").value = 0;
        byId("refundReturnShippingCost").value = 0;
        byId("refundResaleRecovery").value = 0;
        byId("refundReplacementItemCost").value = byId("refundItemCost")?.value || 0;
        byId("refundReplacementShippingCost").value = byId("refundOriginalShippingCost")?.value || 0;
      }
      calculateRefundAndRender();
    });
  });

  byId("copyRefundSummary")?.addEventListener("click", async () => {
    const report = window.currentRefundReport;
    if (!report) return;
    const fmt = currencyFormatter(report.fmtCurrency);
    const summary = `Etsy refund resolution plan
Original profit: ${fmt.format(report.plan.original.profit)}
Refund amount: ${fmt.format(report.plan.refundAmount)}
Estimated fee credit: ${fmt.format(report.plan.feeCredit)}
Profit after refund/return: ${fmt.format(report.plan.afterReturnProfit)}
Replacement profit: ${fmt.format(report.plan.replacementProfit)}
Max refund to break even: ${fmt.format(report.plan.maxSafeRefund)}`;
    await navigator.clipboard.writeText(summary);
    text("copyRefundSummary", "Copied");
    setTimeout(() => text("copyRefundSummary", "Copy resolution plan"), 1200);
  });

  byId("downloadRefundCsv")?.addEventListener("click", () => {
    const report = window.currentRefundReport;
    if (!report) return;
    const blob = new Blob([report.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "etsy-refund-loss-plan.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  calculateRefundAndRender();
}

function bindSpreadsheetBuilder() {
  const builder = document.querySelector("[data-tool='spreadsheet-builder']");
  if (!builder) return;
  const output = byId("spreadsheetCsv");
  const makeCsv = () => {
    const rows = [
      ["Item", "Price", "Qty", "Item cost", "Shipping charged", "Shipping cost", "Discount %", "Offsite ads %", "Profit formula"],
      ["Example sticker", "5.00", "3", "0.80", "1.50", "1.10", "0", "0", "=B2*C2+E2-((B2*C2+E2)*0.065)-((B2*C2+E2)*0.03+0.25)-(D2*C2)-F2"],
      ["Example digital planner", "9.00", "1", "0.25", "0", "0", "15", "0", "=B3*C3*(1-G3/100)-((B3*C3*(1-G3/100))*0.065)-((B3*C3*(1-G3/100))*0.03+0.25)-(D3*C3)"]
    ];
    output.value = rows.map((row) => row.join(",")).join("\n");
  };
  byId("copySpreadsheet")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.value);
    text("copySpreadsheet", "Copied");
    setTimeout(() => text("copySpreadsheet", "Copy CSV"), 1200);
  });
  makeCsv();
}

bindCalculator();
bindDigitalBreakEven();
bindTargetPrice();
bindBundlePricing();
bindAdsRoas();
bindRefundLoss();
bindSpreadsheetBuilder();
