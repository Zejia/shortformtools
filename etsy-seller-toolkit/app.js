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
bindTargetPrice();
bindSpreadsheetBuilder();
