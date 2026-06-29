(function () {
    'use strict';

    // PRELOADER — unlock the page once the intro finishes
    var preloader = document.getElementById('preloader');
    if (preloader) {
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var done = reduce ? 900 : 4200;
        var finish = function () {
            preloader.classList.add('pl-done');
            document.body.classList.remove('is-loading');
        };
        window.setTimeout(finish, done);
        // safety net if a CSS animation never fires
        preloader.addEventListener('animationend', function (e) {
            if (e.target === preloader) finish();
        });
    } else {
        document.body.classList.remove('is-loading');
    }

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
            });
        });
    }
    var track = document.getElementById('prodTrack');

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

    // CAROUSEL — arrows, drag-to-scroll, snap (reused by Production + Academic)
    function initCarousel(trackEl, prevBtn, nextBtn, cardSelector) {
        if (!trackEl) return;

        var step = function () {
            var card = trackEl.querySelector(cardSelector);
            var gap = parseInt(getComputedStyle(trackEl).columnGap || getComputedStyle(trackEl).gap || '28', 10) || 28;
            return card ? card.offsetWidth + gap : 360;
        };

        var updateArrows = function () {
            if (!prevBtn || !nextBtn) return;
            var max = trackEl.scrollWidth - trackEl.clientWidth - 2;
            prevBtn.disabled = trackEl.scrollLeft <= 2;
            nextBtn.disabled = trackEl.scrollLeft >= max;
        };

        if (prevBtn) prevBtn.addEventListener('click', function () {
            trackEl.scrollBy({ left: -step(), behavior: 'smooth' });
        });
        if (nextBtn) nextBtn.addEventListener('click', function () {
            trackEl.scrollBy({ left: step(), behavior: 'smooth' });
        });

        trackEl.addEventListener('scroll', updateArrows, { passive: true });
        window.addEventListener('resize', updateArrows);
        updateArrows();

        // Drag / swipe to scroll (pointer events cover mouse + touch)
        var isDown = false, startX = 0, startScroll = 0, moved = false;

        trackEl.addEventListener('pointerdown', function (e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            isDown = true;
            moved = false;
            startX = e.clientX;
            startScroll = trackEl.scrollLeft;
        });

        trackEl.addEventListener('pointermove', function (e) {
            if (!isDown) return;
            var dx = e.clientX - startX;
            if (Math.abs(dx) > 4 && !moved) {
                moved = true;
                trackEl.classList.add('is-dragging');
                if (trackEl.setPointerCapture) trackEl.setPointerCapture(e.pointerId);
            }
            if (moved) trackEl.scrollLeft = startScroll - dx;
        });

        var endDrag = function () {
            if (!isDown) return;
            isDown = false;
            trackEl.classList.remove('is-dragging');
            updateArrows();
        };
        trackEl.addEventListener('pointerup', endDrag);
        trackEl.addEventListener('pointercancel', endDrag);
        trackEl.addEventListener('pointerleave', endDrag);

        // suppress the click that fires after a drag
        trackEl.addEventListener('click', function (e) {
            if (moved) { e.preventDefault(); e.stopPropagation(); }
        }, true);
    }

    initCarousel(
        document.getElementById('prodTrack'),
        document.getElementById('prodPrev'),
        document.getElementById('prodNext'),
        '.prod-card'
    );

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
