/* ---------- Entradas calmas ----------
 * Bloco independente e primeiro do arquivo: se algo abaixo falhar, as seções
 * continuam aparecendo. O CSS só esconde o conteúdo sob html.reveals.
 */
(function () {
  "use strict";
  if (!("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("reveals");
  const REVEAL = ".section .h2, .section .display-2, .section-head .lede, .story-text .lede, .contact .lede, .contact .btn-lg, .filters, .fine, .process-head, .svc, .chapter, .step, .quote, .contact-item, .item, .story-figure";
  // Depois de todos os scripts (as peças do catálogo são criadas pelo catalog.js).
  document.addEventListener("DOMContentLoaded", () => {
    const GROUPS = ".svc-list, .chapters, .steps, .quote-list, .contact-list, .grid";
    const io = new IntersectionObserver(entries => {
      // Cascata pela ordem de chegada: quem entra junto (uma linha da grade, uma lista)
      // sai com 70 ms entre si, seja qual for o número de colunas.
      let k = 0;
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        if (el.parentElement && el.parentElement.matches(GROUPS)) el.style.transitionDelay = `${Math.min(k++, 3) * 70}ms`;
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.15 });
    document.querySelectorAll(REVEAL).forEach(el => io.observe(el));
  });
})();

/* Interface geral: WhatsApp, aviso, configuração, menu, rolagem, topo, mídia da hero. */
(function () {
  "use strict";
  const SS = (window.SS = window.SS || {});
  const { msg, waUrl, waNumber } = SS.lib;
  const CONFIG = window.SS_CONFIG || {};
  const number = waNumber("geral", CONFIG);
  const insta = String(CONFIG.instagram || "").replace(/^@/, "").trim();
  const LENIS_SRC = "https://cdn.jsdelivr.net/npm/lenis@1.3.26/dist/lenis.min.js";

  /* ---------- Aviso ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = 0;
  function toast(html) {
    // Um diálogo modal fica na camada superior e torna o resto inerte:
    // o aviso precisa morar dentro dele para ser visto e anunciado.
    const host = document.querySelector("dialog[open]") || document.body;
    if (toastEl.parentNode !== host) {
      // Um nó movido nasce sem estilo anterior e a transição de entrada não roda;
      // ler o layout depois de mover fixa o estado escondido como ponto de partida.
      toastEl.classList.remove("is-on");
      host.append(toastEl);
      void toastEl.offsetWidth;
    }
    toastEl.innerHTML = html;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 5200);
  }
  // Ao fechar um diálogo, o aviso volta para a página.
  document.querySelectorAll("dialog").forEach(d => d.addEventListener("close", () => {
    if (toastEl.parentNode === d) document.body.append(toastEl);
  }));
  const escapeHtml = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- WhatsApp ---------- */
  function openWhatsApp(text, kind = "geral") {
    const to = waNumber(kind, CONFIG);
    if (!to) {
      toast(`O WhatsApp do ateliê entra aqui no lançamento. A mensagem será: <b>“${escapeHtml(text)}”</b>`);
      return;
    }
    window.open(waUrl(to, text), "_blank", "noopener");
  }
  function messageFor(el) {
    const kind = el.dataset.wa;
    // Pedido de peça ou gema: a mensagem sai do detalhe aberto (metal e pedra escolhidos ali).
    if ((kind === "peca" || kind === "gema") && SS.catalog) return SS.catalog.orderMessage(el);
    if (kind === "servico") return msg.service(el.dataset.name);
    return msg.general();
  }
  document.addEventListener("click", e => {
    const el = e.target.closest("[data-wa]");
    if (!el) return;
    e.preventDefault();
    const text = messageFor(el);
    if (text) openWhatsApp(text, el.dataset.wa); // sem texto: falta uma escolha, e quem pediu já avisou
  });

  /* ---------- Contato a partir da configuração ---------- */
  function formatPhone(n) {
    const local = n.startsWith("55") ? n.slice(2) : n;
    const m = local.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    return m ? `(${m[1]}) ${m[2]}-${m[3]}` : `+${n}`;
  }
  const cWa = document.getElementById("c-whatsapp");
  if (number && cWa) {
    cWa.classList.remove("pending");
    cWa.innerHTML = `<a href="${waUrl(number, msg.general())}" target="_blank" rel="noopener">${formatPhone(number)}</a>`;
  }
  const cIg = document.getElementById("c-instagram");
  if (insta && cIg) {
    cIg.classList.remove("pending");
    cIg.innerHTML = `<a href="https://instagram.com/${encodeURIComponent(insta)}" target="_blank" rel="noopener">@${escapeHtml(insta)}</a>`;
  }

  /* ---------- Menu (celular) ---------- */
  const menu = document.getElementById("menu");
  const menuBtn = document.getElementById("menu-btn");
  function closeMenu() { if (menu.open) menu.close(); }
  menuBtn.addEventListener("click", () => {
    menu.showModal();
    menuBtn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("has-modal");
    document.dispatchEvent(new Event("ss:modal-open"));
  });
  menu.addEventListener("close", () => {
    menuBtn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("has-modal");
    document.dispatchEvent(new Event("ss:modal-close"));
    menuBtn.focus({ preventScroll: true });
  });
  menu.addEventListener("click", e => {
    if (e.target.closest("[data-close-menu]")) return closeMenu();
    const link = e.target.closest("a[href^='#']");
    if (link) {
      e.preventDefault();
      closeMenu();
      scrollToHash(link.getAttribute("href"));
    }
  });

  /* ---------- Rolagem: suave no computador (Lenis, carregado sob demanda), nativa no celular ---------- */
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  let lenis = null;
  let modalOpen = false;
  document.addEventListener("ss:modal-open", () => { modalOpen = true; if (lenis) lenis.stop(); });
  document.addEventListener("ss:modal-close", () => { modalOpen = false; if (lenis) lenis.start(); });
  if (finePointer && !reducedMotion) {
    const s = document.createElement("script");
    s.src = LENIS_SRC;
    s.async = true;
    s.onload = () => {
      try {
        lenis = new window.Lenis({ lerp: 0.1 });
        if (modalOpen) lenis.stop();
        const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
      } catch (_) {
        lenis = null; // sem rolagem suave, o resto segue igual
      }
    };
    document.head.append(s);
  }
  const topbar = document.getElementById("topo");
  function scrollToHash(hash) {
    const target = hash === "#inicio" ? document.body : document.querySelector(hash);
    if (!target) return;
    // Sem offset: o Lenis e o scrollIntoView já descontam o topo fixo pelo scroll-padding-top
    // do CSS (somar a altura do topo aqui fazia a seção parar ~75 px abaixo do lugar).
    if (lenis) lenis.scrollTo(target, { duration: 1.0 });
    else if (hash === "#inicio") window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    else target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", hash);
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href^='#']");
    if (!a || a.closest("#menu") || a.classList.contains("skip")) return;
    const hash = a.getAttribute("href");
    if (hash.length < 2 || !document.querySelector(hash)) return;
    e.preventDefault();
    scrollToHash(hash);
  });

  /* ---------- Topo sólido, botão fixo e seção ativa ---------- */
  const heroEnd = document.getElementById("hero-end");
  const waFloat = document.querySelector(".wa-float");
  const contato = document.getElementById("contato");
  // Página sem hero (joalheria): topo sólido e botão fixo desde o início.
  let pastHero = !heroEnd, atContact = false;
  const syncChrome = () => {
    topbar.classList.toggle("is-solid", pastHero);
    waFloat.classList.toggle("is-on", pastHero && !atContact);
  };
  syncChrome();
  if ("IntersectionObserver" in window && heroEnd && contato) {
    new IntersectionObserver(([en]) => {
      pastHero = !en.isIntersecting && en.boundingClientRect.top < topbar.offsetHeight;
      syncChrome();
    }, { rootMargin: `-${topbar.offsetHeight}px 0px 0px 0px` }).observe(heroEnd);
    new IntersectionObserver(([en]) => { atContact = en.isIntersecting; syncChrome(); }, { threshold: 0.15 }).observe(contato);

    // Seção ativa no menu do topo (a faixa do meio da tela decide).
    const navLinks = [...document.querySelectorAll(".nav a")];
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        navLinks.forEach(a => {
          if (a.getAttribute("href") === `#${en.target.id}`) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main > section[id]").forEach(s => spy.observe(s));
  }

  /* ---------- Mídia da hero: vídeo quando dá, poster quando não ---------- */
  const hero = document.querySelector(".hero");
  const heroMedia = {
    video: hero && hero.querySelector(".hero-video"),
    poster: hero && hero.querySelector(".hero-poster"),
    started: false,
    start() {
      if (this.started || !hero) return;
      this.started = true;
      const { video, poster } = this;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const saveData = !!(navigator.connection && navigator.connection.saveData);
      const drift = () => { if (!reduced) poster.classList.add("is-drift"); };
      if (reduced) return;
      if (saveData) return drift();
      // Celular em pé recebe o vídeo vertical da cravação; o resto, o corte em paisagem.
      video.src = matchMedia("(orientation: portrait)").matches ? "media/hero-portrait.mp4" : "media/hero-landscape.mp4";
      video.addEventListener("playing", () => hero.classList.add("has-video"), { once: true });
      video.addEventListener("error", drift, { once: true });
      const p = video.play();
      if (p && p.catch) p.catch(drift);
      // Fora da tela, o vídeo pausa (bateria e CPU do celular).
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
          if (!hero.classList.contains("has-video")) return;
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        }).observe(hero);
      }
    }
  };

  SS.ui = { toast, openWhatsApp, scrollToHash, closeMenu, heroMedia };
})();
