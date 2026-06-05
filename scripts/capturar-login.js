const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const imgDir = path.join(__dirname, '..', 'auditoria', 'imagens');
const BASE = process.env.BASE_FINAL || 'http://127.0.0.1:8080';

const htmlRodapeFlutuando = `<!DOCTYPE html><html lang="pt-BR"><head>
<meta charset="UTF-8"><title>Login</title>
<link rel="stylesheet" href="${BASE}/css/estilo.css">
<style>
  body { min-height: 100vh; display: block; }
  main { flex: none; }
  .rodape { margin-top: 0; }
</style></head><body>
<header class="topo"><div class="container">
  <a href="#" class="marca">Trabalho<span>+</span></a>
  <nav><a href="#">Início</a><a href="#">Vagas</a><a href="#">Entrar</a></nav>
</div></header>
<main class="container bloco">
  <form class="formulario"><h1>Entrar na conta</h1>
  <label class="rotulo">E-mail</label><input class="campo" type="email">
  <label class="rotulo">Senha</label><input class="campo" type="password">
  <button type="button" class="botao">Entrar</button></form>
</main>
<footer class="rodape"><div class="container">
  <p>Trabalho+ — Trabalho de Transformação Digital | Daniel Leite Delfino | ODS 8</p>
</div></footer></body></html>`;

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  if (!(await page.$('.rodape'))) throw new Error('Rodape nao encontrado em login.html');
  await page.screenshot({ path: path.join(imgDir, '02-login-final.png'), fullPage: true });
  console.log('02-login-final.png — rodape fixo no final');

  await page.goto(`${BASE}/login.html`, { waitUntil: 'networkidle0' });
  await page.type('#email', 'errado@email.com', { delay: 15 });
  await page.type('#senha', '000000', { delay: 15 });
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(imgDir, '03-login-erro-final.png'), fullPage: true });
  console.log('03-login-erro-final.png — rodape visivel');

  const tmp = path.join(imgDir, '_tmp_rodape_antes.html');
  fs.writeFileSync(tmp, htmlRodapeFlutuando, 'utf8');
  await page.goto(`file:///${tmp.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(imgDir, '14-rodape-flutuando-antes.png'), fullPage: false });
  fs.unlinkSync(tmp);
  console.log('14-rodape-flutuando-antes.png — rodape no meio');

  await browser.close();
})();
