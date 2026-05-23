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

function initTitleAbTester() {
  const shell = document.querySelector("[data-tool='youtube-title-ab']");
  if (!shell) return;

  const keyword = document.getElementById("abKeyword");
  const titles = [
    document.getElementById("abTitleA"),
    document.getElementById("abTitleB"),
    document.getElementById("abTitleC")
  ];
  const rows = document.getElementById("abScoreRows");
  const winner = document.getElementById("abWinner");
  const meter = document.getElementById("abWinnerMeter");
  const previewTitle = document.getElementById("abPreviewTitle");
  const previewMeta = document.getElementById("abPreviewMeta");
  const copy = document.getElementById("copyAbReport");
  let lastReport = "";

  function scoreTitle(text, key) {
    const lower = text.toLowerCase();
    const length = text.length;
    const hasKeyword = key && lower.includes(key);
    const earlyKeyword = key && lower.slice(0, 42).includes(key);
    const hasNumber = /\d/.test(text);
    const curiosity = /\b(secret|tested|why|stop|before|after|mistakes|actually|things|what|how)\b/i.test(text);
    const specificity = /\b(\d+|checklist|framework|examples|case study|template|teardown|ideas|fixes)\b/i.test(text);
    const mobileFit = length >= 42 && length <= 65;
    const tooLong = length > 76;
    const tooShort = length < 32;
    const score = Math.max(0, Math.min(100,
      24 +
      (mobileFit ? 20 : 0) +
      (hasKeyword ? 18 : 0) +
      (earlyKeyword ? 10 : 0) +
      (curiosity ? 14 : 0) +
      (specificity || hasNumber ? 10 : 0) -
      (tooLong ? 18 : 0) -
      (tooShort ? 12 : 0)
    ));
    const notes = [
      mobileFit ? "mobile-safe" : tooLong ? "likely long" : tooShort ? "thin promise" : "usable length",
      hasKeyword ? "keyword present" : "keyword missing",
      curiosity ? "curiosity hook" : "plain angle",
      specificity || hasNumber ? "specific payoff" : "needs sharper payoff"
    ];
    return { score, notes };
  }

  function render() {
    const key = keyword.value.trim().toLowerCase();
    const variants = titles.map((field, index) => {
      const text = field.value.trim();
      return { label: `Title ${String.fromCharCode(65 + index)}`, text, ...scoreTitle(text, key) };
    }).filter((item) => item.text);
    const best = variants.slice().sort((a, b) => b.score - a.score)[0];
    if (!best) return;

    winner.textContent = `${best.label}: ${best.score}`;
    if (meter) meter.style.setProperty("--value", `${best.score}%`);
    if (previewTitle) previewTitle.textContent = best.text;
    if (previewMeta) previewMeta.textContent = best.notes.join(" · ");
    rows.innerHTML = variants.map((item) => `
      <div class="status-item">
        <span>${item.label}</span>
        <strong>${item.score} · ${item.notes[0]}</strong>
      </div>
    `).join("");
    lastReport = variants.map((item) => `${item.label}: ${item.score}/100 - ${item.text} (${item.notes.join(", ")})`).join("\n");
  }

  [keyword, ...titles].forEach((field) => field.addEventListener("input", render));
  copy?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(lastReport);
    copy.textContent = "Copied comparison";
    setTimeout(() => (copy.textContent = "Copy comparison"), 1200);
  });
  render();
}

function initPackagingScorecard() {
  const shell = document.querySelector("[data-tool='youtube-packaging']");
  if (!shell) return;

  const title = document.getElementById("packagingTitle");
  const keyword = document.getElementById("packagingKeyword");
  const thumbnail = document.getElementById("packagingThumbnail");
  const payoff = document.getElementById("packagingPayoff");
  const audience = document.getElementById("packagingAudience");
  const angle = document.getElementById("packagingAngle");
  const recommendations = document.getElementById("packagingRecommendations");
  const variants = document.getElementById("packagingVariants");
  const badge = document.getElementById("packagingBadge");

  const stopWords = new Set(["the", "a", "an", "and", "or", "to", "for", "with", "your", "you", "how", "that", "this", "from"]);

  function words(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((word) => word && !stopWords.has(word));
  }

  function unique(wordsList) {
    return [...new Set(wordsList)];
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function titleCase(text) {
    return text
      .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .replace(/\bYoutube\b/g, "YouTube")
      .replace(/\bTiktok\b/g, "TikTok")
      .replace(/\bInstagram\b/g, "Instagram");
  }

  function setList(el, items) {
    el.replaceChildren(...items.map((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      return li;
    }));
  }

  function buildVariants(keywordText, payoffText, angleValue) {
    const key = keywordText || "youtube video packaging";
    const titledKey = titleCase(key);
    const result = [];
    if (angleValue === "list") {
      result.push(`${titledKey}: 7 packaging fixes for ${payoffText || "more clicks"}`);
      result.push(`${titledKey} that actually ${payoffText || "earn more clicks"}`);
      result.push(`Stop wasting impressions, ${key} fixes for ${payoffText || "better CTR"}`);
    } else if (angleValue === "howto") {
      result.push(`How to improve ${key} for ${payoffText || "better click-through rate"}`);
      result.push(`${titledKey}: a simple framework to ${payoffText || "win more clicks"}`);
      result.push(`How creators tighten ${key} before they publish`);
    } else if (angleValue === "mistakes") {
      result.push(`${titledKey} mistakes that kill ${payoffText || "your CTR"}`);
      result.push(`Most creators miss this ${key} problem`);
      result.push(`Fix these ${key} mistakes before you publish`);
    } else if (angleValue === "case") {
      result.push(`${titledKey} case study: what changed and why it worked`);
      result.push(`We rebuilt this ${key} for ${payoffText || "better CTR"}`);
      result.push(`${titledKey} teardown: the packaging changes that mattered`);
    } else if (angleValue === "comparison") {
      result.push(`${titledKey}: before vs after`);
      result.push(`Good vs bad ${key}, what actually changes clicks`);
      result.push(`${titledKey} comparison for ${payoffText || "stronger performance"}`);
    } else {
      result.push(`${titledKey} reaction: what I would fix before publishing`);
      result.push(`Reviewing ${key} for ${payoffText || "better click performance"}`);
      result.push(`${titledKey} critique: keep this, cut that`);
    }
    return result;
  }

  function evaluate() {
    const titleText = title.value.trim();
    const keywordText = keyword.value.trim().toLowerCase();
    const thumbText = thumbnail.value.trim();
    const payoffText = payoff.value.trim();
    const audienceValue = audience.value;
    const angleValue = angle.value;

    const titleLength = titleText.length;
    const thumbLength = thumbText.length;
    const titleWords = unique(words(titleText));
    const thumbWords = unique(words(thumbText));
    const keywordWords = unique(words(keywordText));
    const overlapCount = thumbWords.filter((word) => titleWords.includes(word)).length;
    const keywordFound = keywordText && titleText.toLowerCase().includes(keywordText);
    const earlyKeyword = keywordText && titleText.toLowerCase().slice(0, 34).includes(keywordText);
    const mobileFriendly = titleLength >= 42 && titleLength <= 60;
    const browseFriendly = titleLength <= 58;
    const thumbFriendly = thumbLength > 0 && thumbLength <= 28;
    const hasNumber = /\d/.test(titleText) || /\d/.test(thumbText);
    const hasClearAngle = /how|why|vs|ideas|mistakes|guide|checklist|hooks|examples|template|teardown|review/i.test(titleText);

    let score = 26;
    if (mobileFriendly) score += 18;
    if (thumbFriendly) score += 12;
    if (keywordFound) score += 16;
    if (earlyKeyword) score += 8;
    if (overlapCount === 0) score += 10;
    if (overlapCount > 0 && overlapCount <= 2) score += 6;
    if (hasNumber) score += 4;
    if (hasClearAngle) score += 8;
    if (audienceValue === "search" && keywordFound) score += 8;
    if (audienceValue === "search" && !earlyKeyword) score -= 8;
    if (audienceValue === "browse" && !browseFriendly) score -= 8;
    if (audienceValue === "browse" && overlapCount > 2) score -= 10;
    if (titleLength > 70) score -= 14;
    if (thumbLength > 32) score -= 10;
    score = Math.max(0, Math.min(100, score));

    const recs = [];
    if (!keywordFound && audienceValue !== "browse") {
      recs.push("Move the exact target phrase into the title. Right now the package is harder for search to classify.");
    }
    if (keywordFound && !earlyKeyword) {
      recs.push("Front-load the target phrase earlier in the title so the topic is clear before truncation.");
    }
    if (!mobileFriendly) {
      recs.push(titleLength < 42
        ? "Make the title a little more specific. It is short enough to read, but not yet doing enough work."
        : "Trim the title. Important words are likely to disappear on smaller mobile surfaces.");
    }
    if (!thumbFriendly) {
      recs.push("Shorten the thumbnail text. Keep it punchy enough to read in a fast homepage scan.");
    }
    if (overlapCount > 2) {
      recs.push("Reduce title and thumbnail repetition. Let the thumbnail add a second meaning instead of echoing the title.");
    } else if (overlapCount === 0) {
      recs.push("Create a clearer bridge between title and thumbnail. They should feel connected even when they use different words.");
    }
    if (!hasClearAngle) {
      recs.push("Sharpen the angle. Add a reason to click, such as a framework, mistakes, examples, or a before-and-after contrast.");
    }
    if (recs.length === 0) {
      recs.push("The package already reads clearly. Protect that clarity if you test more emotional or curiosity-heavy versions.");
      recs.push("If this video is search-led, keep the exact phrase early and do not swap it out for a vaguer hook.");
      recs.push("If this video is browse-led, test a thumbnail phrase that adds contrast without repeating the title.");
    } else {
      if (!payoffText) {
        recs.push("Write the promised outcome more explicitly. A viewer should know what changes after they click.");
      }
      if (recs.length < 3) {
        recs.push("Keep the topic promise concrete. A viewer should know what outcome they get before they click.");
      }
      if (recs.length < 3) {
        recs.push("Review the package at mobile size before publishing. If the payoff disappears, shorten the title or simplify the thumbnail text.");
      }
    }

    const surfaceStatus = audienceValue === "search"
      ? (keywordFound && earlyKeyword ? "Search-ready" : "Search-weak")
      : audienceValue === "browse"
        ? (browseFriendly && overlapCount <= 2 ? "Browse-ready" : "Browse-weak")
        : (score >= 70 ? "Balanced" : "Needs tuning");

    setText("packagingScore", `${score}`);
    setMeter("packagingMeter", score);
    setText("packagingLength", `${titleLength}/60`);
    setText("packagingThumbLength", `${thumbLength}/28`);
    setText("packagingKeywordStatus", keywordFound ? (earlyKeyword ? "Early" : "Late") : "Missing");
    setText("packagingOverlapStatus", overlapCount > 2 ? "Too similar" : overlapCount === 0 ? "Too separate" : "Good split");
    setText("packagingSurfaceStatus", surfaceStatus);
    setText("mobileTitlePreview", titleLength > 62 ? `${titleText.slice(0, 59).trim()}...` : (titleText || "Your preview appears here"));
    setText("mobileTitleMeta", mobileFriendly ? "Readable on mobile and still specific enough." : titleLength > 60 ? "Likely to truncate before the payoff lands." : "Readable, but it may still need more specificity.");
    setText("thumbnailPreview", thumbText || "Thumbnail text");
    setText("thumbnailMeta", thumbFriendly ? "Readable enough for quick browse surfaces." : "Too long for fast browse surfaces.");

    badge.textContent = score >= 78 ? "Strong package" : score >= 62 ? "Promising" : "Needs work";
    badge.className = "badge";
    if (score < 62) badge.classList.add("warn");
    if (score < 45) badge.classList.add("bad");

    setList(recommendations, recs.slice(0, 4));
    setList(variants, buildVariants(keywordText, payoffText, angleValue));
  }

  shell.querySelectorAll("input, textarea, select").forEach((inputEl) => inputEl.addEventListener("input", evaluate));
  shell.querySelectorAll("select").forEach((inputEl) => inputEl.addEventListener("change", evaluate));
  evaluate();
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

function initBioGenerator() {
  const shell = document.querySelector("[data-tool='bio-generator']");
  if (!shell) return;

  const platform = shell.dataset.platform || "creator";
  const niche = document.getElementById("bioNiche");
  const value = document.getElementById("bioValue");
  const tone = document.getElementById("bioTone");
  const proof = document.getElementById("bioProof");
  const output = document.getElementById("bioOutput");
  const copy = document.getElementById("copyBios");
  const generate = document.getElementById("generateBios");

  function build() {
    const subject = niche.value.trim() || "content creators";
    const promise = value.value.trim() || "make better short-form videos";
    const signal = proof.value.trim();
    const toneWord = tone.value;
    const platformLabel = platform === "instagram" ? "IG" : "TikTok";
    const proofLine = signal ? ` | ${signal}` : "";
    const bios = [
      `Tips for ${subject} who want to ${promise}.${proofLine}`,
      `${platformLabel} notes for ${subject}. Helping you ${promise}.`,
      `${toneWord} ideas for ${subject}. Follow for ways to ${promise}.`,
      `${subject}: systems, hooks, and posting ideas. ${signal || "New tools weekly."}`
    ];
    output.replaceChildren(...bios.map((bio) => {
      const item = document.createElement("li");
      item.textContent = bio;
      return item;
    }));
    setText("bioCount", numberFormat.format(bios.length));
  }

  shell.querySelectorAll("input, select").forEach((input) => input.addEventListener("input", build));
  shell.querySelectorAll("select").forEach((input) => input.addEventListener("change", build));
  generate.addEventListener("click", build);
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText([...output.querySelectorAll("li")].map((li) => li.textContent).join("\n"));
    copy.textContent = "Copied";
    setTimeout(() => (copy.textContent = "Copy"), 1200);
  });
  build();
}

function initChannelNameGenerator() {
  const shell = document.querySelector("[data-tool='channel-name']");
  if (!shell) return;

  const topic = document.getElementById("channelTopic");
  const audience = document.getElementById("channelAudience");
  const style = document.getElementById("channelStyle");
  const output = document.getElementById("channelOutput");
  const copy = document.getElementById("copyChannelNames");
  const generate = document.getElementById("generateChannelNames");

  function titleCase(text) {
    return text.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  function build() {
    const subject = titleCase(topic.value.trim() || "Creator Strategy");
    const viewer = titleCase(audience.value.trim() || "Beginners");
    const styleWord = style.value;
    const names = [
      `${subject} Lab`,
      `${viewer} Guide to ${subject}`,
      `${subject} Notes`,
      `${styleWord} ${subject}`,
      `${subject} Playbook`,
      `${viewer} ${subject} Studio`
    ];
    output.replaceChildren(...names.map((name) => {
      const item = document.createElement("li");
      item.textContent = name;
      return item;
    }));
    setText("channelNameCount", numberFormat.format(names.length));
  }

  shell.querySelectorAll("input, select").forEach((input) => input.addEventListener("input", build));
  shell.querySelectorAll("select").forEach((input) => input.addEventListener("change", build));
  generate.addEventListener("click", build);
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
initTitleAbTester();
initPackagingScorecard();
initMoneyCalculator();
initHashtagGenerator();
initCaptionCounter();
initDescriptionGenerator();
initShortsTitleGenerator();
initBioGenerator();
initChannelNameGenerator();
