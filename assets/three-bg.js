/* ============================================================
   SABR — assets/three-bg.js
   Sfondo 3D condiviso: particelle + toro cromato + anelli
   wireframe che ruotano lentamente, parallasse col cursore.
   Graceful degradation: senza WebGL il canvas resta nascosto
   e vale la vignettatura CSS di body::before.
   ============================================================ */

(function () {
    "use strict";

    var canvas = document.getElementById("bg3d");
    if (!canvas) return;

    // Three.js non caricato (CDN offline) → fallback CSS
    if (typeof THREE === "undefined") {
        canvas.style.display = "none";
        return;
    }

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Rileva supporto WebGL
    var renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: "low-power"
        });
    } catch (e) {
        canvas.style.display = "none";
        return;
    }

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 9;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    var isMobile = window.innerWidth < 700;

    /* ---------- PARTICELLE ---------- */

    var COUNT = isMobile ? 420 : 950;
    var positions = new Float32Array(COUNT * 3);
    for (var i = 0; i < COUNT; i++) {
        positions[i * 3]     = (Math.random() - 0.5) * 34;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }

    var particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    var particleMat = new THREE.PointsMaterial({
        color: 0xdfe4ee,
        size: 0.045,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    var particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    /* ---------- TORO CROMATO (wireframe) ---------- */

    var chromeMat = new THREE.MeshBasicMaterial({
        color: 0x9aa4b8,
        wireframe: true,
        transparent: true,
        opacity: 0.16
    });

    var torus = new THREE.Mesh(new THREE.TorusGeometry(3.4, 1.05, 18, 72), chromeMat);
    torus.position.set(0, -0.4, -3);
    torus.rotation.x = 0.9;
    scene.add(torus);

    /* ---------- ANELLI ORBITALI ---------- */

    function makeRing(radius, tube, color, opacity) {
        return new THREE.Mesh(
            new THREE.TorusGeometry(radius, tube, 8, 96),
            new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: opacity })
        );
    }

    var ring1 = makeRing(5.4, 0.02, 0xb8c0d4, 0.14);
    ring1.position.set(0, -0.4, -3);
    ring1.rotation.x = 1.25;
    scene.add(ring1);

    var ring2 = makeRing(6.6, 0.015, 0x8a92a6, 0.10);
    ring2.position.set(0, -0.4, -3);
    ring2.rotation.x = 0.55;
    ring2.rotation.y = 0.4;
    scene.add(ring2);

    /* ---------- ICOSAHEDRI SATELLITI ---------- */

    var sats = [];
    var satGeo = new THREE.IcosahedronGeometry(0.5, 0);
    for (var s = 0; s < (isMobile ? 3 : 5); s++) {
        var sat = new THREE.Mesh(
            satGeo,
            new THREE.MeshBasicMaterial({ color: 0xaab2c6, wireframe: true, transparent: true, opacity: 0.20 })
        );
        var angle = (s / 5) * Math.PI * 2;
        sat.position.set(Math.cos(angle) * 7.5, Math.sin(angle) * 4.2, -4 + Math.sin(angle * 2) * 2);
        sat.userData.spin = 0.0015 + Math.random() * 0.002;
        scene.add(sat);
        sats.push(sat);
    }

    /* ---------- PARALLASSE COL CURSORE ---------- */

    var targetX = 0, targetY = 0, curX = 0, curY = 0;

    if (!isMobile && !reducedMotion) {
        window.addEventListener("mousemove", function (e) {
            targetX = (e.clientX / window.innerWidth - 0.5) * 0.9;
            targetY = (e.clientY / window.innerHeight - 0.5) * 0.55;
        }, { passive: true });
    }

    /* ---------- LOOP ---------- */

    var running = true;

    document.addEventListener("visibilitychange", function () {
        running = !document.hidden;
        if (running && !reducedMotion) requestAnimationFrame(animate);
    });

    function render() {
        renderer.render(scene, camera);
    }

    function animate() {
        if (!running) return;
        requestAnimationFrame(animate);

        torus.rotation.z += 0.0016;
        torus.rotation.x += 0.0004;
        ring1.rotation.z -= 0.0011;
        ring2.rotation.z += 0.0008;
        particles.rotation.y += 0.00035;

        for (var j = 0; j < sats.length; j++) {
            sats[j].rotation.x += sats[j].userData.spin;
            sats[j].rotation.y += sats[j].userData.spin * 1.4;
        }

        // Parallasse fluido (lerp)
        curX += (targetX - curX) * 0.045;
        curY += (targetY - curY) * 0.045;
        camera.position.x = curX;
        camera.position.y = -curY;
        camera.lookAt(0, -0.4, -3);

        render();
    }

    if (reducedMotion) {
        // Un solo frame statico: la scena c'è ma non si muove
        render();
    } else {
        animate();
    }

    /* ---------- RESIZE ---------- */

    var resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            if (reducedMotion) render();
        }, 150);
    }, { passive: true });
})();
