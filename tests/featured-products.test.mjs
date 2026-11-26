import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateFeatured,renderFeatured} from '../scripts/featured-products.mjs';
const catalogue=JSON.parse(fs.readFileSync(new URL('../products/catalogue.json',import.meta.url)));
const config=JSON.parse(fs.readFileSync(new URL('../products/featured.json',import.meta.url)));
test('every featured product has a real page, artwork and any advertised demo', () => {
  validateFeatured(config, catalogue);
  for (const product of config.products) {
    const paths = ['/products/' + product.id + '.html', product.image];
    if (product.demo) paths.push(product.demo + 'index.html');
    for (const file of paths) assert.ok(fs.existsSync(new URL('..' + file, import.meta.url)), file);
  }
});

test('a featured product without a browser demo links to its real product page', () => {
  const product = config.products.find((item) => !item.demo);
  assert.ok(product);
  const html = renderFeatured({ products: [product] }, catalogue);
  assert.ok(html.includes(`href="/products/${product.id}.html">Explore the product`));
  assert.doesNotMatch(html, /data-product-demo|#privacy|#support/);
});

test('both carousels open on the first configured item and support navigation and rotation', () => {
  const script = fs.readFileSync(new URL('../assets/js/featured-carousel.js', import.meta.url), 'utf8');
  for (const path of ['../index.html', '../products/index.html']) {
    const html = fs.readFileSync(new URL(path, import.meta.url), 'utf8');
    const slides = [...html.matchAll(/data-featured-slide data-product="([^"]+)"[^>]*?aria-label="([^"]+)"([^>]*)>/g)]
      .map(([, id, label, attributes]) => ({ id, hidden: /\bhidden\b/.test(attributes), getAttribute: () => label }));
    assert.deepEqual(slides.map((slide) => slide.id), config.products.map((product) => product.id));
    const visible = () => slides.filter((slide) => !slide.hidden).map((slide) => slide.id);
    assert.deepEqual(visible(), [slides[0].id]);

    const events = new Map();
    const control = (name) => ({
      addEventListener(event, handler) { events.set(name + ':' + event, handler); },
      setAttribute() {},
    });
    const elements = Object.fromEntries(['controls', 'count', 'announcement', 'previous', 'next', 'toggle']
      .map((name) => ['[data-featured-' + name + ']', control(name)]));
    const root = {
      ...control('root'),
      querySelectorAll: () => slides,
      querySelector: (selector) => elements[selector],
      matches: () => false,
      contains: () => false,
    };
    let timer;
    vm.runInNewContext(script, {
      document: { ...control('document'), querySelectorAll: () => [root] },
      window: { matchMedia: () => ({ ...control('reducedMotion'), matches: false }) },
      setInterval(callback) { timer = callback; return 1; },
      clearInterval() { timer = undefined; },
    });
    assert.equal(elements['[data-featured-controls]'].hidden, false);
    timer();
    assert.deepEqual(visible(), [slides[1].id]);
    events.get('previous:click')();
    assert.deepEqual(visible(), [slides[0].id]);
    assert.equal(timer, undefined);
    events.get('previous:click')();
    assert.deepEqual(visible(), [slides.at(-1).id]);
    events.get('next:click')();
    assert.deepEqual(visible(), [slides[0].id]);
    events.get('root:touchstart')({ touches: [{ clientX: 100, clientY: 20 }] });
    events.get('root:touchend')({
      changedTouches: [{ clientX: 10, clientY: 20 }],
      target: { closest: () => null },
    });
    assert.deepEqual(visible(), [slides[1].id]);
    events.get('toggle:click')();
    timer();
    assert.deepEqual(visible(), [slides[2].id]);
  }
});
test('carousel accepts 50 real entries and rejects a 51st or duplicate product',()=>{const products=Array.from({length:50},(_,i)=>({...config.products[0],id:'example-'+i}));const cat={products:products.map(p=>({id:p.id,name:p.id,release_status:"in_development"}))};const html=renderFeatured({products},cat);assert.equal((html.match(/data-featured-slide /g)||[]).length,50);assert.equal((html.match(/role="group"[^>]* hidden/g)||[]).length,49);assert.throws(()=>validateFeatured({products:[...products,{...products[0],id:'example-50'}]},cat),/50/);assert.throws(()=>validateFeatured({products:[products[0],products[0]]},cat),/unique/);});
test('unknown products cannot create orphan promotions and copy is escaped',()=>{assert.throws(()=>validateFeatured({products:[{...config.products[0],id:'not-in-catalogue'}]},catalogue),/Unknown/);const p={...config.products[0],intro:'<script>alert(1)</script>'};assert.match(renderFeatured({products:[p]},catalogue),/&lt;script&gt;/);});

test('generated product grids preserve literal dollar prices',()=>{for(const page of ['../index.html','../products/index.html']){const html=fs.readFileSync(new URL(page,import.meta.url),'utf8');for(const product of catalogue.products.filter(p=>/\$\d/.test(p.summary)))assert.ok(html.includes(product.summary.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')),product.id+' price summary must remain intact');}});
