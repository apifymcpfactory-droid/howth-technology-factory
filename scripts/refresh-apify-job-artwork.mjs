import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'assets', 'previews', 'tools');

const products = [
  ['accenture-jobs-api', 'Accenture Jobs API + Report', 'Accenture published vacancies', 'Role title', 'Location', 'Job URL', 'Report summary'],
  ['dropbox-jobs-api', 'Dropbox Jobs API + Report', 'Dropbox published vacancies', 'Role title', 'Team', 'Location', 'Job URL'],
  ['jobs-api-all-sources', 'Jobs API: All Sources', 'Published vacancies across sources', 'Source', 'Role title', 'Location', 'Job URL'],
  ['taketwo-jobs-api', 'Take-Two Jobs API + Report', 'Take-Two published vacancies', 'Role title', 'Studio', 'Location', 'Job URL'],
  ['teleperformancebenelux-jobs-api', 'Teleperformance Benelux', 'Benelux published vacancies', 'Role title', 'Country', 'Location', 'Job URL'],
  ['tripadvisor-jobs-api', 'Tripadvisor Jobs API', 'Tripadvisor published vacancies', 'Role title', 'Team', 'Location', 'Job URL'],
  ['twilio-jobs-api', 'Twilio Jobs API + Report', 'Twilio published vacancies', 'Role title', 'Team', 'Location', 'Job URL'],
  ['ups-jobs-api', 'UPS Jobs API + Report', 'UPS published vacancies', 'Role title', 'Job family', 'Location', 'Job URL'],
  ['walmart-jobs-api', 'Walmart Jobs API + Report', 'Walmart published vacancies', 'Role title', 'Area', 'Location', 'Job URL'],
  ['wellsfargo-jobs-api', 'Wells Fargo Jobs API', 'Wells Fargo published vacancies', 'Role title', 'Job family', 'Location', 'Job URL'],
  ['wise-jobs-api', 'Wise Jobs API + Report', 'Wise published vacancies', 'Role title', 'Team', 'Location', 'Job URL'],
];

const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function jobArtwork(name, source, fields) {
  const rows = fields.map((field, i) => {
    const y = 230 + i * 70;
    return `<text x="696" y="${y}" fill="#171717" font-family="Arial,sans-serif" font-size="24">${esc(field)}</text><path d="M694 ${y + 29}H1116" fill="none" stroke="#d4d4d4"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img"><title>${esc(name)}: conceptual workflow illustration</title><rect width="1200" height="675" fill="#0a0a0a"/><text x="56" y="57" fill="#ffffff" font-family="Arial,sans-serif" font-size="14" letter-spacing="2">HTF / PUBLISHED VACANCIES / DATA</text><text x="56" y="154" fill="#ffffff" font-family="Arial,sans-serif" font-size="52" font-weight="700">Open roles.</text><text x="56" y="217" fill="#ffffff" font-family="Arial,sans-serif" font-size="52" font-weight="700">Ready to use.</text><text x="56" y="280" fill="#bdbdbd" font-family="Arial,sans-serif" font-size="24">${esc(source)}</text><rect x="665" y="116" width="480" height="388" rx="12" fill="#ffffff"/><text x="696" y="161" fill="#525252" font-family="Arial,sans-serif" font-size="15" letter-spacing="1">HIRING FEED / ILLUSTRATION</text><path d="M694 189H1116" fill="none" stroke="#a3a3a3"/>${rows}<rect x="56" y="402" width="165" height="70" rx="10" fill="#ffffff"/><text x="139" y="446" fill="#0a0a0a" font-family="Arial,sans-serif" font-size="25" text-anchor="middle">JSON</text><rect x="238" y="402" width="165" height="70" rx="10" fill="#404040"/><text x="320" y="446" fill="#ffffff" font-family="Arial,sans-serif" font-size="25" text-anchor="middle">CSV</text><path d="M56 581H1144" fill="none" stroke="#ffffff" opacity=".25"/><text x="56" y="625" fill="#ffffff" font-family="Arial,sans-serif" font-size="12" letter-spacing="1.5">WORKFLOW ILLUSTRATION</text><text x="1144" y="625" fill="#ffffff" font-family="Arial,sans-serif" font-size="14" text-anchor="end">HTF</text></svg>`;
}

for (const [id, name, source, ...fields] of products) {
  fs.writeFileSync(path.join(output, `${id}.svg`), jobArtwork(name, source, fields));
}

const portfolio = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img"><title>HTF jobs data portfolio: conceptual workflow illustration</title><rect width="1200" height="675" fill="#0a0a0a"/><text x="56" y="57" fill="#fff" font-family="Arial,sans-serif" font-size="14" letter-spacing="2">HTF / APIFY JOBS PORTFOLIO</text><text x="56" y="154" fill="#fff" font-family="Arial,sans-serif" font-size="52" font-weight="700">Published roles.</text><text x="56" y="217" fill="#fff" font-family="Arial,sans-serif" font-size="52" font-weight="700">Consistent outputs.</text><text x="56" y="280" fill="#bdbdbd" font-family="Arial,sans-serif" font-size="24">Website inventory of developed jobs APIs</text><g transform="translate(665 116)"><rect width="480" height="388" rx="12" fill="#fff"/><text x="31" y="48" fill="#525252" font-family="Arial,sans-serif" font-size="15" letter-spacing="1">PORTFOLIO / ILLUSTRATION</text><g fill="#0a0a0a" font-family="Arial,sans-serif" font-size="22"><text x="31" y="112">Source coverage</text><text x="31" y="178">Structured fields</text><text x="31" y="244">Change monitoring</text><text x="31" y="310">JSON and CSV delivery</text></g><g stroke="#d4d4d4"><path d="M31 137H449"/><path d="M31 203H449"/><path d="M31 269H449"/></g></g><path d="M56 581H1144" stroke="#fff" opacity=".25"/><text x="56" y="625" fill="#fff" font-family="Arial,sans-serif" font-size="12" letter-spacing="1.5">WORKFLOW ILLUSTRATION</text><text x="1144" y="625" fill="#fff" font-family="Arial,sans-serif" font-size="14" text-anchor="end">HTF</text></svg>`;
fs.writeFileSync(path.join(output, 'apify-jobs-development.svg'), portfolio);

const filings = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img"><title>SEC EDGAR API: conceptual workflow illustration</title><rect width="1200" height="675" fill="#0a0a0a"/><text x="56" y="57" fill="#fff" font-family="Arial,sans-serif" font-size="14" letter-spacing="2">HTF / SEC EDGAR / DATA</text><text x="56" y="154" fill="#fff" font-family="Arial,sans-serif" font-size="52" font-weight="700">Company filings.</text><text x="56" y="217" fill="#fff" font-family="Arial,sans-serif" font-size="52" font-weight="700">Clearer signals.</text><text x="56" y="280" fill="#bdbdbd" font-family="Arial,sans-serif" font-size="24">Public SEC filing data</text><rect x="665" y="116" width="480" height="388" rx="12" fill="#fff"/><text x="696" y="161" fill="#525252" font-family="Arial,sans-serif" font-size="15" letter-spacing="1">FILINGS FEED / ILLUSTRATION</text><g fill="#171717" font-family="Arial,sans-serif" font-size="24"><text x="696" y="230">Company and CIK</text><text x="696" y="300">Filing form and date</text><text x="696" y="370">Financial facts</text><text x="696" y="440">Source document URL</text></g><g stroke="#d4d4d4"><path d="M694 259H1116"/><path d="M694 329H1116"/><path d="M694 399H1116"/></g><rect x="56" y="402" width="165" height="70" rx="10" fill="#fff"/><text x="139" y="446" fill="#0a0a0a" font-family="Arial,sans-serif" font-size="25" text-anchor="middle">JSON</text><rect x="238" y="402" width="165" height="70" rx="10" fill="#404040"/><text x="320" y="446" fill="#fff" font-family="Arial,sans-serif" font-size="25" text-anchor="middle">CSV</text><path d="M56 581H1144" stroke="#fff" opacity=".25"/><text x="56" y="625" fill="#fff" font-family="Arial,sans-serif" font-size="12" letter-spacing="1.5">WORKFLOW ILLUSTRATION</text><text x="1144" y="625" fill="#fff" font-family="Arial,sans-serif" font-size="14" text-anchor="end">HTF</text></svg>`;
fs.writeFileSync(path.join(output, 'sec-edgar-api.svg'), filings);

console.log(`Updated ${products.length + 2} Apify website illustrations.`);
