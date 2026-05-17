# Shortform Tools

Static MVP for `shortformtools.com`.

## Deploy

Recommended:

1. Push this folder to a GitHub repo.
2. Import the repo into Vercel, Netlify, or Cloudflare Pages.
3. Use the project root as the publish directory.
4. No build command is required.
5. Add the custom domain `shortformtools.com`.
6. Add `www.shortformtools.com` and redirect it to the apex domain.

## DNS

When the domain purchase finishes, point DNS to the chosen host:

- Vercel: follow the domain screen. Usually apex uses `A 76.76.21.21`; `www` uses a CNAME to Vercel.
- Cloudflare Pages: add the custom domain in Pages, then follow the CNAME target it provides.
- Netlify: add the custom domain, then use the DNS records shown in Netlify.

## Before Launch

- Create or route `hello@shortformtools.com`.
- Add Google Search Console verification.
- Submit `https://shortformtools.com/sitemap.xml`.
- Add analytics.
- Add AdSense only after core pages are indexed and the policy pages are live.

## Current Pages

- `/`
- `/tiktok-engagement-rate-calculator`
- `/instagram-line-break-generator`
- `/youtube-title-checker`
- `/about`
- `/contact`
- `/privacy`
- `/terms`
