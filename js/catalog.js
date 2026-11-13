/* Joalheria: grade de peças do ateliê, filtros, busca e detalhe com o pedido (metal e pedra).
 * Na home (#grid[data-list="destaques"]) mostra só a seleção; na página da joalheria
 * (#grid[data-list="joalheria"]) mostra todas. Os moldes ficam no PDF da seção Moldes. */
(function () {
  "use strict";
  const SS = window.SS;
  const { photoImage, igUrl, matches, msg } = SS.lib;
  const TYPES = SS.TYPES;
  const SINGULAR = { aneis: "Anel", aliancas: "Aliança", brincos: "Brinco", colares: "Colar", pingentes: "Pingente", conjuntos: "Conjunto", gemas: "Gema" };
  const ESCOLHA = "Pedras à escolha";

  const grid = document.getElementById("grid");
  const dialog = document.getElementById("piece");
  if (!grid || !dialog) return;
  const isFull = grid.dataset.list === "joalheria";

  const all = SS.PHOTOS.map(p => ({ ...p, kind: "foto", key: `f-${p.id}`, v: p.p.length, h: 1 }));
  const byKey = Object.fromEntries(all.map(i => [i.key, i]));
  const imageOf = (i, n) => photoImage(i.p[n - 1]);
  const searchText = i => [i.n, TYPES[i.t], SINGULAR[i.t], i.g, i.m, "foto ateliê instagram"].join(" ");

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

  /* ---------- Grade ---------- */
  function itemHTML(i) {
    return `
    <button type="button" class="item" data-key="${i.key}" data-type="${i.t}" aria-label="${i.n}">
      <span class="plate is-photo">
        <img src="${imageOf(i, 1)}" alt="" loading="lazy" decoding="async">
        ${i.v > 1 ? `<span class="chip">${i.v} fotos</span>` : ""}
      </span>
      <span>
        <span class="item-name">${i.n}</span>
        <span class="item-meta">${SINGULAR[i.t]}${i.g ? ` · ${i.g}` : ""}</span>
      </span>
    </button>`;
  }

  if (isFull) {
    grid.innerHTML = `<div class="grid">${all.map(itemHTML).join("")}</div>`;
  } else {
    grid.innerHTML = all.filter(p => p.f).map(itemHTML).join("");
    // Quanto há na galeria completa, contado dos dados (não envelhece quando entra peça nova).
    const total = document.getElementById("total-pecas");
    if (total) { total.textContent = `${all.length} peças na galeria, de anéis a gemas`; total.hidden = false; }
  }

  /* ---------- Filtros e busca (só na página da joalheria) ---------- */
  const filtersEl = document.getElementById("filters");
  const searchEl = document.getElementById("busca");
  const emptyEl = document.getElementById("vazio");
  const countEl = document.getElementById("contagem");
  const params = new URLSearchParams(location.search);
  let filter = TYPES[params.get("tipo")] ? params.get("tipo") : "todos";
  let query = params.get("busca") || "";

  function syncUrl() {
    const p = new URLSearchParams();
    if (filter !== "todos") p.set("tipo", filter);
    if (query.trim()) p.set("busca", query.trim());
    const qs = p.toString();
    history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
  }

  function applyFilter() {
    if (!isFull) return;
    filtersEl.querySelectorAll("[data-filter]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
    let shown = 0;
    grid.querySelectorAll(".item").forEach(el => {
      const i = byKey[el.dataset.key];
      const ok = (filter === "todos" || i.t === filter) && matches(searchText(i), query);
      el.hidden = !ok;
      if (ok) shown++;
    });
    emptyEl.hidden = shown > 0;
    countEl.textContent = shown === 1 ? "1 peça" : `${shown} peças`;
    // Depois do primeiro filtro, as peças ficam visíveis de vez: a troca já tem a sua animação,
    // e peças que a rolagem ainda não tinha revelado não podem chegar invisíveis.
    grid.querySelectorAll(".grid").forEach(g => g.classList.add("is-settled"));
  }

  // Nome de transição só durante a troca de filtro. Nomeadas o tempo todo, as peças eram
  // capturadas também na abertura da peça e pintavam por cima do diálogo.
  const nameItems = on => grid.querySelectorAll(".item").forEach(el => {
    el.style.viewTransitionName = on ? `p-${el.dataset.key}` : "";
  });
  let filterRun = 0;
  function animate(update) {
    if (typeof document.startViewTransition !== "function") return update();
    // Movimento reduzido: só um fade da página; sem nomes, nenhuma peça voa.
    if (reduced()) return void transition(update);
    const root = document.documentElement;
    const run = ++filterRun;
    root.classList.add("vt-filter");
    nameItems(true);
    transition(update).finished.catch(() => {}).then(() => {
      if (run !== filterRun) return; // cliques rápidos: quem limpa é a troca mais nova
      root.classList.remove("vt-filter");
      nameItems(false);
    });
  }
  function setFilter(type) {
    if (!isFull || type === filter || !(type === "todos" || TYPES[type])) return;
    filter = type;
    syncUrl();
    animate(applyFilter);
  }

  if (isFull) {
    const counts = { todos: all.length };
    all.forEach(i => { counts[i.t] = (counts[i.t] || 0) + 1; });
    filtersEl.innerHTML = [["todos", "Todas"], ...Object.entries(TYPES)].filter(([k]) => counts[k]).map(([k, label]) =>
      `<button type="button" class="filter" data-filter="${k}" aria-pressed="${k === filter}">${label}<span class="n">${counts[k]}</span></button>`
    ).join("");
    filtersEl.addEventListener("click", e => {
      const b = e.target.closest("[data-filter]");
      if (b) setFilter(b.dataset.filter);
    });
    searchEl.value = query;
    let typing = 0;
    searchEl.addEventListener("input", () => {
      clearTimeout(typing);
      typing = setTimeout(() => { query = searchEl.value; syncUrl(); applyFilter(); }, 120);
    });
    searchEl.closest("form").addEventListener("submit", e => { e.preventDefault(); searchEl.blur(); });
    document.getElementById("limpar").addEventListener("click", () => {
      query = ""; filter = "todos"; searchEl.value = ""; syncUrl(); applyFilter(); searchEl.focus();
    });
    applyFilter();
  }

  /* ---------- Detalhe ---------- */
  let opener = null;

  function stageHTML(i) {
    const thumbs = i.v > 1
      ? `<div class="thumbs">${Array.from({ length: i.v }, (_, k) =>
          `<button type="button" class="thumb" data-variant="${k + 1}" aria-pressed="${k + 1 === i.h}" aria-label="Foto ${k + 1}"><img src="${imageOf(i, k + 1)}" alt=""></button>`).join("")}</div>`
      : "";
    return `
        <div class="piece-stage is-photo">
          <img class="piece-photo" src="${imageOf(i, i.h)}" alt="${i.n}${i.v > 1 ? `, foto ${i.h}` : ""}">
          ${i.v > 1 ? `
          <button type="button" class="stage-nav is-prev" data-step="-1" aria-label="Foto anterior"><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>
          <button type="button" class="stage-nav is-next" data-step="1" aria-label="Próxima foto"><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>` : ""}
          ${thumbs}
        </div>`;
  }

  function specsHTML(i) {
    return `
          <dl class="specs">
            <dt>Tipo</dt><dd>${SINGULAR[i.t]}</dd>
            ${i.g ? `<dt>${i.t === "gemas" ? "Gema" : "Pedras"}</dt><dd>${i.g}</dd>` : ""}
            ${i.m ? `<dt>Na foto</dt><dd>${i.m}</dd>` : ""}
          </dl>`;
  }

  function orderHTML(i) {
    if (i.t === "gemas") return "";
    const hasStone = !!i.g;
    const prefill = i.g && i.g !== ESCOLHA ? i.g : "";
    return `
          <fieldset class="order">
            <legend>Como você quer a sua?</legend>
            <div class="seg" role="radiogroup" aria-label="Metal">
              <label class="is-prata"><input type="radio" name="metal" value="Prata"><span>Prata</span></label>
              <label class="is-ouro"><input type="radio" name="metal" value="Ouro"><span>Ouro</span></label>
            </div>
            ${hasStone ? `<label class="field"><span>Pedra <small>opcional</small></span><input type="text" name="pedra" value="${prefill}" placeholder="Ex.: esmeralda, topázio azul" autocomplete="off" enterkeyhint="done"></label>` : ""}
          </fieldset>`;
  }

  function detailHTML(i) {
    const gem = i.t === "gemas";
    const note = gem ? "Gema disponível no ateliê para montar na sua joia." : "Foto de uma peça feita no ateliê. A sua é produzida sob encomenda, em prata ou ouro.";
    return `
      <div class="piece-in">
        <button type="button" class="icon-btn piece-close" data-close-piece aria-label="Fechar"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button>
        ${stageHTML(i)}
        <div class="piece-info">
          <h3 class="piece-title" id="piece-title">${i.n}</h3>
          ${specsHTML(i)}
          ${orderHTML(i)}
          <p class="piece-note">${note}</p>
          <div class="piece-actions">
            <button type="button" class="btn btn-lg" data-wa="${gem ? "gema" : "peca"}" data-key="${i.key}"><svg class="icon" aria-hidden="true"><use href="#i-wa"/></svg>${gem ? "Tenho interesse nesta gema" : "Pedir esta peça"}</button>
            ${i.ig ? `<a class="ig-link" href="${igUrl(i.ig)}" target="_blank" rel="noopener"><span>Ver no Instagram</span><svg class="icon" aria-hidden="true"><use href="#i-out"/></svg><span class="sr-only"> (abre em outra aba)</span></a>` : ""}
          </div>
        </div>
      </div>`;
  }

  /* Mensagem do WhatsApp a partir do detalhe aberto. Sem metal escolhido, avisa e não envia. */
  function orderMessage(el) {
    const i = byKey[el.dataset.key];
    if (!i) return msg.general();
    if (i.t === "gemas") return msg.gem(i.n);
    const order = dialog.querySelector(".order");
    const metal = order && order.querySelector("input[name=metal]:checked");
    if (!metal) {
      if (order) {
        order.classList.add("is-missing");
        order.querySelector("input[name=metal]").focus();
      }
      SS.ui.toast("Escolha <b>prata</b> ou <b>ouro</b> para a sua peça.");
      return null;
    }
    const pedra = order.querySelector("input[name=pedra]");
    return msg.piece({ name: i.n, metal: metal.value, stone: pedra ? pedra.value : "" });
  }

  function open(key) {
    const i = byKey[key];
    if (!i || dialog.open) return;
    opener = grid.querySelector(`.item[data-key="${key}"]`);
    const fromImg = opener && opener.querySelector(".plate img");
    const show = () => {
      if (fromImg) fromImg.style.viewTransitionName = "";
      // Troca só o miolo: o aviso (toast) pode estar morando dentro do diálogo.
      const old = dialog.querySelector(".piece-in");
      if (old) old.remove();
      dialog.insertAdjacentHTML("afterbegin", detailHTML(i));
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
    if (item) open(item.dataset.key);
  });

  dialog.addEventListener("cancel", e => { e.preventDefault(); close(); });
  dialog.addEventListener("change", e => {
    if (e.target.name === "metal") e.target.closest(".order").classList.remove("is-missing");
  });
  dialog.addEventListener("keydown", e => {
    if (e.key === "Enter" && e.target.name === "pedra") { e.preventDefault(); e.target.blur(); }
  });
  // Troca a foto do detalhe (miniatura, seta ou teclado). Interrompível: um toque novo parte
  // da opacidade atual e só a última troca vale.
  function showVariant(n) {
    const i = byKey[dialog.querySelector("[data-key]").dataset.key];
    if (!i || i.v < 2) return;
    const img = dialog.querySelector(".piece-photo");
    const swap = () => {
      img.src = imageOf(i, n);
      img.alt = `${i.n}, foto ${n}`;
    };
    dialog.querySelectorAll(".thumb").forEach(x => x.setAttribute("aria-pressed", String(Number(x.dataset.variant) === n)));
    if (!img.animate) return swap(); // só opacidade: vale também com movimento reduzido
    const from = getComputedStyle(img).opacity;
    img.getAnimations().forEach(a => a.cancel());
    img.animate([{ opacity: from }, { opacity: 0 }], { duration: 90, easing: "ease-out", fill: "forwards" }).finished.then(() => {
      swap();
      img.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: "ease-out", fill: "forwards" });
    }, () => {}); // cancelada (outro toque ou detalhe fechado no meio): nada a fazer
  }
  function stepVariant(step) {
    const thumbs = [...dialog.querySelectorAll(".thumb")];
    if (thumbs.length < 2) return;
    const at = thumbs.findIndex(x => x.getAttribute("aria-pressed") === "true");
    showVariant(((at + step + thumbs.length) % thumbs.length) + 1); // dá a volta nas pontas
  }
  dialog.addEventListener("click", e => {
    if (e.target === dialog || e.target.closest("[data-close-piece]")) return close();
    const nav = e.target.closest(".stage-nav");
    if (nav) return stepVariant(Number(nav.dataset.step));
    const th = e.target.closest(".thumb");
    if (th && th.getAttribute("aria-pressed") !== "true") showVariant(Number(th.dataset.variant));
  });
  // Setas do teclado passam as fotos, menos quando a pessoa está escrevendo a pedra.
  dialog.addEventListener("keydown", e => {
    if ((e.key !== "ArrowLeft" && e.key !== "ArrowRight") || e.target.matches("input[type=text], input[type=search]")) return;
    if (!dialog.querySelector(".stage-nav")) return;
    e.preventDefault();
    stepVariant(e.key === "ArrowLeft" ? -1 : 1);
  });

  SS.catalog = { open, close, setFilter, orderMessage };
})();
