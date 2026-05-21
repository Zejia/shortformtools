# Import Duty Toolkit

Static SEO tool site for landed-cost planning, import-duty estimation, tariff modeling, and customs prep.

## First release

- `index.html`
- `import-duty-calculator.html`
- `landed-cost-calculator.html`
- `customs-duty-calculator.html`
- `us-import-duty-calculator.html`
- `uk-import-duty-calculator.html`
- `de-minimis-calculator.html`
- `how-to-estimate-import-duty.html`
- `hs-code-lookup-guide.html`
- `about.html`
- `contact.html`
- `privacy.html`
- `terms.html`
- shared `styles.css` and `app.js`
- `robots.txt` and `sitemap.xml`

## Product scope

This MVP is designed to feel more like an import operations tool than a toy calculator. It includes:

- market presets for the US, UK, EU-like VAT mode, and Custom
- landed-cost modeling with product value, shipping, insurance, duty, tax or VAT, brokerage, misc costs, and FX buffer
- low-value threshold behavior and adjustable relief treatment
- per-unit landed cost output plus scenario comparison
- an HS-code broker brief builder so the site can support classification prep, not just arithmetic
- additional long-tail calculator entry pages for customs-duty, US, UK, and de-minimis search intent

## Monetization basics

- `ads.txt` is included with the same Google publisher line already used elsewhere in this workspace
- canonical URLs and sitemap entries exist for the long-tail calculator pages

Replace the `ads.txt` publisher line if this site should use a different AdSense account.

## Assumption notes

Preset assumptions were reviewed on 2026-05-21 and are intended for planning only.

- US preset assumes broad de minimis relief is not generally available and keeps threshold relief off by default.
- UK preset uses a common `GBP 135` low-value customs-duty line with VAT still modeled separately.
- EU-like preset uses a common `EUR 150` low-value customs-duty line with VAT modeled from the first euro.

Replace the placeholder domain `https://crossborderkit.com/` before production if you launch on a different hostname.

## Local preview

```bash
cd /Users/jimmy/Documents/Playground/import-duty-toolkit
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
