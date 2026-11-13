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
  const order = ["inicio", "joalheria", "servicos", "depoimentos", "historia", "contato"].map(id => html.indexOf(`id="${id}"`));
  assert.ok(order.every(i => i > 0), "falta alguma seção");
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test("nenhuma afirmação proibida", () => {
  for (const page of [html, read("joalheria.html"), read("js/catalog.js"), read("js/data.js")]) {
    assert.doesNotMatch(page, /feit[ao]s? à mão|cravação à mão|925|18k|desde 19/i);
  }
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
  const hero = html.slice(html.indexOf('id="inicio"'), html.indexOf('id="joalheria"'));
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

/* ---------- Revisão das animações ---------- */
const rule = (file, selector) => {
  const src = css(file);
  const i = src.indexOf(selector + " {");
  assert.ok(i >= 0, `falta a regra ${selector} em ${file}`);
  return src.slice(i, src.indexOf("}", i));
};

test("peças só ganham nome de transição durante a troca de filtro", () => {
  // Nomeadas o tempo todo, as 23 peças eram capturadas na abertura da peça e pintavam por cima do diálogo.
  assert.doesNotMatch(js("catalog.js"), /style="view-transition-name/);
});

test("filtro mostra as peças na hora, sem esperar a entrada da rolagem", () => {
  assert.match(css("catalog.css"), /\.grid\.is-settled \.item \{[^}]*opacity: 1[^}]*transition: none/);
  assert.match(js("catalog.js"), /classList\.add\("is-settled"\)/);
});

test("link de pular conteúdo (teclado) aparece sem animação", () => {
  assert.doesNotMatch(rule("base.css", ".skip"), /transition/);
});

test("brilho do logo anda por transform, não por background-position", () => {
  assert.doesNotMatch(css("hero.css"), /background-position/);
  assert.match(css("hero.css"), /\.intro\.logo-on \.intro-sweep::before \{[^}]*transition: transform/);
});

test("menu e fundo do diálogo entram em fade, sem corte seco", () => {
  assert.match(css("base.css"), /\.menu\[open\], \.menu\[open\]::backdrop \{ animation: fade-in/);
  // Transição (não animation): tirar .no-enter depois da View Transition não pode reiniciar o fade.
  assert.match(css("catalog.css"), /\.piece\[open\]::backdrop \{[^}]*transition: opacity/);
  assert.match(css("catalog.css"), /@starting-style \{ \.piece\[open\]::backdrop \{ opacity: 0/);
});

test("botões de toque têm resposta ao apertar", () => {
  assert.match(css("base.css"), /:is\(\.btn, \.filter, \.icon-btn, \.menu-btn, \.thumb\):active \{ transform: scale\(0\.97\)/);
});

test("abrir diálogo não muda a largura da tela (senão a View Transition é abortada)", () => {
  // Com barra de rolagem fixa (Windows), overflow: hidden tirava a barra, mudava a largura e o Chrome abortava a transição.
  assert.match(css("base.css"), /html \{[^}]*scrollbar-gutter: stable/);
});

test("foto da peça começa a voar no toque (curva de gaveta)", () => {
  assert.match(css("tokens.css"), /--ease-drawer: cubic-bezier\(0\.32, 0\.72, 0, 1\);/);
  assert.match(css("catalog.css"), /::view-transition-group\(piece-photo\) \{ animation-duration: 460ms; animation-timing-function: var\(--ease-drawer\); \}/);
});

test("movimento reduzido mantém os fades curtos do catálogo", () => {
  const src = js("catalog.js");
  assert.doesNotMatch(src, /reduced\(\) \|\| !img\.animate/);
  assert.match(src, /if \(!img\.animate\) return swap\(\);/);
  assert.match(src, /if \(reduced\(\)\) return void transition\(update\);/);
});

test("rolagem dos links do menu no computador dura 1 s", () => {
  assert.match(js("ui.js"), /lenis\.scrollTo\(target, \{ duration: 1\.0 \}\)/);
});

/* ---------- Auditoria impeccable ---------- */
test("imagens em WebP: nenhum PNG referenciado nem sobrando em img/", () => {
  const all = html + ["base.css", "hero.css", "catalog.css", "sections.css", "tokens.css"].map(css).join("") +
    ["lib.js", "ui.js", "catalog.js", "intro.js", "data.js"].map(js).join("");
  assert.doesNotMatch(all, /\.png\b/);
  assert.deepEqual(fs.readdirSync(path.join(ROOT, "img")).filter(f => f.endsWith(".png")), []);
});

test("vídeo da hero em paisagem leve (até 1,6 MB)", () => {
  assert.ok(fs.statSync(path.join(ROOT, "media/hero-landscape.mp4")).size <= 1.6e6);
});

test("rótulos em maiúsculas com pelo menos 12 px", () => {
  assert.match(rule("base.css", ".tag"), /font-size: 12px/);
  assert.match(rule("catalog.css", ".plate .chip"), /font-size: 12px/);
});

test("texto corrido sem palavra sozinha na última linha", () => {
  assert.match(css("base.css"), /\np \{ text-wrap: pretty; \}/);
});

test("link de crédito com 44 px de toque sem mexer no layout", () => {
  const r = rule("base.css", ".credit");
  assert.match(r, /padding-block: 11px/);
  assert.match(r, /margin-block: -11px/);
});

/* ---------- Joalheria ---------- */
const joia = read("joalheria.html");

test("joalheria: página própria com busca, filtros e grade completa", () => {
  assert.match(joia, /<meta name="robots" content="noindex, nofollow">/);
  assert.equal((joia.match(/<h1[\s>]/g) || []).length, 1);
  assert.match(joia, /<input type="search" id="busca"/);
  assert.match(joia, /id="filters"/);
  assert.match(joia, /id="grid" data-list="joalheria"/);
  assert.match(joia, /id="vazio" hidden/);
  assert.match(joia, /<dialog class="piece" id="piece"/);
  assert.doesNotMatch(joia, /js\/intro\.js|class="hero/);
  const order = ["js/lib.js", "js/config.js", "js/data.js", "js/ui.js", "js/catalog.js"].map(s => joia.indexOf(`src="${s}"`));
  assert.ok(order.every(i => i > 0), "falta algum script");
  assert.deepEqual([...order].sort((a, b) => a - b), order);
});

test("joalheria: menu leva às seções da home e marca a página atual", () => {
  for (const id of ["historia", "servicos", "depoimentos", "contato"]) assert.match(joia, new RegExp(`href="index\\.html#${id}"`));
  assert.match(joia, /<a href="joalheria\.html" aria-current="page">Joalheria<\/a>/);
  assert.doesNotMatch(joia, /<a [^>]*href="#(?!conteudo)/);
});

test("home: seleção de fotos e link para a joalheria", () => {
  assert.match(html, /id="grid" data-list="destaques"/);
  assert.match(html, /href="joalheria\.html"/);
  assert.doesNotMatch(html, /id="filters"/);
  assert.equal((html.match(/>Joalheria</g) || []).length, 2);
});

test("serviços reais, sem banho, só ouro e prata", () => {
  for (const s of ["Produção de joias", "Reparo de joias", "Ajuste de joias", "Limpeza de joias", "Lapidação"]) {
    assert.match(html, new RegExp(`data-name="${s}"`));
  }
  assert.match(html, /só com ouro e prata\. Não fazemos banho\./);
  const svc = html.slice(html.indexOf('id="servicos"'), html.indexOf('class="process"'));
  assert.doesNotMatch(svc, /Exemplo/);
});

test("pedido de peça pede metal; gema vai sem metal", () => {
  const c = read("js/catalog.js");
  assert.match(c, /name="metal" value="Prata"/);
  assert.match(c, /name="metal" value="Ouro"/);
  assert.match(c, /name="pedra"/);
  assert.match(c, /if \(i\.t === "gemas"\) return msg\.gem/);
  assert.match(read("js/ui.js"), /SS\.catalog\.orderMessage\(el\)/);
});
