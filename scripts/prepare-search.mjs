import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const origin='https://howthtechnologyfactory.pro';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.name==='node_modules'||d.name==='.git'?[]:d.isDirectory()?walk(path.join(dir,d.name)):d.name.endsWith('.html')?[path.join(dir,d.name)]:[]);}
export function prepareSearch(){
 const features=JSON.parse(fs.readFileSync(path.join(root,'products/featured.json'),'utf8')).products;
 let changed=0;
 for(const file of walk(root)){
  let s=fs.readFileSync(file,'utf8'),before=s;
  s=s.replace(/<script\b[^>]*src="https:\/\/cdn\.tailwindcss\.com[^"<>]*"[^>]*><\/script>\s*/gi,'<link rel="stylesheet" href="/assets/css/utilities.css" />\n');
  s=s.replace(/<script>\s*tailwind\.config\s*=[\s\S]*?<\/script>\s*/g,'');
  s=s.replace(/<link\b[^>]*href="https:\/\/unpkg\.com\/aos@[^"<>]+"[^>]*>\s*/gi,'');
  s=s.replace(/<script\b[^>]*src="https:\/\/unpkg\.com\/aos@[^"<>]+"[^>]*><\/script>\s*/gi,'');
  const rel=path.relative(root,file).replaceAll('\\','/');
  if(rel.startsWith('products/demos/')){
   const urlPath='/'+rel.replace(/index\.html$/,'');
   const feature=features.find(p=>p.demo===urlPath);
   const name=feature?.label||'ProjectKit for Jira';
   const title=escape(name+' Demo | HTF');
   s=s.replace(/<title>[\s\S]*?<\/title>/i,'');
   s=s.replace(/<meta\b(?=[^>]*name=["'](?:description|robots)["'])[^>]*>/gi,'');
   s=s.replace(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*>/gi,'');
   // Fictional demos remain available through product pages, but should not
   // compete with the complete product landing pages in search results.
   s=s.replace(/<head>/i,`<head><title>${title}</title><meta name="description" content="${escape('Explore the '+name+' sample workflow. This browser demo uses fictional content and does not access a live design or payment account.')}" /><meta name="robots" content="noindex, follow" /><link rel="canonical" href="${origin+urlPath}" />`);
  }
  if(s!==before){fs.writeFileSync(file,s);changed++;}
 }
 console.log(`Search preparation: ${changed} HTML files updated; canonical landing pages remain indexable.`);
}
if(process.argv[1]===fileURLToPath(import.meta.url))prepareSearch();
