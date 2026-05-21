# China Entry Toolkit

Static SEO tool site for foreigners planning entry into China.

## First release

- Home page with a compact eligibility checker
- `china-visa-free-checker.html`
- `china-visa-free-countries.html`
- `china-transit-without-visa-checker.html`
- `240-hour-transit-china.html`
- `china-stay-length-calculator.html`
- `china-travel-apps.html`
- `how-to-apply-144-hour-visa-free-transit-in-china.html`
- `china-payment-setup-for-foreigners.html`
- `how-to-use-didi-in-china-as-a-foreigner.html`
- `china-address-card-generator.html`
- `china-allergy-card-generator.html`
- `china-visa-free-for-germans.html`
- `china-visa-free-for-french-citizens.html`
- `china-visa-free-for-japanese-citizens.html`
- Standard About, Contact, Privacy, Terms, `robots.txt`, `sitemap.xml`

## Product scope

This first build models two major policy families:

1. China's 30-day unilateral visa-free policy
2. China's 240-hour visa-free transit policy

It also includes two arrival-support tools:

1. A bilingual address card generator
2. A bilingual allergy card generator

And two support pages for post-arrival execution:

1. China payment setup for foreigners
2. How to use DiDi in China as a foreigner

It also now includes:

1. A travel-app setup guide for foreigners
2. Additional nationality-specific landing pages for Germany, France, and Japan

It does not yet model every mutual exemption agreement, regional visa-free program, or port-specific edge case.

## Source review

Policy content in this release is based on official sources reviewed on 2026-05-21:

- National Immigration Administration list of countries covered by unilateral visa exemption policies, compiled as of 2026-02-17
- National Immigration Administration visa-free transit policy guidance, updated 2025-07-04
- National Immigration Administration notice expanding 240-hour transit entry ports to 65, effective 2025-11-05

## Local preview

```bash
cd /Users/jimmy/Documents/Playground/china-entry-toolkit
python3 -m http.server 4173
```

Then open `http://localhost:4173`.
