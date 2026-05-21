const SITE_REVIEW_DATE = "May 21, 2026";
const US_DE_MINIMIS_NOTE_DATE = "August 29, 2025";

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

  const thresholdFlag = byOutput(scope, "thresholdFlag");
  if (thresholdFlag) {
    thresholdFlag.textContent = result.thresholdEligible ? "Eligible in this model" : "Not triggered";
  }
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

document.addEventListener("DOMContentLoaded", () => {
  initStaticBits();
  initLandedCostTools();
  initHsBriefBuilder();
});
