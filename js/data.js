/*
 * Catálogo. Fotos em img/<código>_<n>.webp (n = 1..v).
 * c: código do molde · n: nome sugerido · t: tipo · w: peso (g)
 * s: pedras na notação do catálogo · v: nº de variações de cor · h: variação da foto de destaque
 */
(function (root) {
  const SS = (root.SS = root.SS || {});
  SS.TYPES = { aneis: "Anéis", brincos: "Brincos", colares: "Colares" };
  SS.PIECES = [
    { c: "0414", n: "Anel Princesa",          t: "aneis",   w: "3.2", s: "6x6 Ø1.5/4 2.5x3x4/2", v: 4, h: 1 },
    { c: "1244", n: "Brinco Oval Halo",       t: "brincos", w: "2.2", s: "5x7 Ø1.5/24",          v: 4, h: 3 },
    { c: "5582", n: "Colar Coração",          t: "colares", w: "1.4", s: "6x6 Ø1.25/19",         v: 3, h: 2 },
    { c: "0413", n: "Anel Imperial",          t: "aneis",   w: "9.3", s: "7x7 Ø1.75/16",         v: 4, h: 4 },
    { c: "5572", n: "Argola Olho Grego",      t: "brincos", w: "4.2", s: "Ø3.0/2 Ø1.5/12",       v: 4, h: 1 },
    { c: "5567", n: "Anel Coração",           t: "aneis",   w: "3.2", s: "Ø1.5/17",              v: 3, h: 2 },
    { c: "0001", n: "Anel Flor",              t: "aneis",   w: "2.8", s: "Ø3 Ø2.75/3",           v: 4, h: 3 },
    { c: "5577", n: "Colar Olho Grego",       t: "colares", w: "1.8", s: "Ø2.0 Ø1.25/6 Ø1.0/50", v: 3, h: 2 },
    { c: "5561", n: "Anel Infinito",          t: "aneis",   w: "2.0", s: "Ø1.25/10",             v: 3, h: 1 },
    { c: "0004", n: "Anel Triângulo",         t: "aneis",   w: "4.1", s: "3x5 Ø1/9",             v: 4, h: 1 },
    { c: "0011", n: "Anel Duo",               t: "aneis",   w: "2.4", s: "Ø4 Ø2",                v: 4, h: 4 },
    { c: "0014", n: "Anel Margarida",         t: "aneis",   w: "2.8", s: "Ø3 Ø1.5/4",            v: 4, h: 1 },
    { c: "0409", n: "Anel Oval",              t: "aneis",   w: "2.1", s: "4x6 Ø1.5/2",           v: 4, h: 3 },
    { c: "3029", n: "Anel Trançado",          t: "aneis",   w: "2.6", s: "",                     v: 1, h: 1 },
    { c: "5563", n: "Anel Três Gotas",        t: "aneis",   w: "2.7", s: "5x7/1 5x7/2",          v: 3, h: 2 },
    { c: "5571", n: "Anel Olho Grego",        t: "aneis",   w: "3.5", s: "Ø3.0 Ø1.75/26",        v: 3, h: 2 },
    { c: "1252", n: "Brinco Gota",            t: "brincos", w: "1.9", s: "4x6/2 Ø1.75/2",        v: 4, h: 3 },
    { c: "1258", n: "Brinco Coração",         t: "brincos", w: "2.4", s: "4x6/2 Ø1.5/2",         v: 4, h: 4 },
    { c: "0416", n: "Argola Cravejada",       t: "brincos", w: "6.0", s: "Ø1.0/36",              v: 1, h: 1 },
    { c: "0420", n: "Brinco Pérola",          t: "brincos", w: "2.6", s: "Ø7/2",                 v: 1, h: 1 },
    { c: "0424", n: "Brinco Zigue-Zague",     t: "brincos", w: "3.9", s: "Ø1.25/8 Ø1/4",         v: 1, h: 1 },
    { c: "5574", n: "Argolinha Olho Grego",   t: "brincos", w: "2.9", s: "Ø3.0/2 Ø1.25/32",      v: 3, h: 3 },
    { c: "5579", n: "Gargantilha Olho Grego", t: "colares", w: "2.5", s: "Ø4.0 Ø2.5/16 Ø1.5/11", v: 3, h: 2 }
  ];
})(window);
