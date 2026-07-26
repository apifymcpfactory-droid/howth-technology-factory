import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'assets', 'js', 'main.js'), 'utf8');

function runPage(pathname) {
  const listeners = new Map();
  const events = [];
  const store = new Map();
  const ownedLink = {
    href: 'https://howthtechnologyfactory.pro/products/pdf-toolkit.html',
    dataset: {},
    textContent: 'PDF Toolkit',
  };
  const shopfrontLink = {
    href: 'https://future-shop.example/pdf-toolkit',
    dataset: { shopfront: 'future_shop' },
    textContent: 'Future shop',
  };
  const reviewLink = {
    href: 'https://reviews.example/pdf-toolkit',
    dataset: { reviewSource: 'future_reviews', productId: 'pdf-toolkit' },
    textContent: 'Read independent reviews',
  };
  const location = new URL(`https://howthtechnologyfactory.pro${pathname}?utm_source=bluesky&utm_medium=organic&utm_campaign=stage1&utm_content=stage1-bsky-01&htf_product=pdf-toolkit&htf_campaign=HTF-STAGE1&htf_platform=bluesky&htf_post=HTF-STAGE1-BSKY-01`);
  const document = {
    addEventListener(name, callback) {
      const callbacks = listeners.get(name) || [];
      callbacks.push(callback);
      listeners.set(name, callbacks);
    },
    querySelector() { return null; },
    querySelectorAll(selector) { return selector === 'a[href]' ? [ownedLink] : []; },
  };
  const window = {
    location,
    document,
    URLSearchParams,
    sessionStorage: {
      getItem(key) { return store.get(key) || null; },
      setItem(key, value) { store.set(key, value); },
    },
    gtag(name, eventName, parameters) {
      events.push({ name, eventName, parameters });
    },
  };
  vm.runInNewContext(source, {
    window,
    document,
    URL,
    URLSearchParams,
    FormData: class {},
    console,
    setTimeout,
    clearTimeout,
  });
  for (const callback of listeners.get('DOMContentLoaded') || []) callback();
  for (const callback of listeners.get('click') || []) {
    callback({ target: { closest: () => shopfrontLink } });
    callback({ target: { closest: () => reviewLink } });
  }
  return { events, ownedLink, shopfrontLink, reviewLink, stored: JSON.parse(store.get('htf_campaign_attribution')) };
}

const insight = runPage('/insights/pdf-automation-boundaries.html');
assert.equal(insight.events[0].eventName, 'insight_view');
assert.equal(insight.events[0].parameters.product_id, 'pdf-toolkit');
assert.equal(insight.events[0].parameters.campaign_id, 'HTF-STAGE1');
assert.equal(insight.events[0].parameters.platform_id, 'bluesky');
assert.equal(insight.events[0].parameters.post_id, 'HTF-STAGE1-BSKY-01');
assert.equal(insight.events[1].eventName, 'shopfront_outbound_click');
assert.equal(insight.events[1].parameters.shopfront_id, 'future_shop');
assert.equal(insight.events[2].eventName, 'future_shop_outbound_click');
assert.equal(insight.events[3].eventName, 'review_source_click');
assert.equal(insight.events[3].parameters.product_id, 'pdf-toolkit');
assert.equal(insight.events[3].parameters.review_source, 'future_reviews');
assert.equal(insight.events[3].parameters.destination_url, 'https://reviews.example/pdf-toolkit');
assert.equal(insight.events[3].parameters.campaign_id, 'HTF-STAGE1');
assert.equal(insight.events[3].parameters.post_id, 'HTF-STAGE1-BSKY-01');
assert.equal(insight.events[3].parameters.platform, 'bluesky');
assert.match(insight.ownedLink.href, /htf_campaign=HTF-STAGE1/);
assert.match(insight.shopfrontLink.href, /htf_post=HTF-STAGE1-BSKY-01/);
assert.equal(insight.reviewLink.href, 'https://reviews.example/pdf-toolkit');
assert.equal(insight.stored.htf_product, 'pdf-toolkit');

const product = runPage('/products/pdf-toolkit.html');
assert.equal(product.events[0].eventName, 'product_view');
assert.equal(product.events[0].parameters.utm_source, 'bluesky');

console.log('tracking runtime tests passed');
