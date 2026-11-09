/* Funções puras do site. No navegador ficam em SS.lib; no Node, em module.exports (testes). */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else (root.SS = root.SS || {}).lib = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const SEEN_KEY = "ss-intro-seen";
  const INTRO_MEMORY_MS = 7 * 24 * 60 * 60 * 1000;

  const fmt = n => String(n).replace(".", ",");

  /* "7x7 Ø1.75/16" → [{ qty: 1, label: "7 × 7 mm" }, { qty: 16, label: "Ø 1,75 mm" }] */
  function stones(spec) {
    if (!spec) return [];
    return spec.replace(/Ø\s+/g, "Ø").split(/\s+/).filter(Boolean).map(tok => {
      const [dim, q] = tok.split("/");
      const qty = q ? parseInt(q, 10) : 1;
      const round = dim.startsWith("Ø");
      const size = dim.replace("Ø", "");
      const label = round ? `Ø ${fmt(size)} mm` : `${size.split("x").map(fmt).join(" × ")} mm`;
      return { qty, label };
    });
  }

  const waUrl = (number, text) => `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

  const msg = {
    general: () => "Olá! Vi o site e queria saber mais sobre as peças.",
    piece: code => `Olá! Tenho interesse na peça ${code}.`,
    service: name => `Olá! Queria um orçamento de ${name.toLowerCase()}.`,
    ian: () => "Oi, Ian! Vi o site da Silver Schuffner e quero um site também."
  };

  function introMode({ reduced, hasHash, seenAt, now }) {
    if (reduced || hasHash) return "none";
    if (seenAt == null || now - seenAt > INTRO_MEMORY_MS) return "full";
    return "short";
  }

  function readSeen(storage) {
    try {
      const v = storage && storage.getItem(SEEN_KEY);
      const n = v == null ? NaN : Number(v);
      return Number.isFinite(n) ? n : null;
    } catch (_) {
      return null;
    }
  }

  function markSeen(storage, now) {
    try { if (storage) storage.setItem(SEEN_KEY, String(now)); } catch (_) { /* aba anônima ou bloqueio */ }
  }

  const pieceImage = (piece, i) => `img/${piece.c}_${i}.png`;

  return { fmt, stones, waUrl, msg, introMode, readSeen, markSeen, INTRO_MEMORY_MS, pieceImage };
});
