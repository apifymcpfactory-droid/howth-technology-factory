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
const vatDrafts = fs.readFileSync(path.join(root, 'marketing', 'campaigns', 'HTF-20260726-EUVATVAL-001', 'platform-drafts.md'), 'utf8');
const visualRecord = fs.readFileSync(path.join(root, 'marketing', 'campaigns', 'HTF-20260726-EUVATVAL-001', 'visual-generation-record.md'), 'utf8');
const campaignLinks = JSON.parse(fs.readFileSync(path.join(root, 'marketing', 'campaign-links.json'), 'utf8'));

function markdownSection(markdown, heading, nextHeading) {
  const start = markdown.indexOf(`## ${heading}`);
  const end = nextHeading ? markdown.indexOf(`## ${nextHeading}`, start + 1) : markdown.length;
  assert.ok(start >= 0 && end > start, `missing ${heading} section`);
  return markdown.slice(start, end);
}

function visibleMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/^(?:Post ID|Title|Subtitle|Body|Canonical source|Scheduling proposal):.*$/gmi, ' ')
    .replace(/^Disclosure:.*$/gmi, ' ')
    .replace(/[#>*_`|~-]/g, ' ');
}

function meaningfulWords(text) {
  return (text.match(/\b[\p{L}\p{N}][\p{L}\p{N}’'-]*\b/gu) || []).length;
}

function visibleHtml(html) {
  return html
    .replace(/<(script|style|nav|header|footer)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|#39|#x27);/gi, ' ');
}

function visibleUrlCount(markdown) {
  const withoutLinkDestinations = markdown
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  return (withoutLinkDestinations.match(/https?:\/\/\S+/g) || []).length;
}

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
assert.match(vatProduct, /vies-validation-state-machine\.svg/);
assert.doesNotMatch(vatProduct, /assets\/og\/default\.png/);
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
    assert.match(match[0], /data-(?:shopfront|review-source)=["'][a-z0-9_-]+["']/i, `${file} has an undeclared Apify or MCPize link`);
  }
}

assert.equal(new Set(ledger.campaigns.map((item) => item.campaign_id)).size, ledger.campaigns.length);
assert.ok(ledger.campaigns[0].historical_tracking_note.includes('unattributed'));
assert.equal(ledger.authority, 'non_authoritative_automation_data');
assert.match(workflowReadme, /Google Drive.*03 Campaign Ledger/s);
assert.doesNotMatch(workflowReadme, /campaign-ledger\.json` is authoritative/);
assert.doesNotMatch(automation, /['"]youtube['"]/);
assert.doesNotMatch(automation, /['"]dailydev['"]/);
assert.doesNotMatch(automation, /['"]indiehackers['"]/);
assert.doesNotMatch(automation, /LinkedIn: draft only/);
assert.doesNotMatch(automation, /expected one exact Apify/);
assert.doesNotMatch(automation, /expected one exact MCPize/);
assert.match(workflowReadme, /1,000.*2,000/s);
assert.match(workflowReadme, /X and Bluesky normally use one primary first-party campaign link/);
assert.match(workflowReadme, /tracking parameters must never be printed as visible copy/i);
assert.match(automation, /1,000.*2,000/s);
assert.match(automation, /primary_clean_link/);

const mediumDraft = markdownSection(vatDrafts, 'Medium', 'DEV');
const devDraft = markdownSection(vatDrafts, 'DEV', 'X');
const xDraft = markdownSection(vatDrafts, 'X', 'Bluesky');
const blueskyDraft = markdownSection(vatDrafts, 'Bluesky', 'Reddit');
const redditDraft = markdownSection(vatDrafts, 'Reddit', 'Product Hunt');
for (const [name, copy] of [['Insight', visibleHtml(vatArticle)], ['Medium', visibleMarkdown(mediumDraft)], ['DEV', visibleMarkdown(devDraft)]]) {
  const count = meaningfulWords(copy);
  assert.ok(count >= 1000 && count <= 2000, `${name} meaningful length is ${count}, expected 1000–2000`);
}
for (const [name, copy] of [['Medium', mediumDraft], ['DEV', devDraft]]) {
  assert.doesNotMatch(visibleMarkdown(copy), /(?:utm_|htf_)(?:source|medium|campaign|content|product|platform|post)=/i, `${name} exposes tracking parameters`);
  assert.match(copy, /\[[^\]]{4,}\]\(https?:\/\/[^)]+\)/, `${name} requires descriptive hyperlinks`);
}
for (const [name, copy] of [['X', xDraft], ['Bluesky', blueskyDraft], ['Reddit', redditDraft]]) {
  assert.ok(visibleUrlCount(copy) <= 1, `${name} has more than one visible public URL`);
  assert.doesNotMatch(copy, /https?:\/\/\S+[?&](?:utm_|htf_)/i, `${name} exposes tracking parameters`);
}
assert.match(mediumDraft, /vies-evidence-record\.png/);
assert.match(devDraft, /vies-validation-state-machine\.svg/);
assert.match(visualRecord, /Preflight decision:\s*pass/i);
assert.doesNotMatch(visualRecord, /promotional banner approved/i);

const registryPostIds = campaignLinks.links.map((item) => item.post_id);
assert.equal(new Set(campaignLinks.links.map((item) => item.slug)).size, campaignLinks.links.length);
assert.equal(new Set(registryPostIds).size, registryPostIds.length);
for (const item of campaignLinks.links) {
  const destination = new URL(item.destination_url);
  assert.equal(destination.origin, 'https://howthtechnologyfactory.pro');
  assert.equal(destination.search, '');
  const redirect = fs.readFileSync(path.join(root, 'go', item.slug, 'index.html'), 'utf8');
  assert.match(redirect, /noindex,\s*nofollow,\s*noarchive/);
  assert.match(redirect, new RegExp(item.post_id, 'i'));
}
execFileSync(process.execPath, [path.join(root, 'marketing', 'build-campaign-links.mjs'), '--check'], { cwd: root });

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
assert.deepEqual(
  dryRun.publications.map((item) => item.platform),
  ['website', 'medium', 'devto', 'x', 'bluesky', 'reddit', 'producthunt', 'hackernews', 'apify', 'mcpize']
);
assert.equal(dryRun.publications.find((item) => item.platform === 'apify').status, 'listing_assessment_required');
assert.equal(dryRun.publications.find((item) => item.platform === 'mcpize').status, 'listing_assessment_required');
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
