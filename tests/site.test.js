"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const exists = f => fs.existsSync(path.join(ROOT, f));
const html = read("index.html");

test("noindex, robots e sem CNAME", () => {
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(read("robots.txt"), /Disallow: \//);
  assert.equal(exists("CNAME"), false);
  assert.equal(exists(".nojekyll"), true);
});

test("restos da prévia removidos", () => {
  assert.doesNotMatch(html, /Prévia do site|Dar minha opinião|class="ribbon"|id="fab"|data-palette|data-view=/);
});

test("toda âncora interna tem destino", () => {
  const ids = [...html.matchAll(/href="#([\w-]+)"/g)].map(m => m[1]);
  assert.ok(ids.length > 0);
  for (const id of ids) assert.match(html, new RegExp(`id="${id}"`), `âncora #${id} sem destino`);
});

test("seções na ordem", () => {
  const order = ["inicio", "catalogo", "historia", "servicos", "depoimentos", "contato"].map(id => html.indexOf(`id="${id}"`));
  assert.ok(order.every(i => i > 0), "falta alguma seção");
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test("nenhuma afirmação proibida", () => {
  assert.doesNotMatch(html, /feit[ao]s? à mão|cravação à mão|925|18k|desde 19/i);
});

test("CDN com versão fixa", () => {
  const srcs = [...html.matchAll(/(?:src|href)="(https:\/\/cdn\.[^"]+)"/g)].map(m => m[1]);
  for (const src of srcs) assert.match(src, /@\d+\.\d+\.\d+\//, `sem versão fixa: ${src}`);
});

test("um único h1", () => {
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1);
});

test("crédito do Ian leva ao WhatsApp dele com a mensagem", () => {
  assert.match(html, /href="https:\/\/wa\.me\/5533988429751\?text=Oi%2C%20Ian!%20Vi%20o%20site%20da%20Silver%20Schuffner%20e%20quero%20um%20site%20tamb%C3%A9m\."/);
});

test("scripts na ordem e sem módulos (abre por duplo clique)", () => {
  const order = ["js/lib.js", "js/config.js", "js/data.js", "js/ui.js", "js/catalog.js", "js/intro.js"].map(s => html.indexOf(`src="${s}"`));
  assert.ok(order.every(i => i > 0), "falta algum script");
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.doesNotMatch(html, /type="module"/);
});

test("modo da abertura decidido no head, antes da primeira pintura", () => {
  const head = html.slice(0, html.indexOf("</head>"));
  assert.match(head, /<script src="js\/lib\.js"><\/script>/, "lib.js síncrono no head");
  assert.match(head, /SS\.lib\.introMode\(/);
  assert.match(head, /setAttribute\("data-intro"/);
  assert.ok(head.indexOf('src="js/lib.js"') < head.indexOf("SS.lib.introMode("));
});

test("camada da abertura dentro da hero", () => {
  const hero = html.slice(html.indexOf('id="inicio"'), html.indexOf('id="catalogo"'));
  assert.match(hero, /class="intro"[^>]*aria-hidden="true"/);
  assert.match(hero, /<canvas class="intro-canvas"/);
  assert.match(hero, /class="intro-logo"/);
});

const css = f => read(`css/${f}`);
const js = f => read(`js/${f}`);

test("diálogos não deixam o Lenis travar a roda do mouse", () => {
  assert.match(html, /<dialog class="menu" id="menu"[^>]*data-lenis-prevent/);
  assert.match(html, /<dialog class="piece" id="piece"[^>]*data-lenis-prevent/);
});

test("conteúdo só fica escondido para animar quando o script das entradas rodou", () => {
  assert.doesNotMatch(css("base.css"), /html\.js :is\(\.section-head|html\.js \.section :is\(\.h2|html\.js \.story-/);
  assert.match(css("base.css"), /html\.reveals :is\(\.section-head/);
  assert.match(js("ui.js"), /classList\.add\("reveals"\)/);
});

test("Lenis carregado sob demanda, só com mouse", () => {
  assert.doesNotMatch(html, /lenis(\.min)?\.(js|css)/);
  assert.match(js("ui.js"), /https:\/\/cdn\.jsdelivr\.net\/npm\/lenis@1\.3\.26\/dist\/lenis\.min\.js/);
});

test("topo e botão fixo ficam acima das peças na troca de filtro", () => {
  assert.match(css("catalog.css"), /\.vt-filter \.topbar \{[^}]*view-transition-name: topbar/);
  assert.match(js("catalog.js"), /classList\.add\("vt-filter"\)/);
});

test("abertura sem memória de visita (logo toda vez)", () => {
  const head = html.slice(0, html.indexOf("</head>"));
  assert.doesNotMatch(head, /localStorage|readSeen|seenAt/);
  assert.doesNotMatch(js("intro.js"), /markSeen|localStorage|short/);
  assert.match(js("intro.js"), /calm/);
  assert.match(css("hero.css"), /html\[data-intro="calm"\] \.intro/);
});
