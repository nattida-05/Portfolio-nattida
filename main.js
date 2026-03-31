(function () {
    'use strict';

    const nav = document.getElementById('mainNav');
    const navToggle = document.querySelector('.nav-toggle');

    window.addEventListener('scroll', function () {
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    });

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

    var slides = document.querySelectorAll('.slide-bg');
    var counter = document.getElementById('slideCounter');
    slides.forEach(function (s) {
        if (s.dataset.src) s.style.backgroundImage = "url('" + s.dataset.src + "')";
    });
    var current = 0;
    function showSlide(i) {
        slides.forEach(function (s, idx) {
            s.classList.toggle('active', idx === i);
        });
        if (counter) {
            counter.textContent =
                String(i + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
        }
    }
    if (slides.length) {
        showSlide(0);
        setInterval(function () {
            current = (current + 1) % slides.length;
            showSlide(current);
        }, 3500);
    }

    var track = document.getElementById('perfTrack');
    var btnLeft = document.getElementById('btnLeft');
    var btnRight = document.getElementById('btnRight');
    if (track && btnLeft) {
        btnLeft.addEventListener('click', function () {
            track.scrollBy({ left: -324, behavior: 'smooth' });
        });
    }
    if (track && btnRight) {
        btnRight.addEventListener('click', function () {
            track.scrollBy({ left: 324, behavior: 'smooth' });
        });
    }

    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightboxImg');

    function openLightbox(src) {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightbox.classList.add('open');
    }

    function closeLightbox() {
        if (!lightbox || !lightboxImg) return;
        lightbox.classList.remove('open');
        lightboxImg.src = '';
    }

    if (track) {
        track.addEventListener('click', function (e) {
            var card = e.target.closest('[data-lightbox-src]');
            if (!card || !track.contains(card)) return;
            e.preventDefault();
            openLightbox(card.getAttribute('data-lightbox-src'));
        });
        track.addEventListener('keydown', function (e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            var card = e.target.closest('[data-lightbox-src]');
            if (!card || !track.contains(card)) return;
            e.preventDefault();
            openLightbox(card.getAttribute('data-lightbox-src'));
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
