import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const productsDir = path.join(root, "products");
const featured = JSON.parse(fs.readFileSync(path.join(productsDir, "featured.json"), "utf8")).products;
const featuredById = new Map(featured.map((product) => [product.id, product]));
const explicitFeatures = new Map([
  ["mcpize-development-inventory", [
    "Search supported public job feeds",
    "Retrieve vacancies in a consistent format",
    "Compare current job IDs with a list you supply",
    "Create HTML reports for review",
    "Research SEC filings, tagged financials and material events",
  ]],
]);
const styleVersion = "20261111fx";

const decode = (value) => value.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const clean = (value) => decode(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
const escape = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function structuredFeatures(html) {
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(match[1]);
      for (const item of Array.isArray(data) ? data : [data]) {
        if (item?.featureList?.length) return item.featureList.map(String);
      }
    } catch {
      // Structured-data validation reports malformed JSON separately.
    }
  }
  return [];
}

function cardFeatures(html) {
  return [...new Set([...html.matchAll(/<article[^>]*>\s*<h3[^>]*>([\s\S]*?)<\/h3>/gi)]
    .map((match) => clean(match[1]).replace(/^\d+\.\s*/, ""))
    .filter(Boolean))].slice(0, 6);
}

function renderFeatureList(features) {
  return `<section class="content-section product-features" aria-labelledby="key-features-title"><div class="section-heading"><p class="eyebrow">At a glance</p><h2 id="key-features-title">Key features</h2><p>See what the product helps you do before you decide whether it fits your workflow.</p></div><ul class="product-feature-list">${features.map((feature) => `<li>${escape(feature)}</li>`).join("")}</ul></section>`;
}

function insertFeatureList(html, features) {
  const section = renderFeatureList(features);
  for (const anchor of [/<section id="privacy"/i, /<section id="status"/i, /<section class="disclosure-section"/i, /<p class="legal-note"/i, /<\/main>/i]) {
    if (anchor.test(html)) return html.replace(anchor, `${section}$&`);
  }
  throw new Error("No safe insertion point");
}

const failures = [];
let changed = 0;
for (const name of fs.readdirSync(productsDir).filter((name) => name.endsWith(".html") && name !== "index.html")) {
  const id = name.replace(/\.html$/, "");
  const file = path.join(productsDir, name);
  let html = fs.readFileSync(file, "utf8");
  let features = structuredFeatures(html);
  if (features.length < 3) features = explicitFeatures.get(id) ?? [];
  if (features.length < 3) features = featuredById.get(id)?.facts ?? [];
  if (features.length < 3) features = cardFeatures(html);
  features = [...new Set(features.map(clean).map((feature) => feature.replace(/^(?:Apify|MCPize) workflow:\s*/i, "")).filter(Boolean))].slice(0, 6);
  if (features.length < 3) {
    failures.push(`${name}: found ${features.length} verified features`);
    continue;
  }
  try {
    if (html.includes('class="content-section product-features"')) {
      html = html.replace(/<section class="content-section product-features"[\s\S]*?<\/section>/i, renderFeatureList(features));
    } else {
      html = insertFeatureList(html, features);
    }
    html = html.replace(/assets\/css\/main\.css\?v=[^"']+/g, `assets/css/main.css?v=${styleVersion}`);
    fs.writeFileSync(file, html);
    changed += 1;
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
console.log(`product feature lists: ${changed} pages updated`);
