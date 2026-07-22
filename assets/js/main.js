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

    // Contact form: FormSubmit.co redirects back here with ?sent=true - show inline thanks state.
    const params = new URLSearchParams(window.location.search);
    const successEl = document.querySelector('[data-form-success]');
    const formEl = document.querySelector('[data-contact-form]');
    if (params.get('sent') === 'true' && successEl && formEl) {
        formEl.classList.add('hidden');
        successEl.classList.remove('hidden');
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Footer year stamp
    document.querySelectorAll('[data-year]').forEach((el) => {
        el.textContent = String(new Date().getFullYear());
    });
});
