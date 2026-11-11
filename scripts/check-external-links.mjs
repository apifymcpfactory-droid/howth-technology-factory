import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const files = walk(root).filter(file => file.endsWith('.html'));
const ignoredHosts = new Set(['howthtechnologyfactory.pro', 'schema.org', 'fonts.googleapis.com', 'fonts.gstatic.com', 'www.googletagmanager.com', 'www.clarity.ms', 'unpkg.com', 'example.com', 'your-image-host.com', 'your-store.myshopify.com', 'your-website.com']);
const urls = new Set();
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/\b(?:href|action)=["'](https:\/\/[^"']+)["']/gi)) {
    const raw = match[1].replaceAll('&amp;', '&');
    if (raw.includes('${')) continue;
    const url = new URL(raw);
    if (!ignoredHosts.has(url.hostname)) urls.add(url.href);
  }
}

async function check(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    let response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'HTF-Link-Audit/1.0' } });
    if ([405, 501].includes(response.status)) response = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal, headers: { 'user-agent': 'HTF-Link-Audit/1.0', range: 'bytes=0-0' } });
    const postOnlyForm = new URL(url).hostname === 'formsubmit.co' && new URL(url).pathname.startsWith('/ajax/') && response.status === 405;
    return { url, status: response.status, ok: postOnlyForm || response.status < 400 || [401, 403, 429].includes(response.status) };
  } catch (error) {
    return { url, status: 0, ok: false, error: error.name };
  } finally { clearTimeout(timer); }
}

const queue = [...urls];
const results = [];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) results.push(await check(queue.shift()));
}));
results.sort((a, b) => a.url.localeCompare(b.url));
const failed = results.filter(result => !result.ok);
for (const result of failed) console.error(`${result.status || result.error}\t${result.url}`);
if (failed.length) process.exitCode = 1;
else console.log(`external links: ${results.length} destinations responded`);
