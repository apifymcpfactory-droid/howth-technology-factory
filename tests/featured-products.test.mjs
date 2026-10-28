import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateFeatured,renderFeatured} from '../scripts/featured-products.mjs';
const catalogue=JSON.parse(fs.readFileSync(new URL('../products/catalogue.json',import.meta.url)));
const config=JSON.parse(fs.readFileSync(new URL('../products/featured.json',import.meta.url)));
test('every featured product has a real page, demo and artwork',()=>{validateFeatured(config,catalogue);for(const p of config.products){for(const file of ['/products/'+p.id+'.html',p.image,p.demo+'index.html'])assert.ok(fs.existsSync(new URL('..'+file,import.meta.url)),file);}});
test('carousel accepts 50 real entries and rejects a 51st or duplicate product',()=>{const products=Array.from({length:50},(_,i)=>({...config.products[0],id:'example-'+i}));const cat={products:products.map(p=>({id:p.id,name:p.id}))};const html=renderFeatured({products},cat);assert.equal((html.match(/data-featured-slide /g)||[]).length,50);assert.equal((html.match(/role="tabpanel"[^>]* hidden/g)||[]).length,49);assert.throws(()=>validateFeatured({products:[...products,{...products[0],id:'example-50'}]},cat),/50/);assert.throws(()=>validateFeatured({products:[products[0],products[0]]},cat),/unique/);});
test('unknown products cannot create orphan promotions and copy is escaped',()=>{assert.throws(()=>validateFeatured({products:[{...config.products[0],id:'not-in-catalogue'}]},catalogue),/Unknown/);const p={...config.products[0],intro:'<script>alert(1)</script>'};assert.match(renderFeatured({products:[p]},catalogue),/&lt;script&gt;/);});
