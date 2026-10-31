const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validateFeatured(config,catalogue){
  const products=config.products;
  if(!Array.isArray(products)||products.length<1||products.length>50)throw Error('Choose between 1 and 50 featured products.');
  if(new Set(products.map(p=>p.id)).size!==products.length)throw Error('Featured products must be unique.');
  for(const p of products){
    if(!catalogue.products.some(c=>c.id===p.id))throw Error('Unknown featured product: '+p.id);
    for(const field of ['label','platform','intro','priceLead','priceDetail','image','imageAlt','caption','demo'])if(typeof p[field]!=='string'||!p[field].trim())throw Error(p.id+': missing '+field);
    if(!Array.isArray(p.heading)||!p.heading.length||p.heading.some(h=>typeof h!=='string'))throw Error(p.id+': heading required');
    if(!p.image.startsWith('/assets/')||!p.demo.startsWith('/products/demos/'))throw Error(p.id+': use local images and demos');
    if(p.marketplace&&!p.marketplace.url.startsWith('https://'))throw Error(p.id+': marketplace must use HTTPS');
    if(!Array.isArray(p.facts)||p.facts.length>5)throw Error(p.id+': use up to five product facts');
  }
  return products;
}
export function renderFeatured(config,catalogue,compact=false){
  const products=validateFeatured(config,catalogue),prefix=compact?'catalogue-feature':'home-feature';
  const slides=products.map((p,i)=>{
    const product=catalogue.products.find(c=>c.id===p.id),name=product.name,path='/products/'+p.id+'.html';
    const marketplaceLabel=product.release_status==='live'&&p.marketplace?.url.startsWith('https://www.figma.com/')?'Buy on Figma':p.marketplace?.label;
    const actions=`<div class="spotlight-actions"><a class="spotlight-button" data-product-demo="${escape(p.id)}" href="${escape(p.demo)}">${escape(p.demoLabel||'Try the interactive demo')} <span aria-hidden="true">&nbsp;↗</span></a>${p.marketplace?`<a class="spotlight-button secondary" href="${escape(p.marketplace.url)}" target="_blank" rel="noopener noreferrer">${escape(marketplaceLabel)} <span aria-hidden="true">&nbsp;↗</span></a>`:`<a class="spotlight-button secondary" href="${path}">Explore the product <span aria-hidden="true">&nbsp;↗</span></a>`}</div>`;
    const links=`<div class="spotlight-links"><a class="spotlight-link" href="${path}">Product details</a><a class="spotlight-link" href="${path}#privacy">Privacy &amp; data</a><a class="spotlight-link" href="${path}#support">Support</a></div>`;
    const figure=`<a class="spotlight-art" href="${path}" aria-label="Explore ${escape(name)}"><img src="${escape(p.image)}" width="1920" height="1080" ${i?'loading="lazy"':'fetchpriority="high"'} alt="${escape(p.imageAlt)}"></a>`;
    const heading=p.heading.map((line,j)=>(j===p.emphasisFrom?'<span>':'')+escape(line)+(j===p.heading.length-1&&j>=p.emphasisFrom?'</span>':'')+(j<p.heading.length-1?'<br>':'')).join('');
    return `<div id="${prefix}-slide-${i}" data-featured-slide data-product="${escape(p.id)}" role="group" aria-roledescription="slide" aria-label="${escape(name)}" ${i?'hidden':''}><div class="${compact?'catalogue-feature':'product-spotlight'}"><div class="spotlight-copy"><p class="spotlight-kicker">Featured product / ${escape(p.platform)}</p>${compact?`<h2>${escape(name)}</h2>`:`<p class="spotlight-name">${escape(name)}</p><${i?'h2':'h1'}>${heading}</${i?'h2':'h1'}>`}<p class="spotlight-intro">${escape(p.intro)}</p><p class="spotlight-price"><strong>${escape(p.priceLead)}</strong> ${escape(p.priceDetail)}</p>${actions}${links}${compact?'':`<div class="spotlight-facts">${p.facts.map(f=>`<span>${escape(f)}</span>`).join('')}</div>`}</div>${compact?figure:`<figure>${figure}<figcaption class="spotlight-caption">${escape(p.caption)}</figcaption></figure>`}</div></div>`;
  }).join('\n');
  return `<!-- BEGIN featured products -->\n<section class="featured-carousel${compact?' featured-carousel--compact':''}" data-featured-carousel role="region" aria-roledescription="carousel" aria-label="New products from Agentic Systems Studio | HTF">${slides}<div class="featured-carousel__controls" data-featured-controls hidden><div class="featured-carousel__arrows"><button type="button" data-featured-previous aria-label="Previous featured product">←</button><span data-featured-count aria-hidden="true">1 / ${products.length}</span><button type="button" data-featured-next aria-label="Next featured product">→</button><button type="button" class="featured-carousel__pause" data-featured-toggle aria-label="Pause product rotation" aria-pressed="false">Ⅱ</button></div><a class="featured-carousel__all" href="/products/">All products ↗</a></div><p class="sr-only" data-featured-announcement aria-live="polite" aria-atomic="true"></p></section>\n<!-- END featured products -->`;
}
