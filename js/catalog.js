/* Catálogo: filtros, grade e detalhe da peça. */
(function () {
  "use strict";
  const SS = window.SS;
  const { stones, fmt, pieceImage } = SS.lib;
  const PIECES = SS.PIECES;
  const TYPES = SS.TYPES;
  const SINGULAR = { aneis: "Anel", brincos: "Brinco", colares: "Colar" };
  const byCode = Object.fromEntries(PIECES.map(p => [p.c, p]));

  const grid = document.getElementById("grid");
  const filtersEl = document.getElementById("filters");
  const dialog = document.getElementById("piece");
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canTransition = () => typeof document.startViewTransition === "function" && !reduced();
  // View Transition com as promessas tratadas: uma transição pulada (cliques rápidos,
  // aba em segundo plano) rejeita `ready`, e isso não pode virar erro no console.
  function transition(update) {
    const t = document.startViewTransition(update);
    t.ready.catch(() => {});
    t.finished.catch(() => {});
    return t;
  }

  /* ---------- Filtros ---------- */
  let filter = "todos";
  const counts = { todos: PIECES.length };
  PIECES.forEach(p => { counts[p.t] = (counts[p.t] || 0) + 1; });
  filtersEl.innerHTML = [["todos", "Todos"], ...Object.entries(TYPES)].map(([k, label]) =>
    `<button type="button" class="filter" data-filter="${k}" aria-pressed="${k === filter}">${label}<span class="n">${counts[k] || 0}</span></button>`
  ).join("");

  /* ---------- Grade ---------- */
  grid.innerHTML = PIECES.map(p => `
    <button type="button" class="item" data-code="${p.c}" data-type="${p.t}" aria-label="${p.n}, código ${p.c}">
      <span class="plate">
        <img src="${pieceImage(p, p.h)}" alt="" loading="lazy" decoding="async">
        ${p.v > 1 ? `<span class="chip">${p.v} cores</span>` : ""}
      </span>
      <span>
        <span class="item-name">${p.n}</span>
        <span class="item-meta">Cód. ${p.c} · ${fmt(p.w)} g</span>
      </span>
    </button>`).join("");

  function applyFilter() {
    filtersEl.querySelectorAll("[data-filter]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
    grid.querySelectorAll(".item").forEach(el => { el.hidden = filter !== "todos" && el.dataset.type !== filter; });
    // Depois do primeiro filtro, as peças ficam visíveis de vez: a troca já tem a sua animação,
    // e peças que a rolagem ainda não tinha revelado não podem chegar invisíveis.
    grid.classList.add("is-settled");
  }
  // Nome de transição só durante a troca de filtro. Nomeadas o tempo todo, as peças eram
  // capturadas também na abertura da peça e pintavam por cima do diálogo.
  const nameItems = on => grid.querySelectorAll(".item").forEach(el => {
    el.style.viewTransitionName = on ? `p-${el.dataset.code}` : "";
  });
  let filterRun = 0;
  function setFilter(type) {
    if (type === filter || !(type === "todos" || TYPES[type])) return;
    filter = type;
    if (typeof document.startViewTransition !== "function") return applyFilter();
    // Movimento reduzido: só um fade da página; sem nomes, nenhuma peça voa.
    if (reduced()) return void transition(applyFilter);
    const root = document.documentElement;
    const run = ++filterRun;
    root.classList.add("vt-filter");
    nameItems(true);
    transition(applyFilter).finished.catch(() => {}).then(() => {
      if (run !== filterRun) return; // cliques rápidos: quem limpa é a troca mais nova
      root.classList.remove("vt-filter");
      nameItems(false);
    });
  }
  filtersEl.addEventListener("click", e => {
    const b = e.target.closest("[data-filter]");
    if (b) setFilter(b.dataset.filter);
  });

  /* ---------- Detalhe ---------- */
  let opener = null;

  function detailHTML(p) {
    const st = stones(p.s);
    const thumbs = p.v > 1
      ? `<div class="thumbs">${Array.from({ length: p.v }, (_, k) =>
          `<button type="button" class="thumb" data-variant="${k + 1}" aria-pressed="${k + 1 === p.h}" aria-label="Variação ${k + 1}"><img src="${pieceImage(p, k + 1)}" alt=""></button>`).join("")}</div>`
      : "";
    const stoneList = st.length
      ? `<ul>${st.map(s => `<li><span class="q">${s.qty}×</span>${s.label}</li>`).join("")}</ul>`
      : "Sem pedras";
    return `
      <div class="piece-in">
        <div class="piece-stage">
          <img class="piece-photo" src="${pieceImage(p, p.h)}" alt="${p.n}, variação ${p.h}">
          ${thumbs}
        </div>
        <div class="piece-info">
          <div class="piece-head">
            <h3 id="piece-title">${p.n}</h3>
            <button type="button" class="icon-btn" data-close-piece aria-label="Fechar"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button>
          </div>
          <dl class="specs">
            <dt>Tipo</dt><dd>${SINGULAR[p.t]}</dd>
            <dt>Código</dt><dd>${p.c}</dd>
            <dt>Peso aprox.</dt><dd>${fmt(p.w)} g</dd>
            <dt>Pedras</dt><dd>${stoneList}</dd>
          </dl>
          <p class="piece-note">Peso sujeito à variação de acordo com o tamanho do aro.</p>
          <button type="button" class="btn btn-lg" data-wa="peca" data-code="${p.c}"><svg class="icon" aria-hidden="true"><use href="#i-wa"/></svg>Tenho interesse nesta peça</button>
        </div>
      </div>`;
  }

  function open(code) {
    const p = byCode[code];
    if (!p || dialog.open) return;
    opener = grid.querySelector(`.item[data-code="${code}"]`);
    const fromImg = opener && opener.querySelector(".plate img");
    const show = () => {
      if (fromImg) fromImg.style.viewTransitionName = "";
      // Troca só o miolo: o aviso (toast) pode estar morando dentro do diálogo.
      const old = dialog.querySelector(".piece-in");
      if (old) old.remove();
      dialog.insertAdjacentHTML("afterbegin", detailHTML(p));
      dialog.showModal();
      document.documentElement.classList.add("has-modal");
      document.dispatchEvent(new Event("ss:modal-open"));
      dialog.querySelector("[data-close-piece]").focus();
    };
    if (canTransition() && fromImg) {
      dialog.classList.add("no-enter");
      fromImg.style.viewTransitionName = "piece-photo";
      const t = transition(() => {
        show();
        dialog.querySelector(".piece-photo").style.viewTransitionName = "piece-photo";
      });
      t.finished.catch(() => {}).then(() => {
        const ph = dialog.querySelector(".piece-photo");
        if (ph) ph.style.viewTransitionName = "";
        dialog.classList.remove("no-enter");
      });
    } else {
      dialog.classList.remove("no-enter");
      show();
    }
  }

  function close() {
    if (!dialog.open) return;
    const toImg = opener && opener.querySelector(".plate img");
    const ph = dialog.querySelector(".piece-photo");
    const hide = () => {
      if (ph) ph.style.viewTransitionName = "";
      dialog.close();
      const inner = dialog.querySelector(".piece-in");
      if (inner) inner.remove();
      document.documentElement.classList.remove("has-modal");
      document.dispatchEvent(new Event("ss:modal-close"));
      if (opener) opener.focus({ preventScroll: true });
    };
    const visible = toImg && toImg.getBoundingClientRect().bottom > 0 && toImg.getBoundingClientRect().top < innerHeight;
    if (canTransition() && ph && visible) {
      ph.style.viewTransitionName = "piece-photo";
      const t = transition(() => { hide(); toImg.style.viewTransitionName = "piece-photo"; });
      t.finished.catch(() => {}).then(() => { toImg.style.viewTransitionName = ""; });
    } else {
      hide();
    }
  }

  grid.addEventListener("click", e => {
    const item = e.target.closest(".item");
    if (item) open(item.dataset.code);
  });

  dialog.addEventListener("cancel", e => { e.preventDefault(); close(); });
  dialog.addEventListener("click", e => {
    if (e.target === dialog || e.target.closest("[data-close-piece]")) return close();
    const th = e.target.closest(".thumb");
    if (!th || th.getAttribute("aria-pressed") === "true") return;
    const p = byCode[dialog.querySelector("[data-code]").dataset.code];
    const img = dialog.querySelector(".piece-photo");
    const swap = () => {
      img.src = pieceImage(p, th.dataset.variant);
      img.alt = `${p.n}, variação ${th.dataset.variant}`;
    };
    dialog.querySelectorAll(".thumb").forEach(x => x.setAttribute("aria-pressed", String(x === th)));
    if (!img.animate) return swap(); // só opacidade: vale também com movimento reduzido
    // Interrompível: um toque novo parte da opacidade atual e só a última troca vale.
    const from = getComputedStyle(img).opacity;
    img.getAnimations().forEach(a => a.cancel());
    img.animate([{ opacity: from }, { opacity: 0 }], { duration: 90, easing: "ease-out", fill: "forwards" }).finished.then(() => {
      swap();
      img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: "ease-out", fill: "forwards" });
    }, () => {}); // cancelada (outro toque ou detalhe fechado no meio): nada a fazer
  });

  SS.catalog = { open, close, setFilter };
})();
