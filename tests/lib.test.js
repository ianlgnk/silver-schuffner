"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.join(__dirname, "..");
const { fmt, stones, waUrl, msg, introMode, readSeen, markSeen, INTRO_MEMORY_MS, pieceImage } = require("../js/lib.js");

function loadData() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "js/data.js"), "utf8"), ctx);
  // JSON tira os protótipos do outro contexto do vm, para o deepEqual estrito comparar só os valores
  return JSON.parse(JSON.stringify(ctx.window.SS));
}

test("stones converte a notação do catálogo", () => {
  assert.deepEqual(stones("7x7 Ø1.75/16"), [{ qty: 1, label: "7 × 7 mm" }, { qty: 16, label: "Ø 1,75 mm" }]);
  assert.deepEqual(stones("Ø3 Ø2.75/3"), [{ qty: 1, label: "Ø 3 mm" }, { qty: 3, label: "Ø 2,75 mm" }]);
  assert.deepEqual(stones("5x7/1 5x7/2"), [{ qty: 1, label: "5 × 7 mm" }, { qty: 2, label: "5 × 7 mm" }]);
  assert.deepEqual(stones(""), []);
});

test("fmt troca ponto por vírgula", () => {
  assert.equal(fmt("9.3"), "9,3");
  assert.equal(fmt(2), "2");
});

test("mensagens exatas", () => {
  assert.equal(msg.piece("0413"), "Olá! Tenho interesse na peça 0413.");
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

test("introMode", () => {
  const now = 1_000_000_000_000, day = 86_400_000;
  assert.equal(INTRO_MEMORY_MS, 7 * day);
  assert.equal(introMode({ reduced: true, hasHash: false, seenAt: null, now }), "none");
  assert.equal(introMode({ reduced: false, hasHash: true, seenAt: null, now }), "none");
  assert.equal(introMode({ reduced: false, hasHash: false, seenAt: null, now }), "full");
  assert.equal(introMode({ reduced: false, hasHash: false, seenAt: now - 2 * day, now }), "short");
  assert.equal(introMode({ reduced: false, hasHash: false, seenAt: now - 8 * day, now }), "full");
});

test("readSeen e markSeen guardam o momento", () => {
  const store = {};
  const mem = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  assert.equal(readSeen(mem), null);
  markSeen(mem, 12345);
  assert.equal(store["ss-intro-seen"], "12345");
  assert.equal(readSeen(mem), 12345);
});

test("storage que lança erro não quebra", () => {
  const bad = { getItem() { throw new Error("x"); }, setItem() { throw new Error("x"); } };
  assert.equal(readSeen(bad), null);
  assert.doesNotThrow(() => markSeen(bad, 1));
  assert.equal(readSeen(null), null);
});

test("pieceImage monta o caminho", () => {
  assert.equal(pieceImage({ c: "0413" }, 4), "img/0413_4.png");
});

test("dados: 23 peças, tipos e imagens existentes", () => {
  const SS = loadData();
  assert.deepEqual(SS.TYPES, { aneis: "Anéis", brincos: "Brincos", colares: "Colares" });
  assert.equal(SS.PIECES.length, 23);
  const count = t => SS.PIECES.filter(p => p.t === t).length;
  assert.equal(count("aneis"), 12);
  assert.equal(count("brincos"), 8);
  assert.equal(count("colares"), 3);
  for (const p of SS.PIECES) {
    assert.ok(p.h >= 1 && p.h <= p.v, `${p.c}: destaque ${p.h} fora de 1..${p.v}`);
    for (let i = 1; i <= p.v; i++) {
      assert.ok(fs.existsSync(path.join(ROOT, `img/${p.c}_${i}.png`)), `falta img/${p.c}_${i}.png`);
    }
  }
});
