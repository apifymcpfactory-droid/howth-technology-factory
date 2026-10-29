import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {artDirections} from './product-art-directions.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalogue=JSON.parse(fs.readFileSync(path.join(root,'products/catalogue.json')));
const featured=JSON.parse(fs.readFileSync(path.join(root,'products/featured.json')));
const examples={
 'pdf-toolkit':['One PDF workflow.','Many documents.',['Merge · Split · Compress','Rotate · Watermark · Convert'],'PDF files','Processed documents'],
 'eu-vat-validator':['Check the number.','Keep the evidence.',['Single and bulk VAT checks','Official VIES service'],'VAT numbers','Validation results'],
 'tech-stack-detector':['See what powers','the website.',['CMS · Frameworks · Analytics','Structured website intelligence'],'Website URL','Detected technologies'],
 'llms-txt-checker':['Is your website','ready to be read?',['Inspect llms.txt','Review actionable findings'],'Website URL','Readiness report'],
 'llms-txt-generator':['Give AI agents','a clearer starting point.',['Generate llms.txt','Review before publishing'],'Website URL','llms.txt draft'],
 'llms-txt-suite':['Check. Generate.','Keep checking.',['Audit and generate llms.txt','Monitor changes over time'],'Website','Readiness workflow'],
 'sanctions-screening':['Screen the names.','Review the matches.',['OFAC · EU · UK · UN','Bulk screening with match scores'],'Names to screen','Matches for review'],
 'domain-health-audit':['Your domain.','A clearer diagnosis.',['DNS · SSL · Email authentication','Readiness findings and fixes'],'Domain names','Health report'],
 'iban-validator':['Check the IBAN.','Know what passed.',['Checksum · Structure · SEPA','Single and bulk validation'],'IBAN values','Validation results'],
 'email-domain-checker':['Better signals.','Before you send.',['MX · SPF · DKIM · DMARC','DNS-based domain checks'],'Email / domain','Authentication signals'],
 'bankofamerica-jobs-api':['Open roles.','Ready for your workflow.',['Bank of America vacancies','Structured JSON and CSV'],'Published vacancies','Structured job data'],
 'homedepot-jobs-api':['Corporate to stores.','Hiring data in one place.',['The Home Depot vacancies','Structured JSON and CSV'],'Published vacancies','Structured job data'],
 'lowes-jobs-api':['Store-level roles.','Structured for you.',['Lowe’s published vacancies','Full-time and part-time details'],'Published vacancies','Structured job data'],
 'target-jobs-api':['Retail and technology.','One structured feed.',['Target published vacancies','US and Bangalore roles'],'Published vacancies','Structured job data'],
 'workday-jobs-api':['Workday careers.','An API-ready result.',['Tenant careers URL in','Structured job records out'],'Careers URL','JSON / CSV records']
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dir=path.join(root,'assets/previews/tools');fs.mkdirSync(dir,{recursive:true});
for(const p of catalogue.products){if(featured.products.some(f=>f.id===p.id))continue;if(artDirections[p.id]){fs.writeFileSync(path.join(dir,p.id+'.svg'),artDirections[p.id]()+'\n');continue;}const data=examples[p.id];if(!data)throw Error('Missing illustration: '+p.id);const [line1,line2,rows,input,output]=data;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="#eeeede"/><path d="M760 0H1200V675H990Z" fill="#dbe3cf"/><text x="56" y="55" font-family="Arial,sans-serif" font-size="14" letter-spacing="2" fill="#516249">HTF / PRACTICAL SOFTWARE</text><text x="56" y="188" font-family="Georgia,serif" font-size="54" fill="#203a30">${esc(line1)}</text><text x="56" y="254" font-family="Georgia,serif" font-size="54" fill="#456248">${esc(line2)}</text><text x="56" y="322" font-family="Arial,sans-serif" font-size="20" fill="#64705b">${esc(rows[0])}</text><text x="56" y="356" font-family="Arial,sans-serif" font-size="20" fill="#64705b">${esc(rows[1])}</text><rect x="56" y="426" width="435" height="112" rx="12" fill="#fafbf4" stroke="#bbc6ad"/><rect x="660" y="426" width="484" height="112" rx="12" fill="#254b3d"/><text x="80" y="461" font-family="Arial,sans-serif" font-size="12" letter-spacing="2" fill="#7e8b71">INPUT</text><text x="80" y="505" font-family="Arial,sans-serif" font-size="26" fill="#203a30">${esc(input)}</text><path d="M518 482H626M614 470L626 482L614 494" fill="none" stroke="#516d4a" stroke-width="3"/><text x="688" y="461" font-family="Arial,sans-serif" font-size="12" letter-spacing="2" fill="#b8cbae">OUTPUT</text><text x="688" y="505" font-family="Arial,sans-serif" font-size="26" fill="#f1f4e8">${esc(output)}</text><text x="56" y="619" font-family="Arial,sans-serif" font-size="13" fill="#7e8b71">WORKFLOW ILLUSTRATION</text><text x="1144" y="619" text-anchor="end" font-family="Arial,sans-serif" font-size="13" fill="#516249">Agentic Systems Studio | HTF</text></svg>`;
fs.writeFileSync(path.join(dir,p.id+'.svg'),svg+'\n');}
console.log('Built accurate workflow artwork for '+Object.keys(examples).length+' API and MCP products.');
