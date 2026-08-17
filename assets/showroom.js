/* ============================================================
   SABR — assets/showroom.js
   Showroom 3D stile Need for Speed per prodotti.html
   - Un prodotto alla volta al centro, sotto lo spotlight
   - Frecce laterali, swipe touch (soglia 50px), tastiera ←/→
   - Wrap-around infinito, indicatori con nomi prodotto
   - Click su slide laterale = porta quella slide al centro
   - Click sulla business card attiva = flip fronte/retro
   ============================================================ */

(function () {
    "use strict";

    var stage = document.querySelector(".showroom-stage");
    if (!stage) return;

    var slides = Array.prototype.slice.call(stage.querySelectorAll(".sr-slide"));
    var n = slides.length;
    if (!n) return;

    var infoPanel = document.querySelector(".sr-info");
    var dotsWrap = document.querySelector(".sr-dots");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var active = 0;
    var switching = false;

    /* ---------- POSIZIONAMENTO 3D ---------- */

    // Offset relativo con wrap-around (distanza più breve)
    function offsetOf(i) {
        var d = i - active;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        return d;
    }

    function layout() {
        for (var i = 0; i < n; i++) {
            var d = offsetOf(i);
            var slide = slides[i];
            var abs = Math.abs(d);

            if (abs >= 2) {
                // Slide "dietro": nascosta in profondità
                slide.style.transform =
                    "translateX(-50%) translateZ(-560px) scale(0.6)";
                slide.style.opacity = "0";
                slide.style.filter = "brightness(0.3)";
                slide.style.pointerEvents = "none";
                slide.classList.remove("is-active");
            } else if (d === 0) {
                slide.style.transform =
                    "translateX(-50%) translateZ(0) rotateY(0deg) scale(1)";
                slide.style.opacity = "1";
                slide.style.filter = "none";
                slide.style.pointerEvents = "auto";
                slide.classList.add("is-active");
            } else {
                // Slide laterali: ruotate verso il centro, stile NFS
                slide.style.transform =
                    "translateX(calc(-50% + " + (d * 62) + "%)) " +
                    "translateZ(-280px) rotateY(" + (-d * 50) + "deg) scale(0.74)";
                slide.style.opacity = "0.85";
                slide.style.filter = "brightness(0.5) saturate(0.85)";
                slide.style.pointerEvents = "auto";
                slide.classList.remove("is-active");
            }
            slide.setAttribute("aria-hidden", d === 0 ? "false" : "true");
        }
        updateDots();
    }

    /* ---------- PANNELLO INFO ---------- */

    function swapInfo() {
        if (!infoPanel) return;
        var data = slides[active].querySelector(".sr-data");
        if (!data) return;

        if (reducedMotion) {
            infoPanel.innerHTML = data.innerHTML;
            return;
        }

        infoPanel.classList.add("switching");
        setTimeout(function () {
            infoPanel.innerHTML = data.innerHTML;
            infoPanel.classList.remove("switching");
        }, 300);
    }

    /* ---------- DOTS (nomi prodotto) ---------- */

    var dots = [];

    function buildDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = "";
        dots = [];
        slides.forEach(function (slide, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "sr-dot";
            b.textContent = slide.getAttribute("data-name") || ("Prodotto " + (i + 1));
            b.setAttribute("aria-label", "Vai a " + b.textContent);
            b.addEventListener("click", function () { goTo(i); });
            dotsWrap.appendChild(b);
            dots.push(b);
        });
    }

    function updateDots() {
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === active);
            dot.setAttribute("aria-current", i === active ? "true" : "false");
        });
    }

    /* ---------- NAVIGAZIONE ---------- */

    function goTo(index) {
        var next = ((index % n) + n) % n; // wrap-around
        if (next === active || switching) return;
        switching = true;
        active = next;
        layout();
        swapInfo();
        setTimeout(function () { switching = false; }, reducedMotion ? 60 : 500);
    }

    function next() { goTo(active + 1); }
    function prev() { goTo(active - 1); }

    /* ---------- FRECCE ---------- */

    Array.prototype.forEach.call(
        document.querySelectorAll(".sr-arrow"),
        function (arrow) {
            arrow.addEventListener("click", function () {
                if (arrow.classList.contains("next")) next(); else prev();
            });
        }
    );

    /* ---------- TASTIERA (← →) ---------- */

    document.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { next(); }
        else if (e.key === "ArrowLeft") { prev(); }
    });

    /* ---------- SWIPE TOUCH (soglia 50px) ---------- */

    var touchX = null;

    stage.addEventListener("touchstart", function (e) {
        touchX = e.touches[0].clientX;
    }, { passive: true });

    stage.addEventListener("touchend", function (e) {
        if (touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) >= 50) {
            if (dx < 0) next(); else prev();
        }
        touchX = null;
    }, { passive: true });

    /* ---------- CLICK SULLE SLIDE ---------- */

    slides.forEach(function (slide, i) {
        slide.addEventListener("click", function () {
            if (i !== active) {
                // Click su slide laterale → portala al centro
                goTo(i);
            }
        });

        // Flip card: solo se la slide è quella attiva
        var card = slide.querySelector(".card-3d");
        if (card) {
            card.addEventListener("click", function (e) {
                if (i === active) {
                    card.classList.toggle("flip");
                    e.stopPropagation();
                }
            });
        }
    });

    /* ---------- INIT ---------- */

    buildDots();
    layout();
    swapInfo();
    stage.classList.add("sr-ready");
})();
