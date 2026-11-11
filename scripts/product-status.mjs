export const releaseLabels = Object.freeze({
    in_development: 'Coming Soon - in development',
    developed_not_submitted: 'Developed but not submitted',
    submitted_for_review: 'Developed and in Review',
    live: 'Available for Purchase',
});

export function releaseLabel(product) {
    const label = releaseLabels[product.release_status];
    if (!label) throw new Error(`${product.id}: unknown release status ${product.release_status}`);
    return label;
}

export function renderReleaseStatus(product) {
    return `<p class="product-release-status status-${product.release_status}" data-release-status="${product.release_status}">${releaseLabel(product)}</p>`;
}
