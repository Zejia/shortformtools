# ShortFormTools Next Steps

Last updated: 2026-05-17

## Current State

- Domain: `shortformtools.com`
- Production: `https://shortformtools.com`
- GitHub: `Zejia/shortformtools`
- Vercel project: `shortformtools`
- Canonical host: apex domain, `www.shortformtools.com` redirects to `https://shortformtools.com`
- Google Search Console property: `https://shortformtools.com/`
- Sitemap submitted in Search Console and processed successfully
- Search Console discovered URLs from sitemap before latest expansion: 16
- Current sitemap URLs after latest expansion: 19
- AdSense publisher ID: `pub-4259477754165351`
- AdSense status: review requested, waiting for Google review before ads can serve
- Online `ads.txt`: `google.com, pub-4259477754165351, DIRECT, f08c47fec0942fa0`

## Completed

- Built and deployed the first static SEO tool site.
- Added logo and favicon.
- Added core pages: homepage, about, contact, privacy, terms.
- Added creator tool pages for TikTok, Instagram, and YouTube.
- Added the first expansion cluster:
  - `/tiktok-bio-generator`
  - `/instagram-bio-generator`
  - `/youtube-channel-name-generator`
- Added topic hub pages:
  - `/tiktok-tools`
  - `/instagram-tools`
  - `/youtube-tools`
- Added sitemap and robots.
- Connected domain to Vercel.
- Configured `www` to apex redirect.
- Verified production pages return 200.
- Added Google Search Console HTML verification file:
  - `/google333164a3006b4105.html`
- Verified Search Console ownership.
- Submitted `sitemap.xml` and confirmed successful processing.
- Added AdSense site verification script.
- Added and verified `ads.txt` online.
- Submitted `shortformtools.com` to AdSense review.
- Created reusable Codex skill:
  - `/Users/jimmy/.codex/skills/seo-tool-site-launcher`

## Needs Verification Later

Check these after 24-72 hours:

- Search Console indexing status for homepage and priority tool pages.
- Whether pages appear under "Pages" / "Indexing" without crawl or canonical errors.
- Whether sitemap still shows successful processing.
- Whether Google starts showing impressions in Performance.
- Whether the 3 newly added pages are discovered from the updated sitemap.
- Whether AdSense finishes review or asks for more site value/content.
- Whether AdSense UI clears its cached Ads.txt warning after Google recrawls it.
- Whether Vercel production remains healthy after DNS propagation fully settles.

Priority URLs to inspect/request indexing:

- `https://shortformtools.com/`
- `https://shortformtools.com/tiktok-tools`
- `https://shortformtools.com/tiktok-bio-generator`
- `https://shortformtools.com/tiktok-engagement-rate-calculator`
- `https://shortformtools.com/tiktok-money-calculator`
- `https://shortformtools.com/tiktok-hashtag-generator`
- `https://shortformtools.com/instagram-tools`
- `https://shortformtools.com/instagram-bio-generator`
- `https://shortformtools.com/instagram-caption-character-counter`
- `https://shortformtools.com/youtube-tools`
- `https://shortformtools.com/youtube-channel-name-generator`
- `https://shortformtools.com/youtube-description-generator`
- `https://shortformtools.com/youtube-shorts-title-generator`

## Next Operating Steps

1. After the latest deploy, use Search Console URL Inspection to request indexing for the 3 new tool pages.
2. Resubmit or recheck `https://shortformtools.com/sitemap.xml` in Search Console so Google sees 19 URLs.
3. Wait for AdSense review and initial indexing/impression data.
4. Use Ahrefs to find the next low-difficulty creator-tool keyword cluster.
5. Add one cluster at a time instead of many unrelated pages.
6. Improve existing pages with examples, presets, copy buttons, and more useful outputs.
7. Add Google Analytics or another lightweight analytics tool.

## Good Next Page Clusters

Potential clusters to research in Ahrefs:

- TikTok caption generator
- TikTok username ideas
- TikTok video idea generator
- Instagram hashtag counter
- Instagram username generator
- YouTube Shorts description generator
- YouTube Shorts hashtag generator

For each keyword, capture:

- Volume
- Keyword difficulty
- SERP intent
- Ranking page types
- Whether an interactive tool can beat the current results

## New Window Prompt

Use this in a new Codex window:

```text
Use $seo-tool-site-launcher. Continue the ShortFormTools project at /Users/jimmy/Documents/Playground/creator-tools-hub. Read NEXT_STEPS.md and SEO.md first. Help me verify Search Console/indexing status, then choose and build the next low-difficulty tool cluster.
```

## Useful Commands

```bash
cd /Users/jimmy/Documents/Playground
git status --short
git log --oneline -5
curl -sI https://shortformtools.com/
curl -sI https://shortformtools.com/sitemap.xml
curl -s https://shortformtools.com/sitemap.xml | head -40
```
