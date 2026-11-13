/* Funções puras do site. No navegador ficam em SS.lib; no Node, em module.exports (testes). */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else (root.SS = root.SS || {}).lib = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

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
  // Pedido de gema vai para quem cuida das gemas (Thayna); o resto, e a falta dela, para o Esteves.
  const digits = s => String(s || "").replace(/\D/g, "");
  const waNumber = (kind, cfg = {}) => (kind === "gema" && digits(cfg.whatsappGemas)) || digits(cfg.whatsapp);

  const lower = s => String(s || "").trim().toLowerCase();
  const msg = {
    general: () => "Olá! Vi o site e queria saber mais sobre as peças.",
    /* { name, code?, metal?, stone? } → "Olá! Tenho interesse na peça Anel Princesa (código 0414), em ouro, com esmeralda." */
    piece: ({ name, code, metal, stone }) =>
      `Olá! Tenho interesse na peça ${String(name).trim()}${code ? ` (código ${code})` : ""}` +
      `${lower(metal) ? `, em ${lower(metal)}` : ""}${lower(stone) ? `, com ${lower(stone)}` : ""}.`,
    gem: name => `Olá! Tenho interesse na gema ${lower(name)}.`,
    service: name => `Olá! Queria um orçamento de ${name.toLowerCase()}.`,
    ian: () => "Oi, Ian! Vi o site da Silver Schuffner e quero um site também."
  };

  /* Busca da joalheria: sem diferença de acento nem de maiúscula; todas as palavras precisam aparecer. */
  const fold = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  function matches(haystack, query) {
    const words = fold(query).split(/\s+/).filter(Boolean);
    const text = fold(haystack);
    return words.every(w => text.includes(w));
  }

  /* O logo aparece em toda abertura. Link direto para uma seção (#catalogo) cai nela sem abertura;
   * com movimento reduzido, o logo entra num fade simples (modo "calm"). */
  function introMode({ reduced, hasHash }) {
    if (hasHash) return "none";
    return reduced ? "calm" : "full";
  }

  const pieceImage = (piece, i) => `img/${piece.c}_${i}.webp`;
  const photoImage = name => `img/ig/${name}.webp`;
  const igUrl = code => `https://www.instagram.com/p/${code}/`;

  return { fmt, stones, waUrl, waNumber, msg, introMode, pieceImage, photoImage, igUrl, fold, matches };
});
