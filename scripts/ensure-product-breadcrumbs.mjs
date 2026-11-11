import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const products = [
  ['fieldnote-playtest-research-studio', 'Fieldnote'],
  ['buildscope-release-readiness-studio', 'BuildScope'],
  ['caliper-forge-shopify-theme', 'Caliper Forge'],
];
for (const [id, name] of products) {
  const file = path.join(root, 'products', `${id}.html`);
  let html = fs.readFileSync(file, 'utf8');
  if (id === 'caliper-forge-shopify-theme') {
    html = html.replace(/,"offers":\{"@type":"Offer","price":"100","priceCurrency":"USD","availability":"https:\/\/schema\.org\/PreOrder"\}/, '');
  }
  if (!html.includes('"@type":"BreadcrumbList"')) {
    const data = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://howthtechnologyfactory.pro/' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://howthtechnologyfactory.pro/products/' },
      { '@type': 'ListItem', position: 3, name, item: `https://howthtechnologyfactory.pro/products/${id}.html` },
    ] };
    html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(data)}</script></head>`);
  }
  fs.writeFileSync(file, html);
}
