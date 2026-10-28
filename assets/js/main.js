// Howth Technology Factory — minimal vanilla JS. No framework, no build step.
document.addEventListener('DOMContentLoaded', () => {
    const ATTRIBUTION_KEYS = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'htf_product',
        'htf_campaign',
        'htf_platform',
        'htf_post',
    ];
    const ATTRIBUTION_STORE = 'htf_campaign_attribution';

    const sendEvent = (name, params = {}) => {
        if (typeof window.gtag === 'function') {
            window.gtag('event', name, params);
        }
    };

    const readAttribution = () => {
        const current = new URLSearchParams(window.location.search);
        let stored = {};
        try {
            stored = JSON.parse(window.sessionStorage.getItem(ATTRIBUTION_STORE) || '{}');
        } catch {
            stored = {};
        }

        const attribution = {};
        for (const key of ATTRIBUTION_KEYS) {
            const value = current.get(key) || stored[key];
            if (value) attribution[key] = value.slice(0, 100);
        }
        if (Object.keys(attribution).length) {
            try {
                window.sessionStorage.setItem(ATTRIBUTION_STORE, JSON.stringify(attribution));
            } catch {
                // Tracking must never block navigation when storage is unavailable.
            }
        }
        return attribution;
    };

    const attribution = readAttribution();
    const eventAttribution = {
        product_id: attribution.htf_product,
        campaign_id: attribution.htf_campaign || attribution.utm_campaign,
        platform_id: attribution.htf_platform || attribution.utm_source,
        platform: attribution.htf_platform || attribution.utm_source,
        post_id: attribution.htf_post || attribution.utm_content,
        utm_source: attribution.utm_source,
        utm_medium: attribution.utm_medium,
        utm_campaign: attribution.utm_campaign,
        utm_content: attribution.utm_content,
    };

    const appendAttribution = (url) => {
        for (const [key, value] of Object.entries(attribution)) {
            if (!url.searchParams.has(key)) url.searchParams.set(key, value);
        }
        return url;
    };

    // Preserve the originating campaign and post through owned-site navigation.
    if (Object.keys(attribution).length) {
        document.querySelectorAll('a[href]').forEach((link) => {
            let url;
            try {
                url = new URL(link.href, window.location.href);
            } catch {
                return;
            }
            if (url.origin === window.location.origin && /^https?:$/.test(url.protocol)) {
                link.href = appendAttribution(url).href;
            }
        });
    }

    const pageParameters = {
        ...eventAttribution,
        page_path: window.location.pathname,
        page_location: window.location.href,
    };
    if (/^\/insights\/[^/]+\.html$/.test(window.location.pathname)) {
        sendEvent('insight_view', pageParameters);
    }
    if (/^\/products\/[^/]+\.html$/.test(window.location.pathname)) {
        sendEvent('product_view', pageParameters);
    }

    // Delegated measurement keeps future shopfronts covered when their product
    // links declare data-shopfront="<stable-name>". No hostname allow-list is used.
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link) return;

        let url;
        try {
            url = new URL(link.href, window.location.href);
        } catch {
            return;
        }

        const common = {
            ...eventAttribution,
            link_url: appendAttribution(url).href,
            link_text: (link.textContent || '').trim().slice(0, 100),
            page_path: window.location.pathname,
            campaign_id: link.dataset.campaignId || eventAttribution.campaign_id,
            post_id: link.dataset.postId || link.dataset.contentId || eventAttribution.post_id,
        };

        const shopfront = link.dataset.shopfront?.trim().toLowerCase();
        if (link.dataset.productDemo && url.origin === window.location.origin && url.pathname.startsWith('/products/demos/')) {
            sendEvent('product_demo_click', {
                ...common,
                product_id: link.dataset.productDemo,
                demo_path: url.pathname,
            });
        }
        if (shopfront && url.origin !== window.location.origin) {
            const safeShopfront = shopfront.replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 25);
            const shopfrontParameters = { ...common, shopfront_id: shopfront };
            sendEvent('shopfront_outbound_click', shopfrontParameters);
            if (safeShopfront) sendEvent(`${safeShopfront}_outbound_click`, shopfrontParameters);
            link.href = common.link_url;
        }

        // Review destinations are evidence links, not campaign landing pages.
        // Measure the click with the active attribution, but leave the verified
        // third-party URL byte-for-byte unchanged.
        const reviewSource = link.dataset.reviewSource?.trim().toLowerCase();
        if (reviewSource && url.origin !== window.location.origin) {
            sendEvent('review_source_click', {
                ...common,
                product_id: link.dataset.productId || eventAttribution.product_id,
                review_source: reviewSource,
                destination_url: link.href,
                platform: eventAttribution.platform,
            });
        }

        if (
            window.location.pathname.startsWith('/insights/') &&
            url.origin === window.location.origin &&
            url.pathname.startsWith('/products/')
        ) {
            sendEvent('insight_to_product_click', common);
        }
    });

    // Icons (Lucide CDN)
    if (window.lucide) window.lucide.createIcons();

    // Scroll-reveal (AOS CDN)
    if (window.AOS) {
        window.AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });
    }

    // Mobile nav toggle
    const navToggle = document.querySelector('[data-nav-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');
    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', () => {
            const isOpen = mobileNav.classList.toggle('flex');
            mobileNav.classList.toggle('hidden', !isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
        mobileNav.querySelectorAll('a').forEach((link) =>
            link.addEventListener('click', () => {
                mobileNav.classList.add('hidden');
                mobileNav.classList.remove('flex');
                navToggle.setAttribute('aria-expanded', 'false');
            }),
        );
    }

    // Sticky header shadow/opacity once page scrolls
    const header = document.querySelector('[data-site-header]');
    if (header) {
        const onScroll = () => header.classList.toggle('shadow-lg', window.scrollY > 8);
        document.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // Contact form: submitted via FormSubmit's AJAX endpoint so the visitor
    // never leaves the site - no redirect, no losing the page. Falls back to
    // a normal (new-tab) submit if fetch is unavailable or the request fails.
    const formEl = document.querySelector('[data-contact-form]');
    const successEl = document.querySelector('[data-form-success]');
    const errorEl = document.querySelector('[data-form-error]');
    const submitBtn = formEl?.querySelector('[data-submit-btn]');
    const submitLabel = formEl?.querySelector('[data-submit-label]');

    if (formEl && successEl && window.fetch) {
        formEl.addEventListener('submit', async (event) => {
            event.preventDefault();
            errorEl?.classList.add('hidden');
            if (submitBtn) submitBtn.disabled = true;
            if (submitLabel) submitLabel.textContent = 'Sending…';

            try {
                const response = await fetch(formEl.action, {
                    method: 'POST',
                    headers: { Accept: 'application/json' },
                    body: new FormData(formEl),
                });
                if (!response.ok) throw new Error(`Request failed: ${response.status}`);

                sendEvent('contact_submit', {
                    form_id: formEl.id || 'contact',
                    page_path: window.location.pathname,
                });
                formEl.classList.add('hidden');
                successEl.classList.remove('hidden');
                successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (err) {
                errorEl?.classList.remove('hidden');
                if (submitBtn) submitBtn.disabled = false;
                if (submitLabel) submitLabel.textContent = 'Send message';
            }
        });
    }

    // Footer year stamp
    document.querySelectorAll('[data-year]').forEach((el) => {
        el.textContent = String(new Date().getFullYear());
    });
});
