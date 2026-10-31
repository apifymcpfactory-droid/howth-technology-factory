'use strict';
(() => {
  const byId = id => document.getElementById(id);
  let step = 0;
  const nextNames = ['Keep checks in step →', 'Read the evidence →', 'Back to the start ↺'];
  function showStep(index, focus = true) {
    step = index;
    document.querySelectorAll('[data-step]').forEach(button => {
      if (Number(button.dataset.step) === step) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    for (let i = 0; i < 3; i++) byId(`step-${i}`).hidden = i !== step;
    byId('previous').disabled = step === 0;
    byId('next').textContent = nextNames[step];
    byId('step-count').textContent = `Step ${step + 1} of 3`;
    if (focus) byId(`title-${step}`).focus({preventScroll:false});
  }
  document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => showStep(Number(button.dataset.step))));
  byId('previous').addEventListener('click', () => showStep(Math.max(0, step - 1)));
  byId('next').addEventListener('click', () => showStep((step + 1) % 3));
  const text = (tag, value, className) => { const node = document.createElement(tag); node.textContent = value; if (className) node.className = className; return node; };
  const json = value => JSON.stringify(value, null, 2);
  async function load(name) { const response = await fetch(`samples/${name}.json`); if (!response.ok) throw new Error('Sample unavailable'); return response.json(); }
  Promise.all(['contract-changes','contract-after','checks-generated','checks-authored','checks-synced','saved-run-excerpt'].map(load)).then(([changes, contract, generated, authored, synced, evidence]) => {
    function renderChanges() {
      const filter = byId('change-filter').value;
      const shown = changes.filter(change => filter === 'all' || change.severity === filter);
      const list = byId('findings'); list.replaceChildren();
      shown.forEach(change => {
        const card = text('article', '', 'finding');
        card.append(text('span', change.severity === 'BREAKING' ? 'Breaking change' : 'Needs review', 'tag'));
        const body = document.createElement('div'); body.append(text('h3', change.description), text('p', `${change.operation} · ${change.location}`)); card.append(body); list.append(card);
      });
      if (!shown.length) list.append(text('p', 'No findings in this category for these sample contracts. This is not a compatibility certification.', 'empty'));
      byId('finding-count').textContent = `${shown.length} of ${changes.length} recorded findings shown. No API requests were sent.`;
    }
    byId('change-filter').addEventListener('change', renderChanges); renderChanges();
    byId('contract-preview').textContent = json(contract);
    const stages = {generated, authored, synced};
    function renderChecks() {
      const stage = byId('suite-stage').value, suite = stages[stage];
      const row = suite.find(item => item.contractOperation === 'GET /health');
      const own = row.generatedJsonChecks || [];
      const rows = row.jsonChecks.map(check => ({check, origin:own.some(base => json(base) === json(check)) ? 'generated' : 'authored'}));
      const filter = byId('check-filter').value;
      const shown = rows.filter(item => filter === 'all' || item.origin === filter);
      const table = byId('checks'); table.replaceChildren();
      shown.forEach(({check, origin}) => {
        const tr = document.createElement('tr');
        tr.append(text('td', check.pointer || '(whole response)'), text('td', check.rule), text('td', 'expected' in check ? JSON.stringify(check.expected) : 'Present'));
        const td = document.createElement('td'); td.append(text('span', origin === 'generated' ? 'Generated' : 'Authored', `origin ${origin}`)); tr.append(td); table.append(tr);
      });
      if (!shown.length) { const tr = document.createElement('tr'), td = text('td', 'No authored checks in the generated draft. Choose a later saved stage to see the custom check.'); td.colSpan = 4; tr.append(td); table.append(tr); }
      byId('check-count').textContent = `${shown.length} of ${rows.length} saved checks shown · ${stage === 'synced' ? 'Contract sync output; review required' : stage === 'authored' ? 'Authored stage before sync' : 'Generated draft; disabled until review'}.`;
      const preserved = Boolean(row.headers?.['X-Authored']) && row['x-authored']?.keep === true && row.scripts.length > 0;
      byId('retained-copy').textContent = preserved ? 'The saved file also retains the authored header, script and extra metadata. The custom healthy = true check remains alongside the generated rules. Scripts are displayed as source data here and never executed.' : 'This generated draft has no custom additions yet. Choose “With authored checks” or “After contract sync” to inspect the saved additions and their preservation.';
      byId('suite-preview').textContent = json(suite);
    }
    byId('suite-stage').addEventListener('change', renderChecks); byId('check-filter').addEventListener('change', renderChecks); renderChecks();
    const result = evidence.results.find(row => row.outcome !== 'SKIPPED');
    if (!result) throw new Error('Recorded result missing');
    byId('result-outcome').textContent = result.outcome;
    byId('result-status').textContent = `HTTP ${result.status}`;
    const passed = result.assertions.filter(value => value === true).length;
    byId('assertion-summary').textContent = `${passed} of ${result.assertions.length} recorded assertions passed.`;
    result.assertions.forEach(value => byId('assertion-marks').append(text('span', value === true ? '✓' : '×')));
    const skipped = evidence.results.filter(row => row.outcome === 'SKIPPED').length;
    byId('skipped-summary').textContent = `${skipped} other case was skipped in the recorded suite. Skipped is not counted as passed.`;
    byId('evidence-preview').textContent = json(evidence);
    byId('load-status').textContent = '';
  }).catch(() => {
    byId('load-status').textContent = 'The saved sample files could not be loaded. Reload the page or download the sample files above. No results have been generated.';
  });
})();
