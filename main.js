(function () {
    'use strict';

    // PRELOADER lifecycle (fade-in, slot-machine reveal, fade-out) is handled
    // by preloader.js, which also removes body.is-loading when it finishes.

    const nav = document.getElementById('mainNav');
    const navToggle = document.querySelector('.nav-toggle');

    // NAV — flip colours once the dark hero scrolls past, so the bar stays readable
    var hero = document.querySelector('.hero');
    if (nav) {
        var syncNav = function () {
            var threshold = hero ? hero.offsetHeight - 80 : 80;
            nav.classList.toggle('nav-scrolled', window.scrollY > threshold);
        };
        window.addEventListener('scroll', syncNav, { passive: true });
        window.addEventListener('resize', syncNav);
        syncNav();
    }

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('nav-open');
            var open = nav.classList.contains('nav-open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            navToggle.textContent = open ? '✕' : '☰';
        });
        nav.querySelectorAll('ul a').forEach(function (a) {
            a.addEventListener('click', function () {
                nav.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.textContent = '☰';
                closeLightbox();
            });
        });
    }
    var track = document.getElementById('worksList');

    var lightbox = document.getElementById('lightbox');
    var lightboxGallery = document.getElementById('lightboxGallery');
    var lightboxTag = document.getElementById('lightboxTag');
    var lightboxTitle = document.getElementById('lightboxTitle');
    var lightboxDesc = document.getElementById('lightboxDesc');
    var lightboxLink = document.getElementById('lightboxLink');

    function openLightbox(card) {
        if (!lightbox || !lightboxGallery) return;

        // Build the (scrollable) image gallery — supports multiple images
        // via data-gallery="a.png, b.png, c.png"; falls back to data-lightbox-src.
        var gallery = card.getAttribute('data-gallery') || card.getAttribute('data-lightbox-src') || '';
        var srcs = gallery.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        var title = card.getAttribute('data-title') || '';
        lightboxGallery.innerHTML = '';
        srcs.forEach(function (src) {
            var img = document.createElement('img');
            img.src = src;
            img.alt = title;
            img.loading = 'lazy';
            lightboxGallery.appendChild(img);
        });
        lightboxGallery.scrollTop = 0;
        lightboxGallery.classList.toggle('is-multi', srcs.length > 1);

        if (lightboxTag) lightboxTag.textContent = card.getAttribute('data-tag') || '';
        if (lightboxTitle) lightboxTitle.textContent = card.getAttribute('data-title') || '';
        if (lightboxDesc) {
            var desc = card.getAttribute('data-desc') || '';
            lightboxDesc.textContent = desc;
            lightboxDesc.style.display = desc ? '' : 'none';
        }

        var link = card.getAttribute('data-link');
        if (lightboxLink) {
            if (link) {
                lightboxLink.href = link;
                lightboxLink.style.display = '';
            } else {
                lightboxLink.removeAttribute('href');
                lightboxLink.style.display = 'none';
            }
        }

        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        if (lightboxGallery) lightboxGallery.innerHTML = '';
        document.body.style.overflow = '';
    }

  if (track) {

    // Click
    track.addEventListener('click', function (e) {

        // ถ้าคลิกลิงก์ ให้เปิดลิงก์ ไม่ต้องเปิด Lightbox
        if (e.target.closest('a')) return;

        var card = e.target.closest('[data-lightbox-src]');
        if (!card || !track.contains(card)) return;

        e.preventDefault();
        openLightbox(card);
    });

    // Keyboard
    track.addEventListener('keydown', function (e) {

        if (e.key !== 'Enter' && e.key !== ' ') return;

        // ถ้าโฟกัสอยู่ที่ลิงก์ ให้ Browser จัดการเอง
        if (document.activeElement.tagName === 'A') return;

        var card = e.target.closest('[data-lightbox-src]');
        if (!card || !track.contains(card)) return;

        e.preventDefault();
        openLightbox(card);
    });

}

    var closeBtn = document.querySelector('.lightbox-close');
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLightbox();
    });

    // SITE-WIDE CURSOR — a minimal whale that follows the pointer with easing,
    // gently swims (tilt + float) as it moves, and morphs into the black
    // "VIEW" circle over Works project images. Desktop (fine pointer) only.
    function initSiteCursor() {
        var cursor = document.getElementById('siteCursor');
        if (!cursor || typeof gsap === 'undefined') return;

        var fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!fineHover || reduceMotion) return;

        var whaleInner = document.getElementById('siteCursorWhaleInner');

        var xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3' });
        var yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3' });

        var revealed = false;
        var lastX = null;
        var velX = 0;

        document.addEventListener('pointermove', function (e) {
            if (!revealed) {
                revealed = true;
                gsap.to(cursor, { opacity: 1, duration: 0.3 });
            }
            if (lastX !== null) velX = e.clientX - lastX;
            lastX = e.clientX;
            xTo(e.clientX);
            yTo(e.clientY);
        });

        document.documentElement.addEventListener('pointerleave', function () {
            revealed = false;
            gsap.to(cursor, { opacity: 0, duration: 0.3 });
        });

        // Continuous "swim": tilt eases toward the current horizontal velocity
        // and decays back to level when the pointer stops, plus a slow float bob.
        // Driven by a raw transform write (not GSAP) so it never fights the
        // CSS transitions that handle the hover scale / morph states.
        if (whaleInner) {
            var rotation = 0;
            var bobStart = performance.now();
            (function tick() {
                var targetRotation = Math.max(-18, Math.min(18, velX * 1.5));
                rotation += (targetRotation - rotation) * 0.12;
                velX *= 0.82;
                var bob = Math.sin((performance.now() - bobStart) / 900) * 3;
                whaleInner.style.transform = 'rotate(' + rotation.toFixed(2) + 'deg) translateY(' + bob.toFixed(2) + 'px)';
                requestAnimationFrame(tick);
            })();
        }

        // Links/buttons — whale scales up slightly.
        document.querySelectorAll('a, button, [role="button"], input, select, textarea').forEach(function (el) {
            el.addEventListener('pointerenter', function () { cursor.classList.add('is-link-hover'); });
            el.addEventListener('pointerleave', function () { cursor.classList.remove('is-link-hover'); });
        });

        // Works project images — morph the whale into the "VIEW" circle.
        document.querySelectorAll('.work-item-media').forEach(function (media) {
            media.addEventListener('pointerenter', function () { cursor.classList.add('is-view-hover'); });
            media.addEventListener('pointerleave', function () { cursor.classList.remove('is-view-hover'); });
        });
    }

    // WORKS — each project gently fades and slides in as it scrolls into view
    function initWorksReveal(trackEl) {
        if (!trackEl) return;
        var items = trackEl.querySelectorAll('.work-item');
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            items.forEach(function (item) {
                item.style.opacity = '1';
                item.style.transform = 'none';
            });
            return;
        }

        gsap.registerPlugin(ScrollTrigger);
        items.forEach(function (item) {
            gsap.to(item, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 82%',
                    once: true
                }
            });
        });
    }

    initSiteCursor();
    initWorksReveal(track);

    var faders = document.querySelectorAll('.fade-in');
    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    observer.unobserve(e.target);
                }
            });
        },
        { threshold: 0.1 }
    );
    faders.forEach(function (f) {
        observer.observe(f);
    });
})();
