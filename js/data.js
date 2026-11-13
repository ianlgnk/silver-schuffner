/*
 * Joalheria: peças fotografadas pelo ateliê (Instagram). Os moldes para encomenda ficam
 * no PDF da seção Moldes (moldes/), não aqui.
 *
 * SS.PHOTOS — peças reais. Fotos em img/ig/<foto>.webp (4:5).
 *   id: identificador · n: nome · t: tipo · g: pedras · m: metal da foto (vazio se não informado)
 *   p: fotos (a primeira é a capa) · ig: código do post no Instagram · f: 1 = aparece na home
 *   A seleção da home (f: 1) é provisória até o ateliê escolher as peças.

 */
(function (root) {
  const SS = (root.SS = root.SS || {});
  SS.TYPES = {
    aneis: "Anéis", aliancas: "Alianças", colares: "Colares",
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
})(window);
