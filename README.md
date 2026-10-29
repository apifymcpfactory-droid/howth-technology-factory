# Howth Technology Factory — marketing site

Static marketing site for Howth Technology Factory, hosted on GitHub Pages.

- Plain HTML + precompiled local Tailwind CSS + minimal vanilla JS. No runtime CSS compiler.
- Google Fonts (Inter, Space Grotesk), Lucide icons (CDN). Content is visible without scroll-reveal JavaScript.
- One reusable product-page template (`products/*.html`) — adding a new product means
  copying one of those files, editing its content, and adding a card + `llms.txt` +
  `sitemap.xml` entry for it.
- `llms.txt`, `sitemap.xml`, `robots.txt` at the root for agent/search legibility.
- Contact form submits via [FormSubmit.co](https://formsubmit.co) — no backend required.

## Local preview

After editing or regenerating pages: `npm ci --ignore-scripts`, `npm run prepare:search`, `npm run build:css`, then `npm run check:search`. Commit `assets/css/utilities.css`; GitHub Pages serves static files. Fictional demos have unique metadata and `noindex, follow`; the 46 complete canonical landing/content pages are in the sitemap. Redirect-only tracking URLs remain excluded. Do not add fake modification dates or indexing guarantees.

Any static file server works, e.g.:

```bash
npx serve .
```

## Structure

```
index.html            Home
contact.html           Contact (FormSubmit)
privacy.html            Privacy policy
products/<id>.html      One page per product
assets/css/main.css      Custom CSS (Tailwind handles the rest via CDN config)
assets/js/main.js        Nav toggle, AOS/Lucide init, contact-form success state
assets/icons/<id>.svg     Standalone product icon files
assets/favicon.svg|png    Site favicon / apple-touch-icon
assets/og/default.*       Default Open Graph share image
llms.txt / sitemap.xml / robots.txt
```
