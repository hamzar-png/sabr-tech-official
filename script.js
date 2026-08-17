/* ============================================================
   SABR — script.js
   Popup, nav mobile, tilt 3D, reveal on scroll drammatico,
   bottoni magnetici, glow cursore, reveal parola per parola
   ============================================================ */

/* ---------- POPUP (nomi funzioni invariati) ---------- */

function openPopup(id) {
    const popup = document.getElementById(id);
    if (popup) {
        popup.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}

function closePopup(id) {
    const popup = document.getElementById(id);
    if (popup) {
        popup.style.display = "none";
        document.body.style.overflow = "";
    }
}

// Chiudi il popup cliccando fuori dal contenuto
window.addEventListener("click", function (event) {
    if (event.target.classList && event.target.classList.contains("popup")) {
        event.target.style.display = "none";
        document.body.style.overflow = "";
    }
});

// Chiudi tutti i popup con ESC
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        document.querySelectorAll(".popup").forEach(function (popup) {
            popup.style.display = "none";
        });
        document.body.style.overflow = "";
    }
});

/* ---------- PREFERENZA MOTION / TOUCH ---------- */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouchDevice = window.matchMedia("(hover: none)").matches;

/* ---------- NAV MOBILE (hamburger) ---------- */

document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector("header nav");
    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            toggle.classList.toggle("open");
            nav.classList.toggle("open");
        });
        // Chiudi il menu quando si clicca una voce
        nav.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                toggle.classList.remove("open");
                nav.classList.remove("open");
            });
        });
    }
});

/* ---------- REVEAL PAROLA PER PAROLA (hero) ---------- */

document.addEventListener("DOMContentLoaded", function () {
    if (prefersReducedMotion) return;

    document.querySelectorAll(".word-reveal").forEach(function (el) {
        const words = el.textContent.trim().split(/\s+/);
        el.textContent = "";
        words.forEach(function (word, i) {
            const span = document.createElement("span");
            span.className = "w";
            span.style.setProperty("--wd", (i * 0.09) + "s");
            span.textContent = word;
            el.appendChild(span);
            if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
        });
        // A fine animazione rimuovi i fotogrammi chiave: stato DOM "pulito",
        // niente layer compositi residui (fix testo doppiato/sovrapposto)
        const last = el.lastElementChild;
        if (last) {
            last.addEventListener("animationend", function () {
                el.classList.add("done");
            }, { once: true });
        }
    });
});

/* ---------- GLOW CHE SEGUE IL CURSORE ---------- */

document.addEventListener("DOMContentLoaded", function () {
    if (prefersReducedMotion || isTouchDevice) return;

    const glow = document.createElement("div");
    glow.id = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.appendChild(glow);

    let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    let cx = gx, cy = gy;
    let glowRunning = false;

    function glowLoop() {
        cx += (gx - cx) * 0.12;
        cy += (gy - cy) * 0.12;
        glow.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)";
        if (Math.abs(gx - cx) > 0.3 || Math.abs(gy - cy) > 0.3) {
            requestAnimationFrame(glowLoop);
        } else {
            glowRunning = false;
        }
    }

    window.addEventListener("mousemove", function (e) {
        gx = e.clientX;
        gy = e.clientY;
        if (!glowRunning) {
            glowRunning = true;
            requestAnimationFrame(glowLoop);
        }
    }, { passive: true });
});

/* ---------- BOTTONI MAGNETICI ---------- */

document.addEventListener("DOMContentLoaded", function () {
    if (prefersReducedMotion || isTouchDevice) return;

    const SELECTOR = ".btn-primary, .btn-ghost, .btn-ghost-blue, .btn-trackflow, .sr-arrow";
    const STRENGTH = 0.28; // frazione della distanza dal centro
    const MAX = 9;         // px massimi di attrazione

    document.querySelectorAll(SELECTOR).forEach(function (btn) {
        btn.classList.add("magnetic");

        btn.addEventListener("mousemove", function (e) {
            const rect = btn.getBoundingClientRect();
            const dx = e.clientX - (rect.left + rect.width / 2);
            const dy = e.clientY - (rect.top + rect.height / 2);
            let mx = dx * STRENGTH;
            let my = dy * STRENGTH;
            mx = Math.max(-MAX, Math.min(MAX, mx));
            my = Math.max(-MAX, Math.min(MAX, my));
            const base = btn.classList.contains("sr-arrow") ? " translateY(-50%)" : "";
            btn.style.transform = base + " translate(" + mx.toFixed(1) + "px," + my.toFixed(1) + "px)";
        });

        btn.addEventListener("mouseleave", function () {
            btn.style.transform = btn.classList.contains("sr-arrow") ? "translateY(-50%)" : "";
        });
    });
});

/* ---------- TILT 3D SULLE CARD ---------- */

document.addEventListener("DOMContentLoaded", function () {
    if (prefersReducedMotion) return;
    if (isTouchDevice) return; // no tilt su touch

    document.querySelectorAll(".tilt").forEach(function (card) {
        // Layer glare
        if (!card.querySelector(".tilt-glare")) {
            const glare = document.createElement("div");
            glare.className = "tilt-glare";
            card.appendChild(glare);
        }

        const MAX_TILT = 8; // gradi

        card.addEventListener("mousemove", function (e) {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;   // 0..1
            const y = (e.clientY - rect.top) / rect.height;   // 0..1
            const rotateY = (x - 0.5) * MAX_TILT * 2;
            const rotateX = (0.5 - y) * MAX_TILT * 2;
            card.style.transform =
                "perspective(900px) rotateX(" + rotateX.toFixed(2) + "deg) rotateY(" + rotateY.toFixed(2) + "deg) translateY(-4px)";
            card.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
            card.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
        });

        card.addEventListener("mouseleave", function () {
            card.style.transform = "";
        });
    });
});

/* ---------- REVEAL ON SCROLL ---------- */

document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        elements.forEach(function (el) { el.classList.add("visible"); });
        return;
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = parseInt(el.dataset.revealDelay || "0", 10);
                setTimeout(function () { el.classList.add("visible"); }, delay);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    elements.forEach(function (el) { observer.observe(el); });
});
