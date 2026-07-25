import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const article = fs.readFileSync(path.join(root, 'insights', 'pdf-automation-boundaries.html'), 'utf8');
const index = fs.readFileSync(path.join(root, 'insights', 'index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const js = fs.readFileSync(path.join(root, 'assets', 'js', 'main.js'), 'utf8');
const ledger = JSON.parse(fs.readFileSync(path.join(root, 'marketing', 'campaign-ledger.json'), 'utf8'));

assert.match(article, /rel="canonical" href="https:\/\/howthtechnologyfactory\.pro\/insights\/pdf-automation-boundaries\.html"/);
assert.match(article, /"@type":"TechArticle"/);
assert.match(article, /apify\.com\/apifmcpfactory\/pdf-toolkit\?/);
assert.match(article, /mcpize\.com\/mcp\/pdf-toolkit-mcp\?/);
assert.match(article, /\/products\/pdf-toolkit\.html\?/);
assert.match(index, /pdf-automation-boundaries\.html/);
assert.match(sitemap, /https:\/\/howthtechnologyfactory\.pro\/insights\//);
for (const event of ['apify_outbound_click','mcpize_outbound_click','contact_submit','insight_to_product_click','youtube_outbound_click']) {
  assert.match(js, new RegExp(event));
}
assert.equal(new Set(ledger.campaigns.map((item) => item.campaign_id)).size, ledger.campaigns.length);
assert.ok(ledger.campaigns[0].historical_tracking_note.includes('unattributed'));

const output = execFileSync(process.execPath, [
  path.join(root, 'marketing', 'run-campaign.mjs'),
  'https://howthtechnologyfactory.pro/products/pdf-toolkit.html',
  '--offline', '--dry-run'
], { cwd: root, encoding: 'utf8' });
const dryRun = JSON.parse(output);
assert.equal(dryRun.marketplace_verification.length, 2);
assert.notEqual(dryRun.angle, ledger.campaigns[0].angle);
console.log('marketing tests passed');
