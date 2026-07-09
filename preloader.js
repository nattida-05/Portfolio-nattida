/**
 * Premium slot-machine preloader.
 * Phases: fade in + scale up -> independent slot-machine letter spin ->
 * sequential left-to-right letter lock (with a brief glow) -> hold ->
 * cinematic zoom-through that dissolves into the homepage underneath.
 */
(function () {
    'use strict';

    var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function randomLetter() {
        return LETTERS.charAt((Math.random() * LETTERS.length) | 0);
    }

    function initPreloader(options) {
        var opts = Object.assign({
            preloaderId: 'preloader',
            wordId: 'plWord',
            initialScale: 0.2,     // starting scale before fade/zoom in
            fadeInDuration: 500,   // ms
            scaleDuration: 1300,   // ms — grow to full size while letters spin
            lockStart: 1150,       // ms — when the first letter locks
            lockStagger: 110,      // ms between each subsequent lock
            holdDuration: 750,     // ms the finished word stays perfectly still
            zoomScale: 7,          // final scale of the word during the zoom-through
            zoomDuration: 950,     // ms for the word to zoom past the camera
            zoomRevealDelay: 450,  // ms into the zoom before the homepage starts showing through
            zoomRevealDuration: 600 // ms for the preloader to dissolve away
        }, options || {});

        var preloader = document.getElementById(opts.preloaderId);

        function finish() {
            document.body.classList.remove('is-loading');
            if (preloader) preloader.classList.add('pl-done');
        }

        if (!preloader) {
            document.body.classList.remove('is-loading');
            return;
        }

        var wordEl = document.getElementById(opts.wordId);
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var hasGsap = typeof window.gsap !== 'undefined';

        // Graceful fallback: no animation library or user prefers less motion.
        if (!wordEl || !hasGsap || reduceMotion) {
            if (wordEl) {
                wordEl.textContent = wordEl.getAttribute('data-text') || wordEl.textContent;
            }
            window.setTimeout(finish, reduceMotion ? 250 : 400);
            return;
        }

        var finalText = (wordEl.getAttribute('data-text') || wordEl.textContent || '').trim();
        wordEl.textContent = '';

        var chars = finalText.split('').map(function (ch) {
            var span = document.createElement('span');
            span.className = 'pl-char';
            span.textContent = ch === ' ' ? ' ' : randomLetter();
            wordEl.appendChild(span);
            return { el: span, final: ch, locked: false };
        });

        var lockTimes = chars.map(function (_, i) {
            return opts.lockStart + i * opts.lockStagger;
        });

        var start = performance.now();

        // Each character spins independently and decelerates into its stop
        // time, like a slot-machine reel easing to a halt rather than
        // cutting off abruptly.
        function spin(charObj, lockAt) {
            if (charObj.final === ' ') return;
            (function tick() {
                if (charObj.locked) return;
                var remaining = lockAt - (performance.now() - start);
                if (remaining <= 0) return;
                charObj.el.textContent = randomLetter();
                var delay = remaining < 260 ? 90 : remaining < 650 ? 55 : 30 + Math.random() * 20;
                window.setTimeout(tick, delay);
            })();
        }

        function lockChar(charObj) {
            charObj.locked = true;
            charObj.el.textContent = charObj.final === ' ' ? ' ' : charObj.final;
            charObj.el.classList.add('is-locked');
        }

        chars.forEach(function (c, i) { spin(c, lockTimes[i]); });

        var lastLockTime = lockTimes[lockTimes.length - 1];

        var tl = gsap.timeline({ defaults: { ease: 'power2.out' }, onComplete: finish });

        // Phase 1 — fade in from a small scale with elegant, cinematic easing.
        tl.set(wordEl, { opacity: 0, scale: opts.initialScale, filter: 'blur(0px)' });
        tl.to(wordEl, { opacity: 1, duration: opts.fadeInDuration / 1000, ease: 'power1.out' }, 0);

        // Phase 1/2 — scale up to full size while the letters spin, with a
        // light motion blur that clears as the zoom settles.
        tl.to(wordEl, { scale: 1, duration: opts.scaleDuration / 1000, ease: 'power3.out' }, 0.1);
        tl.to(wordEl, { filter: 'blur(5px)', duration: 0.45, ease: 'power1.inOut' }, 0.1);
        tl.to(wordEl, { filter: 'blur(0px)', duration: 0.7, ease: 'power1.out' }, 0.75);

        // Phase 2 — lock letters left to right in step with the spin timers above.
        chars.forEach(function (c, i) {
            tl.call(function () { lockChar(c); }, null, lockTimes[i] / 1000);
        });

        // Phase 3 — hold the finished word, perfectly still, with a subtle glow.
        tl.addLabel('final', lastLockTime / 1000);
        tl.call(function () { wordEl.classList.add('pl-word--final'); }, null, 'final');
        tl.addLabel('zoom', 'final+=' + (opts.holdDuration / 1000));

        // Phase 4 — the word becomes the transition: it zooms toward the
        // camera until it fills (and exceeds) the viewport, and as it grows
        // past the frame the homepage dissolves into view underneath. One
        // continuous, GPU-friendly transform + opacity animation, no cut.
        tl.call(function () { preloader.style.pointerEvents = 'none'; }, null, 'zoom');
        tl.to(wordEl, { scale: opts.zoomScale, duration: opts.zoomDuration / 1000, ease: 'power2.in' }, 'zoom');
        tl.to(wordEl, { filter: 'blur(14px)', duration: (opts.zoomDuration * 0.7) / 1000, ease: 'power1.in' }, 'zoom');
        tl.to(preloader, {
            opacity: 0,
            duration: opts.zoomRevealDuration / 1000,
            ease: 'power1.inOut'
        }, 'zoom+=' + (opts.zoomRevealDelay / 1000));

        // Safety net in case a tab is backgrounded and timers stall.
        var totalRuntime = lastLockTime + opts.holdDuration +
            Math.max(opts.zoomDuration, opts.zoomRevealDelay + opts.zoomRevealDuration);
        window.setTimeout(finish, totalRuntime + 2000);
    }

    initPreloader();
})();
