import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),origin='https://howthtechnologyfactory.pro';
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(urls).size,urls.length,'Duplicate sitemap URLs');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>['node_modules','.git'].includes(d.name)?[]:d.isDirectory()?walk(path.join(dir,d.name)):d.name.endsWith('.html')?[path.join(dir,d.name)]:[]);}
let indexable=0,demos=0;
for(const file of walk(root)){
 const html=fs.readFileSync(file,'utf8'),rel=path.relative(root,file).replaceAll('\\','/');
 assert.doesNotMatch(html,/cdn\.tailwindcss\.com|tailwind\.config\s*=/,`${rel}: browser CSS compiler`);
 assert.doesNotMatch(html,/https:\/\/unpkg\.com\/aos@/,`${rel}: script-dependent content visibility`);
 const noindex=/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html);
 if(rel.startsWith('go/')){assert(noindex);continue;}
 assert.match(html,/<title>[^<]+<\/title>/i,`${rel}: title`);
 assert.match(html,/<meta\b[^>]*name="description"[^>]*content="[^"]+"/i,`${rel}: description`);
 const canon=[...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/gi)].map(m=>m[1]);
 assert.equal(canon.length,1,`${rel}: exactly one canonical`);
 const own=origin+'/'+rel.replace(/index\.html$/,'');assert.equal(canon[0],own,`${rel}: self canonical`);
 if(rel.startsWith('products/demos/')){assert(noindex,`${rel}: fictional demo exclusion`);assert(!urls.includes(own));demos++;continue;}
 assert(!noindex,`${rel}: important page accidentally excluded`);
 assert(urls.includes(own),`${rel}: missing from sitemap`);indexable++;
}
assert.equal(indexable,urls.length,'Sitemap includes a missing or excluded page');
assert(fs.statSync(path.join(root,'assets/css/utilities.css')).size>10000,'Compiled CSS missing');
console.log(`Search checks passed: ${indexable} indexable pages in sitemap, ${demos} fictional demos excluded, metadata and local CSS verified.`);
