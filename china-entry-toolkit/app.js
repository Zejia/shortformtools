const SITE_REVIEW_DATE = "May 21, 2026";
const UNILATERAL_VISA_FREE_END = "December 31, 2026";
const UNILATERAL_VISA_FREE_SOURCE_DATE = "February 17, 2026";
const TRANSIT_POLICY_SOURCE_DATE = "July 4, 2025";
const TRANSIT_PORT_UPDATE_DATE = "November 5, 2025";
const ADSENSE_CLIENT = "ca-pub-4259477754165351";
const CONSENT_STORAGE_KEY = "chinaentrytoolkit-consent-v1";

const countryRows = [
  ["AL", "Albania", "Europe", false, true],
  ["AD", "Andorra", "Europe", true, false],
  ["AR", "Argentina", "Americas", true, true],
  ["AU", "Australia", "Oceania", true, true],
  ["AT", "Austria", "Europe", true, true],
  ["BH", "Bahrain", "Asia", true, false],
  ["BY", "Belarus", "Europe", false, true],
  ["BE", "Belgium", "Europe", true, true],
  ["BA", "Bosnia and Herzegovina", "Europe", false, true],
  ["BR", "Brazil", "Americas", true, true],
  ["BN", "Brunei", "Asia", true, true],
  ["BG", "Bulgaria", "Europe", true, true],
  ["CA", "Canada", "Americas", true, true],
  ["CL", "Chile", "Americas", true, true],
  ["HR", "Croatia", "Europe", true, true],
  ["CY", "Cyprus", "Europe", true, true],
  ["CZ", "Czech Republic", "Europe", false, true],
  ["DK", "Denmark", "Europe", true, true],
  ["EE", "Estonia", "Europe", true, true],
  ["FI", "Finland", "Europe", true, true],
  ["FR", "France", "Europe", true, true],
  ["DE", "Germany", "Europe", true, true],
  ["GR", "Greece", "Europe", true, true],
  ["HU", "Hungary", "Europe", true, true],
  ["IS", "Iceland", "Europe", true, true],
  ["ID", "Indonesia", "Asia", false, true],
  ["IE", "Ireland", "Europe", true, true],
  ["IT", "Italy", "Europe", true, true],
  ["JP", "Japan", "Asia", true, true],
  ["KW", "Kuwait", "Asia", true, false],
  ["LV", "Latvia", "Europe", true, true],
  ["LI", "Liechtenstein", "Europe", true, false],
  ["LT", "Lithuania", "Europe", false, true],
  ["LU", "Luxembourg", "Europe", true, true],
  ["MT", "Malta", "Europe", true, true],
  ["MX", "Mexico", "Americas", false, true],
  ["MC", "Monaco", "Europe", true, true],
  ["ME", "Montenegro", "Europe", true, true],
  ["NL", "Netherlands", "Europe", true, true],
  ["NZ", "New Zealand", "Oceania", true, true],
  ["MK", "North Macedonia", "Europe", true, true],
  ["NO", "Norway", "Europe", true, true],
  ["OM", "Oman", "Asia", true, false],
  ["PE", "Peru", "Americas", true, false],
  ["PL", "Poland", "Europe", true, true],
  ["PT", "Portugal", "Europe", true, true],
  ["QA", "Qatar", "Asia", false, true],
  ["RO", "Romania", "Europe", true, true],
  ["RU", "Russian Federation", "Europe", true, true],
  ["SA", "Saudi Arabia", "Asia", true, false],
  ["RS", "Serbia", "Europe", false, true],
  ["SG", "Singapore", "Asia", false, true],
  ["SK", "Slovakia", "Europe", true, true],
  ["SI", "Slovenia", "Europe", true, true],
  ["KR", "Republic of Korea", "Asia", true, true],
  ["ES", "Spain", "Europe", true, true],
  ["SE", "Sweden", "Europe", true, true],
  ["CH", "Switzerland", "Europe", true, true],
  ["AE", "United Arab Emirates", "Asia", false, true],
  ["UA", "Ukraine", "Europe", false, true],
  ["GB", "United Kingdom", "Europe", true, true],
  ["US", "United States", "Americas", false, true],
  ["UY", "Uruguay", "Americas", true, false],
  ["IN", "India", "Asia", false, false],
  ["PH", "Philippines", "Asia", false, false],
  ["TH", "Thailand", "Asia", false, false],
  ["TR", "Turkey", "Asia", false, false],
  ["VN", "Vietnam", "Asia", false, false],
  ["ZA", "South Africa", "Africa", false, false]
];

const countries = countryRows
  .map(([code, name, region, unilateral, transit]) => ({ code, name, region, unilateral, transit }))
  .sort((a, b) => a.name.localeCompare(b.name));

const countryMap = new Map(countries.map((country) => [country.code, country]));
const routePoints = [
  { code: "HK", name: "Hong Kong SAR" },
  { code: "MO", name: "Macao SAR" },
  { code: "TW", name: "Taiwan region" },
  ...countries.map(({ code, name }) => ({ code, name }))
];

const transitZones = [
  {
    code: "bj",
    name: "Beijing-Tianjin-Hebei",
    note: "Good if you plan to stay around Beijing, Tianjin, or Hebei after entering through an eligible port in the region."
  },
  {
    code: "yd",
    name: "Shanghai-Jiangsu-Zhejiang",
    note: "Best for Shanghai and the surrounding Yangtze Delta transit pattern."
  },
  {
    code: "gd",
    name: "Guangdong and Greater Bay gateways",
    note: "Useful for Guangzhou, Shenzhen, Zhuhai, and nearby eligible entries."
  },
  {
    code: "sc",
    name: "Sichuan-Chongqing",
    note: "Designed for Chengdu and Chongqing style itineraries."
  },
  {
    code: "other",
    name: "Another eligible 240-hour region",
    note: "Use this if you already know your entry port is one of the 65 eligible ports."
  },
  {
    code: "unsure",
    name: "I am not sure yet",
    note: "The general rule check can still help, but you should confirm your port and stay area before booking."
  }
];

const addressCardPresets = {
  taxi: {
    requestEn: "Please take me to this address.",
    requestZh: "请带我去这个地址。",
    defaultNoteEn: "I will show you the exact address on my phone.",
    defaultNoteZh: "我会在手机上给您看详细地址。"
  },
  hotel: {
    requestEn: "I have a reservation here. Please help me get to the main entrance.",
    requestZh: "我在这里有预订，请带我到正门。",
    defaultNoteEn: "If needed, please call the front desk for me.",
    defaultNoteZh: "如果需要，请帮我联系前台。"
  },
  help: {
    requestEn: "Could you help me find this place?",
    requestZh: "请问您可以帮我找一下这个地方吗？",
    defaultNoteEn: "Thank you for helping me confirm the route.",
    defaultNoteZh: "谢谢您帮我确认路线。"
  }
};

const taxiRideCardPresets = {
  airport: {
    titleEn: "Airport or station pickup",
    titleZh: "机场或车站上车",
    requestEn: "Hello, I am waiting at this pickup point. Please contact me if you cannot find me.",
    requestZh: "您好，我在这个上车点等车。如果找不到我，请联系我。",
    noteEn: "I have luggage. Please go to the pickup area if possible.",
    noteZh: "我有行李。如可以，请到上车区接我。"
  },
  hotel: {
    titleEn: "Ride to hotel",
    titleZh: "前往酒店",
    requestEn: "Please take me to this hotel or address.",
    requestZh: "请带我去这个酒店或地址。",
    noteEn: "Please stop near the main entrance.",
    noteZh: "请在正门附近停车。"
  },
  driver: {
    titleEn: "Driver help",
    titleZh: "司机沟通",
    requestEn: "I do not speak Chinese well. Please use the address and notes below.",
    requestZh: "我中文不太好，请参考下面的地址和说明。",
    noteEn: "If needed, please call the contact person.",
    noteZh: "如有需要，请联系联系人。"
  }
};

const allergyItems = {
  peanuts: { en: "peanuts", zh: "花生" },
  "tree-nuts": { en: "tree nuts", zh: "坚果" },
  shellfish: { en: "shellfish", zh: "贝类" },
  fish: { en: "fish", zh: "鱼" },
  egg: { en: "egg", zh: "鸡蛋" },
  milk: { en: "milk and dairy", zh: "牛奶和奶制品" },
  sesame: { en: "sesame", zh: "芝麻" },
  soy: { en: "soy", zh: "大豆" },
  wheat: { en: "wheat", zh: "小麦" },
  gluten: { en: "gluten", zh: "麸质" }
};

const dietNotes = {
  none: null,
  vegetarian: {
    en: "I do not eat meat or seafood.",
    zh: "我不吃肉和海鲜。"
  },
  vegan: {
    en: "I do not eat meat, seafood, eggs, or dairy.",
    zh: "我不吃肉、海鲜、鸡蛋和奶制品。"
  },
  "no-pork": {
    en: "I do not eat pork.",
    zh: "我不吃猪肉。"
  },
  "no-beef": {
    en: "I do not eat beef.",
    zh: "我不吃牛肉。"
  }
};

const hotelCardPresets = {
  checkin: {
    titleEn: "Hotel check-in",
    titleZh: "酒店入住",
    requestEn: "Hello, I have a reservation and would like to check in.",
    requestZh: "您好，我有预订，想办理入住。",
    noteEn: "Please let me know if you need my passport, booking confirmation, or phone number.",
    noteZh: "如果需要我的护照、预订确认单或手机号码，请告诉我。"
  },
  late: {
    titleEn: "Late arrival",
    titleZh: "晚到入住",
    requestEn: "Hello, I will arrive late, but I still need to check in tonight.",
    requestZh: "您好，我会比较晚到，但今晚仍需要办理入住。",
    noteEn: "Please keep the reservation if possible. I will show my booking confirmation when I arrive.",
    noteZh: "如可以，请帮我保留预订。我到达时会出示预订确认单。"
  },
  help: {
    titleEn: "Need front-desk help",
    titleZh: "需要前台帮助",
    requestEn: "Hello, could you please help me with this hotel or reservation question?",
    requestZh: "您好，可以请您帮我处理这个酒店或预订问题吗？",
    noteEn: "I may need help with the address, payment, deposit, Wi-Fi, or room access.",
    noteZh: "我可能需要帮助确认地址、付款、押金、无线网络或房间门卡。"
  }
};

const allowedVisitPurposes = new Set(["tourism", "business", "family", "exchange", "transit"]);
const allowedTransitPurposes = new Set(["tourism", "business", "family", "exchange"]);

function formatNumber(value, digits = 0) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(value);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function nonEmpty(values) {
  return values.map((value) => (value || "").trim()).filter(Boolean);
}

function hoursBetween(startValue, endValue) {
  if (!startValue || !endValue) return null;
  const start = new Date(startValue);
  const end = new Date(endValue);
  const diff = (end.getTime() - start.getTime()) / 36e5;
  return Number.isFinite(diff) ? diff : null;
}

function visaFreeDeadline(entryValue) {
  if (!entryValue) return null;
  const entry = new Date(entryValue);
  if (!Number.isFinite(entry.getTime())) return null;
  const start = new Date(entry);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + 1);
  const deadline = new Date(start);
  deadline.setDate(deadline.getDate() + 30);
  return { start, deadline };
}

function thirdRegionSatisfied(origin, destination) {
  return origin && destination && origin !== destination;
}

function statusTone(status) {
  if (status === "Eligible" || status === "Ready") return "good";
  if (status === "Check carefully") return "warn";
  return "bad";
}

function populateCountrySelect(select, includeBlank = false, blankLabel = "Choose nationality") {
  if (!select) return;
  const regionOrder = ["Americas", "Europe", "Oceania", "Asia", "Africa"];
  const grouped = new Map();
  regionOrder.forEach((region) => grouped.set(region, []));
  countries.forEach((country) => {
    if (!grouped.has(country.region)) grouped.set(country.region, []);
    grouped.get(country.region).push(country);
  });
  const fragments = [];
  if (includeBlank) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = blankLabel;
    fragments.push(option);
  }
  grouped.forEach((items, region) => {
    if (!items.length) return;
    const group = document.createElement("optgroup");
    group.label = region;
    items.forEach((country) => {
      const option = document.createElement("option");
      option.value = country.code;
      option.textContent = country.name;
      group.appendChild(option);
    });
    fragments.push(group);
  });
  select.replaceChildren(...fragments);
}

function populateRouteSelect(select, includeBlankLabel) {
  if (!select) return;
  const items = [];
  if (includeBlankLabel) {
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = includeBlankLabel;
    items.push(blank);
  }
  const specialGroup = document.createElement("optgroup");
  specialGroup.label = "Regions that count as third destinations";
  ["HK", "MO", "TW"].forEach((code) => {
    const point = routePoints.find((item) => item.code === code);
    const option = document.createElement("option");
    option.value = point.code;
    option.textContent = point.name;
    specialGroup.appendChild(option);
  });
  items.push(specialGroup);
  const countryGroup = document.createElement("optgroup");
  countryGroup.label = "Countries";
  countries.forEach((point) => {
    const option = document.createElement("option");
    option.value = point.code;
    option.textContent = point.name;
    countryGroup.appendChild(option);
  });
  items.push(countryGroup);
  select.replaceChildren(...items);
}

function populateTransitZones(select) {
  if (!select) return;
  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "Choose your planned transit area";
  const options = [blank];
  transitZones.forEach((zone) => {
    const option = document.createElement("option");
    option.value = zone.code;
    option.textContent = zone.name;
    options.push(option);
  });
  select.replaceChildren(...options);
}

function renderStatus(container, result) {
  const pill = container.querySelector(".status-pill");
  const verdict = container.querySelector(".verdict");
  const reason = container.querySelector(".reason");
  const nextSteps = container.querySelector(".next-steps");
  const facts = container.querySelector(".facts");
  const source = container.querySelector(".source-line");
  if (!pill || !verdict || !reason || !nextSteps || !facts || !source) return;

  pill.textContent = result.status;
  pill.className = `status-pill ${statusTone(result.status)}`;
  verdict.textContent = result.headline;
  reason.textContent = result.reason;
  nextSteps.innerHTML = result.steps.map((step) => `<li>${step}</li>`).join("");
  facts.innerHTML = result.facts.map((fact) => `<div class="fact"><strong>${fact.value}</strong><span>${fact.label}</span></div>`).join("");
  source.textContent = result.source;
}

function renderArrivalPlan(container, result) {
  const pill = container.querySelector(".status-pill");
  const verdict = container.querySelector(".verdict");
  const reason = container.querySelector(".reason");
  const priorities = container.querySelector(".next-steps");
  const sections = container.querySelector(".arrival-sections");
  const facts = container.querySelector(".facts");
  const source = container.querySelector(".source-line");
  if (!pill || !verdict || !reason || !priorities || !sections || !facts || !source) return;

  pill.textContent = result.status;
  pill.className = `status-pill ${statusTone(result.status)}`;
  verdict.textContent = result.headline;
  reason.textContent = result.reason;
  priorities.innerHTML = result.priorities.map((item) => `<li>${item}</li>`).join("");
  sections.innerHTML = result.sections.map((section) => `
    <div class="arrival-block">
      <h4>${section.title}</h4>
      <ul>${section.items.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
  `).join("");
  facts.innerHTML = result.facts.map((fact) => `<div class="fact"><strong>${fact.value}</strong><span>${fact.label}</span></div>`).join("");
  source.textContent = result.source;
}

function visitEligibility(country, purpose, stayDays, ordinaryPassport) {
  if (!ordinaryPassport) {
    return {
      status: "Check carefully",
      headline: "This release assumes an ordinary passport.",
      reason: "The 30-day unilateral visa-free list published by the National Immigration Administration applies to ordinary passport holders. Diplomatic, service, and other document types may follow different rules.",
      steps: [
        "Check your passport type against the exact policy used by your embassy or airline.",
        "If you hold an ordinary passport, switch the toggle and re-run the check.",
        "If you are actually in transit, use the transit checker instead of the visit mode."
      ],
      facts: [
        { label: "Stay modeled", value: `${stayDays} day${stayDays === 1 ? "" : "s"}` },
        { label: "Purpose", value: purposeLabel(purpose) },
        { label: "Policy scope", value: "Ordinary passports only" }
      ],
      source: `Policy review date: ${SITE_REVIEW_DATE}`
    };
  }

  if (!country.unilateral) {
    return {
      status: "Not covered",
      headline: `${country.name} is not on the 30-day unilateral list modeled here.`,
      reason: "That does not automatically mean you cannot travel. It means this first-release checker did not match you to China's current unilateral 30-day visa-free list.",
      steps: [
        "If your trip is a true onward transit, try the 240-hour transit checker.",
        "You may still qualify under a mutual exemption or regional program not modeled in this release.",
        "Use official consular or immigration sources before you book non-refundable travel."
      ],
      facts: [
        { label: "Country", value: country.name },
        { label: "30-day unilateral policy", value: "No match" },
        { label: "240-hour transit list", value: country.transit ? "Yes" : "No" }
      ],
      source: `Unilateral list compiled by NIA as of ${UNILATERAL_VISA_FREE_SOURCE_DATE}`
    };
  }

  if (!allowedVisitPurposes.has(purpose)) {
    return {
      status: "Not covered",
      headline: "Your trip purpose is outside this 30-day visa-free policy.",
      reason: "The official list covers business, tourism, visits to relatives and friends, exchange visits, and transit. It does not cover work, study, or news reporting.",
      steps: [
        "Switch the purpose if your trip was misclassified.",
        "If you plan to work, study, or report, assume you need the correct visa before departure.",
        "Check the embassy or visa center instructions for your route and passport."
      ],
      facts: [
        { label: "Country", value: country.name },
        { label: "Purpose", value: purposeLabel(purpose) },
        { label: "30-day limit", value: "Applies only to covered purposes" }
      ],
      source: `Unilateral list compiled by NIA as of ${UNILATERAL_VISA_FREE_SOURCE_DATE}`
    };
  }

  if (stayDays > 30) {
    return {
      status: "Not covered",
      headline: "Your stay is longer than the 30-day unilateral allowance.",
      reason: "This policy only covers stays of up to 30 days, counted from 00:00 on the day after entry.",
      steps: [
        "Use the stay calculator to see the practical deadline for your entry date.",
        "Shorten the trip, split it, or plan a visa route instead.",
        "If your stop is actually transit, test it in the 240-hour transit checker."
      ],
      facts: [
        { label: "Planned stay", value: `${stayDays} days` },
        { label: "Modeled limit", value: "30 days" },
        { label: "Country", value: country.name }
      ],
      source: `Unilateral list compiled by NIA as of ${UNILATERAL_VISA_FREE_SOURCE_DATE}`
    };
  }

  return {
    status: "Eligible",
    headline: `${country.name} is on the current 30-day unilateral visa-free list.`,
    reason: `For ordinary passport holders traveling for ${purposeLabel(purpose).toLowerCase()}, China's current unilateral visa-free policy can cover a stay of up to 30 days. The clock starts at 00:00 on the day after entry.`,
    steps: [
      "Keep proof of your onward or return travel, lodging, and trip purpose handy.",
      `Plan your exit before the 30-day window closes, and remember the current published end date is ${UNILATERAL_VISA_FREE_END}.`,
      "Final admission is still decided by border officers and carriers."
    ],
    facts: [
      { label: "Country", value: country.name },
      { label: "Policy window", value: "30 days" },
      { label: "Published through", value: UNILATERAL_VISA_FREE_END }
    ],
    source: `Unilateral list compiled by NIA as of ${UNILATERAL_VISA_FREE_SOURCE_DATE}`
  };
}

function transitEligibility(input) {
  const { country, purpose, hours, ordinaryPassport, onwardBooked, origin, destination, zoneCode, enteringEligiblePort, stayingInArea } = input;

  if (!country.transit) {
    return {
      status: "Not covered",
      headline: `${country.name} is not on the 240-hour transit list modeled here.`,
      reason: "China's current 240-hour visa-free transit policy is limited to nationals of 55 countries.",
      steps: [
        "Check whether a direct visa, mutual exemption, or regional policy applies instead.",
        "If you are on the unilateral 30-day list, test visit mode in the main checker.",
        "Do not assume a transit stop qualifies just because the airline itinerary looks short."
      ],
      facts: [
        { label: "Country", value: country.name },
        { label: "240-hour list", value: "No match" },
        { label: "30-day unilateral list", value: country.unilateral ? "Yes" : "No" }
      ],
      source: `Transit policy reviewed from NIA sources dated ${TRANSIT_POLICY_SOURCE_DATE} and ${TRANSIT_PORT_UPDATE_DATE}`
    };
  }

  if (!ordinaryPassport) {
    return {
      status: "Check carefully",
      headline: "This tool assumes an ordinary passport.",
      reason: "Different document types can trigger different treatment at the border. Use the policy as a screening step, not a final legal answer.",
      steps: [
        "Re-run with the ordinary passport toggle if that is what you hold.",
        "Otherwise verify your travel document rules directly with official guidance."
      ],
      facts: [
        { label: "Country", value: country.name },
        { label: "Passport", value: "Non-ordinary" },
        { label: "Transit list", value: "Country is covered" }
      ],
      source: `Transit policy reviewed from NIA sources dated ${TRANSIT_POLICY_SOURCE_DATE} and ${TRANSIT_PORT_UPDATE_DATE}`
    };
  }

  if (!allowedTransitPurposes.has(purpose)) {
    return {
      status: "Not covered",
      headline: "This trip purpose is outside the 240-hour transit activities described in the policy.",
      reason: "The official transit policy allows tourism, business, exchange visits, and family visits. Work, study, and reporting require the appropriate visa in advance.",
      steps: [
        "Switch the purpose if the trip was classified incorrectly.",
        "Assume you need a visa if your real plan is work, study, or media activity."
      ],
      facts: [
        { label: "Purpose", value: purposeLabel(purpose) },
        { label: "Country", value: country.name },
        { label: "Allowed stay", value: "Up to 240 hours" }
      ],
      source: `Transit policy reviewed from NIA sources dated ${TRANSIT_POLICY_SOURCE_DATE} and ${TRANSIT_PORT_UPDATE_DATE}`
    };
  }

  if (!thirdRegionSatisfied(origin, destination)) {
    return {
      status: "Not covered",
      headline: "Your route does not satisfy the third-country or third-region rule.",
      reason: "For the 240-hour transit policy, your onward destination must be a different country or region from where you came from. Hong Kong SAR, Macao SAR, and Taiwan region count as third regions.",
      steps: [
        "Change either the origin or the onward destination in the checker.",
        "If you are simply entering China and returning home later, use visit mode instead.",
        "Check route examples before you ticket the itinerary."
      ],
      facts: [
        { label: "Origin", value: routeName(origin) || "Not set" },
        { label: "Onward destination", value: routeName(destination) || "Not set" },
        { label: "Third-region rule", value: "Not satisfied" }
      ],
      source: `Transit policy reviewed from NIA sources dated ${TRANSIT_POLICY_SOURCE_DATE} and ${TRANSIT_PORT_UPDATE_DATE}`
    };
  }

  if (!onwardBooked) {
    return {
      status: "Check carefully",
      headline: "You still need a confirmed onward booking.",
      reason: "The policy requires interline tickets or other proof showing confirmed departure to a third country or region within the permitted window.",
      steps: [
        "Book the onward segment before relying on the transit rule.",
        "Keep the confirmed booking details ready for airline and border checks."
      ],
      facts: [
        { label: "Country", value: country.name },
        { label: "Onward ticket", value: "Not confirmed" },
        { label: "Route rule", value: "Otherwise looks plausible" }
      ],
      source: `Transit policy reviewed from NIA sources dated ${TRANSIT_POLICY_SOURCE_DATE} and ${TRANSIT_PORT_UPDATE_DATE}`
    };
  }

  if (hours === null || hours <= 0) {
    return {
      status: "Check carefully",
      headline: "Enter valid arrival and departure times first.",
      reason: "The transit check needs a real stay window to determine whether you are inside 240 hours.",
      steps: [
        "Add your arrival date and time in mainland China.",
        "Add the onward departure date and time."
      ],
      facts: [
        { label: "Country", value: country.name },
        { label: "Stay window", value: "Missing" },
        { label: "Max policy stay", value: "240 hours" }
      ],
      source: `Transit policy reviewed from NIA sources dated ${TRANSIT_POLICY_SOURCE_DATE} and ${TRANSIT_PORT_UPDATE_DATE}`
    };
  }

  if (hours > 240) {
    return {
      status: "Not covered",
      headline: "Your planned mainland stay is longer than 240 hours.",
      reason: "The current transit policy is capped at 240 hours, with the official stay period counted from 00:00 on the day after entry.",
      steps: [
        "Shorten the itinerary or change the entry model.",
        "Use the stay calculator to check your timing assumptions.",
        "If you need a longer stay, plan for a proper visa route."
      ],
      facts: [
        { label: "Planned stay", value: `${formatNumber(hours, 1)} hours` },
        { label: "Policy limit", value: "240 hours" },
        { label: "Route", value: `${routeName(origin)} → China → ${routeName(destination)}` }
      ],
      source: `Transit policy reviewed from NIA sources dated ${TRANSIT_POLICY_SOURCE_DATE} and ${TRANSIT_PORT_UPDATE_DATE}`
    };
  }

  if (!enteringEligiblePort || !stayingInArea) {
    const zone = transitZones.find((item) => item.code === zoneCode);
    return {
      status: "Check carefully",
      headline: "Your general rule fit looks good, but the port and area step still matters.",
      reason: "China's 240-hour transit policy only works through designated ports and permitted stay areas. This release checks the general rule first and then asks you to confirm the geography.",
      steps: [
        "Confirm that your first mainland entry point is one of the 65 eligible ports.",
        "Make sure you will stay inside the permitted area for that entry region.",
        zone ? zone.note : "Pick a transit region once you know your arrival plan."
      ],
      facts: [
        { label: "Country", value: country.name },
        { label: "Stay window", value: `${formatNumber(hours, 1)} hours` },
        { label: "Route", value: `${routeName(origin)} → China → ${routeName(destination)}` }
      ],
      source: `Transit policy reviewed from NIA sources dated ${TRANSIT_POLICY_SOURCE_DATE} and ${TRANSIT_PORT_UPDATE_DATE}`
    };
  }

  const zone = transitZones.find((item) => item.code === zoneCode);
  return {
    status: "Eligible",
    headline: "This itinerary passes the main 240-hour transit rule checks.",
    reason: "You selected an eligible nationality, a valid third-country or third-region route, a stay inside the 240-hour window, and the required port and permitted-area confirmations.",
    steps: [
      "Carry proof of your onward booking and eligibility for the next destination.",
      "Keep the transit region details with you at check-in and on arrival.",
      zone ? zone.note : "Confirm your exact port and permitted area before departure."
    ],
    facts: [
      { label: "Country", value: country.name },
      { label: "Stay window", value: `${formatNumber(hours, 1)} hours` },
      { label: "Route", value: `${routeName(origin)} → China → ${routeName(destination)}` }
    ],
    source: `Transit policy reviewed from NIA sources dated ${TRANSIT_POLICY_SOURCE_DATE} and ${TRANSIT_PORT_UPDATE_DATE}`
  };
}

function purposeLabel(value) {
  const labels = {
    tourism: "Tourism",
    business: "Business",
    family: "Visit to relatives or friends",
    exchange: "Exchange visit",
    transit: "Pure transit",
    study: "Study",
    work: "Work",
    media: "News reporting"
  };
  return labels[value] || "Trip";
}

function routeName(code) {
  const point = routePoints.find((item) => item.code === code);
  return point ? point.name : "";
}

function transitScript(input, result) {
  const origin = routeName(input.origin) || "my origin before mainland China";
  const destination = routeName(input.destination) || "my onward destination after mainland China";
  const hours = input.hours && input.hours > 0 ? `${formatNumber(input.hours, 1)} hours` : "within the permitted time window";
  const countryName = input.country?.name || "my passport nationality";

  if (!input.country) {
    return "I am checking whether my route can use China's 240-hour visa-free transit policy. I will confirm nationality, origin, onward destination, entry port, stay area, and confirmed onward booking before relying on it.";
  }

  if (result.status === "Eligible") {
    return `I am traveling on an ordinary ${countryName} passport from ${origin} to mainland China, then onward to ${destination}. My planned mainland stay is ${hours}. I have a confirmed onward departure and have checked that my entry port and stay area match the 240-hour transit requirements.`;
  }

  if (result.status === "Check carefully") {
    return `My route is ${origin} to mainland China, then onward to ${destination}, using a ${countryName} passport. The route may need extra verification: ${result.headline} I should confirm the onward booking, designated port, permitted stay area, and timing before check-in.`;
  }

  return `This route should not be treated as confirmed 240-hour visa-free transit yet. The checker flagged: ${result.headline} I should verify another legal entry basis, adjust the itinerary, or plan for a visa before travel.`;
}

function transitRouteSummary(input, result) {
  const countryName = input.country?.name || "Not selected";
  const origin = routeName(input.origin) || "Not selected";
  const destination = routeName(input.destination) || "Not selected";
  const zone = transitZones.find((item) => item.code === input.zoneCode);
  const hours = input.hours && input.hours > 0 ? `${formatNumber(input.hours, 1)} hours` : "Not calculated";
  return [
    "China 240-hour transit route summary",
    `Passport nationality: ${countryName}`,
    `Trip purpose: ${purposeLabel(input.purpose)}`,
    `Route: ${origin} -> mainland China -> ${destination}`,
    `Mainland stay window: ${hours}`,
    `Planned transit area: ${zone ? zone.name : "Not selected"}`,
    "",
    "Traveler confirmations",
    `- Ordinary passport: ${input.ordinaryPassport ? "yes" : "no"}`,
    `- Confirmed onward departure: ${input.onwardBooked ? "yes" : "no"}`,
    `- Entry port confirmed as designated: ${input.enteringEligiblePort ? "yes" : "no"}`,
    `- Stay area confirmed: ${input.stayingInArea ? "yes" : "no"}`,
    "",
    "Checker verdict",
    `${result.status}: ${result.headline}`,
    result.reason,
    "",
    "Next steps",
    ...result.steps.map((step) => `- ${step}`),
    "",
    "Airline check-in script",
    transitScript(input, result),
    "",
    `Transit policy reviewed from NIA sources dated ${TRANSIT_POLICY_SOURCE_DATE} and ${TRANSIT_PORT_UPDATE_DATE}`
  ].join("\n");
}

function formatList(items, locale = "en-US") {
  return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(items);
}

function uniqueItems(items) {
  return [...new Set(items.filter(Boolean))];
}

function arrivalEntryLabel(value) {
  const labels = {
    direct30: "30-day direct visit",
    transit240: "240-hour transit",
    visaHeld: "Visa already held",
    notSure: "Still unclear"
  };
  return labels[value] || "Arrival plan";
}

function paymentStateLabel(value) {
  const labels = {
    both: "Two wallets ready",
    alipay: "Alipay ready",
    wechat: "Weixin or WeChat ready",
    installed: "Installed, not fully proven",
    none: "No wallet setup yet"
  };
  return labels[value] || "Unknown";
}

function dataStateLabel(value) {
  const labels = {
    roaming: "Roaming or eSIM ready",
    wifi: "Airport or hotel Wi-Fi only",
    unset: "No data plan confirmed"
  };
  return labels[value] || "Unknown";
}

function arrivalWindowLabel(value) {
  const labels = {
    daytime: "Daytime arrival",
    evening: "Evening arrival",
    latenight: "Late-night arrival"
  };
  return labels[value] || "Arrival";
}

function transportNeedLabel(value) {
  const labels = {
    airportRide: "Airport or station ride",
    hotelCheckin: "Time-sensitive hotel check-in",
    cashier: "First payment or cashier test"
  };
  return labels[value] || "Arrival focus";
}

function tripStyleLabel(value) {
  const labels = {
    simple: "One city or simple transfer pattern",
    railHeavy: "Multiple rail legs or multi-city travel"
  };
  return labels[value] || "Trip pattern";
}

function foodNeedLabel(value) {
  const labels = {
    none: "No special food note",
    diet: "Dietary preference or ingredient avoidance",
    allergy: "Allergy warning needed"
  };
  return labels[value] || "Food communication";
}

function replaceLines(container, lines) {
  if (!container) return;
  container.replaceChildren(...lines.map((line) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = line;
    return paragraph;
  }));
}

async function copyText(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (error) {
    // Fall back to a hidden textarea when the async clipboard API is unavailable.
  }

  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  field.style.pointerEvents = "none";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(field);
  return copied;
}

function downloadTextFile(filename, text) {
  if (!text) return false;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

function printTravelCard(shell) {
  if (!shell) return;
  shell.classList.add("print-target");
  document.body.classList.add("print-travel-card");
  window.print();
  setTimeout(() => {
    shell.classList.remove("print-target");
    document.body.classList.remove("print-travel-card");
  }, 400);
}

function initPolicyMeta() {
  document.querySelectorAll("[data-policy-review]").forEach((node) => {
    node.textContent = SITE_REVIEW_DATE;
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
        <p>China Entry Toolkit can use local storage and Google AdSense cookies to remember your consent choice, support ads, and keep the tools free. The checker tools still work if you continue without ad cookies.</p>
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

  const footerMeta = document.querySelector(".site-footer .foot div:first-child");
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

function initEligibilityCheckers() {
  document.querySelectorAll(".eligibility-tool").forEach((tool) => {
    const countryField = tool.querySelector(".country-field");
    const purposeField = tool.querySelector(".purpose-field");
    const daysField = tool.querySelector(".days-field");
    const modeButtons = tool.querySelectorAll("[data-mode]");
    const transitPanel = tool.querySelector(".transit-fields");
    const ordinaryField = tool.querySelector(".ordinary-field");
    const originField = tool.querySelector(".origin-field");
    const destinationField = tool.querySelector(".destination-field");
    const transitHoursField = tool.querySelector(".transit-hours-field");
    const onwardField = tool.querySelector(".onward-field");
    const portField = tool.querySelector(".port-field");
    const areaField = tool.querySelector(".area-field");

    populateCountrySelect(countryField, true);
    populateRouteSelect(originField, "Choose origin");
    populateRouteSelect(destinationField, "Choose onward destination");

    let mode = "visit";

    function syncMode() {
      modeButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
      });
      if (transitPanel) {
        transitPanel.hidden = mode !== "transit";
      }
      evaluate();
    }

    function evaluate() {
      const country = countryMap.get(countryField?.value);
      if (!country) {
        renderStatus(tool, {
          status: "Check carefully",
          headline: "Choose a nationality to begin.",
          reason: "This first release screens China's 30-day unilateral visa-free list and the 240-hour transit list.",
          steps: [
            "Pick the passport nationality you plan to travel with.",
            "Then choose whether this is a direct visit or a transit itinerary."
          ],
          facts: [
            { label: "Modeled policies", value: "2" },
            { label: "Current unilateral list", value: "50 countries" },
            { label: "Current transit list", value: "55 countries" }
          ],
          source: `Policy review date: ${SITE_REVIEW_DATE}`
        });
        return;
      }

      const purpose = purposeField?.value || "tourism";
      const ordinaryPassport = ordinaryField?.checked ?? true;

      if (mode === "visit") {
        const days = clamp(Number(daysField?.value || 0), 0, 365);
        renderStatus(tool, visitEligibility(country, purpose, days, ordinaryPassport));
        return;
      }

      const hours = clamp(Number(transitHoursField?.value || 0), 0, 500);
      renderStatus(tool, transitEligibility({
        country,
        purpose,
        hours,
        ordinaryPassport,
        onwardBooked: onwardField?.checked ?? false,
        origin: originField?.value || "",
        destination: destinationField?.value || "",
        zoneCode: "",
        enteringEligiblePort: portField?.checked ?? false,
        stayingInArea: areaField?.checked ?? false
      }));
    }

    modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        mode = button.dataset.mode;
        syncMode();
      });
    });

    [countryField, purposeField, daysField, ordinaryField, originField, destinationField, transitHoursField, onwardField, portField, areaField]
      .filter(Boolean)
      .forEach((field) => {
        field.addEventListener("input", evaluate);
        field.addEventListener("change", evaluate);
      });

    syncMode();
  });
}

function initCountryCatalog() {
  const shell = document.querySelector("[data-country-catalog]");
  if (!shell) return;

  const search = shell.querySelector(".country-search");
  const regionButtons = shell.querySelectorAll("[data-region]");
  const list = shell.querySelector(".country-list");
  const count = shell.querySelector(".country-count");
  let region = "all";

  function render() {
    const term = (search?.value || "").trim().toLowerCase();
    const items = countries.filter((country) => {
      const matchesRegion = region === "all" || country.region === region;
      const matchesTerm = !term || country.name.toLowerCase().includes(term);
      return matchesRegion && matchesTerm && country.unilateral;
    });

    if (count) {
      count.textContent = `${items.length} countries on the current unilateral 30-day list`;
    }

    list.replaceChildren(...items.map((country) => {
      const row = document.createElement("article");
      row.className = "country-row";
      row.innerHTML = `
        <div>
          <h3>${country.name}</h3>
          <small>${country.region}</small>
        </div>
        <div><span class="tag">30 days</span></div>
        <div><span class="tag navy">${country.transit ? "Also on 240-hour transit list" : "Visit policy only in this release"}</span></div>
        <div>
          <strong>Ordinary passport holders</strong>
          <p>Business, tourism, visits to relatives and friends, exchange visits, and transit, with the current published policy window running through ${UNILATERAL_VISA_FREE_END}.</p>
        </div>
      `;
      return row;
    }));
  }

  regionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      region = button.dataset.region;
      regionButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      render();
    });
  });

  search?.addEventListener("input", render);
  render();
}

function initTransitChecker() {
  const shell = document.querySelector("[data-transit-checker]");
  if (!shell) return;

  const countryField = shell.querySelector(".country-field");
  const purposeField = shell.querySelector(".purpose-field");
  const ordinaryField = shell.querySelector(".ordinary-field");
  const originField = shell.querySelector(".origin-field");
  const destinationField = shell.querySelector(".destination-field");
  const arrivalField = shell.querySelector(".arrival-field");
  const departureField = shell.querySelector(".departure-field");
  const zoneField = shell.querySelector(".zone-field");
  const onwardField = shell.querySelector(".onward-field");
  const portField = shell.querySelector(".port-field");
  const areaField = shell.querySelector(".area-field");
  const copyScriptButton = shell.querySelector(".copy-airline-script");
  const downloadSummaryButton = shell.querySelector(".download-transit-summary");
  let summaryPayload = "";

  populateCountrySelect(countryField, true);
  populateRouteSelect(originField, "Choose where the trip starts");
  populateRouteSelect(destinationField, "Choose the onward destination");
  populateTransitZones(zoneField);

  function evaluate() {
    const country = countryMap.get(countryField?.value);
    const hours = hoursBetween(arrivalField?.value, departureField?.value);
    const zone = transitZones.find((item) => item.code === zoneField?.value);

    if (!country) {
      renderStatus(shell, {
        status: "Check carefully",
        headline: "Choose the nationality shown on the passport you plan to use.",
        reason: "This page checks the current 240-hour transit framework for nationals of 55 countries.",
        steps: [
          "Pick your nationality first.",
          "Then enter the origin, China stay window, and onward destination."
        ],
        facts: [
          { label: "Current transit list", value: "55 countries" },
          { label: "Eligible entry ports", value: "65 ports" },
          { label: "Permitted stay", value: "Up to 240 hours" }
        ],
        source: `Transit policy reviewed from NIA sources dated ${TRANSIT_POLICY_SOURCE_DATE} and ${TRANSIT_PORT_UPDATE_DATE}`
      });
      summaryPayload = "";
      if (downloadSummaryButton) downloadSummaryButton.disabled = true;
      return;
    }

    const transitInput = {
      country,
      purpose: purposeField?.value || "tourism",
      hours,
      ordinaryPassport: ordinaryField?.checked ?? true,
      onwardBooked: onwardField?.checked ?? false,
      origin: originField?.value || "",
      destination: destinationField?.value || "",
      zoneCode: zoneField?.value || "",
      enteringEligiblePort: portField?.checked ?? false,
      stayingInArea: areaField?.checked ?? false
    };
    const output = transitEligibility(transitInput);

    renderStatus(shell, output);

    const zoneNote = shell.querySelector(".zone-note");
    if (zoneNote) {
      zoneNote.textContent = zone ? zone.note : "Pick a transit region to see the most useful reminder for your stay area.";
    }

    const rawHours = shell.querySelector(".transit-hours-output");
    if (rawHours) {
      rawHours.textContent = hours && hours > 0 ? `${formatNumber(hours, 1)} hours in mainland China` : "Enter valid arrival and departure times";
    }

    const airlineScript = shell.querySelector(".airline-script");
    if (airlineScript) {
      airlineScript.textContent = transitScript(transitInput, output);
    }
    summaryPayload = transitRouteSummary(transitInput, output);
    if (downloadSummaryButton) downloadSummaryButton.disabled = false;
  }

  [countryField, purposeField, ordinaryField, originField, destinationField, arrivalField, departureField, zoneField, onwardField, portField, areaField]
    .filter(Boolean)
    .forEach((field) => {
      field.addEventListener("input", evaluate);
      field.addEventListener("change", evaluate);
    });

  copyScriptButton?.addEventListener("click", async () => {
    const script = shell.querySelector(".airline-script")?.textContent || "";
    if (!script) return;
    await navigator.clipboard.writeText(script);
    copyScriptButton.textContent = "Copied";
    setTimeout(() => {
      copyScriptButton.textContent = "Copy script";
    }, 1200);
  });

  downloadSummaryButton?.addEventListener("click", () => {
    const ok = downloadTextFile("china-transit-route-summary.txt", summaryPayload);
    downloadSummaryButton.textContent = ok ? "Downloaded" : "Download failed";
    setTimeout(() => {
      downloadSummaryButton.textContent = "Download route summary";
    }, 1200);
  });

  evaluate();
}

function initStayCalculator() {
  const shell = document.querySelector("[data-stay-calculator]");
  if (!shell) return;

  const entryField = shell.querySelector(".entry-field");
  const exitField = shell.querySelector(".exit-field");
  const ruleModeField = shell.querySelector(".rule-mode-field");
  const bufferField = shell.querySelector(".buffer-field");
  const visitOutput = shell.querySelector(".visit-output");
  const visitStart = shell.querySelector(".visit-start");
  const visitDeadline = shell.querySelector(".visit-deadline");
  const transitOutput = shell.querySelector(".transit-output");
  const transitDeadline = shell.querySelector(".transit-deadline");
  const stayHours = shell.querySelector(".stay-hours");
  const stayDays = shell.querySelector(".stay-days");
  const riskPill = shell.querySelector(".stay-risk-pill");
  const bufferOutput = shell.querySelector(".stay-buffer-output");
  const riskNote = shell.querySelector(".stay-risk-note");
  const safeDepartureOutput = shell.querySelector(".safe-departure-output");
  const safeDepartureNote = shell.querySelector(".safe-departure-note");
  const checklist = shell.querySelector(".stay-checklist");
  const copyBrief = shell.querySelector(".copy-stay-brief");
  const downloadBrief = shell.querySelector(".download-stay-brief");
  let timingBrief = "";

  function setRisk(label, tone) {
    if (!riskPill) return;
    riskPill.textContent = label;
    riskPill.className = `status-pill stay-risk-pill ${tone || ""}`.trim();
  }

  function setChecklist(items) {
    if (!checklist) return;
    checklist.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  }

  function addHours(date, hours) {
    const output = new Date(date);
    output.setHours(output.getHours() + hours);
    return output;
  }

  function evaluate() {
    const hours = hoursBetween(entryField?.value, exitField?.value);
    const visaWindow = visaFreeDeadline(entryField?.value);
    const hasEntry = Boolean(entryField?.value);
    const hasExit = Boolean(exitField?.value);
    const hasBothDates = hasEntry && hasExit;
    const ruleMode = ruleModeField?.value || "transit";
    const desiredBuffer = clamp(Number(bufferField?.value || 0), 0, 96);
    let selectedDeadline = null;
    let selectedLimit = ruleMode === "visit" ? "30-day unilateral visit" : "240-hour transit";
    let selectedStart = null;

    if (stayHours) stayHours.textContent = hours && hours > 0 ? formatNumber(hours, 1) : "0";
    if (stayDays) stayDays.textContent = hours && hours > 0 ? formatNumber(hours / 24, 1) : "0";

    if (visaWindow) {
      visitStart.textContent = formatDate(visaWindow.start);
      visitDeadline.textContent = formatDate(visaWindow.deadline);
      if (visitOutput) {
        visitOutput.textContent = "For the current 30-day unilateral visa-free policy, the stay clock starts at 00:00 on the day after entry.";
      }
      if (ruleMode === "visit") {
        selectedDeadline = visaWindow.deadline;
        selectedStart = visaWindow.start;
      }
    } else {
      visitStart.textContent = "Enter valid dates";
      visitDeadline.textContent = "Enter valid dates";
      if (visitOutput) {
        visitOutput.textContent = "For the current 30-day unilateral visa-free policy, the stay clock starts at 00:00 on the day after entry.";
      }
    }

    if (hours && hours > 0 && hasEntry) {
      const entry = new Date(entryField.value);
      const transitStart = new Date(entry);
      transitStart.setHours(0, 0, 0, 0);
      transitStart.setDate(transitStart.getDate() + 1);
      const deadline = new Date(transitStart);
      deadline.setHours(deadline.getHours() + 240);
      transitDeadline.textContent = formatDate(deadline);
      if (ruleMode === "transit") {
        selectedDeadline = deadline;
        selectedStart = transitStart;
      }
      if (transitOutput) {
        transitOutput.textContent = hours <= 240
          ? "Your raw itinerary length sits inside a 240-hour window."
          : "Your raw itinerary length is longer than 240 hours.";
      }
    } else {
      transitDeadline.textContent = "Enter valid dates";
      if (transitOutput) {
        transitOutput.textContent = hasBothDates
          ? "Check your dates and times. Departure must be later than arrival."
          : "Add arrival and departure times to compare the raw stay against a 240-hour window.";
      }
    }

    if (!hasBothDates || !selectedDeadline || !hours || hours <= 0) {
      setRisk(hasBothDates ? "Check dates" : "Enter times", hasBothDates ? "warn" : "");
      if (bufferOutput) bufferOutput.textContent = "Enter valid dates";
      if (riskNote) riskNote.textContent = hasBothDates
        ? "Departure must be later than arrival before the timing risk can be calculated."
        : "Choose arrival and departure times to calculate the deadline buffer.";
      if (safeDepartureOutput) safeDepartureOutput.textContent = "Enter valid dates";
      if (safeDepartureNote) safeDepartureNote.textContent = "This subtracts your selected buffer from the modeled deadline.";
      setChecklist([
        "Enter the first mainland China arrival time from your itinerary.",
        "Enter the planned mainland China departure time.",
        "Choose whether you are stress-testing a 240-hour transit or 30-day visit window."
      ]);
      timingBrief = "";
      if (downloadBrief) downloadBrief.disabled = true;
      return;
    }

    const exit = new Date(exitField.value);
    const bufferHours = (selectedDeadline.getTime() - exit.getTime()) / 36e5;
    const safeDeparture = addHours(selectedDeadline, -desiredBuffer);
    const limitHours = ruleMode === "visit" ? 30 * 24 : 240;
    const countedHours = selectedStart ? (exit.getTime() - selectedStart.getTime()) / 36e5 : hours;
    const overLimit = bufferHours < 0 || countedHours > limitHours;
    const belowBuffer = bufferHours >= 0 && bufferHours < desiredBuffer;
    const tight = bufferHours >= desiredBuffer && bufferHours < desiredBuffer + 12;

    if (bufferOutput) {
      bufferOutput.textContent = `${formatNumber(bufferHours, 1)} hours`;
    }
    if (safeDepartureOutput) {
      safeDepartureOutput.textContent = formatDate(safeDeparture);
    }
    if (safeDepartureNote) {
      safeDepartureNote.textContent = `Based on a ${formatNumber(desiredBuffer)} hour buffer before the modeled ${selectedLimit} deadline.`;
    }

    if (overLimit) {
      setRisk("Over deadline", "bad");
      if (riskNote) riskNote.textContent = `This itinerary leaves after the modeled ${selectedLimit} deadline. Do not rely on this timing without changing the itinerary or confirming another legal entry basis.`;
    } else if (belowBuffer) {
      setRisk("Too tight", "warn");
      if (riskNote) riskNote.textContent = `The itinerary is inside the modeled deadline, but it does not keep your selected ${formatNumber(desiredBuffer)} hour safety buffer.`;
    } else if (tight) {
      setRisk("Narrow buffer", "warn");
      if (riskNote) riskNote.textContent = "The itinerary clears your selected buffer, but a delay, retimed flight, or check-in dispute could make it fragile.";
    } else {
      setRisk("Comfortable", "good");
      if (riskNote) riskNote.textContent = `The itinerary keeps at least ${formatNumber(desiredBuffer)} hours before the modeled ${selectedLimit} deadline.`;
    }

    const checklistItems = [
      ruleMode === "transit"
        ? "Confirm the route also satisfies the third-country or third-region transit rule."
        : "Confirm your nationality, passport type, and purpose fit the current 30-day unilateral visit rule.",
      `Keep departure no later than ${formatDate(safeDeparture)} if you want the selected safety buffer.`,
      bufferHours < 24
        ? "Consider moving the outbound flight earlier; this timing leaves little room for delays or interpretation differences."
        : "Keep screenshots of the arrival and departure bookings with local times visible.",
      "Recheck airline, port, and official guidance if any flight time changes before travel."
    ];
    setChecklist(checklistItems);

    timingBrief = [
      "China stay timing brief",
      `Rule family checked: ${selectedLimit}`,
      `Mainland entry: ${formatDate(new Date(entryField.value))}`,
      `Mainland departure: ${formatDate(exit)}`,
      `Raw stay: ${formatNumber(hours, 1)} hours (${formatNumber(hours / 24, 1)} days)`,
      `Modeled clock start: ${selectedStart ? formatDate(selectedStart) : "Not calculated"}`,
      `Modeled deadline: ${formatDate(selectedDeadline)}`,
      `Selected safety buffer: ${formatNumber(desiredBuffer)} hours`,
      `Buffer before deadline: ${formatNumber(bufferHours, 1)} hours`,
      `Latest safer departure: ${formatDate(safeDeparture)}`,
      `Timing risk: ${riskPill ? riskPill.textContent : "Not calculated"}`,
      "",
      "Checklist:",
      ...checklistItems.map((item, index) => `${index + 1}. ${item}`),
      "",
      `Official-source review dates: transit policy ${TRANSIT_POLICY_SOURCE_DATE}; transit port update ${TRANSIT_PORT_UPDATE_DATE}; unilateral list ${UNILATERAL_VISA_FREE_SOURCE_DATE}.`
    ].join("\n");
    if (downloadBrief) downloadBrief.disabled = false;
  }

  [entryField, exitField, ruleModeField, bufferField].filter(Boolean).forEach((field) => {
    field.addEventListener("input", evaluate);
    field.addEventListener("change", evaluate);
  });

  copyBrief?.addEventListener("click", async () => {
    if (!timingBrief) return;
    const ok = await copyText(timingBrief);
    copyBrief.textContent = ok ? "Copied timing brief" : "Copy failed";
    setTimeout(() => (copyBrief.textContent = "Copy timing brief"), 1200);
  });

  downloadBrief?.addEventListener("click", () => {
    const ok = downloadTextFile("china-stay-timing-brief.txt", timingBrief);
    downloadBrief.textContent = ok ? "Downloaded" : "Download failed";
    setTimeout(() => (downloadBrief.textContent = "Download timing brief"), 1200);
  });

  evaluate();
}

function initAddressGenerator() {
  const shell = document.querySelector("[data-address-generator]");
  if (!shell) return;

  const presetButtons = shell.querySelectorAll("[data-address-preset]");
  const placeEnField = shell.querySelector(".address-place-en");
  const placeZhField = shell.querySelector(".address-place-zh");
  const lineEnField = shell.querySelector(".address-line-en");
  const lineZhField = shell.querySelector(".address-line-zh");
  const areaEnField = shell.querySelector(".address-area-en");
  const areaZhField = shell.querySelector(".address-area-zh");
  const contactNameField = shell.querySelector(".address-contact-name");
  const contactPhoneField = shell.querySelector(".address-contact-phone");
  const noteEnField = shell.querySelector(".address-note-en");
  const noteZhField = shell.querySelector(".address-note-zh");
  const requestEnNode = shell.querySelector(".address-request-en");
  const requestZhNode = shell.querySelector(".address-request-zh");
  const previewPlaceEn = shell.querySelector(".address-preview-place-en");
  const previewPlaceZh = shell.querySelector(".address-preview-place-zh");
  const previewLineEn = shell.querySelector(".address-preview-line-en");
  const previewLineZh = shell.querySelector(".address-preview-line-zh");
  const previewAreaEn = shell.querySelector(".address-preview-area-en");
  const previewAreaZh = shell.querySelector(".address-preview-area-zh");
  const previewNoteEn = shell.querySelector(".address-preview-note-en");
  const previewNoteZh = shell.querySelector(".address-preview-note-zh");
  const previewContact = shell.querySelector(".address-preview-contact");
  const feedback = shell.querySelector(".copy-feedback");
  const copyButtons = shell.querySelectorAll("[data-copy-address]");
  const downloadButton = shell.querySelector("[data-download-address-card]");
  const printButton = shell.querySelector("[data-print-address-card]");

  let activePreset = "taxi";
  let payloads = { zh: "", en: "", full: "" };
  let hasCoreDetails = false;

  function evaluate() {
    const preset = addressCardPresets[activePreset] || addressCardPresets.taxi;
    const placeEn = (placeEnField?.value || "").trim();
    const placeZh = (placeZhField?.value || "").trim();
    const lineEn = (lineEnField?.value || "").trim();
    const lineZh = (lineZhField?.value || "").trim();
    const areaEn = (areaEnField?.value || "").trim();
    const areaZh = (areaZhField?.value || "").trim();
    const contactName = (contactNameField?.value || "").trim();
    const contactPhone = (contactPhoneField?.value || "").trim();
    const noteEn = (noteEnField?.value || "").trim() || preset.defaultNoteEn;
    const noteZh = (noteZhField?.value || "").trim() || preset.defaultNoteZh;
    const hasCore = [placeEn, placeZh, lineEn, lineZh].some(Boolean);
    hasCoreDetails = hasCore;

    requestEnNode.textContent = preset.requestEn;
    requestZhNode.textContent = preset.requestZh;
    previewPlaceEn.textContent = placeEn || "Add the place name in English";
    previewPlaceZh.textContent = placeZh || "在这里填入中文地点名称";
    previewLineEn.textContent = lineEn || "Add the address in English";
    previewLineZh.textContent = lineZh || "在这里填入中文地址";
    previewAreaEn.textContent = areaEn || "Optional area or landmark note";
    previewAreaZh.textContent = areaZh || "可选：区域或地标说明";
    previewNoteEn.textContent = noteEn;
    previewNoteZh.textContent = noteZh;
    previewContact.textContent = [contactName, contactPhone].filter(Boolean).join(" · ") || "联系人 / 电话";

    const zhLines = nonEmpty([preset.requestZh, placeZh, lineZh, areaZh, noteZh, [contactName, contactPhone].filter(Boolean).join(" / ")]);
    const enLines = nonEmpty([preset.requestEn, placeEn, lineEn, areaEn, noteEn, [contactName, contactPhone].filter(Boolean).join(" / ")]);
    payloads = {
      zh: zhLines.join("\n"),
      en: enLines.join("\n"),
      full: [...zhLines, "", ...enLines].join("\n")
    };

    copyButtons.forEach((button) => {
      button.disabled = !hasCore;
    });
    if (downloadButton) downloadButton.disabled = !hasCore;
    if (printButton) printButton.disabled = !hasCore;
    if (feedback) {
      feedback.textContent = hasCore
        ? "Copy, save, or print the version that fits the moment: Chinese only for quick showing, or bilingual if someone wants both."
        : "Add at least a place name or address to generate a copy-ready card.";
    }
  }

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activePreset = button.dataset.addressPreset || "taxi";
      presetButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      evaluate();
    });
  });

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const key = button.dataset.copyAddress;
      const ok = await copyText(payloads[key]);
      if (feedback) {
        feedback.textContent = ok ? "Copied. Keep the card in your notes or photo favorites before the trip." : "Copy failed in the browser. Try selecting the text manually.";
      }
    });
  });

  downloadButton?.addEventListener("click", () => {
    const ok = downloadTextFile("china-address-card.txt", payloads.full);
    if (feedback) {
      feedback.textContent = ok ? "Saved as a text file. Keep it available offline with your booking or map screenshot." : "Add a place name or address before saving the card.";
    }
  });

  printButton?.addEventListener("click", () => {
    if (!hasCoreDetails) return;
    if (feedback) feedback.textContent = "Opening print dialog for the card area.";
    printTravelCard(shell);
  });

  [
    placeEnField,
    placeZhField,
    lineEnField,
    lineZhField,
    areaEnField,
    areaZhField,
    contactNameField,
    contactPhoneField,
    noteEnField,
    noteZhField
  ].filter(Boolean).forEach((field) => {
    field.addEventListener("input", evaluate);
    field.addEventListener("change", evaluate);
  });

  evaluate();
}

function initHotelCardGenerator() {
  const shell = document.querySelector("[data-hotel-card-generator]");
  if (!shell) return;

  const presetButtons = shell.querySelectorAll("[data-hotel-card-preset]");
  const hotelEnField = shell.querySelector(".hotel-name-en");
  const hotelZhField = shell.querySelector(".hotel-name-zh");
  const guestNameField = shell.querySelector(".hotel-guest-name");
  const bookingField = shell.querySelector(".hotel-booking-code");
  const arrivalField = shell.querySelector(".hotel-arrival-time");
  const phoneField = shell.querySelector(".hotel-phone");
  const roomNeedField = shell.querySelector(".hotel-room-need");
  const noteEnField = shell.querySelector(".hotel-note-en");
  const noteZhField = shell.querySelector(".hotel-note-zh");
  const titleEnNode = shell.querySelector(".hotel-preview-title-en");
  const titleZhNode = shell.querySelector(".hotel-preview-title-zh");
  const requestEnNode = shell.querySelector(".hotel-request-en");
  const requestZhNode = shell.querySelector(".hotel-request-zh");
  const previewZh = shell.querySelector(".hotel-preview-zh");
  const previewEn = shell.querySelector(".hotel-preview-en");
  const feedback = shell.querySelector(".copy-feedback");
  const copyButtons = shell.querySelectorAll("[data-copy-hotel-card]");
  const downloadButton = shell.querySelector("[data-download-hotel-card]");
  const printButton = shell.querySelector("[data-print-hotel-card]");

  let activePreset = "checkin";
  let payloads = { zh: "", en: "", full: "" };
  let hasCoreDetails = false;

  function evaluate() {
    const preset = hotelCardPresets[activePreset] || hotelCardPresets.checkin;
    const hotelEn = (hotelEnField?.value || "").trim();
    const hotelZh = (hotelZhField?.value || "").trim();
    const guestName = (guestNameField?.value || "").trim();
    const booking = (bookingField?.value || "").trim();
    const arrival = (arrivalField?.value || "").trim();
    const phone = (phoneField?.value || "").trim();
    const roomNeed = (roomNeedField?.value || "").trim();
    const noteEn = (noteEnField?.value || "").trim() || preset.noteEn;
    const noteZh = (noteZhField?.value || "").trim() || preset.noteZh;
    const hasCore = [hotelEn, hotelZh, guestName, booking].some(Boolean);
    hasCoreDetails = hasCore;

    titleEnNode.textContent = preset.titleEn;
    titleZhNode.textContent = preset.titleZh;
    requestEnNode.textContent = preset.requestEn;
    requestZhNode.textContent = preset.requestZh;

    const zhLines = nonEmpty([
      preset.requestZh,
      hotelZh ? `酒店：${hotelZh}` : "",
      guestName ? `住客姓名：${guestName}` : "",
      booking ? `预订号：${booking}` : "",
      arrival ? `预计到达时间：${arrival}` : "",
      phone ? `联系电话：${phone}` : "",
      roomNeed ? `房间或入住需求：${roomNeed}` : "",
      noteZh
    ]);
    const enLines = nonEmpty([
      preset.requestEn,
      hotelEn ? `Hotel: ${hotelEn}` : "",
      guestName ? `Guest name: ${guestName}` : "",
      booking ? `Booking number: ${booking}` : "",
      arrival ? `Expected arrival: ${arrival}` : "",
      phone ? `Phone or WeChat: ${phone}` : "",
      roomNeed ? `Room or check-in request: ${roomNeed}` : "",
      noteEn
    ]);

    replaceLines(previewZh, zhLines.length ? zhLines : ["填写酒店名称、住客姓名或预订号后，这里会生成中文入住卡。"]);
    replaceLines(previewEn, enLines.length ? enLines : ["Add a hotel name, guest name, or booking code to build the English backup card."]);

    payloads = {
      zh: zhLines.join("\n"),
      en: enLines.join("\n"),
      full: [...zhLines, "", ...enLines].join("\n")
    };

    copyButtons.forEach((button) => {
      button.disabled = !hasCore;
    });
    if (downloadButton) downloadButton.disabled = !hasCore;
    if (printButton) printButton.disabled = !hasCore;
    if (feedback) {
      feedback.textContent = hasCore
        ? "Copy the Chinese card for the front desk, or keep the bilingual version in your notes before arrival."
        : "Add the hotel name, guest name, or booking code to generate a copy-ready card.";
    }
  }

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activePreset = button.dataset.hotelCardPreset || "checkin";
      presetButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      evaluate();
    });
  });

  [
    hotelEnField,
    hotelZhField,
    guestNameField,
    bookingField,
    arrivalField,
    phoneField,
    roomNeedField,
    noteEnField,
    noteZhField
  ].filter(Boolean).forEach((field) => {
    field.addEventListener("input", evaluate);
    field.addEventListener("change", evaluate);
  });

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const key = button.dataset.copyHotelCard;
      const ok = await copyText(payloads[key]);
      if (feedback) {
        feedback.textContent = ok ? "Copied. Save it somewhere reachable before you reach the desk." : "Copy failed in the browser. Try selecting the card text manually.";
      }
    });
  });

  downloadButton?.addEventListener("click", () => {
    const ok = downloadTextFile("china-hotel-check-in-card.txt", payloads.full);
    if (feedback) {
      feedback.textContent = ok ? "Saved as a text file. Keep it available offline with your booking screenshot." : "Add hotel details before saving the card.";
    }
  });

  printButton?.addEventListener("click", () => {
    if (!hasCoreDetails) return;
    if (feedback) feedback.textContent = "Opening print dialog for the card area.";
    printTravelCard(shell);
  });

  evaluate();
}

function initTaxiRideCardGenerator() {
  const shell = document.querySelector("[data-taxi-ride-card-generator]");
  if (!shell) return;

  const presetButtons = shell.querySelectorAll("[data-taxi-card-preset]");
  const pickupEnField = shell.querySelector(".taxi-pickup-en");
  const pickupZhField = shell.querySelector(".taxi-pickup-zh");
  const destinationEnField = shell.querySelector(".taxi-destination-en");
  const destinationZhField = shell.querySelector(".taxi-destination-zh");
  const gateField = shell.querySelector(".taxi-gate-note");
  const luggageField = shell.querySelector(".taxi-luggage-note");
  const contactNameField = shell.querySelector(".taxi-contact-name");
  const contactPhoneField = shell.querySelector(".taxi-contact-phone");
  const carPlateField = shell.querySelector(".taxi-car-plate");
  const noteEnField = shell.querySelector(".taxi-note-en");
  const noteZhField = shell.querySelector(".taxi-note-zh");
  const titleEnNode = shell.querySelector(".taxi-preview-title-en");
  const titleZhNode = shell.querySelector(".taxi-preview-title-zh");
  const requestEnNode = shell.querySelector(".taxi-request-en");
  const requestZhNode = shell.querySelector(".taxi-request-zh");
  const previewZh = shell.querySelector(".taxi-preview-zh");
  const previewEn = shell.querySelector(".taxi-preview-en");
  const feedback = shell.querySelector(".copy-feedback");
  const copyButtons = shell.querySelectorAll("[data-copy-taxi-card]");
  const downloadButton = shell.querySelector("[data-download-taxi-card]");
  const printButton = shell.querySelector("[data-print-taxi-card]");

  let activePreset = "airport";
  let payloads = { zh: "", en: "", full: "" };
  let hasCoreDetails = false;

  function evaluate() {
    const preset = taxiRideCardPresets[activePreset] || taxiRideCardPresets.airport;
    const pickupEn = (pickupEnField?.value || "").trim();
    const pickupZh = (pickupZhField?.value || "").trim();
    const destinationEn = (destinationEnField?.value || "").trim();
    const destinationZh = (destinationZhField?.value || "").trim();
    const gate = (gateField?.value || "").trim();
    const luggage = (luggageField?.value || "").trim();
    const contactName = (contactNameField?.value || "").trim();
    const contactPhone = (contactPhoneField?.value || "").trim();
    const carPlate = (carPlateField?.value || "").trim();
    const noteEn = (noteEnField?.value || "").trim() || preset.noteEn;
    const noteZh = (noteZhField?.value || "").trim() || preset.noteZh;
    const hasCore = [pickupEn, pickupZh, destinationEn, destinationZh, contactPhone].some(Boolean);
    hasCoreDetails = hasCore;

    titleEnNode.textContent = preset.titleEn;
    titleZhNode.textContent = preset.titleZh;
    requestEnNode.textContent = preset.requestEn;
    requestZhNode.textContent = preset.requestZh;

    const zhLines = nonEmpty([
      preset.requestZh,
      pickupZh ? `上车点：${pickupZh}` : "",
      destinationZh ? `目的地：${destinationZh}` : "",
      gate ? `出口 / 门 / 站台：${gate}` : "",
      luggage ? `行李说明：${luggage}` : "",
      carPlate ? `车牌或车辆信息：${carPlate}` : "",
      [contactName, contactPhone].filter(Boolean).length ? `联系人：${[contactName, contactPhone].filter(Boolean).join(" / ")}` : "",
      noteZh
    ]);
    const enLines = nonEmpty([
      preset.requestEn,
      pickupEn ? `Pickup point: ${pickupEn}` : "",
      destinationEn ? `Destination: ${destinationEn}` : "",
      gate ? `Gate / exit / platform: ${gate}` : "",
      luggage ? `Luggage note: ${luggage}` : "",
      carPlate ? `Car plate or vehicle info: ${carPlate}` : "",
      [contactName, contactPhone].filter(Boolean).length ? `Contact: ${[contactName, contactPhone].filter(Boolean).join(" / ")}` : "",
      noteEn
    ]);

    replaceLines(previewZh, zhLines.length ? zhLines : ["填写上车点、目的地或联系方式后，这里会生成中文打车卡。"]);
    replaceLines(previewEn, enLines.length ? enLines : ["Add a pickup point, destination, or phone number to build the English backup card."]);

    payloads = {
      zh: zhLines.join("\n"),
      en: enLines.join("\n"),
      full: [...zhLines, "", ...enLines].join("\n")
    };

    copyButtons.forEach((button) => {
      button.disabled = !hasCore;
    });
    if (downloadButton) downloadButton.disabled = !hasCore;
    if (printButton) printButton.disabled = !hasCore;
    if (feedback) {
      feedback.textContent = hasCore
        ? "Copy the Chinese card for a driver, or keep the bilingual version in notes for pickup confusion."
        : "Add a pickup point, destination, or phone number to generate a ride card.";
    }
  }

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activePreset = button.dataset.taxiCardPreset || "airport";
      presetButtons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      evaluate();
    });
  });

  [
    pickupEnField,
    pickupZhField,
    destinationEnField,
    destinationZhField,
    gateField,
    luggageField,
    contactNameField,
    contactPhoneField,
    carPlateField,
    noteEnField,
    noteZhField
  ].filter(Boolean).forEach((field) => {
    field.addEventListener("input", evaluate);
    field.addEventListener("change", evaluate);
  });

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const key = button.dataset.copyTaxiCard;
      const ok = await copyText(payloads[key]);
      if (feedback) {
        feedback.textContent = ok ? "Copied. Save it before you leave the airport, station, or hotel Wi-Fi." : "Copy failed in the browser. Try selecting the card text manually.";
      }
    });
  });

  downloadButton?.addEventListener("click", () => {
    const ok = downloadTextFile("china-taxi-didi-card.txt", payloads.full);
    if (feedback) {
      feedback.textContent = ok ? "Saved as a text file. Keep it available before leaving reliable Wi-Fi." : "Add pickup, destination, or contact details before saving the card.";
    }
  });

  printButton?.addEventListener("click", () => {
    if (!hasCoreDetails) return;
    if (feedback) feedback.textContent = "Opening print dialog for the card area.";
    printTravelCard(shell);
  });

  evaluate();
}

function initAllergyGenerator() {
  const shell = document.querySelector("[data-allergy-generator]");
  if (!shell) return;

  const severityField = shell.querySelector(".allergy-severity");
  const dietField = shell.querySelector(".allergy-diet");
  const allergenFields = shell.querySelectorAll("[data-allergen]");
  const crossContactField = shell.querySelector(".allergy-cross-contact");
  const medsField = shell.querySelector(".allergy-meds");
  const contactNameField = shell.querySelector(".allergy-contact-name");
  const contactPhoneField = shell.querySelector(".allergy-contact-phone");
  const previewZh = shell.querySelector(".allergy-preview-zh");
  const previewEn = shell.querySelector(".allergy-preview-en");
  const previewContact = shell.querySelector(".allergy-preview-contact");
  const feedback = shell.querySelector(".copy-feedback");
  const copyButtons = shell.querySelectorAll("[data-copy-allergy]");
  const downloadButton = shell.querySelector("[data-download-allergy-card]");
  const printButton = shell.querySelector("[data-print-allergy-card]");

  let payloads = { zh: "", en: "", full: "" };
  let hasCoreDetails = false;

  function evaluate() {
    const severity = severityField?.value || "severe";
    const diet = dietNotes[dietField?.value || "none"];
    const selected = [...allergenFields]
      .filter((field) => field.checked)
      .map((field) => allergyItems[field.value])
      .filter(Boolean);
    const crossContact = crossContactField?.checked ?? false;
    const meds = medsField?.checked ?? false;
    const contactName = (contactNameField?.value || "").trim();
    const contactPhone = (contactPhoneField?.value || "").trim();
    const hasCore = selected.length > 0 || Boolean(diet);
    hasCoreDetails = hasCore;

    if (!hasCore) {
      replaceLines(previewZh, ["请选择至少一种过敏原，或加入饮食限制说明。"]);
      replaceLines(previewEn, ["Choose at least one allergy or add a diet note to build the card."]);
      previewContact.textContent = "";
      payloads = { zh: "", en: "", full: "" };
      copyButtons.forEach((button) => {
        button.disabled = true;
      });
      if (downloadButton) downloadButton.disabled = true;
      if (printButton) printButton.disabled = true;
      if (feedback) {
        feedback.textContent = "Choose at least one allergy or a diet note to build the card.";
      }
      return;
    }

    const zhLines = [];
    const enLines = [];

    if (selected.length) {
      const enList = formatList(selected.map((item) => item.en), "en-US");
      const zhList = selected.map((item) => item.zh).join("、");
      if (severity === "sensitive") {
        zhLines.push(`我不能吃${zhList}。这些食物会让我很不舒服。`);
        enLines.push(`I cannot eat ${enList}. These foods make me very sick.`);
      } else if (severity === "allergy") {
        zhLines.push(`我对${zhList}过敏。请不要在食物里加入这些食材。`);
        enLines.push(`I am allergic to ${enList}. Please do not include these ingredients in my food.`);
      } else {
        zhLines.push(`我对${zhList}严重过敏。即使少量也可能引起严重反应。`);
        enLines.push(`I have a severe allergy to ${enList}. Even a small amount can cause a serious reaction.`);
      }
    }

    if (diet) {
      zhLines.push(diet.zh);
      enLines.push(diet.en);
    }

    if (crossContact) {
      zhLines.push("请不要使用共用的油、汤、锅具或餐具。");
      enLines.push("Please avoid shared oil, broth, cookware, and utensils.");
    }

    if (meds) {
      zhLines.push("如果误食，我可能需要立即就医。我随身带有急救药。");
      enLines.push("If I eat the wrong food, I may need urgent medical help. I carry emergency medicine.");
    }

    const contactLine = [contactName, contactPhone].filter(Boolean).join(" · ");
    if (contactLine) {
      zhLines.push(`紧急联系人：${contactLine}`);
      enLines.push(`Emergency contact: ${contactLine}`);
      previewContact.textContent = contactLine;
    } else {
      previewContact.textContent = "";
    }

    replaceLines(previewZh, zhLines);
    replaceLines(previewEn, enLines);

    payloads = {
      zh: zhLines.join("\n"),
      en: enLines.join("\n"),
      full: [...zhLines, "", ...enLines].join("\n")
    };

    copyButtons.forEach((button) => {
      button.disabled = false;
    });
    if (downloadButton) downloadButton.disabled = false;
    if (printButton) printButton.disabled = false;
    if (feedback) {
      feedback.textContent = "Show the Chinese card before ordering, and keep an offline or printed backup if someone wants to double-check.";
    }
  }

  [severityField, dietField, crossContactField, medsField, contactNameField, contactPhoneField]
    .filter(Boolean)
    .forEach((field) => {
      field.addEventListener("input", evaluate);
      field.addEventListener("change", evaluate);
    });

  allergenFields.forEach((field) => {
    field.addEventListener("input", evaluate);
    field.addEventListener("change", evaluate);
  });

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const key = button.dataset.copyAllergy;
      const ok = await copyText(payloads[key]);
      if (feedback) {
        feedback.textContent = ok ? "Copied. Keep the card open before you order." : "Copy failed in the browser. Try selecting the card text manually.";
      }
    });
  });

  downloadButton?.addEventListener("click", () => {
    const ok = downloadTextFile("china-allergy-card.txt", payloads.full);
    if (feedback) {
      feedback.textContent = ok ? "Saved as a text file. Keep it reachable before restaurant, cafe, or hotel breakfast ordering." : "Choose an allergy or diet note before saving the card.";
    }
  });

  printButton?.addEventListener("click", () => {
    if (!hasCoreDetails) return;
    if (feedback) feedback.textContent = "Opening print dialog for the card area.";
    printTravelCard(shell);
  });

  evaluate();
}

function initArrivalChecklistBuilder() {
  const shell = document.querySelector("[data-arrival-checklist]");
  if (!shell) return;

  const countryField = shell.querySelector(".arrival-country");
  const entryField = shell.querySelector(".arrival-entry");
  const windowField = shell.querySelector(".arrival-window");
  const paymentField = shell.querySelector(".arrival-payment");
  const dataField = shell.querySelector(".arrival-data");
  const transportField = shell.querySelector(".arrival-transport");
  const tripField = shell.querySelector(".arrival-trip-style");
  const foodField = shell.querySelector(".arrival-food");
  const ruleField = shell.querySelector(".arrival-rule-ready");
  const addressField = shell.querySelector(".arrival-address-ready");
  const backupField = shell.querySelector(".arrival-backup-ready");
  const rideField = shell.querySelector(".arrival-ride-ready");
  const bookingField = shell.querySelector(".arrival-booking-ready");
  const medicalField = shell.querySelector(".arrival-medical-ready");
  const feedback = shell.querySelector(".copy-feedback");
  const copyButtons = shell.querySelectorAll("[data-copy-arrival]");
  const downloadButton = shell.querySelector("[data-download-arrival]");

  let payloads = { short: "", full: "", filename: "china-arrival-checklist.txt" };

  populateCountrySelect(countryField, true);

  function evaluate() {
    const country = countryMap.get(countryField?.value || "");
    if (!country) {
      renderArrivalPlan(shell, {
        status: "Check carefully",
        headline: "Choose a passport to build an arrival plan.",
        reason: "This builder connects entry status to day-one setup so you can see what still matters before wheels down.",
        priorities: [
          "Choose the passport nationality you are actually traveling with.",
          "Then tell the builder whether you expect a direct visit, transit entry, or a visa route."
        ],
        sections: [
          {
            title: "What you will get",
            items: [
              "A short priority list for the tasks that still carry real arrival risk.",
              "A practical landing sequence for payment, data, transport, and hotel check-in.",
              "A backup layer for the common day-one failure points."
            ]
          }
        ],
        facts: [
          { label: "Linked areas", value: "Entry + arrival" },
          { label: "Output", value: "Copy-ready checklist" },
          { label: "Reviewed", value: SITE_REVIEW_DATE }
        ],
        source: `Operational logic reviewed on ${SITE_REVIEW_DATE}`
      });
      payloads = { short: "", full: "", filename: "china-arrival-checklist.txt" };
      copyButtons.forEach((button) => {
        button.disabled = true;
      });
      if (downloadButton) downloadButton.disabled = true;
      if (feedback) {
        feedback.textContent = "Choose a passport first, then the builder will turn your inputs into a practical checklist.";
      }
      return;
    }

    const entryPath = entryField?.value || "notSure";
    const arrivalWindow = windowField?.value || "daytime";
    const paymentState = paymentField?.value || "none";
    const dataState = dataField?.value || "unset";
    const transportNeed = transportField?.value || "airportRide";
    const tripStyle = tripField?.value || "simple";
    const foodNeed = foodField?.value || "none";
    const done = {
      rule: ruleField?.checked ?? false,
      address: addressField?.checked ?? false,
      backup: backupField?.checked ?? false,
      ride: rideField?.checked ?? false,
      booking: bookingField?.checked ?? false,
      medical: medicalField?.checked ?? false
    };

    const beforeFlight = [];
    const afterLanding = [
      "Charge your phone before descent and keep the power bank easy to reach.",
      "Open your main payment app once after landing before you join a payment queue."
    ];
    const backupPlan = [
      "Keep passport, booking, hotel, and onward-travel screenshots available offline."
    ];
    const priorities = [];
    let blockers = 0;
    let cautions = 0;

    function addPriority(text) {
      if (!priorities.includes(text)) priorities.push(text);
    }

    if (entryPath === "direct30") {
      if (!country.unilateral) {
        blockers += 2;
        addPriority(`${country.name} is not on the modeled 30-day unilateral list. Re-check the entry basis before you spend time on arrival setup.`);
        beforeFlight.push("Switch to the transit checker or visa planning if your direct-visit assumption is wrong.");
      } else if (!done.rule) {
        cautions += 1;
        addPriority("Re-run the visa-free checker with your stay length and trip purpose, then keep that answer with your booking notes.");
        beforeFlight.push("Save your lodging and onward or return proof next to the entry answer.");
      }
    } else if (entryPath === "transit240") {
      if (!country.transit) {
        blockers += 2;
        addPriority(`${country.name} is not on the modeled 240-hour transit list. Do not rely on transit entry without checking another route.`);
        beforeFlight.push("If the trip is not valid third-country transit, plan for a visa or another legal entry basis.");
      } else if (!done.rule) {
        blockers += 1;
        addPriority("Confirm the third-country route, stay window, and eligible port before you build the rest of the arrival plan around transit entry.");
        beforeFlight.push("Run the transit checker with the exact origin, onward destination, and mainland stay window.");
      }
    } else if (entryPath === "visaHeld") {
      if (!done.rule) {
        cautions += 1;
        addPriority("Double-check the visa validity, entries remaining, and first-entry timing before departure.");
        beforeFlight.push("Keep your visa page, invitation or booking support, and passport together for check-in.");
      }
    } else if (country.unilateral) {
      cautions += 1;
      addPriority("Your passport may fit the current 30-day direct-visit list, but confirm that before departure.");
      beforeFlight.push("Use the visa-free checker first so the arrival checklist is built on the right entry path.");
    } else if (country.transit) {
      blockers += 1;
      addPriority("Decide whether this is true onward transit or a visa trip before you focus on payment setup.");
      beforeFlight.push("If you will continue to a third country or region, test the 240-hour transit checker with the real route.");
    } else {
      blockers += 2;
      addPriority("This passport is not covered by the two shortcut entry models on this site. Verify the visa route first.");
      beforeFlight.push("Do not treat payment prep as a substitute for entry clearance.");
    }

    if (paymentState === "none") {
      blockers += 1;
      addPriority("Set up a China-ready payment app before the flight, then make a small test payment before you depend on it.");
      beforeFlight.push("Start with Alipay or another wallet you can finish setting up before airport arrival.");
      afterLanding.push("Make the first payment something small, not the only way to pay for a long ride or late hotel check-in.");
    } else if (paymentState === "installed") {
      cautions += 1;
      addPriority("Finish identity and card verification, then prove the wallet with one small payment before travel day.");
      beforeFlight.push("Do not treat an installed app as a ready app until the card and verification steps are complete.");
    } else if (paymentState === "wechat") {
      cautions += 1;
      beforeFlight.push("If Weixin or WeChat is your only wallet, keep a second card or cash ready in case one flow stalls.");
      afterLanding.push("Open Weixin or WeChat once after landing and confirm the same card is still selected for payment.");
    } else if (paymentState === "alipay") {
      afterLanding.push("Open Alipay once after landing and confirm the same card is still active for payment.");
    } else {
      afterLanding.push("Open both payment apps once after landing so you know which one is behaving normally.");
    }

    if (dataState === "unset") {
      blockers += 1;
      addPriority("Arrange roaming, eSIM, or another live data plan before arrival so payment and ride apps can recover when airport Wi-Fi is weak.");
      beforeFlight.push("Save the support path for your payment app and transport app before the trip.");
    } else if (dataState === "wifi") {
      cautions += 1;
      backupPlan.push("Save hotel, transport, and support details offline because airport or hotel Wi-Fi can be slow at the worst moment.");
      if (arrivalWindow === "latenight") {
        addPriority("Do not rely only on airport Wi-Fi for a late-night arrival.");
      }
    }

    if (!done.address) {
      cautions += 1;
      addPriority("Save the hotel or host address in Chinese before the flight.");
      beforeFlight.push("Keep the address in notes, screenshots, and your booking confirmation.");
    } else {
      afterLanding.push("Show the saved Chinese address directly if pickup or check-in communication gets messy.");
    }

    if (!done.backup) {
      cautions += 1;
      addPriority("Add a second card or enough emergency cash for one ride, one snack, and one transfer.");
      backupPlan.push("One app and one card is not a full backup plan.");
    }

    const rideDependentArrival = arrivalWindow === "latenight" || transportNeed === "airportRide";
    if (rideDependentArrival && !done.ride) {
      blockers += 1;
      addPriority("Install DiDi or confirm another pickup plan before a ride-dependent arrival.");
      beforeFlight.push("If the airport or station arrival ends with a car pickup, save the destination and know the pickup zone pattern first.");
    } else if (!done.ride) {
      cautions += 1;
      afterLanding.push("Install DiDi before the first transfer where a missed pickup would cost you time.");
    }

    if (tripStyle === "railHeavy" && !done.booking) {
      cautions += 1;
      addPriority("Train-heavy itineraries need one booking app you can actually use under time pressure.");
      beforeFlight.push("Install one booking or rail app you already understand for schedule changes and ticket checks.");
    }

    if (foodNeed !== "none" && !done.medical) {
      cautions += 1;
      if (foodNeed === "allergy") {
        addPriority("Prepare the allergy card before the first meal, not at the table.");
      }
      beforeFlight.push("Generate a bilingual food or allergy card before the trip.");
    }

    if (transportNeed === "hotelCheckin") {
      afterLanding.push("If the hotel arrival is time-sensitive, keep the booking screenshot and passport page ready for the desk.");
    } else if (transportNeed === "cashier") {
      afterLanding.push("Test the payment setup on a low-risk purchase before you rely on it for a full transport or meal chain.");
    }

    const finalPriorities = uniqueItems(priorities).slice(0, 5);
    const finalBeforeFlight = uniqueItems(beforeFlight);
    const finalAfterLanding = uniqueItems(afterLanding);
    const finalBackupPlan = uniqueItems(backupPlan);

    let status = "Ready";
    let headline = "Your first-day setup looks workable.";
    let reason = "The key entry, payment, data, and arrival basics look covered. Keep the backup layer nearby so a small failure does not turn into a long airport problem.";
    let riskLabel = "Low";

    if (blockers >= 2) {
      status = "Not ready";
      headline = "This arrival plan still has avoidable failure points.";
      reason = "At least two high-friction items are still open. Solve those before you treat the rest of the trip as operationally ready.";
      riskLabel = "High";
    } else if (blockers >= 1 || cautions >= 3) {
      status = "Check carefully";
      headline = "The trip is close, but a few day-one failure points remain.";
      reason = "You are not starting from zero, but the remaining gaps are exactly the ones that tend to show up at the airport curb, the first cashier, or a late hotel arrival.";
      riskLabel = blockers ? "Elevated" : "Manageable";
    }

    const result = {
      status,
      headline,
      reason,
      priorities: finalPriorities.length ? finalPriorities : [
        "Keep the payment app, hotel address, and transport plan easy to reach during the first arrival hour.",
        "Do one low-risk test action after landing before you depend on the full setup."
      ],
      sections: [
        { title: "Before the flight", items: finalBeforeFlight },
        { title: "After landing", items: finalAfterLanding },
        { title: "Backup layer", items: finalBackupPlan }
      ],
      facts: [
        { label: "Entry basis", value: arrivalEntryLabel(entryPath) },
        { label: "Payments", value: paymentStateLabel(paymentState) },
        { label: "Day-one risk", value: riskLabel }
      ],
      source: `Checklist logic reviewed on ${SITE_REVIEW_DATE}, using this site's entry models plus current foreign-visitor payment setup signals.`
    };

    renderArrivalPlan(shell, result);

    payloads = {
      short: result.priorities.map((item, index) => `${index + 1}. ${item}`).join("\n"),
      full: [
        `China arrival checklist for ${country.name}`,
        `Entry basis: ${arrivalEntryLabel(entryPath)}`,
        `Arrival profile: ${arrivalWindowLabel(arrivalWindow)}`,
        `Payments: ${paymentStateLabel(paymentState)}`,
        `Connectivity: ${dataStateLabel(dataState)}`,
        `Transport focus: ${transportNeedLabel(transportNeed)}`,
        `Trip pattern: ${tripStyleLabel(tripStyle)}`,
        `Food note: ${foodNeedLabel(foodNeed)}`,
        "",
        "Prepared already",
        `- Entry basis confirmed: ${done.rule ? "yes" : "no"}`,
        `- Chinese hotel or host address saved: ${done.address ? "yes" : "no"}`,
        `- Backup card or emergency cash ready: ${done.backup ? "yes" : "no"}`,
        `- Ride or pickup plan ready: ${done.ride ? "yes" : "no"}`,
        `- Booking or rail app ready: ${done.booking ? "yes" : "no"}`,
        `- Food or allergy card ready if needed: ${done.medical ? "yes" : "no"}`,
        "",
        "Top priorities",
        ...result.priorities.map((item, index) => `${index + 1}. ${item}`),
        "",
        "Before the flight",
        ...finalBeforeFlight.map((item) => `- ${item}`),
        "",
        "After landing",
        ...finalAfterLanding.map((item) => `- ${item}`),
        "",
        "Backup layer",
        ...finalBackupPlan.map((item) => `- ${item}`),
        "",
        result.source
      ].join("\n"),
      filename: `china-arrival-checklist-${country.code.toLowerCase()}.txt`
    };

    copyButtons.forEach((button) => {
      button.disabled = false;
    });
    if (downloadButton) downloadButton.disabled = false;
    if (feedback) {
      feedback.textContent = "Copy the checklist into your notes, or download the text file for offline travel prep.";
    }
  }

  [
    countryField,
    entryField,
    windowField,
    paymentField,
    dataField,
    transportField,
    tripField,
    foodField,
    ruleField,
    addressField,
    backupField,
    rideField,
    bookingField,
    medicalField
  ].filter(Boolean).forEach((field) => {
    field.addEventListener("input", evaluate);
    field.addEventListener("change", evaluate);
  });

  copyButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const key = button.dataset.copyArrival;
      const ok = await copyText(payloads[key]);
      if (feedback) {
        feedback.textContent = ok
          ? "Copied. Keep the checklist in your phone notes or offline screenshots before the flight."
          : "Copy failed in the browser. Try selecting the text manually.";
      }
    });
  });

  downloadButton?.addEventListener("click", () => {
    const ok = downloadTextFile(payloads.filename, payloads.full);
    if (feedback) {
      feedback.textContent = ok
        ? "Downloaded. Keep the file somewhere reachable before the flight."
        : "Download failed in the browser. Copy the full checklist instead.";
    }
  });

  evaluate();
}

document.addEventListener("DOMContentLoaded", () => {
  initPolicyMeta();
  initConsentAndAds();
  initEligibilityCheckers();
  initCountryCatalog();
  initTransitChecker();
  initStayCalculator();
  initAddressGenerator();
  initHotelCardGenerator();
  initTaxiRideCardGenerator();
  initAllergyGenerator();
  initArrivalChecklistBuilder();
});
