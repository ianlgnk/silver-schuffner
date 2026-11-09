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

  const msg = {
    general: () => "Olá! Vi o site e queria saber mais sobre as peças.",
    piece: code => `Olá! Tenho interesse na peça ${code}.`,
    service: name => `Olá! Queria um orçamento de ${name.toLowerCase()}.`,
    ian: () => "Oi, Ian! Vi o site da Silver Schuffner e quero um site também."
  };

  /* O logo aparece em toda abertura. Link direto para uma seção (#catalogo) cai nela sem abertura;
   * com movimento reduzido, o logo entra num fade simples (modo "calm"). */
  function introMode({ reduced, hasHash }) {
    if (hasHash) return "none";
    return reduced ? "calm" : "full";
  }

  const pieceImage = (piece, i) => `img/${piece.c}_${i}.png`;

  return { fmt, stones, waUrl, msg, introMode, pieceImage };
});
