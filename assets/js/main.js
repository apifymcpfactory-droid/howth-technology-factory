// Howth Technology Factory — minimal vanilla JS. No framework, no build step.
document.addEventListener('DOMContentLoaded', () => {
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
