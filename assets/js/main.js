// Howth Technology Factory — minimal vanilla JS. No framework, no build step.
document.addEventListener('DOMContentLoaded', () => {
    const sendEvent = (name, params = {}) => {
        if (typeof window.gtag === 'function') {
            window.gtag('event', name, params);
        }
    };

    const classifyDestination = (url) => {
        if (url.hostname === 'apify.com') return 'apify';
        if (url.hostname === 'mcpize.com') return 'mcpize';
        if (url.hostname === 'youtube.com' || url.hostname === 'youtu.be') return 'youtube';
        return null;
    };

    // Delegated measurement keeps new Insights and product pages covered without
    // page-specific event handlers. Parameters intentionally avoid personal data.
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link) return;

        let url;
        try {
            url = new URL(link.href, window.location.href);
        } catch {
            return;
        }

        const destination = classifyDestination(url);
        const common = {
            link_url: url.href,
            link_text: (link.textContent || '').trim().slice(0, 100),
            page_path: window.location.pathname,
            campaign_id: link.dataset.campaignId || undefined,
            content_id: link.dataset.contentId || undefined,
        };

        if (destination === 'apify') sendEvent('apify_outbound_click', common);
        if (destination === 'mcpize') sendEvent('mcpize_outbound_click', common);
        if (destination === 'youtube') sendEvent('youtube_outbound_click', common);

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
