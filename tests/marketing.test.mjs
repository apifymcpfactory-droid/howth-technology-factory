import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const article = fs.readFileSync(path.join(root, 'insights', 'pdf-automation-boundaries.html'), 'utf8');
const vatArticle = fs.readFileSync(path.join(root, 'insights', 'vies-validation-state-machine.html'), 'utf8');
const index = fs.readFileSync(path.join(root, 'insights', 'index.html'), 'utf8');
const vatProduct = fs.readFileSync(path.join(root, 'products', 'eu-vat-validator.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const js = fs.readFileSync(path.join(root, 'assets', 'js', 'main.js'), 'utf8');
const automation = fs.readFileSync(path.join(root, 'marketing', 'run-campaign.mjs'), 'utf8');
const workflowReadme = fs.readFileSync(path.join(root, 'marketing', 'README.md'), 'utf8');
const ledger = JSON.parse(fs.readFileSync(path.join(root, 'marketing', 'campaign-ledger.json'), 'utf8'));

assert.match(article, /rel="canonical" href="https:\/\/howthtechnologyfactory\.pro\/insights\/pdf-automation-boundaries\.html"/);
assert.match(article, /"@type":"TechArticle"/);
assert.match(article, /apify\.com\/apifmcpfactory\/pdf-toolkit\?/);
assert.match(article, /mcpize\.com\/mcp\/pdf-toolkit-mcp\?/);
assert.match(article, /\/products\/pdf-toolkit\.html\?/);
assert.match(index, /pdf-automation-boundaries\.html/);
assert.match(vatArticle, /rel="canonical" href="https:\/\/howthtechnologyfactory\.pro\/insights\/vies-validation-state-machine\.html"/);
assert.match(vatArticle, /HTF-20260726-EUVATVAL-001-WEBSITE-01/);
assert.match(vatArticle, /apify\.com\/apifmcpfactory\/eu-vat-validator\?/);
assert.match(vatArticle, /mcpize\.com\/mcp\/eu-vat-validator-mcp\?/);
assert.match(index, /vies-validation-state-machine\.html/);
assert.doesNotMatch(vatProduct, /official VIES database/);
assert.doesNotMatch(vatProduct, /proof of a reverse-charge check/);
assert.match(vatProduct, /national VAT databases/);
assert.match(vatProduct, /consultation number/);
assert.match(sitemap, /https:\/\/howthtechnologyfactory\.pro\/insights\//);
for (const event of ['insight_view','product_view','shopfront_outbound_click','contact_submit','insight_to_product_click']) {
  assert.match(js, new RegExp(event));
}
for (const key of ['htf_product','htf_campaign','htf_platform','htf_post']) {
  assert.match(js, new RegExp(key));
}
assert.match(js, /sessionStorage/);
assert.match(js, /data\.shopfront|dataset\.shopfront/);
assert.doesNotMatch(js, /hostname === ['"]apify\.com/);
assert.doesNotMatch(js, /hostname === ['"]mcpize\.com/);
assert.doesNotMatch(js, /youtube_outbound_click/);

for (const file of fs.readdirSync(path.join(root, 'products')).filter((name) => name.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, 'products', file), 'utf8');
  for (const match of html.matchAll(/<a\b[^>]*href=["']https:\/\/(?:apify\.com\/apifmcpfactory\/|mcpize\.com\/mcp\/)[^"']+["'][^>]*>/gi)) {
    assert.match(match[0], /data-shopfront=["'][a-z0-9_-]+["']/i, `${file} has an undeclared shopfront link`);
  }
}

assert.equal(new Set(ledger.campaigns.map((item) => item.campaign_id)).size, ledger.campaigns.length);
assert.ok(ledger.campaigns[0].historical_tracking_note.includes('unattributed'));
assert.equal(ledger.authority, 'non_authoritative_automation_data');
assert.match(workflowReadme, /Google Drive.*03 Campaign Ledger/s);
assert.doesNotMatch(workflowReadme, /campaign-ledger\.json` is authoritative/);
assert.doesNotMatch(automation, /['"]youtube['"]/);
assert.doesNotMatch(automation, /expected one exact Apify/);
assert.doesNotMatch(automation, /expected one exact MCPize/);

const output = execFileSync(process.execPath, [
  path.join(root, 'marketing', 'run-campaign.mjs'),
  'https://howthtechnologyfactory.pro/products/pdf-toolkit.html',
  '--offline', '--dry-run'
], { cwd: root, encoding: 'utf8' });
const dryRun = JSON.parse(output);
assert.equal(dryRun.shopfront_verification.length, 2);
assert.notEqual(dryRun.angle, ledger.campaigns[0].angle);
assert.match(dryRun.campaign_id, /^HTF-\d{8}-[A-Z0-9]+-\d{3}$/);
assert.equal(new Set(dryRun.publications.map((item) => item.post_id)).size, dryRun.publications.length);
assert.ok(dryRun.publications.length > 0);
for (const publication of dryRun.publications) {
  assert.notEqual(publication.platform, 'youtube');
  for (const link of Object.values(publication.tracked_links)) {
    const url = new URL(link);
    assert.equal(url.searchParams.get('htf_product'), 'pdf-toolkit');
    assert.equal(url.searchParams.get('htf_campaign'), dryRun.campaign_id);
    assert.equal(url.searchParams.get('htf_platform'), publication.platform);
    assert.equal(url.searchParams.get('htf_post'), publication.post_id);
    assert.equal(url.searchParams.get('utm_source'), publication.platform);
    assert.equal(url.searchParams.get('utm_campaign'), dryRun.campaign_id.toLowerCase());
    assert.equal(url.searchParams.get('utm_content'), publication.post_id.toLowerCase());
  }
}
console.log('marketing tests passed');
