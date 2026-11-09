/*
 * Abertura "Faísca": a estrela do logo acende, pisca, junta força e cresce girando
 * até virar a tela, revelando o vídeo por dentro dela.
 * Um canvas por cima da mídia pinta tudo de preto e recorta a estrela (destination-out).
 */
(function () {
  "use strict";
  const SS = window.SS;
  const root = document.documentElement;
  const hero = document.querySelector(".hero");
  const intro = hero.querySelector(".intro");
  const media = SS.ui.heroMedia;

  // Estrela de quatro pontas em caixa de 100 unidades (a mesma do esboço aprovado).
  const STAR_D = "M0-50 C3-8 8-3 50 0 C8 3 3 8 0 50 C-3 8 -8 3 -50 0 C-8 -3 -3 -8 0 -50Z";
  const INNER_RADIUS = 14.6;            // raio interno da estrela, em unidades
  const STAR_IN_LOGO = [355 / 618, 65 / 408]; // centro da estrela dentro do logo.png

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const outBack = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const inOutExpo = x => (x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2);
  const outCubic = x => 1 - Math.pow(1 - x, 3);
  const inOut = x => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

  // O script rodou: a rede de segurança do CSS (para quando ele não roda) sai de cena.
  root.classList.add("intro-live");

  let readyDone = false;
  function ready() {
    if (readyDone) return;
    readyDone = true;
    // Um quadro depois, para as transições de entrada partirem do estado escondido;
    // o temporizador cobre páginas em segundo plano, onde não há quadros.
    let fired = false;
    const go = () => {
      if (fired) return;
      fired = true;
      root.classList.add("intro-done");
      document.dispatchEvent(new Event("ss:intro-done"));
    };
    requestAnimationFrame(go);
    setTimeout(go, 120);
  }

  const mode = root.getAttribute("data-intro") || "none";
  // Sem abertura (ou se algo der errado nela): texto primeiro, depois a mídia.
  function bail() {
    if (intro) intro.remove();
    ready();
    try { media.start(); } catch (_) { /* o poster continua lá */ }
  }
  if (mode === "none" || !intro || !window.Path2D) return bail();
  try {
    run();
  } catch (_) {
    bail();
  }

  function run() {

  let store = null;
  try { store = window.localStorage; } catch (_) { /* aba anônima */ }
  SS.lib.markSeen(store, Date.now());

  const canvas = intro.querySelector(".intro-canvas");
  const ctx = canvas.getContext("2d");
  const logo = intro.querySelector(".intro-logo");
  const STAR = new Path2D(STAR_D);
  let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, base = 0, cover = 0;

  function measure() {
    const r = hero.getBoundingClientRect();
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    // Medida pelo layout (offset*), sem o translate da entrada do logo; o CSS centraliza com translateX(-50%).
    const lw = logo.offsetWidth, lh = logo.offsetHeight;
    cx = logo.offsetLeft - lw / 2 + lw * STAR_IN_LOGO[0];
    cy = logo.offsetTop + lh * STAR_IN_LOGO[1];
    base = (lw * 0.16) / 100;
    const far = Math.max(...[[0, 0], [W, 0], [0, H], [W, H]].map(([x, y]) => Math.hypot(x - cx, y - cy)));
    cover = (far / INNER_RADIUS) * 1.08;
  }

  function draw(s, rot, fo, so) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.shadowBlur = 0;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    if (s <= 0) return;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.scale(s, s);
    ctx.globalCompositeOperation = "destination-out";
    ctx.fill(STAR);
    ctx.globalCompositeOperation = "source-over";
    if (fo > 0.002) {
      if (s < base * 3) { ctx.shadowBlur = 16; ctx.shadowColor = "rgba(255,255,255,0.85)"; }
      ctx.fillStyle = `rgba(255,255,255,${fo})`;
      ctx.fill(STAR);
      ctx.shadowBlur = 0;
    }
    if (so > 0.002) {
      ctx.lineWidth = 1.2 / s;
      ctx.strokeStyle = `rgba(255,255,255,${so})`;
      ctx.stroke(STAR);
    }
    ctx.restore();
  }

  // Linhas do tempo em ms. Cada uma devolve [escala, rotação°, alfa do branco, alfa do contorno].
  const once = {};
  const at = (key, fn) => { if (!once[key]) { once[key] = 1; fn(); } };

  function full(t) {
    let s = 0, r = -35, fo = 1, so = 1;
    if (t < 2300) {
      const tw = Math.sin(seg(t, 900, 2300) * Math.PI * 3) * 0.07 * (1 - seg(t, 900, 2300));
      s = base * (outBack(seg(t, 300, 900)) + tw);
      r = -35 + 35 * outCubic(seg(t, 300, 1100)) + 6 * Math.sin(seg(t, 900, 2300) * Math.PI);
    } else if (t < 2750) {
      s = base * (1 - 0.22 * inOut(seg(t, 2300, 2750)));
      r = 0;
    } else {
      s = base * 0.78 + (cover - base * 0.78) * inOutExpo(seg(t, 2750, 4050));
      r = 45 * inOut(seg(t, 2750, 4050));
      fo = 1 - outCubic(seg(t, 2800, 3350));
      so = 1 - seg(t, 3300, 4000);
    }
    if (t >= 1000) at("logo-on", () => intro.classList.add("logo-on"));
    if (t >= 2300) at("logo-off", () => { intro.classList.remove("logo-on"); intro.classList.add("logo-off"); });
    if (t >= 3850) at("ready", ready);
    return { s, r, fo, so, end: t >= 4100 };
  }

  function short(t) {
    let s, r, fo = 1, so = 1;
    if (t < 250) {
      s = base * outBack(seg(t, 0, 250));
      r = 0;
    } else {
      s = base + (cover - base) * inOutExpo(seg(t, 250, 1250));
      r = 45 * inOut(seg(t, 250, 1250));
      fo = 1 - outCubic(seg(t, 300, 700));
      so = 1 - seg(t, 600, 1200);
    }
    if (t >= 1050) at("ready", ready);
    return { s, r, fo, so, end: t >= 1300 };
  }

  const timeline = mode === "short" ? short : full;
  let raf = 0, t0 = 0, finished = false;

  function frame(now) {
    if (!t0) t0 = now;
    try {
      const f = timeline(now - t0);
      draw(Math.max(0, f.s), f.r, f.fo, f.so);
      if (f.end) return finish(false);
    } catch (_) {
      return finish(true); // nunca deixar a hero presa no escuro
    }
    raf = requestAnimationFrame(frame);
  }

  function finish(skipped) {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    removeSkipListeners();
    window.removeEventListener("resize", onResize);
    ready();
    if (skipped) {
      intro.classList.add("is-leaving");
      setTimeout(() => intro.remove(), 220);
    } else {
      intro.remove();
    }
  }

  // Qualquer gesto pula a abertura. Nunca travamos a rolagem.
  const SKIP_EVENTS = ["pointerdown", "wheel", "touchmove", "keydown", "scroll"];
  const skip = () => finish(true);
  function removeSkipListeners() { SKIP_EVENTS.forEach(ev => window.removeEventListener(ev, skip, { passive: true })); }
  SKIP_EVENTS.forEach(ev => window.addEventListener(ev, skip, { passive: true }));

  function onResize() { measure(); }
  window.addEventListener("resize", onResize);

  measure();
  draw(0, 0, 1, 1);
  intro.classList.add("is-drawing");
  media.start();
  raf = requestAnimationFrame(frame);

  SS.intro = { skip };
  }
})();
