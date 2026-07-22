# Howth Technology Factory — marketing site

Static marketing site for Howth Technology Factory, hosted on GitHub Pages.

- Plain HTML + Tailwind CSS (CDN) + minimal vanilla JS. No build step, no framework.
- Google Fonts (Inter, Space Grotesk), Lucide icons (CDN), AOS for scroll reveal (CDN).
- One reusable product-page template (`products/*.html`) — adding a new product means
  copying one of those files, editing its content, and adding a card + `llms.txt` +
  `sitemap.xml` entry for it.
- `llms.txt`, `sitemap.xml`, `robots.txt` at the root for agent/search legibility.
- Contact form submits via [FormSubmit.co](https://formsubmit.co) — no backend required.

## Local preview

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
