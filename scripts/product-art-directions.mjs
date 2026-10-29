// Website-only editorial illustrations. These are not screenshots or product UI.
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = (x,y,s,size=22,color='#202836',extra='') => `<text x="${x}" y="${y}" fill="${color}" font-family="Arial,sans-serif" font-size="${size}" ${extra}>${esc(s)}</text>`;
const box = (x,y,w,h,fill,rx=16,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line = (x,y,x2,y2,color,width=3,extra='') => `<path d="M${x} ${y}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
function shell(name,bg,ink,category,body){return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img"><title>${esc(name)}: conceptual workflow illustration</title>${box(0,0,1200,675,bg,0)}${text(56,57,'HTF / '+category,14,ink,'letter-spacing="2"')}${body}${line(56,581,1144,581,ink,1,'opacity=".2"')}${text(56,625,'WORKFLOW ILLUSTRATION',12,ink,'letter-spacing="1.5"')}${text(1144,625,'Agentic Systems Studio | HTF',14,ink,'text-anchor="end"')}</svg>`;}
const headline=(a,b,ink)=>text(56,154,a,52,ink,'font-weight="700"')+text(56,217,b,52,ink,'font-weight="700"');
const paper=(x,y,label,fill,ink)=>box(x,y,216,266,fill,8)+text(x+24,y+45,label,16,ink,'font-weight="700"')+[86,116,146,176].map((v,i)=>line(x+24,y+v,x+175-i*15,y+v,ink,3,'opacity=".25"')).join('');
export const artDirections = {
 'pdf-toolkit':()=>shell('PDF Toolkit','#f9e9e1','#782d29','DOCUMENT WORKFLOWS',
  headline('Less document work.','More done.','#782d29')+text(56,278,'Merge / Split / Compress / Convert',24,'#93524a')+
  `<g transform="translate(692 111) rotate(-9 108 133)">${paper(0,0,'PDF / 01','#e49682','#782d29')}</g><g transform="translate(852 162) rotate(8 108 133)">${paper(0,0,'PDF / 02','#fffaf4','#782d29')}</g>`+
  box(56,367,518,145,'#782d29')+text(82,412,'ONE TOOLKIT',14,'#f9c4ae','letter-spacing="2"')+text(82,461,'Many document workflows.',28,'#fff8f1')),
 'eu-vat-validator':()=>shell('EU VAT Validator','#203fc8','#ffffff','EU VAT / VIES',
  headline('Check the number.','Keep the evidence.','#ffffff')+text(56,281,'Individual and bulk VAT checks',24,'#d7dfff')+
  Array.from({length:12},(_,i)=>{let a=i*Math.PI/6;return `<circle cx="${922+113*Math.cos(a)}" cy="${245+113*Math.sin(a)}" r="8" fill="#ffdf76"/>`;}).join('')+
  box(56,361,620,160,'#f7f8ff')+text(83,406,'VAT NUMBER → OFFICIAL VIES SERVICE',16,'#203fc8','letter-spacing="1"')+text(83,467,'Validation results, ready to keep.',28,'#17286f')+text(922,257,'EU',64,'#ffffff','text-anchor="middle" font-weight="700"')),
 'iban-validator':()=>shell('IBAN Validator','#102d2d','#e5faf1','BANK ACCOUNT DATA',
  headline('Every character','has a purpose.','#e5faf1')+text(56,280,'Structure / Checksum / SEPA',25,'#94d4bd')+
  box(637,113,506,319,'#b9efce',24)+text(675,165,'IBAN / FORMAT CHECK',17,'#153d35','letter-spacing="2"')+
  [0,1,2,3].map(i=>box(675+i*107,218,89,62,'#153d35',8)+text(719+i*107,258,['CC','00','BANK','…'][i],i===2?19:25,'#b9efce','text-anchor="middle"')).join('')+
  text(675,368,'Illustrated structure, no account data',17,'#285a47')+line(56,400,548,400,'#94d4bd',2)+text(56,459,'Validate locally.',31,'#e5faf1')+text(56,501,'No bank connection required.',22,'#94d4bd')),
 'sanctions-screening':()=>shell('Sanctions Screening','#f3e5c7','#553c22','SCREENING / HUMAN REVIEW',
  headline('Screen at scale.','Review with care.','#553c22')+text(56,280,'Bulk names. Candidate matches for review.',23,'#775b3d')+
  ['OFAC','EU','UK','UN'].map((s,i)=>box(690+(i%2)*221,111+Math.floor(i/2)*117,197,89,i%2?'#d8bd8c':'#fff8e9')+text(788+(i%2)*221,166+Math.floor(i/2)*117,s,29,'#553c22','text-anchor="middle" font-weight="700"')).join('')+
  line(785,334,785,386,'#9f773e')+line(1006,334,1006,386,'#9f773e')+box(690,388,418,124,'#553c22')+text(719,437,'MATCH CANDIDATES',15,'#e8c78e','letter-spacing="1.5"')+text(719,477,'A review, not a verdict.',27,'#fff8e9')+text(56,476,'Official lists. Clear evidence.',25,'#553c22')),
 'tech-stack-detector':()=>shell('Tech Stack Detector','#ebe8ff','#352270','WEBSITE INTELLIGENCE',
  headline('Look beneath','the homepage.','#352270')+text(56,282,'Discover the technologies behind a website.',23,'#62528e')+
  ['CMS','FRAMEWORKS','ANALYTICS'].map((s,i)=>box(694+i*28,127+i*111,351,96,['#c8bcf1','#9c83d9','#4f3388'][i],14)+text(724+i*28,186+i*111,s,24,i===2?'#ffffff':'#352270','font-weight="700"')).join('')+
  text(56,433,'Website URL',30,'#352270')+line(56,460,525,460,'#a394c5',2)+text(56,507,'Technology signals, structured.',26,'#62528e')),
 'llms-txt-checker':()=>shell('llms.txt Checker','#171d25','#e3efbd','AI READINESS / INSPECTION',
  headline('Can agents find','their way in?','#e3efbd')+text(56,284,'Inspect llms.txt and AI-readiness signals.',23,'#a9b8a0')+
  box(665,106,480,395,'#222d36',16)+text(698,150,'/ SITE INSPECTION',17,'#a5ba8c','letter-spacing="2"')+line(695,177,1114,177,'#4a5d59',1)+
  ['01 / llms.txt','02 / crawler access','03 / sitemap','04 / review findings'].map((s,i)=>text(699,230+i*66,s,23,i===3?'#e3efbd':'#c1d2c5')).join('')+
  text(56,462,'A clearer starting point',27,'#e3efbd')+text(56,504,'for your next fix.',27,'#a9b8a0')),
 'email-domain-checker':()=>shell('Email Domain Checker','#e2effa','#174b70','EMAIL AUTHENTICATION',
  headline('Before you send,','check the signals.','#174b70')+text(56,281,'DNS-based email and domain checks.',24,'#48758f')+
  box(710,139,379,243,'#174b70',20)+`<path d="M728 162L900 282L1070 162M728 356L842 266M1070 356L955 266" fill="none" stroke="#a9d9f0" stroke-width="5"/>`+
  ['MX','SPF','DKIM','DMARC'].map((s,i)=>box(56+i*139,390,123,86,i%2?'#bdd7ed':'#ffffff',12)+text(117+i*139,443,s,21,'#174b70','text-anchor="middle" font-weight="700"')).join('')+text(718,454,'Read the records.',27,'#174b70')+text(718,495,'Understand the setup.',23,'#48758f')),
 'domain-health-audit':()=>shell('Domain Health Audit','#fcebe7','#703e43','DOMAIN INFRASTRUCTURE',
  headline('One domain.','A fuller picture.','#703e43')+text(56,281,'DNS / SSL / WHOIS / Email authentication',22,'#9c6564')+
  `<circle cx="904" cy="291" r="171" fill="#f3c6bc"/><circle cx="904" cy="291" r="119" fill="#fff7f1"/><path d="M757 292H810L840 240L887 346L927 275L956 292H1053" fill="none" stroke="#a85159" stroke-width="6" stroke-linejoin="round"/>`+
  box(56,387,532,124,'#703e43')+text(83,431,'FINDINGS → RECORDS TO REVIEW',15,'#f2c3ba','letter-spacing="1"')+text(83,475,'From diagnosis to next steps.',27,'#fff8f4')),
 'bankofamerica-jobs-api':()=>shell('Bank of America Jobs API','#182740','#f0e9d9','PUBLISHED VACANCIES / DATA',
  headline('Open roles.','Structured for work.','#f0e9d9')+text(56,280,'Bank of America published vacancies',24,'#afbcd1')+
  box(665,116,480,388,'#f0e9d9',12)+text(696,161,'HIRING FEED / ILLUSTRATION',15,'#43536c','letter-spacing="1"')+
  ['Role title','Location','Job URL','Changes between runs'].map((s,i)=>line(694,189+i*70,1116,189+i*70,'#ccd0cf',1)+text(696,230+i*70,s,24,'#243551')).join('')+
  box(56,402,165,70,'#b8c9df',10)+text(139,446,'JSON',25,'#182740','text-anchor="middle"')+box(238,402,165,70,'#425d80',10)+text(320,446,'CSV',25,'#ffffff','text-anchor="middle"')),
 'workday-jobs-api':()=>shell('Workday Jobs API','#dff3ed','#164e43','CAREERS SITES / STRUCTURED FEEDS',
  text(56,151,'One careers URL.',54,'#164e43','font-weight="700"')+text(56,216,'A reusable jobs feed.',54,'#164e43','font-weight="700"')+text(56,280,'For Workday-hosted careers sites.',25,'#4d796d')+
  [0,1,2].map(i=>box(56+i*372,361,340,162,['#ffffff','#b4dbce','#164e43'][i],16)+text(82+i*372,405,['01 / SOURCE','02 / STRUCTURE','03 / DELIVER'][i],15,i===2?'#bce4d6':'#4d796d','letter-spacing="1.5"')+text(82+i*372,466,['Careers URL','Job records','JSON / CSV'][i],30,i===2?'#ffffff':'#164e43')).join(''))
};
