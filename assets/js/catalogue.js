(() => {
    'use strict';

    const root = document.querySelector('[data-catalogue]');
    if (!root) return;

    const cards = [...root.querySelectorAll('[data-product-card]')];
    const search = root.querySelector('[data-catalogue-search]');
    const count = root.querySelector('[data-result-count]');
    const empty = root.querySelector('[data-empty-state]');
    const reset = root.querySelector('[data-reset-filters]');
    const checks = [...root.querySelectorAll('input[data-facet]')];
    const quickFilters = [...root.querySelectorAll('[data-quick-problem]')];

    const normalize = (value) => String(value || '').toLocaleLowerCase().trim();
    const selectedByFacet = () => checks.reduce((selected, input) => {
        if (input.checked) (selected[input.dataset.facet] ||= []).push(input.value);
        return selected;
    }, {});

    const applyFilters = () => {
        const query = normalize(search.value);
        const selected = selectedByFacet();
        let visible = 0;

        for (const card of cards) {
            const searchMatch = !query || normalize(card.dataset.search).includes(query);
            const facetMatch = Object.entries(selected).every(([facet, values]) => {
                const cardValues = (card.dataset[facet] || '').split(/\s+/).filter(Boolean);
                return values.some((value) => cardValues.includes(value));
            });
            card.hidden = !(searchMatch && facetMatch);
            if (!card.hidden) visible += 1;
        }

        count.textContent = `${visible} ${visible === 1 ? 'tool' : 'tools'}`;
        empty.hidden = visible !== 0;
        for (const button of quickFilters) {
            const input = checks.find((candidate) =>
                candidate.dataset.facet === 'problems' && candidate.value === button.dataset.quickProblem
            );
            button.setAttribute('aria-pressed', String(Boolean(input?.checked)));
        }
    };

    root.addEventListener('input', applyFilters);
    root.addEventListener('change', applyFilters);
    for (const button of quickFilters) {
        button.addEventListener('click', () => {
            const input = checks.find((candidate) =>
                candidate.dataset.facet === 'problems' && candidate.value === button.dataset.quickProblem
            );
            if (input) input.checked = !input.checked;
            applyFilters();
        });
    }
    reset.addEventListener('click', () => {
        search.value = '';
        for (const input of checks) input.checked = false;
        applyFilters();
        search.focus();
    });

    applyFilters();
})();
