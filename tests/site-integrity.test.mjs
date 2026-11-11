import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const full = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const htmlFiles = walk(root).filter(file => file.endsWith('.html') && !file.includes(`${path.sep}.git${path.sep}`));
const rel = file => path.relative(root, file).replaceAll('\\', '/');
const text = file => fs.readFileSync(file, 'utf8');
const attr = (html, tag, name) => new RegExp(`<${tag}\\b[^>]*\\b${name}=["']([^"']*)["'][^>]*>`, 'i').exec(html)?.[1];
const meta = (html, name) => new RegExp(`<meta\\b(?=[^>]*(?:name|property)=["']${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'])[^>]*content=["']([^"']*)["'][^>]*>`, 'i').exec(html)?.[1];

const errors = [];
const titles = new Map();
const canonicalUrls = new Map();
for (const file of htmlFiles) {
  const html = text(file);
  const name = rel(file);
  const noindex = /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
  const title = /<title>([\s\S]*?)<\/title>/i.exec(html)?.[1].trim();
  if (!title) errors.push(`${name}: missing title`);
  if (!noindex) {
    const description = meta(html, 'description');
    const canonical = attr(html, 'link', 'href') && /<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)["']/i.exec(html)?.[1];
    if (!description) errors.push(`${name}: missing meta description`);
    if (!canonical?.startsWith('https://howthtechnologyfactory.pro/')) errors.push(`${name}: missing or invalid canonical`);
    if (title) {
      const prior = titles.get(title);
      if (prior) errors.push(`${name}: duplicate title also used by ${prior}`);
      titles.set(title, name);
    }
    if (canonical) {
      const prior = canonicalUrls.get(canonical);
      if (prior) errors.push(`${name}: duplicate canonical also used by ${prior}`);
      canonicalUrls.set(canonical, name);
    }
    const h1s = [...html.matchAll(/<h1\b/gi)].length;
    if (h1s !== 1) errors.push(`${name}: expected one h1, found ${h1s}`);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(match[0])) errors.push(`${name}: image missing alt`);
  }
  for (const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (!href || href.includes('${') || href.startsWith('#') || /^(?:https?:|mailto:|tel:|javascript:)/i.test(href)) continue;
    const clean = decodeURIComponent(href.split(/[?#]/)[0]);
    let target;
    if (clean.startsWith('/')) target = path.join(root, clean.replace(/^\/+/, ''));
    else target = path.resolve(path.dirname(file), clean);
    if (clean.endsWith('/') || (!path.extname(clean) && !clean.endsWith('.html'))) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) errors.push(`${name}: broken internal link ${href}`);
  }
}

const contact = text(path.join(root, 'contact.html'));
assert.match(contact, /<form\b[^>]*data-contact-form[^>]*action=["']https:\/\/formsubmit\.co\/ajax\/218574ae20552abf49afc439a073b508["']/i);
assert.match(contact, /name=["']email["'][^>]*type=["']email["'][^>]*required/i);
assert.match(contact, /id=["']consent["'][^>]*required/i);
assert.match(contact, /href=["']privacy\.html["']/i);
const caliperSupport = text(path.join(root, 'caliper', 'support.html'));
assert.match(caliperSupport, /<form\b[^>]*action=["']https:\/\/formsubmit\.co\/218574ae20552abf49afc439a073b508["'][^>]*method=["']POST["']/i);
assert.match(caliperSupport, /name=["']_next["'][^>]*value=["']https:\/\/howthtechnologyfactory\.pro\/caliper\/support-received\.html["']/i);
assert.match(caliperSupport, /id=["']support-email["'][^>]*name=["']email["'][^>]*required/i);
assert.match(caliperSupport, /id=["']support-consent["'][^>]*required/i);
const catalogue = JSON.parse(text(path.join(root, 'products', 'catalogue.json')));
for (const product of catalogue.products) {
  const productPath = new URL(product.url).pathname.replace(/^\//, '');
  const productHtml = text(path.join(root, productPath));
  if (!/class=["'][^"']*product-features[^"']*["']/i.test(productHtml)) {
    errors.push(`${productPath}: missing visible key features section`);
  }
  const featureSection = /<section\b[^>]*class=["'][^"']*product-features[^"']*["'][^>]*>([\s\S]*?)<\/section>/i.exec(productHtml)?.[1] ?? '';
  const featureCount = [...featureSection.matchAll(/<li\b/gi)].length;
  if (featureCount < 3) errors.push(`${productPath}: expected at least three visible features, found ${featureCount}`);
}
assert.deepEqual(errors, [], `Site integrity failures:\n${errors.join('\n')}`);
console.log(`site integrity: ${htmlFiles.length} HTML files checked`);
