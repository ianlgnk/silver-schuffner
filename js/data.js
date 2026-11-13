/*
 * Joalheria: peças fotografadas pelo ateliê (Instagram) e modelos do catálogo de moldes.
 *
 * SS.PHOTOS — peças reais. Fotos em img/ig/<foto>.webp (4:5).
 *   id: identificador · n: nome · t: tipo · g: pedras · m: metal da foto (vazio se não informado)
 *   p: fotos (a primeira é a capa) · ig: código do post no Instagram · f: 1 = aparece na home
 *   A seleção da home (f: 1) é provisória até o ateliê escolher as peças.
 *
 * SS.PIECES — modelos do catálogo de moldes. Fotos em img/<código>_<n>.webp (n = 1..v).
 *   c: código do molde · n: nome sugerido · t: tipo · w: peso (g)
 *   s: pedras na notação do catálogo · v: nº de variações de cor · h: variação da foto de destaque
 */
(function (root) {
  const SS = (root.SS = root.SS || {});
  SS.TYPES = {
    aneis: "Anéis", aliancas: "Alianças", brincos: "Brincos", colares: "Colares",
    pingentes: "Pingentes", conjuntos: "Conjuntos", gemas: "Gemas"
  };
  const ESCOLHA = "Pedras à escolha";
  SS.PHOTOS = [
    { id: "aneis-citrino",         n: "Anéis de citrino",                       t: "aneis",     g: "Citrino",                    m: "Prata", p: ["aneis-citrino"], ig: "DWWleQFlTIS", f: 1 },
    { id: "anel-esmeralda",        n: "Anel de esmeralda",                      t: "aneis",     g: "Esmeralda",                  m: "Prata", p: ["anel-esmeralda"], ig: "DUrhMWqjJwG", f: 1 },
    { id: "colares-perolas",       n: "Colares de pérolas",                     t: "colares",   g: "Pérolas de água doce",       m: "",      p: ["colares-perolas"], ig: "DaLIhe8h269", f: 1 },
    { id: "pingente-opala",        n: "Pingente de opala",                      t: "pingentes", g: "Opala",                      m: "Prata", p: ["pingente-opala-1", "pingente-opala-2"], ig: "DWFnL6gF7aR", f: 1 },
    { id: "conjunto-ametista",     n: "Brincos e pingente de ametista",         t: "conjuntos", g: "Ametista",                   m: "Prata", p: ["conjunto-ametista"], ig: "DUrgZLoDBHh", f: 1 },
    { id: "aliancas-diamantadas",  n: "Alianças diamantadas",                   t: "aliancas",  g: "",                           m: "Prata", p: ["aliancas-diamantadas"], ig: "DZs6UtOMQRf", f: 1 },
    { id: "anel-topazio-azul",     n: "Anel de topázio azul",                   t: "aneis",     g: "Topázio azul",               m: "Prata", p: ["anel-topazio-azul"], ig: "DUrgvVIjA4w", f: 1 },
    { id: "aneis-turmalina",       n: "Anéis de turmalina, opala e esmeralda",  t: "aneis",     g: "Turmalina, opala e esmeralda", m: "Prata", p: ["aneis-turmalina-opala-esmeralda"], ig: "DWWkhDYFZqn", f: 1 },
    { id: "aneis-granada",         n: "Anéis de granada",                       t: "aneis",     g: "Granada",                    m: "Prata", p: ["aneis-granada"], ig: "DWWl2GIFdyk" },
    { id: "aneis-encomendas",      n: "Anéis sob encomenda",                    t: "aneis",     g: ESCOLHA,                      m: "Prata", p: ["aneis-encomendas"], ig: "DYATfTUkXKC" },
    { id: "anel-ouro-branco",      n: "Anel em ouro branco",                    t: "aneis",     g: "Diamante de laboratório",    m: "Ouro branco", p: ["anel-ouro-branco"], ig: "DfFuTaoGsjo" },
    { id: "aliancas-solitario",    n: "Alianças com solitário",                 t: "aliancas",  g: "",                           m: "",      p: ["aliancas-solitario-1", "aliancas-solitario-2"], ig: "DZs5v2OmsRZ" },
    { id: "aliancas-namoro",       n: "Alianças de namoro",                     t: "aliancas",  g: "",                           m: "",      p: ["aliancas-namoro"], ig: "DeZ8E7FmnDu" },
    { id: "conjunto-esmeralda",    n: "Brincos e pingente de esmeralda",        t: "conjuntos", g: "Esmeralda",                  m: "Prata", p: ["conjunto-esmeralda"], ig: "DUrhMWqjJwG" },
    { id: "conjunto-topazio",      n: "Brincos e pingente de topázio azul",     t: "conjuntos", g: "Topázio azul",               m: "Prata", p: ["conjunto-topazio"], ig: "DUrgvVIjA4w" },
    { id: "conjunto-topazio-gota", n: "Conjunto de topázio em gota",            t: "conjuntos", g: "Topázio",                    m: "Prata", p: ["conjunto-topazio-gota-1", "conjunto-topazio-gota-2"], ig: "DZf1uUxGks3" },
    { id: "conjunto-anel-pingente", n: "Anel e pingente",                       t: "conjuntos", g: ESCOLHA,                      m: "",      p: ["conjunto-anel-pingente"], ig: "DZf1TFusijq" },
    { id: "conjuntos-encomenda",   n: "Conjuntos de brincos e pingente",        t: "conjuntos", g: ESCOLHA,                      m: "Prata", p: ["conjuntos-encomenda-1", "conjuntos-encomenda-2", "conjuntos-encomenda-3", "conjuntos-encomenda-4"], ig: "DZf0ypLGgpT" },
    { id: "pingente-apatita",      n: "Pingente de apatita",                    t: "pingentes", g: "Apatita",                    m: "Prata", p: ["pingente-apatita"], ig: "DYAS_RmkTfv" },
    { id: "pingente-topazio",      n: "Pingente de topázio com corrente",       t: "pingentes", g: "Topázio",                    m: "Prata", p: ["pingente-topazio-masculino"], ig: "DYAT1i5EYro" },
    { id: "colares-perolas-pingente", n: "Colares de pérolas com pingente",     t: "colares",   g: "Pérolas de água doce e pedras naturais", m: "", p: ["colares-perolas-pingente"], ig: "DaLIDCWJGen" },
    { id: "fios-perolas",          n: "Fios de pérolas",                        t: "colares",   g: "Pérolas de água doce",       m: "",      p: ["fios-perolas"], ig: "DZs5we5O0ht" },
    { id: "gema-topazio-azul",     n: "Topázio azul em gota",                   t: "gemas",     g: "Topázio azul",               m: "",      p: ["gema-topazio-azul"], ig: "DaD-DPKms6i" },
    { id: "gema-turmalina-rosa",   n: "Turmalina rosa em gota",                 t: "gemas",     g: "Turmalina rosa",             m: "",      p: ["gema-turmalina-rosa"], ig: "DaD9RrDGr1I" },
    { id: "gema-cristal",          n: "Cristal em gota",                        t: "gemas",     g: "Cristal",                    m: "",      p: ["gema-cristal"], ig: "DaD9wbpmnRV" },
    { id: "gema-ametrino",         n: "Ametrino",                               t: "gemas",     g: "Ametrino",                   m: "",      p: ["gema-ametrino"], ig: "DWFoyECl61o" }
  ];
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
