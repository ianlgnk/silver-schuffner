"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const lib = require("../js/lib.js");
const { waUrl, waNumber, msg, introMode, photoImage, igUrl, matches } = lib;

function loadData() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8"), ctx);
  // JSON tira os protótipos do outro contexto do vm, para o deepEqual estrito comparar só os valores
  return JSON.parse(JSON.stringify(ctx.window.SS));
}

test("mensagens exatas", () => {
  assert.equal(msg.piece({ name: "Anel Imperial", code: "0413", metal: "Ouro", stone: "Esmeralda" }),
    "Olá! Tenho interesse na peça Anel Imperial (código 0413), em ouro, com esmeralda.");
  assert.equal(msg.piece({ name: "Anel de citrino", metal: "Prata", stone: "  " }), "Olá! Tenho interesse na peça Anel de citrino, em prata.");
  assert.equal(msg.gem("Turmalina rosa em gota"), "Olá! Tenho interesse na gema turmalina rosa em gota.");
  assert.equal(msg.service("Peças sob encomenda"), "Olá! Queria um orçamento de peças sob encomenda.");
  assert.equal(msg.general(), "Olá! Vi o site e queria saber mais sobre as peças.");
  assert.equal(msg.ian(), "Oi, Ian! Vi o site da Silver Schuffner e quero um site também.");
});

test("waUrl codifica o texto", () => {
  assert.equal(
    waUrl("5533988429751", "Olá! Tenho interesse na peça 0413."),
    "https://wa.me/5533988429751?text=Ol%C3%A1!%20Tenho%20interesse%20na%20pe%C3%A7a%200413."
  );
});

test("introMode: o logo aparece em toda abertura", () => {
  assert.equal(introMode({ reduced: false, hasHash: false }), "full");
  assert.equal(introMode({ reduced: true, hasHash: false }), "calm");
  // Link direto para uma seção cai nela, sem abertura por cima.
  assert.equal(introMode({ reduced: false, hasHash: true }), "none");
  assert.equal(introMode({ reduced: true, hasHash: true }), "none");
});

test("sem memória de visita: nada de versão curta nem armazenamento", () => {
  assert.equal(lib.readSeen, undefined);
  assert.equal(lib.markSeen, undefined);
  assert.equal(lib.INTRO_MEMORY_MS, undefined);
});

test("dados: tipos da joalheria", () => {
  const SS = loadData();
  assert.deepEqual(Object.keys(SS.TYPES), ["aneis", "aliancas", "colares", "pingentes", "conjuntos", "gemas"]);
  assert.equal(SS.PIECES, undefined, "os moldes moram no PDF, não nos dados");
});

test("fotos do ateliê: tipos válidos, imagens existentes e 8 na home", () => {
  const SS = loadData();
  const ids = new Set();
  for (const p of SS.PHOTOS) {
    assert.ok(SS.TYPES[p.t], `${p.id}: tipo ${p.t} desconhecido`);
    assert.ok(!ids.has(p.id), `${p.id} repetido`); ids.add(p.id);
    assert.ok(p.p.length >= 1, `${p.id}: sem foto`);
    for (const f of p.p) assert.ok(fs.existsSync(path.join(ROOT, photoImage(f))), `falta ${photoImage(f)}`);
    assert.match(p.ig, /^[\w-]+$/);
  }
  assert.equal(SS.PHOTOS.filter(p => p.f).length, 8);
  for (const t of Object.keys(SS.TYPES)) {
    const n = SS.PHOTOS.filter(p => p.t === t).length;
    assert.ok(n > 0, `tipo ${t} sem peças`);
  }
});

test("caminhos das fotos e do Instagram", () => {
  assert.equal(photoImage("anel-esmeralda"), "img/ig/anel-esmeralda.webp");
  assert.equal(igUrl("DUrhMWqjJwG"), "https://www.instagram.com/p/DUrhMWqjJwG/");
});

test("busca ignora acento e maiúscula e exige todas as palavras", () => {
  assert.ok(matches("Anel de topázio azul Prata", "topazio"));
  assert.ok(matches("Anel de topázio azul Prata", "ANEL azul"));
  assert.ok(!matches("Anel de topázio azul Prata", "anel ouro"));
  assert.ok(matches("qualquer coisa", "   "));
});

test("waNumber: gemas vão para a Thayna, o resto e a falta dela para o Esteves", () => {
  const cfg = { whatsapp: "+55 (33) 98455-9979", whatsappGemas: "5533911112222" };
  assert.equal(waNumber("gema", cfg), "5533911112222");
  assert.equal(waNumber("peca", cfg), "5533984559979");
  assert.equal(waNumber("geral", cfg), "5533984559979");
  assert.equal(waNumber("gema", { whatsapp: "5533984559979", whatsappGemas: "" }), "5533984559979");
  assert.equal(waNumber("geral", {}), "");
});
