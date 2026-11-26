import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../products/index.html', import.meta.url), 'utf8');
const script = fs.readFileSync(new URL('../assets/js/catalogue.js', import.meta.url), 'utf8');
const catalogue = JSON.parse(fs.readFileSync(new URL('../products/catalogue.json', import.meta.url), 'utf8'));

test('the purchase filter shows each live product in every marketplace where it is sold', () => {
    const groups = [...html.matchAll(/<section data-platform-group="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)].map(([, platformGroup, markup]) => {
        const group = { dataset: { platformGroup } };
        group.cards = [...markup.matchAll(/data-product-id="([^"]+)" data-status="([^"]+)"/g)].map(([, productId, status]) => ({
            dataset: { productId, status },
            closest: () => group,
        }));
        group.querySelector = () => group.cards.find((card) => !card.hidden);
        return group;
    });
    const cards = groups.flatMap((group) => group.cards);
    const purchase = { dataset: { facet: 'status' }, value: 'live' };
    const search = { value: '', focus() {} };
    const platform = { value: '' };
    const count = {};
    const empty = {};
    const listeners = {};
    const reset = { addEventListener(event, handler) { listeners.reset = handler; } };
    const controls = {
        '[data-catalogue-search]': search,
        '[data-catalogue-platform]': platform,
        '[data-result-count]': count,
        '[data-empty-state]': empty,
        '[data-reset-filters]': reset,
    };
    const collections = {
        '[data-product-card]': cards,
        '[data-platform-group]': groups,
        'input[data-facet]': [purchase],
        '[data-quick-problem]': [],
    };
    const root = {
        querySelector: (selector) => controls[selector],
        querySelectorAll: (selector) => collections[selector],
        addEventListener(event, handler) { listeners[event] = handler; },
    };
    vm.runInNewContext(script, { document: { querySelector: () => root } });

    purchase.checked = true;
    listeners.change();
    const liveProducts = catalogue.products.filter((product) => product.release_status === 'live');
    const expectedListings = liveProducts.flatMap((product) => product.shopfronts.map((shop) => `${shop.id}:${product.id}`));
    const visibleListings = groups.flatMap((group) => group.cards.filter((card) => !card.hidden)
        .map((card) => `${group.dataset.platformGroup === 'confluence' ? 'atlassian-marketplace' : group.dataset.platformGroup}:${card.dataset.productId}`));
    assert.deepEqual(visibleListings.sort(), expectedListings.sort());
    assert.equal(count.textContent, `${expectedListings.length} results across ${liveProducts.length} products`);
    assert.equal(empty.hidden, true);

    platform.value = 'mcpize';
    listeners.change();
    const mcpizeListings = expectedListings.filter((listing) => listing.startsWith('mcpize:')).length;
    assert.deepEqual(groups.filter((group) => !group.hidden).map((group) => group.dataset.platformGroup), ['mcpize']);
    assert.equal(cards.filter((card) => !card.hidden).length, mcpizeListings);
    assert.equal(count.textContent, `${mcpizeListings} results`);

    listeners.reset();
    assert.equal(purchase.checked, false);
    assert.equal(cards.filter((card) => !card.hidden).length, cards.length);
    assert.equal(count.textContent, `${cards.length} results across ${catalogue.products.length} products`);
});
