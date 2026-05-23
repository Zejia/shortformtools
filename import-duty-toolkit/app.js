const SITE_REVIEW_DATE = "May 21, 2026";
const US_DE_MINIMIS_NOTE_DATE = "August 29, 2025";
const ADSENSE_CLIENT = "ca-pub-4259477754165351";
const CONSENT_STORAGE_KEY = "crossborderkit-consent-v1";
const LANDED_HISTORY_KEY = "crossborderkit-landed-history-v1";

const marketPresets = {
  US: {
    label: "United States",
    currency: "USD",
    dutyRate: 8,
    taxRate: 0,
    brokerage: 95,
    misc: 0,
    bufferRate: 2,
    threshold: 0,
    reliefMode: "none",
    useDeMinimis: false,
    includeShippingInDuty: false,
    includeInsuranceInDuty: false,
    taxIncludesDuty: true,
    taxIncludesBrokerage: false,
    thresholdNote:
      "US preset assumes broad de minimis relief is not available for most imports. Use Custom only if you are modeling a specific exception or broker-confirmed program.",
    basisNote: "Duty modeled on product value by default, not freight. No federal import VAT is applied in this preset."
  },
  UK: {
    label: "United Kingdom",
    currency: "GBP",
    dutyRate: 6,
    taxRate: 20,
    brokerage: 42,
    misc: 0,
    bufferRate: 2,
    threshold: 135,
    reliefMode: "duty-only",
    useDeMinimis: true,
    includeShippingInDuty: true,
    includeInsuranceInDuty: true,
    taxIncludesDuty: true,
    taxIncludesBrokerage: true,
    thresholdNote:
      "UK preset uses the common low-value customs-duty line at GBP 135. VAT may still apply even when customs duty does not.",
    basisNote: "Duty modeled on a CIF-style base. VAT modeled on landed value plus duty and brokerage."
  },
  EU: {
    label: "EU-like VAT mode",
    currency: "EUR",
    dutyRate: 5.5,
    taxRate: 21,
    brokerage: 38,
    misc: 0,
    bufferRate: 2,
    threshold: 150,
    reliefMode: "duty-only",
    useDeMinimis: true,
    includeShippingInDuty: true,
    includeInsuranceInDuty: true,
    taxIncludesDuty: true,
    taxIncludesBrokerage: true,
    thresholdNote:
      "EU-like preset assumes VAT from the first euro and a common low-value customs-duty line at EUR 150. This is a planning model, not member-state legal advice.",
    basisNote: "Duty modeled on a CIF-style base. VAT modeled on landed value plus duty and brokerage."
  },
  CUSTOM: {
    label: "Custom market",
    currency: "USD",
    dutyRate: 5,
    taxRate: 10,
    brokerage: 55,
    misc: 0,
    bufferRate: 1.5,
    threshold: 0,
    reliefMode: "duty-and-tax",
    useDeMinimis: false,
    includeShippingInDuty: true,
    includeInsuranceInDuty: true,
    taxIncludesDuty: true,
    taxIncludesBrokerage: false,
    thresholdNote:
      "Use Custom when you have broker instructions or a market that does not fit the starter presets.",
    basisNote: "Adjust the calculation basis under Advanced assumptions to match your filing logic."
  }
};

const compactNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0
});

function formatCurrency(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
}

function formatPercent(value) {
  return `${compactNumber.format(value)}%`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function safeNumber(value) {
  return Math.max(0, Number(String(value ?? "").replaceAll(",", "")) || 0);
}

function byField(scope, name) {
  return scope.querySelector(`[data-field="${name}"]`);
}

function byOutput(scope, name) {
  return scope.querySelector(`[data-output="${name}"]`);
}

function setText(scope, name, value) {
  const node = byOutput(scope, name);
  if (node) node.textContent = value;
}

function currentPreset(scope) {
  const key = byField(scope, "market")?.value || "US";
  return marketPresets[key] || marketPresets.US;
}

function applyPreset(scope, key) {
  const preset = marketPresets[key] || marketPresets.US;
  const assignments = {
    dutyRate: preset.dutyRate,
    taxRate: preset.taxRate,
    brokerage: preset.brokerage,
    misc: preset.misc,
    bufferRate: preset.bufferRate,
    threshold: preset.threshold,
    reliefMode: preset.reliefMode
  };

  Object.entries(assignments).forEach(([name, value]) => {
    const field = byField(scope, name);
    if (!field) return;
    field.value = String(value);
  });

  const checks = {
    useDeMinimis: preset.useDeMinimis,
    includeShippingInDuty: preset.includeShippingInDuty,
    includeInsuranceInDuty: preset.includeInsuranceInDuty,
    taxIncludesDuty: preset.taxIncludesDuty,
    taxIncludesBrokerage: preset.taxIncludesBrokerage
  };

  Object.entries(checks).forEach(([name, checked]) => {
    const field = byField(scope, name);
    if (field) field.checked = checked;
  });

  const useDeMinimis = byField(scope, "useDeMinimis");
  if (useDeMinimis) {
    useDeMinimis.disabled = preset.threshold === 0 && key !== "CUSTOM";
  }

  const threshold = byField(scope, "threshold");
  if (threshold) {
    threshold.disabled = preset.threshold === 0 && key !== "CUSTOM";
  }
}

function readToolInputs(scope) {
  const preset = currentPreset(scope);
  const units = Math.max(1, safeNumber(byField(scope, "units")?.value || 1));
  return {
    preset,
    currency: preset.currency,
    productValue: safeNumber(byField(scope, "productValue")?.value),
    shippingCost: safeNumber(byField(scope, "shippingCost")?.value),
    insuranceCost: safeNumber(byField(scope, "insuranceCost")?.value),
    dutyRate: safeNumber(byField(scope, "dutyRate")?.value) / 100,
    taxRate: safeNumber(byField(scope, "taxRate")?.value) / 100,
    brokerage: safeNumber(byField(scope, "brokerage")?.value),
    misc: safeNumber(byField(scope, "misc")?.value),
    bufferRate: safeNumber(byField(scope, "bufferRate")?.value) / 100,
    threshold: safeNumber(byField(scope, "threshold")?.value),
    reliefMode: byField(scope, "reliefMode")?.value || "none",
    useDeMinimis: Boolean(byField(scope, "useDeMinimis")?.checked),
    includeShippingInDuty: Boolean(byField(scope, "includeShippingInDuty")?.checked),
    includeInsuranceInDuty: Boolean(byField(scope, "includeInsuranceInDuty")?.checked),
    taxIncludesDuty: Boolean(byField(scope, "taxIncludesDuty")?.checked),
    taxIncludesBrokerage: Boolean(byField(scope, "taxIncludesBrokerage")?.checked),
    units
  };
}

function calculateLandedCost(inputs) {
  const thresholdEligible = inputs.useDeMinimis && inputs.threshold > 0 && inputs.productValue <= inputs.threshold;
  const customsValue =
    inputs.productValue +
    (inputs.includeShippingInDuty ? inputs.shippingCost : 0) +
    (inputs.includeInsuranceInDuty ? inputs.insuranceCost : 0);
  const bufferCost = (inputs.productValue + inputs.shippingCost + inputs.insuranceCost) * inputs.bufferRate;
  const duty = thresholdEligible && inputs.reliefMode !== "none" ? 0 : customsValue * inputs.dutyRate;
  const taxBase =
    inputs.productValue +
    inputs.shippingCost +
    inputs.insuranceCost +
    (inputs.taxIncludesDuty ? duty : 0) +
    (inputs.taxIncludesBrokerage ? inputs.brokerage : 0);
  const tax = thresholdEligible && inputs.reliefMode === "duty-and-tax" ? 0 : taxBase * inputs.taxRate;
  const totalLanded =
    inputs.productValue +
    inputs.shippingCost +
    inputs.insuranceCost +
    inputs.brokerage +
    inputs.misc +
    bufferCost +
    duty +
    tax;
  const perUnit = totalLanded / inputs.units;
  const overhead = totalLanded - inputs.productValue;
  const upliftPercent = inputs.productValue > 0 ? (overhead / inputs.productValue) * 100 : 0;
  const rateBurden = totalLanded > 0 ? ((duty + tax) / totalLanded) * 100 : 0;
  const adminBurden = totalLanded > 0 ? ((inputs.brokerage + inputs.misc + bufferCost) / totalLanded) * 100 : 0;
  return {
    thresholdEligible,
    customsValue,
    duty,
    taxBase,
    tax,
    bufferCost,
    totalLanded,
    perUnit,
    overhead,
    upliftPercent,
    rateBurden,
    adminBurden
  };
}

function planningStatus(inputs, result) {
  if (result.upliftPercent >= 45 || result.rateBurden >= 22) {
    return ["High-friction file", "bad"];
  }
  if (result.thresholdEligible || result.upliftPercent <= 20) {
    return ["Lean landed profile", "good"];
  }
  return ["Watch the paperwork", "warn"];
}

function buildInsights(inputs, result) {
  const items = [];
  if (result.thresholdEligible) {
    if (inputs.reliefMode === "duty-only") {
      items.push(
        `This shipment sits under the low-value line, so duty is waived in this model but tax still applies.`
      );
    } else if (inputs.reliefMode === "duty-and-tax") {
      items.push(
        `This shipment sits under the low-value line, so both duty and tax are waived in this model. Confirm that with your broker before pricing to it.`
      );
    }
  }
  if (inputs.preset.label === "United States") {
    items.push(
      `US preset keeps de minimis off by default because broad duty-free treatment changed on ${US_DE_MINIMIS_NOTE_DATE}. Use a customs broker if you expect a specific exception.`
    );
  }
  if (inputs.dutyRate >= 0.1) {
    items.push(
      `A double-digit duty rate usually means HS classification, origin claims, and trade remedy exposure deserve a second review before you quote landed price.`
    );
  }
  if (inputs.brokerage > result.duty && inputs.brokerage > 0) {
    items.push(
      `Brokerage is larger than modeled duty. Small consignments often win more from shipment consolidation than from shaving one tariff point.`
    );
  }
  if (result.upliftPercent >= 35) {
    items.push(
      `Landed cost is ${formatPercent(result.upliftPercent)} above product value. Build this into MOQ, replenishment, and margin-floor decisions instead of treating it as a checkout surprise.`
    );
  }
  if (result.adminBurden >= 12) {
    items.push(
      `Non-duty overhead is carrying a lot of the file. Pressure-test prepaid freight, disbursement fees, and your FX buffer before blaming the tariff line alone.`
    );
  }
  if (!items.length) {
    items.push(
      `This file looks relatively straightforward. Save one version with today's rates and another with a rate dispute or freight slip so your team can quote both base and stressed economics.`
    );
  }
  return items;
}

function scenarioRows(inputs) {
  const scenarios = [
    { label: "Current filing", patch: {} },
    { label: "Duty rate +2 pts", patch: { dutyRate: inputs.dutyRate + 0.02 } },
    { label: "Freight +12%", patch: { shippingCost: inputs.shippingCost * 1.12 } },
    { label: "Brokerage +25%", patch: { brokerage: inputs.brokerage * 1.25 } }
  ];

  if (inputs.threshold > 0 && !inputs.useDeMinimis) {
    scenarios[3] = { label: "Turn threshold relief on", patch: { useDeMinimis: true } };
  }

  return scenarios;
}

function renderScenarioTable(scope, inputs) {
  const body = byOutput(scope, "scenarioRows");
  if (!body) return;
  const rows = scenarioRows(inputs)
    .map((scenario) => {
      const result = calculateLandedCost({ ...inputs, ...scenario.patch });
      const [status] = planningStatus({ ...inputs, ...scenario.patch }, result);
      return `<tr>
        <td>${scenario.label}</td>
        <td>${formatCurrency(result.duty, inputs.currency)}</td>
        <td>${formatCurrency(result.tax, inputs.currency)}</td>
        <td>${formatCurrency(result.totalLanded, inputs.currency)}</td>
        <td>${formatCurrency(result.perUnit, inputs.currency)}</td>
        <td>${status}</td>
      </tr>`;
    })
    .join("");
  body.innerHTML = rows;
}

function landedCsvRows(inputs, result) {
  return [
    ["Metric", "Value"],
    ["Market", inputs.preset.label],
    ["Currency", inputs.currency],
    ["Product value", inputs.productValue],
    ["Units", inputs.units],
    ["Shipping cost", inputs.shippingCost],
    ["Insurance cost", inputs.insuranceCost],
    ["Duty rate percent", inputs.dutyRate * 100],
    ["Tax or VAT rate percent", inputs.taxRate * 100],
    ["Brokerage", inputs.brokerage],
    ["Misc cost", inputs.misc],
    ["FX or compliance buffer percent", inputs.bufferRate * 100],
    ["Customs value", result.customsValue],
    ["Duty", result.duty],
    ["Tax or VAT", result.tax],
    ["Buffer cost", result.bufferCost],
    ["Total landed cost", result.totalLanded],
    ["Per-unit landed cost", result.perUnit],
    ["Landed uplift percent", result.upliftPercent],
    ["Duty and tax share percent", result.rateBurden],
    ["Threshold applied", result.thresholdEligible ? "yes" : "no"]
  ];
}

function toCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
        })
        .join(",")
    )
    .join("\n");
}

function readLandedHistory() {
  try {
    return JSON.parse(localStorage.getItem(LANDED_HISTORY_KEY) || "[]");
  } catch (_error) {
    return [];
  }
}

function writeLandedHistory(items) {
  try {
    localStorage.setItem(LANDED_HISTORY_KEY, JSON.stringify(items.slice(0, 6)));
  } catch (_error) {
    // Ignore storage failures in privacy-restricted browsers.
  }
}

function historyLabel(item) {
  return `${item.market}: ${formatCurrency(item.totalLanded, item.currency)} total / ${formatCurrency(item.perUnit, item.currency)} per unit`;
}

function renderLandedHistory(scope) {
  const list = byOutput(scope, "historyRows");
  if (!list) return;
  const history = readLandedHistory();
  if (!history.length) {
    list.innerHTML = "<li>No saved scenarios yet.</li>";
    return;
  }
  list.innerHTML = history
    .map((item) => `<li><strong>${historyLabel(item)}</strong><span>${item.savedAt}</span></li>`)
    .join("");
}

function renderTool(scope) {
  const inputs = readToolInputs(scope);
  const result = calculateLandedCost(inputs);
  const [status, tone] = planningStatus(inputs, result);

  setText(scope, "totalLanded", formatCurrency(result.totalLanded, inputs.currency));
  setText(scope, "duty", formatCurrency(result.duty, inputs.currency));
  setText(scope, "tax", formatCurrency(result.tax, inputs.currency));
  setText(scope, "perUnit", formatCurrency(result.perUnit, inputs.currency));
  setText(scope, "customsValue", formatCurrency(result.customsValue, inputs.currency));
  setText(scope, "upliftPercent", formatPercent(result.upliftPercent));
  setText(scope, "rateBurden", formatPercent(result.rateBurden));
  setText(scope, "bufferCost", formatCurrency(result.bufferCost, inputs.currency));
  setText(scope, "taxBase", formatCurrency(result.taxBase, inputs.currency));
  setText(scope, "thresholdLabel", inputs.threshold > 0 ? `${inputs.preset.currency} ${compactNumber.format(inputs.threshold)}` : "No low-value line");
  setText(scope, "assumptionNote", inputs.preset.basisNote);
  setText(scope, "thresholdNote", inputs.preset.thresholdNote);
  setText(scope, "status", status);
  setText(
    scope,
    "formulaLine",
    `Landed = product + freight + insurance + brokerage + misc + FX buffer + duty + tax = ${formatCurrency(result.totalLanded, inputs.currency)}`
  );

  const statusNode = byOutput(scope, "statusTone");
  if (statusNode) statusNode.className = `status-pill ${tone}`;
  const meter = byOutput(scope, "meter");
  if (meter) meter.style.setProperty("--value", `${clamp(result.upliftPercent, 0, 60) / 60 * 100}%`);

  const insights = buildInsights(inputs, result);
  const insightList = byOutput(scope, "insights");
  if (insightList) {
    insightList.innerHTML = insights.map((item) => `<li>${item}</li>`).join("");
  }

  renderScenarioTable(scope, inputs);
  renderLandedHistory(scope);

  const thresholdFlag = byOutput(scope, "thresholdFlag");
  if (thresholdFlag) {
    thresholdFlag.textContent = result.thresholdEligible ? "Eligible in this model" : "Not triggered";
  }
}

function attachCsvAndHistory(scope) {
  const downloadButton = byOutput(scope, "downloadCsv");
  const saveButton = byOutput(scope, "saveScenario");
  const copyHistoryButton = byOutput(scope, "copyHistory");
  const clearHistoryButton = byOutput(scope, "clearHistory");

  downloadButton?.addEventListener("click", () => {
    const inputs = readToolInputs(scope);
    const result = calculateLandedCost(inputs);
    const blob = new Blob([toCsv(landedCsvRows(inputs, result))], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "landed-cost-scenario.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  saveButton?.addEventListener("click", () => {
    const inputs = readToolInputs(scope);
    const result = calculateLandedCost(inputs);
    const savedAt = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date());
    const item = {
      savedAt,
      market: inputs.preset.label,
      currency: inputs.currency,
      productValue: inputs.productValue,
      totalLanded: result.totalLanded,
      perUnit: result.perUnit,
      duty: result.duty,
      tax: result.tax,
      upliftPercent: result.upliftPercent
    };
    writeLandedHistory([item, ...readLandedHistory()]);
    renderLandedHistory(scope);
    saveButton.textContent = "Saved";
    window.setTimeout(() => {
      saveButton.textContent = "Save scenario";
    }, 1200);
  });

  copyHistoryButton?.addEventListener("click", async () => {
    const history = readLandedHistory();
    const text = history.length
      ? history.map((item) => `${item.savedAt} - ${historyLabel(item)}`).join("\n")
      : "No saved landed-cost scenarios yet.";
    try {
      await navigator.clipboard.writeText(text);
      copyHistoryButton.textContent = "Copied";
      window.setTimeout(() => {
        copyHistoryButton.textContent = "Copy history";
      }, 1200);
    } catch (_error) {
      copyHistoryButton.textContent = "Copy failed";
      window.setTimeout(() => {
        copyHistoryButton.textContent = "Copy history";
      }, 1200);
    }
  });

  clearHistoryButton?.addEventListener("click", () => {
    writeLandedHistory([]);
    renderLandedHistory(scope);
  });
}

function attachCopySummary(scope) {
  const button = byOutput(scope, "copySummary");
  if (!button) return;
  button.addEventListener("click", async () => {
    const inputs = readToolInputs(scope);
    const result = calculateLandedCost(inputs);
    const summary = [
      `${inputs.preset.label} landed-cost summary`,
      `Product value: ${formatCurrency(inputs.productValue, inputs.currency)}`,
      `Duty: ${formatCurrency(result.duty, inputs.currency)}`,
      `Tax: ${formatCurrency(result.tax, inputs.currency)}`,
      `Total landed: ${formatCurrency(result.totalLanded, inputs.currency)}`,
      `Per-unit landed: ${formatCurrency(result.perUnit, inputs.currency)}`,
      `Threshold: ${result.thresholdEligible ? "applied" : "not applied"}`
    ].join("\n");
    try {
      await navigator.clipboard.writeText(summary);
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = "Copy summary";
      }, 1200);
    } catch (_error) {
      button.textContent = "Copy failed";
      window.setTimeout(() => {
        button.textContent = "Copy summary";
      }, 1200);
    }
  });
}

function readMarginInputs(scope) {
  const baseInputs = readToolInputs(scope);
  return {
    ...baseInputs,
    salePrice: safeNumber(byField(scope, "salePrice")?.value),
    marketplaceFeeRate: safeNumber(byField(scope, "marketplaceFeeRate")?.value) / 100,
    fulfillmentCost: safeNumber(byField(scope, "fulfillmentCost")?.value),
    returnAllowanceRate: safeNumber(byField(scope, "returnAllowanceRate")?.value) / 100,
    targetMargin: safeNumber(byField(scope, "targetMargin")?.value) / 100
  };
}

function calculateImportMargin(inputs, landed = calculateLandedCost(inputs)) {
  const landedPerUnit = landed.perUnit;
  const marketplaceFee = inputs.salePrice * inputs.marketplaceFeeRate;
  const returnAllowance = inputs.salePrice * inputs.returnAllowanceRate;
  const channelCosts = marketplaceFee + inputs.fulfillmentCost + returnAllowance;
  const profitPerUnit = inputs.salePrice - landedPerUnit - channelCosts;
  const grossMargin = inputs.salePrice > 0 ? (profitPerUnit / inputs.salePrice) * 100 : 0;
  const markupOnLanded = landedPerUnit > 0 ? (profitPerUnit / landedPerUnit) * 100 : 0;
  const variableRate = inputs.marketplaceFeeRate + inputs.returnAllowanceRate;
  const denominator = 1 - variableRate - inputs.targetMargin;
  const targetPrice = denominator > 0 ? (landedPerUnit + inputs.fulfillmentCost) / denominator : Infinity;
  const breakEvenPrice = variableRate < 1 ? (landedPerUnit + inputs.fulfillmentCost) / (1 - variableRate) : Infinity;

  return {
    landedPerUnit,
    marketplaceFee,
    returnAllowance,
    channelCosts,
    profitPerUnit,
    grossMargin,
    markupOnLanded,
    targetPrice,
    breakEvenPrice
  };
}

function marginHealth(result) {
  if (result.profitPerUnit < 0) return ["Below break-even", "bad"];
  if (result.grossMargin < 15) return ["Thin resale margin", "warn"];
  if (result.grossMargin < 30) return ["Workable", "good"];
  return ["Healthy resale spread", "good"];
}

function renderMarginScenarioTable(scope, inputs, landed) {
  const body = byOutput(scope, "marginScenarioRows");
  if (!body) return;
  const scenarios = [
    { label: "Current sale price", patch: {} },
    { label: "Sale price -10%", patch: { salePrice: inputs.salePrice * 0.9 } },
    { label: "Freight +12%", patch: { shippingCost: inputs.shippingCost * 1.12 } },
    { label: "Duty rate +2 pts", patch: { dutyRate: inputs.dutyRate + 0.02 } }
  ];

  body.innerHTML = scenarios
    .map((scenario) => {
      const merged = { ...inputs, ...scenario.patch };
      const scenarioLanded = scenario.patch.shippingCost || scenario.patch.dutyRate
        ? calculateLandedCost(merged)
        : landed;
      const result = calculateImportMargin(merged, scenarioLanded);
      const [status] = marginHealth(result);
      return `<tr>
        <td>${scenario.label}</td>
        <td>${formatCurrency(scenarioLanded.perUnit, inputs.currency)}</td>
        <td>${formatCurrency(merged.salePrice, inputs.currency)}</td>
        <td>${formatCurrency(result.profitPerUnit, inputs.currency)}</td>
        <td>${formatPercent(result.grossMargin)}</td>
        <td>${status}</td>
      </tr>`;
    })
    .join("");
}

function buildMarginInsights(inputs, landed, result) {
  const notes = [];
  if (result.profitPerUnit < 0) {
    notes.push(`The current resale price is below break-even. Raise price to at least ${formatCurrency(result.breakEvenPrice, inputs.currency)} before this SKU can absorb channel costs.`);
  } else if (result.grossMargin < inputs.targetMargin * 100) {
    notes.push(`The SKU is profitable, but it misses the target margin. A ${formatPercent(inputs.targetMargin * 100)} target needs about ${formatCurrency(result.targetPrice, inputs.currency)} per unit.`);
  } else {
    notes.push(`The current resale price clears the target margin under these import and channel-cost assumptions.`);
  }
  if (landed.upliftPercent >= 35) {
    notes.push(`Import overhead is ${formatPercent(landed.upliftPercent)} above product value, so freight, tax, and brokerage deserve the same attention as supplier cost.`);
  }
  if (inputs.marketplaceFeeRate >= 0.15) {
    notes.push("Marketplace fees are a major part of the resale spread. Compare direct wholesale or B2B pricing before assuming this SKU works on every channel.");
  }
  if (result.targetPrice === Infinity) {
    notes.push("The target margin is mathematically impossible with the entered channel-fee and return rates. Lower the target or reduce variable channel costs.");
  }
  return notes;
}

function renderImportMarginTool(scope) {
  const inputs = readMarginInputs(scope);
  const landed = calculateLandedCost(inputs);
  const result = calculateImportMargin(inputs, landed);
  const [status, tone] = marginHealth(result);

  setText(scope, "thresholdNote", inputs.preset.thresholdNote);
  setText(scope, "assumptionNote", inputs.preset.basisNote);
  setText(scope, "landedPerUnit", formatCurrency(landed.perUnit, inputs.currency));
  setText(scope, "resaleProfit", formatCurrency(result.profitPerUnit, inputs.currency));
  setText(scope, "resaleMargin", formatPercent(result.grossMargin));
  setText(scope, "targetResalePrice", Number.isFinite(result.targetPrice) ? formatCurrency(result.targetPrice, inputs.currency) : "No safe price");
  setText(scope, "breakEvenResalePrice", Number.isFinite(result.breakEvenPrice) ? formatCurrency(result.breakEvenPrice, inputs.currency) : "No safe price");
  setText(scope, "channelCosts", formatCurrency(result.channelCosts, inputs.currency));
  setText(scope, "marginStatus", status);
  setText(
    scope,
    "marginFormulaLine",
    `Profit per unit = ${formatCurrency(inputs.salePrice, inputs.currency)} sale price - ${formatCurrency(landed.perUnit, inputs.currency)} landed cost - ${formatCurrency(result.channelCosts, inputs.currency)} channel costs = ${formatCurrency(result.profitPerUnit, inputs.currency)}.`
  );

  const statusNode = byOutput(scope, "marginStatusTone");
  if (statusNode) statusNode.className = `status-pill ${tone}`;
  const meter = byOutput(scope, "marginMeter");
  if (meter) meter.style.setProperty("--value", `${clamp(result.grossMargin, 0, 45) / 45 * 100}%`);

  const insightList = byOutput(scope, "marginInsights");
  if (insightList) {
    insightList.innerHTML = buildMarginInsights(inputs, landed, result)
      .map((item) => `<li>${item}</li>`)
      .join("");
  }

  renderMarginScenarioTable(scope, inputs, landed);
}

function initImportMarginTools() {
  document.querySelectorAll("[data-import-margin-tool]").forEach((scope) => {
    const marketField = byField(scope, "market");
    if (marketField) {
      applyPreset(scope, marketField.value || "US");
      marketField.addEventListener("change", () => {
        applyPreset(scope, marketField.value);
        renderImportMarginTool(scope);
      });
    }

    scope.querySelectorAll("input, select").forEach((field) => {
      field.addEventListener("input", () => renderImportMarginTool(scope));
      field.addEventListener("change", () => renderImportMarginTool(scope));
    });

    const copyButton = byOutput(scope, "copyMarginSummary");
    copyButton?.addEventListener("click", async () => {
      const inputs = readMarginInputs(scope);
      const landed = calculateLandedCost(inputs);
      const result = calculateImportMargin(inputs, landed);
      const summary = [
        `${inputs.preset.label} import resale margin`,
        `Landed cost per unit: ${formatCurrency(landed.perUnit, inputs.currency)}`,
        `Sale price: ${formatCurrency(inputs.salePrice, inputs.currency)}`,
        `Channel costs: ${formatCurrency(result.channelCosts, inputs.currency)}`,
        `Profit per unit: ${formatCurrency(result.profitPerUnit, inputs.currency)}`,
        `Gross margin: ${formatPercent(result.grossMargin)}`,
        `Target resale price: ${Number.isFinite(result.targetPrice) ? formatCurrency(result.targetPrice, inputs.currency) : "No safe price"}`
      ].join("\n");
      try {
        await navigator.clipboard.writeText(summary);
        copyButton.textContent = "Copied";
        window.setTimeout(() => {
          copyButton.textContent = "Copy margin plan";
        }, 1200);
      } catch (_error) {
        copyButton.textContent = "Copy failed";
        window.setTimeout(() => {
          copyButton.textContent = "Copy margin plan";
        }, 1200);
      }
    });

    renderImportMarginTool(scope);
  });
}

function readQuoteInputs(scope) {
  const baseInputs = readToolInputs(scope);
  return {
    ...baseInputs,
    targetSellPrice: safeNumber(byField(scope, "targetSellPrice")?.value),
    targetMargin: safeNumber(byField(scope, "targetMargin")?.value) / 100,
    quotes: ["A", "B", "C"].map((key) => ({
      key,
      name: byField(scope, `supplier${key}Name`)?.value?.trim() || `Supplier ${key}`,
      unitCost: safeNumber(byField(scope, `supplier${key}UnitCost`)?.value),
      units: Math.max(1, safeNumber(byField(scope, `supplier${key}Units`)?.value || 1)),
      freight: safeNumber(byField(scope, `supplier${key}Freight`)?.value),
      insurance: safeNumber(byField(scope, `supplier${key}Insurance`)?.value),
      extra: safeNumber(byField(scope, `supplier${key}Extra`)?.value),
      defectRate: clamp(safeNumber(byField(scope, `supplier${key}DefectRate`)?.value), 0, 60) / 100,
      leadDays: safeNumber(byField(scope, `supplier${key}LeadDays`)?.value)
    }))
  };
}

function calculateSupplierQuote(inputs, quote) {
  const productValue = quote.unitCost * quote.units;
  const landedInputs = {
    ...inputs,
    productValue,
    shippingCost: quote.freight,
    insuranceCost: quote.insurance,
    misc: inputs.misc + quote.extra,
    units: quote.units
  };
  const landed = calculateLandedCost(landedInputs);
  const sellableUnits = Math.max(1, quote.units * (1 - quote.defectRate));
  const landedPerSellableUnit = landed.totalLanded / sellableUnits;
  const grossProfitAtTarget = inputs.targetSellPrice - landedPerSellableUnit;
  const marginAtTarget = inputs.targetSellPrice > 0 ? (grossProfitAtTarget / inputs.targetSellPrice) * 100 : 0;
  const denominator = 1 - inputs.targetMargin;
  const targetPrice = denominator > 0 ? landedPerSellableUnit / denominator : Infinity;

  return {
    ...quote,
    productValue,
    landed,
    sellableUnits,
    landedPerSellableUnit,
    grossProfitAtTarget,
    marginAtTarget,
    targetPrice
  };
}

function quoteReadout(result, best) {
  if (result === best && result.marginAtTarget >= 30) return "Best cost and healthy margin";
  if (result === best) return "Best landed cost";
  if (result.leadDays < best.leadDays && result.landedPerSellableUnit <= best.landedPerSellableUnit * 1.08) {
    return "Faster, close-cost backup";
  }
  if (result.marginAtTarget < 0) return "Loses money at target sale price";
  if (result.defectRate >= 0.05) return "Defect allowance is pressuring sellable cost";
  return "Viable alternate";
}

function renderSupplierQuoteRows(scope, results, inputs) {
  const body = byOutput(scope, "quoteRows");
  if (!body) return;
  const best = results[0];
  body.innerHTML = results
    .map((result, index) => `<tr>
      <td>${index + 1}</td>
      <td>${result.name}</td>
      <td>${formatCurrency(result.unitCost, inputs.currency)}</td>
      <td>${formatCurrency(result.landedPerSellableUnit, inputs.currency)}</td>
      <td>${formatCurrency(result.landed.totalLanded, inputs.currency)}</td>
      <td>${formatPercent(result.marginAtTarget)}</td>
      <td>${compactNumber.format(result.leadDays)} days</td>
      <td>${quoteReadout(result, best)}</td>
    </tr>`)
    .join("");
}

function buildSupplierQuoteInsights(results, inputs) {
  const best = results[0];
  const highest = results[results.length - 1];
  const factoryCheapest = [...results].sort((a, b) => a.unitCost - b.unitCost)[0];
  const notes = [];
  if (factoryCheapest.name !== best.name) {
    notes.push(`${factoryCheapest.name} has the lowest factory unit quote, but ${best.name} wins after freight, duty, tax, inspection, and defect allowance.`);
  } else {
    notes.push(`${best.name} is also the cheapest on landed cost, not just factory unit quote.`);
  }
  if (best.marginAtTarget < inputs.targetMargin * 100) {
    notes.push(`At the target sale price, the best quote misses the ${formatPercent(inputs.targetMargin * 100)} margin target. It needs about ${formatCurrency(best.targetPrice, inputs.currency)} per unit.`);
  }
  if (highest.landedPerSellableUnit > best.landedPerSellableUnit * 1.15) {
    notes.push(`The landed spread is meaningful: the most expensive quote is ${formatCurrency(highest.landedPerSellableUnit - best.landedPerSellableUnit, inputs.currency)} higher per sellable unit.`);
  }
  if (best.defectRate >= 0.04) {
    notes.push("The winning quote still has a high defect allowance. Ask for inspection evidence or tighten acceptance criteria before issuing the PO.");
  }
  if (best.landed.upliftPercent >= 35) {
    notes.push("Import overhead is high relative to product value, so freight consolidation and brokerage terms may matter as much as supplier negotiation.");
  }
  return notes;
}

function renderSupplierQuoteTool(scope) {
  const inputs = readQuoteInputs(scope);
  const results = inputs.quotes
    .map((quote) => calculateSupplierQuote(inputs, quote))
    .sort((a, b) => a.landedPerSellableUnit - b.landedPerSellableUnit);
  const best = results[0];
  const highest = results[results.length - 1];
  const spread = highest.landedPerSellableUnit - best.landedPerSellableUnit;
  const [status, tone] = best.marginAtTarget >= inputs.targetMargin * 100
    ? ["Best quote clears target", "good"]
    : best.marginAtTarget >= 0
      ? ["Best quote needs price work", "warn"]
      : ["Best quote loses money", "bad"];

  setText(scope, "thresholdNote", inputs.preset.thresholdNote);
  setText(scope, "assumptionNote", inputs.preset.basisNote);
  setText(scope, "quoteBestPerUnit", formatCurrency(best.landedPerSellableUnit, inputs.currency));
  setText(scope, "quoteBestName", best.name);
  setText(scope, "quoteSpread", formatCurrency(spread, inputs.currency));
  setText(scope, "quoteBestCash", formatCurrency(best.landed.totalLanded, inputs.currency));
  setText(scope, "quoteBestMargin", formatPercent(best.marginAtTarget));
  setText(scope, "quoteTargetPrice", Number.isFinite(best.targetPrice) ? formatCurrency(best.targetPrice, inputs.currency) : "No safe price");
  setText(scope, "quoteStatus", status);
  setText(
    scope,
    "quoteFormulaLine",
    `${best.name}: landed cost per sellable unit = ${formatCurrency(best.landed.totalLanded, inputs.currency)} total landed / ${compactNumber.format(best.sellableUnits)} sellable units = ${formatCurrency(best.landedPerSellableUnit, inputs.currency)}.`
  );

  const statusNode = byOutput(scope, "quoteStatusTone");
  if (statusNode) statusNode.className = `status-pill ${tone}`;
  const meter = byOutput(scope, "quoteMeter");
  if (meter) meter.style.setProperty("--value", `${clamp(best.marginAtTarget, 0, 45) / 45 * 100}%`);

  renderSupplierQuoteRows(scope, results, inputs);
  const insightList = byOutput(scope, "quoteInsights");
  if (insightList) {
    insightList.innerHTML = buildSupplierQuoteInsights(results, inputs)
      .map((item) => `<li>${item}</li>`)
      .join("");
  }

  window.currentSupplierQuoteReport = { inputs, results };
}

function initSupplierQuoteTools() {
  document.querySelectorAll("[data-supplier-quote-tool]").forEach((scope) => {
    const marketField = byField(scope, "market");
    if (marketField) {
      applyPreset(scope, marketField.value || "US");
      marketField.addEventListener("change", () => {
        applyPreset(scope, marketField.value);
        renderSupplierQuoteTool(scope);
      });
    }

    scope.querySelectorAll("input, select").forEach((field) => {
      field.addEventListener("input", () => renderSupplierQuoteTool(scope));
      field.addEventListener("change", () => renderSupplierQuoteTool(scope));
    });

    const copyButton = byOutput(scope, "copyQuoteSummary");
    copyButton?.addEventListener("click", async () => {
      const report = window.currentSupplierQuoteReport;
      if (!report) return;
      const best = report.results[0];
      const lines = [
        "Import supplier quote comparison",
        `Recommended supplier: ${best.name}`,
        `Best landed cost per sellable unit: ${formatCurrency(best.landedPerSellableUnit, report.inputs.currency)}`,
        `Total landed cash tied up: ${formatCurrency(best.landed.totalLanded, report.inputs.currency)}`,
        `Margin at target sale price: ${formatPercent(best.marginAtTarget)}`,
        `Sell price for target margin: ${Number.isFinite(best.targetPrice) ? formatCurrency(best.targetPrice, report.inputs.currency) : "No safe price"}`
      ];
      try {
        await navigator.clipboard.writeText(lines.join("\n"));
        copyButton.textContent = "Copied";
        window.setTimeout(() => {
          copyButton.textContent = "Copy quote comparison";
        }, 1200);
      } catch (_error) {
        copyButton.textContent = "Copy failed";
        window.setTimeout(() => {
          copyButton.textContent = "Copy quote comparison";
        }, 1200);
      }
    });

    renderSupplierQuoteTool(scope);
  });
}

function initLandedCostTools() {
  const tools = document.querySelectorAll("[data-landed-cost-tool]");
  tools.forEach((scope) => {
    const marketField = byField(scope, "market");
    if (marketField) {
      applyPreset(scope, marketField.value || "US");
      marketField.addEventListener("change", () => {
        applyPreset(scope, marketField.value);
        renderTool(scope);
      });
    }

    scope.querySelectorAll("input, select").forEach((field) => {
      field.addEventListener("input", () => renderTool(scope));
      field.addEventListener("change", () => renderTool(scope));
    });

    attachCopySummary(scope);
    attachCsvAndHistory(scope);
    renderTool(scope);
  });
}

function buildHsBrief(scope) {
  const clean = (value, fallback) => {
    const text = (value || "").trim().replace(/[.\s]+$/g, "");
    return text || fallback;
  };
  const product = clean(byField(scope, "productName")?.value, "Unnamed product");
  const material = clean(byField(scope, "material")?.value, "material not specified");
  const use = clean(byField(scope, "useCase")?.value, "use case not specified");
  const origin = clean(byField(scope, "origin")?.value, "origin not specified");
  const components = clean(byField(scope, "components")?.value, "component mix not specified");
  const notes = clean(byField(scope, "classificationNotes")?.value, "");
  return [
    `Broker brief: ${product}.`,
    `Primary material: ${material}.`,
    `Intended use: ${use}.`,
    `Country of origin: ${origin}.`,
    `Construction or component detail: ${components}.`,
    notes ? `Commercial notes: ${notes}.` : null,
    "Ask for the probable HS heading, competing alternatives, and the documents needed to defend the final code."
  ]
    .filter(Boolean)
    .join(" ");
}

function initHsBriefBuilder() {
  const builders = document.querySelectorAll("[data-hs-brief-builder]");
  builders.forEach((scope) => {
    const update = () => {
      const brief = buildHsBrief(scope);
      const output = byOutput(scope, "brief");
      if (output) output.textContent = brief;
    };

    scope.querySelectorAll("input, textarea").forEach((field) => {
      field.addEventListener("input", update);
    });

    const button = byOutput(scope, "copyBrief");
    if (button) {
      button.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(buildHsBrief(scope));
          button.textContent = "Copied";
          window.setTimeout(() => {
            button.textContent = "Copy brief";
          }, 1200);
        } catch (_error) {
          button.textContent = "Copy failed";
          window.setTimeout(() => {
            button.textContent = "Copy brief";
          }, 1200);
        }
      });
    }

    update();
  });
}

function initStaticBits() {
  document.querySelectorAll("[data-review-date]").forEach((node) => {
    node.textContent = SITE_REVIEW_DATE;
  });

  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    if (href === path || (path === "" && href === "index.html")) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function readConsentChoice() {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch (_error) {
    return null;
  }
}

function writeConsentChoice(choice) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch (_error) {
    // Ignore storage failures in privacy-restricted browsers.
  }
}

function loadAdSense() {
  if (!ADSENSE_CLIENT || document.querySelector(`script[data-adsense-client="${ADSENSE_CLIENT}"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.dataset.adsenseClient = ADSENSE_CLIENT;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
  document.head.appendChild(script);
}

function applyConsentChoice(choice) {
  if (choice === "accepted") {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => loadAdSense(), { timeout: 1800 });
    } else {
      window.setTimeout(() => loadAdSense(), 240);
    }
  }
}

function hideConsentBanner() {
  document.querySelector("[data-consent-banner]")?.remove();
}

function showConsentBanner() {
  if (document.querySelector("[data-consent-banner]")) return;

  const banner = document.createElement("aside");
  banner.className = "consent-banner";
  banner.dataset.consentBanner = "true";
  banner.innerHTML = `
    <div class="consent-panel" role="dialog" aria-live="polite" aria-label="Cookie preferences">
      <div class="consent-copy">
        <strong>Privacy choices</strong>
        <p>Crossborder Kit can use local storage and Google AdSense cookies to remember your consent choice, support ads, and keep the tools free. The calculators still work if you continue without ad cookies.</p>
      </div>
      <div class="consent-actions">
        <button type="button" class="primary" data-consent-action="accept">Allow ad cookies</button>
        <button type="button" data-consent-action="reject">Continue without ads</button>
        <a class="button ghost" href="privacy.html">Read privacy policy</a>
      </div>
    </div>
  `;

  banner.querySelectorAll("[data-consent-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.getAttribute("data-consent-action") === "accept" ? "accepted" : "rejected";
      writeConsentChoice(choice);
      applyConsentChoice(choice);
      hideConsentBanner();
    });
  });

  document.body.appendChild(banner);
}

function mountConsentManager() {
  if (document.querySelector("[data-consent-manage]")) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "consent-manage";
  button.dataset.consentManage = "true";
  button.textContent = "Privacy choices";
  button.addEventListener("click", () => {
    hideConsentBanner();
    showConsentBanner();
  });

  const footerMeta = document.querySelector(".footer-inner span:last-child");
  if (footerMeta) {
    footerMeta.append(" · ");
    footerMeta.appendChild(button);
    return;
  }

  document.body.appendChild(button);
}

function initConsentAndAds() {
  mountConsentManager();
  const choice = readConsentChoice();
  if (choice === "accepted" || choice === "rejected") {
    applyConsentChoice(choice);
    return;
  }

  showConsentBanner();
}

document.addEventListener("DOMContentLoaded", () => {
  initStaticBits();
  initConsentAndAds();
  initLandedCostTools();
  initImportMarginTools();
  initSupplierQuoteTools();
  initHsBriefBuilder();
});
