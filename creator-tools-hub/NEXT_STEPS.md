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
- Search Console discovered URLs from sitemap: 16

## Completed

- Built and deployed the first static SEO tool site.
- Added logo and favicon.
- Added core pages: homepage, about, contact, privacy, terms.
- Added creator tool pages for TikTok, Instagram, and YouTube.
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
- Created reusable Codex skill:
  - `/Users/jimmy/.codex/skills/seo-tool-site-launcher`

## Needs Verification Later

Check these after 24-72 hours:

- Search Console indexing status for homepage and priority tool pages.
- Whether pages appear under "Pages" / "Indexing" without crawl or canonical errors.
- Whether sitemap still shows successful processing.
- Whether Google starts showing impressions in Performance.
- Whether Vercel production remains healthy after DNS propagation fully settles.

Priority URLs to inspect/request indexing:

- `https://shortformtools.com/`
- `https://shortformtools.com/tiktok-tools`
- `https://shortformtools.com/tiktok-engagement-rate-calculator`
- `https://shortformtools.com/tiktok-money-calculator`
- `https://shortformtools.com/tiktok-hashtag-generator`
- `https://shortformtools.com/instagram-tools`
- `https://shortformtools.com/instagram-caption-character-counter`
- `https://shortformtools.com/youtube-tools`
- `https://shortformtools.com/youtube-description-generator`
- `https://shortformtools.com/youtube-shorts-title-generator`

## Next Operating Steps

1. Use Search Console URL Inspection to request indexing for the homepage and priority pages.
2. Wait for initial indexing and impression data.
3. Use Ahrefs to find the next low-difficulty creator-tool keyword cluster.
4. Add one cluster at a time instead of many unrelated pages.
5. Improve existing pages with examples, presets, copy buttons, and more useful outputs.
6. Add Google Analytics or another lightweight analytics tool.
7. Apply for AdSense only after the site has meaningful indexed utility pages and some organic signal.

## Good Next Page Clusters

Potential clusters to research in Ahrefs:

- TikTok bio generator
- TikTok caption generator
- TikTok username ideas
- TikTok video idea generator
- Instagram bio generator
- Instagram hashtag counter
- Instagram username generator
- YouTube Shorts description generator
- YouTube Shorts hashtag generator
- YouTube channel name generator

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

