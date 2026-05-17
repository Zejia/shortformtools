const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function num(id) {
  const value = document.getElementById(id)?.value ?? 0;
  return Number(String(value).replaceAll(",", "")) || 0;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setMeter(id, value) {
  const el = document.getElementById(id);
  if (el) el.style.setProperty("--value", `${Math.max(0, Math.min(value, 100))}%`);
}

function rateBadge(rate) {
  if (rate >= 8) return ["Excellent", ""];
  if (rate >= 4) return ["Healthy", ""];
  if (rate >= 2) return ["Average", "warn"];
  return ["Low", "bad"];
}

function initTikTok() {
  const shell = document.querySelector("[data-tool='tiktok']");
  if (!shell) return;

  const buttons = shell.querySelectorAll("[data-mode]");
  const copy = document.getElementById("copyTiktokReport");
  let mode = "followers";
  let lastReport = "";

  function calculate() {
    const followers = num("followers");
    const views = num("views");
    const posts = Math.max(1, num("posts"));
    const targetRate = num("targetRate") || 5;
    const interactions = num("likes") + num("comments") + num("shares") + num("saves");
    const denominator = mode === "views" ? views : followers;
    const rate = denominator > 0 ? (interactions / denominator) * 100 : 0;
    const perPost = interactions / posts;
    const targetInteractions = Math.ceil((targetRate / 100) * denominator);
    const gap = Math.max(0, targetInteractions - interactions);
    const [label, tone] = rateBadge(rate);

    setText("engagementRate", `${numberFormat.format(rate)}%`);
    setText("totalInteractions", numberFormat.format(interactions));
    setText("perPost", numberFormat.format(perPost));
    setText("targetGap", gap ? `${numberFormat.format(gap)} more` : "Target met");
    setText("targetRateLabel", `${numberFormat.format(targetRate)}% target`);
    setText("benchmark", label);
    document.getElementById("benchmark")?.classList.toggle("warn", tone === "warn");
    document.getElementById("benchmark")?.classList.toggle("bad", tone === "bad");
    setMeter("engagementMeter", rate * 8);
    lastReport = `TikTok engagement report
Mode: ${mode}
Engagement rate: ${numberFormat.format(rate)}%
Total interactions: ${numberFormat.format(interactions)}
Interactions per post: ${numberFormat.format(perPost)}
Benchmark: ${label}
Target gap: ${gap ? `${numberFormat.format(gap)} more interactions for ${numberFormat.format(targetRate)}%` : "target met"}`;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      mode = button.dataset.mode;
      buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      calculate();
    });
  });

  shell.querySelectorAll("input").forEach((input) => input.addEventListener("input", calculate));
  copy?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(lastReport);
    copy.textContent = "Copied report";
    setTimeout(() => (copy.textContent = "Copy report"), 1200);
  });
  calculate();
}

function initLineBreaks() {
  const shell = document.querySelector("[data-tool='linebreak']");
  if (!shell) return;

  const input = document.getElementById("captionInput");
  const output = document.getElementById("captionOutput");
  const copy = document.getElementById("copyCaption");
  const clear = document.getElementById("clearCaption");

  function format() {
    const raw = input.value.trim();
    const formatted = raw
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .join("\n\u2063\n");
    output.textContent = formatted || "Your formatted caption will appear here.";
    setText("captionChars", numberFormat.format(raw.length));
    setText("captionLines", numberFormat.format(raw ? raw.split("\n").length : 0));
  }

  input.addEventListener("input", format);
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.textContent);
    copy.textContent = "Copied";
    setTimeout(() => (copy.textContent = "Copy"), 1200);
  });
  clear.addEventListener("click", () => {
    input.value = "";
    format();
  });
  format();
}

function initTitleChecker() {
  const shell = document.querySelector("[data-tool='youtube-title']");
  if (!shell) return;

  const title = document.getElementById("videoTitle");
  const keyword = document.getElementById("targetKeyword");
  const previewTitle = document.getElementById("serpPreviewTitle");
  const previewMeta = document.getElementById("serpPreviewMeta");

  function check() {
    const text = title.value.trim();
    const key = keyword.value.trim().toLowerCase();
    const length = text.length;
    const hasKeyword = key && text.toLowerCase().includes(key);
    const frontLoaded = key && text.toLowerCase().slice(0, 45).includes(key);
    const ideal = length >= 45 && length <= 70;
    const score = Math.max(0, Math.min(100, 35 + (ideal ? 35 : 0) + (hasKeyword ? 20 : 0) + (frontLoaded ? 10 : 0) - (length > 85 ? 25 : 0)));

    setText("titleLength", `${length}/70`);
    setText("titleScore", `${score}`);
    setText("keywordStatus", hasKeyword ? "Found" : "Missing");
    setText("lengthStatus", ideal ? "Good range" : length < 45 ? "Short" : "Long");
    setText("frontStatus", frontLoaded ? "Early" : "Not early");
    setMeter("titleMeter", score);
    if (previewTitle) previewTitle.textContent = text || "Your YouTube title preview";
    if (previewMeta) {
      previewMeta.textContent = length > 70 ? "Likely truncated on smaller screens." : "Likely readable in search and suggested video surfaces.";
    }
  }

  title.addEventListener("input", check);
  keyword.addEventListener("input", check);
  check();
}

function initMoneyCalculator() {
  const shell = document.querySelector("[data-tool='tiktok-money']");
  if (!shell) return;

  function calculate() {
    const views = num("moneyViews");
    const rpmLow = num("rpmLow") || 0.2;
    const rpmHigh = num("rpmHigh") || 1;
    const engagementRate = num("moneyEngagementRate") || 3;
    const multiplier = Math.max(0.65, Math.min(1.35, 0.85 + engagementRate / 12));
    const low = (views / 1000) * rpmLow * multiplier;
    const high = (views / 1000) * rpmHigh * multiplier;

    setText("moneyRange", `$${numberFormat.format(low)} - $${numberFormat.format(high)}`);
    setText("moneyMid", `$${numberFormat.format((low + high) / 2)}`);
    setText("moneyMultiplier", `${numberFormat.format(multiplier)}x`);
    setMeter("moneyMeter", multiplier * 70);
  }

  shell.querySelectorAll("input").forEach((input) => input.addEventListener("input", calculate));
  calculate();
}

function initHashtagGenerator() {
  const shell = document.querySelector("[data-tool='hashtag']");
  if (!shell) return;

  const topic = document.getElementById("hashtagTopic");
  const niche = document.getElementById("hashtagNiche");
  const output = document.getElementById("hashtagOutput");
  const copy = document.getElementById("copyHashtags");
  const generate = document.getElementById("generateHashtags");
  const banks = {
    creator: ["creator", "contentcreator", "creatortips", "creatorlife", "socialmediatips"],
    beauty: ["beautytok", "makeuptips", "skincare", "beautycreator", "grwm"],
    fitness: ["fitnesstok", "workouttips", "gymtok", "healthylifestyle", "fitnesscreator"],
    business: ["businesstok", "smallbusiness", "foundertok", "marketingtips", "sidehustle"],
    food: ["foodtok", "easyrecipe", "homecooking", "foodcreator", "dinnerideas"]
  };

  function build() {
    const seed = topic.value.trim().toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter(Boolean);
    const selected = banks[niche.value] || banks.creator;
    const topicTags = seed.slice(0, 3).map((word) => word.length > 2 ? word : "").filter(Boolean);
    const tags = [...new Set([...topicTags, ...selected, "tiktoktips", "fyp"])].slice(0, 12).map((tag) => `#${tag}`);
    output.textContent = tags.join(" ");
    setText("hashtagCount", numberFormat.format(tags.length));
  }

  generate.addEventListener("click", build);
  topic.addEventListener("input", build);
  niche.addEventListener("change", build);
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.textContent);
    copy.textContent = "Copied";
    setTimeout(() => (copy.textContent = "Copy"), 1200);
  });
  build();
}

function initCaptionCounter() {
  const shell = document.querySelector("[data-tool='caption-counter']");
  if (!shell) return;

  const input = document.getElementById("captionCounterInput");
  function count() {
    const text = input.value;
    const hashtags = (text.match(/#[\w]+/g) || []).length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const remaining = Math.max(0, 2200 - text.length);
    setText("captionCounterChars", numberFormat.format(text.length));
    setText("captionCounterWords", numberFormat.format(words));
    setText("captionCounterHashtags", numberFormat.format(hashtags));
    setText("captionCounterRemaining", numberFormat.format(remaining));
    setMeter("captionCounterMeter", (text.length / 2200) * 100);
  }

  input.addEventListener("input", count);
  count();
}

function initDescriptionGenerator() {
  const shell = document.querySelector("[data-tool='youtube-description']");
  if (!shell) return;

  const title = document.getElementById("descriptionTitle");
  const summary = document.getElementById("descriptionSummary");
  const link = document.getElementById("descriptionLink");
  const cta = document.getElementById("descriptionCta");
  const output = document.getElementById("descriptionOutput");
  const copy = document.getElementById("copyDescription");

  function generate() {
    const lines = [
      title.value.trim(),
      "",
      summary.value.trim(),
      "",
      cta.value.trim(),
      link.value.trim() ? `Resource: ${link.value.trim()}` : "",
      "",
      "Chapters:",
      "00:00 Intro",
      "00:30 Main idea",
      "02:00 Key examples",
      "04:00 Next steps"
    ].filter((line, index, arr) => line || arr[index - 1] !== "");
    output.textContent = lines.join("\n").trim();
    setText("descriptionChars", numberFormat.format(output.textContent.length));
  }

  shell.querySelectorAll("input, textarea").forEach((input) => input.addEventListener("input", generate));
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(output.textContent);
    copy.textContent = "Copied";
    setTimeout(() => (copy.textContent = "Copy"), 1200);
  });
  generate();
}

function initShortsTitleGenerator() {
  const shell = document.querySelector("[data-tool='shorts-title']");
  if (!shell) return;

  const topic = document.getElementById("shortsTopic");
  const angle = document.getElementById("shortsAngle");
  const output = document.getElementById("shortsOutput");
  const generate = document.getElementById("generateShortsTitles");
  const copy = document.getElementById("copyShortsTitles");

  function build() {
    const subject = topic.value.trim() || "your niche";
    const prefix = angle.value;
    const titles = [
      `${prefix}: ${subject}`,
      `${subject} in 30 seconds`,
      `Stop doing this with ${subject}`,
      `The simple ${subject} trick I wish I knew sooner`,
      `${subject}: before vs after`
    ];
    output.replaceChildren(...titles.map((title) => {
      const item = document.createElement("li");
      item.textContent = title;
      return item;
    }));
  }

  generate.addEventListener("click", build);
  topic.addEventListener("input", build);
  angle.addEventListener("change", build);
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText([...output.querySelectorAll("li")].map((li) => li.textContent).join("\n"));
    copy.textContent = "Copied";
    setTimeout(() => (copy.textContent = "Copy"), 1200);
  });
  build();
}

initTikTok();
initLineBreaks();
initTitleChecker();
initMoneyCalculator();
initHashtagGenerator();
initCaptionCounter();
initDescriptionGenerator();
initShortsTitleGenerator();
