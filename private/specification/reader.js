'use strict';
(() => {
  const get = id => document.getElementById(id);
  const allowed = new Set(['p','h3','h4','h5','h6','ul','ol','li','strong','em','a','code','pre','blockquote','br','hr','dl','dt','dd','del','sup','sub']);
  const decode = value => Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), char => char.charCodeAt(0));
  let pages;

  function renderNode(node) {
    if (typeof node === 'string') return document.createTextNode(node);
    if (!allowed.has(node.tag)) throw new Error('Unsupported content');
    const element = document.createElement(node.tag);
    if (node.tag === 'dl') element.className = 'record';
    if (node.tag === 'a') {
      const url = new URL(node.href);
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid source link');
      element.href = url.href;
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
    }
    element.append(...(node.children || []).map(renderNode));
    return element;
  }

  function showPage() {
    const index = Number(new URLSearchParams(location.search).get('section'));
    const selected = Number.isInteger(index) && pages[index] ? index : 0;
    const page = pages[selected];
    const title = document.createElement('h2');
    title.id = 'section-title';
    title.textContent = page.title;
    get('content').replaceChildren(title, ...page.body.map(renderNode));
    get('section').value = String(selected);
    const headings = [...get('content').querySelectorAll('h3,h4')];
    const options = headings.map((heading, i) => {
      heading.id = 'topic-' + i;
      heading.tabIndex = -1;
      return new Option(heading.textContent, heading.id);
    });
    get('topic').replaceChildren(new Option('Choose a topic', ''), ...options);
    get('topics').hidden = headings.length < 3;
  }

  async function open() {
    const value = new URLSearchParams(location.hash.slice(1)).get('k');
    if (!value || !/^[A-Za-z0-9_-]{43}$/.test(value)) return;
    const key = await crypto.subtle.importKey('raw', decode(value), 'AES-GCM', false, ['decrypt']);
    const response = await fetch('document.enc.json', {cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer'});
    if (!response.ok) throw new Error('Document unavailable');
    const box = await response.json();
    if (box.v !== 1) throw new Error('Unknown format');
    const bytes = await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(box.iv),additionalData:new TextEncoder().encode('HTF-private-specification-v1')},key,decode(box.data));
    const spec = JSON.parse(new TextDecoder().decode(bytes));
    if (spec.schema !== 1 || !Array.isArray(spec.pages) || !spec.pages.length) throw new Error('Invalid document');
    pages = spec.pages;
    get('title').textContent = spec.title;
    get('lead').textContent = spec.lead;
    get('edition').textContent = spec.edition;
    get('back').href = '../worklist/' + location.hash;
    document.title = spec.title + ' | HTF';
    for (const [index, page] of pages.entries()) get('section').add(new Option(page.title, String(index)));
    get('topic').addEventListener('change', () => {
      const target = get(get('topic').value);
      if (target) target.focus();
    });
    get('section').addEventListener('change', () => {
      const url = new URL(location.href);
      url.searchParams.set('section', get('section').value);
      history.pushState(null, '', url);
      showPage();
    });
    window.addEventListener('popstate', showPage);
    showPage();
    get('locked').hidden = true;
    get('document').hidden = false;
  }
  open().catch(() => {
    get('locked').querySelector('p').textContent = 'The document could not be opened. Use the link in your unlocked private checklist and try again.';
  });
})();
