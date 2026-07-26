#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REGISTRY_PATH = path.join(ROOT, 'marketing', 'campaign-links.json');
const SITE_ORIGIN = 'https://howthtechnologyfactory.pro';
const TRACKING_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'htf_product', 'htf_campaign', 'htf_platform', 'htf_post'];

export function trackedDestination(entry) {
  const url = new URL(entry.destination_url);
  url.searchParams.set('utm_source', entry.platform);
  url.searchParams.set('utm_medium', 'organic');
  url.searchParams.set('utm_campaign', entry.campaign_id.toLowerCase());
  url.searchParams.set('utm_content', entry.post_id.toLowerCase());
  url.searchParams.set('htf_product', entry.product_id);
  url.searchParams.set('htf_campaign', entry.campaign_id);
  url.searchParams.set('htf_platform', entry.platform);
  url.searchParams.set('htf_post', entry.post_id);
  return url.href;
}

export function validateRegistry(registry) {
  if (registry.schema_version !== 1 || !Array.isArray(registry.links)) throw new Error('campaign-link registry schema is invalid');
  const slugs = new Set();
  const postIds = new Set();
  for (const entry of registry.links) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.slug)) throw new Error(`malformed campaign-link slug: ${entry.slug}`);
    if (slugs.has(entry.slug)) throw new Error(`reused campaign-link slug: ${entry.slug}`);
    if (postIds.has(entry.post_id)) throw new Error(`reused campaign-link post id: ${entry.post_id}`);
    if (!entry.campaign_id || !entry.post_id || !entry.product_id || !entry.platform) throw new Error(`campaign-link identity is incomplete: ${entry.slug}`);
    const destination = new URL(entry.destination_url);
    if (destination.origin !== SITE_ORIGIN) throw new Error(`campaign-link destination must be first-party: ${entry.slug}`);
    if (destination.search || destination.hash) throw new Error(`campaign-link destination must be the permanent clean URL: ${entry.slug}`);
    const tracked = new URL(trackedDestination(entry));
    for (const key of TRACKING_KEYS) {
      if (!tracked.searchParams.get(key)) throw new Error(`campaign-link ${entry.slug} is missing ${key}`);
    }
    if (tracked.searchParams.get('htf_campaign') !== entry.campaign_id || tracked.searchParams.get('htf_post') !== entry.post_id) {
      throw new Error(`campaign-link identity mismatch: ${entry.slug}`);
    }
    slugs.add(entry.slug);
    postIds.add(entry.post_id);
  }
}

function render(entry) {
  const tracked = trackedDestination(entry);
  const escapedUrl = tracked.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  const escapedName = entry.destination_name.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Continue to ${escapedName}</title>
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta http-equiv="refresh" content="0; url=${escapedUrl}">
  <link rel="canonical" href="${entry.destination_url}">
  <script>window.location.replace(${JSON.stringify(tracked)});</script>
</head>
<body>
  <p>Continue to <a href="${escapedUrl}" rel="nofollow">${escapedName}</a>.</p>
</body>
</html>
`;
}

export function buildCampaignLinks({ check = false } = {}) {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  validateRegistry(registry);
  for (const entry of registry.links) {
    const output = path.join(ROOT, 'go', entry.slug, 'index.html');
    const expected = render(entry);
    if (check) {
      if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== expected) throw new Error(`campaign redirect is missing or stale: /go/${entry.slug}/`);
      continue;
    }
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, expected);
  }
  return registry.links.length;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  try {
    const count = buildCampaignLinks({ check: process.argv.includes('--check') });
    console.log(`${process.argv.includes('--check') ? 'Verified' : 'Generated'} ${count} campaign redirects.`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
