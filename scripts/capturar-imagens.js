const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const raiz = path.join(__dirname, '..');
const imgDir = path.join(raiz, 'auditoria', 'imagens');
const resDir = path.join(raiz, 'auditoria', 'resultados');
fs.mkdirSync(imgDir, { recursive: true });

const BASE_FINAL = process.env.BASE_FINAL || 'http://127.0.0.1:8080';
const BASE_ANTES = process.env.BASE_ANTES || 'http://127.0.0.1:8081';

function lerJson(arquivo) {
  return JSON.parse(fs.readFileSync(path.join(resDir, arquivo), 'utf8'));
}

function htmlLighthouse(titulo, dados) {
  const linhas = dados.map((d) => `
    <div class="card">
      <h3>${d.label}</h3>
      <div class="scores">
        <div class="score perf"><span>${d.performance}</span><small>Performance</small></div>
        <div class="score a11y"><span>${d.accessibility}</span><small>Acessibilidade</small></div>
      </div>
      <p>FCP: ${d.fcp} | LCP: ${d.lcp}</p>
    </div>`).join('');

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <style>
    body{font-family:Segoe UI,Arial;background:#f0f2f5;padding:24px;color:#222}
    h1{color:#1a5f2a;margin-bottom:20px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
    .card{background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.1)}
    .scores{display:flex;gap:12px;margin:12px 0}
    .score{flex:1;text-align:center;border-radius:50%;width:90px;height:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;font-size:1.6rem}
    .score small{font-size:.65rem;font-weight:600}
    .perf{background:#e8f5e9;color:#1b5e20}
    .a11y{background:#e3f2fd;color:#0d47a1}
    p{font-size:.9rem;color:#555}
  </style></head><body>
  <h1>${titulo}</h1><div class="grid">${linhas}</div>
  </body></html>`;
}

function htmlTerminal(titulo, texto) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{background:#1e1e1e;margin:0;padding:20px;font-family:Consolas,monospace}
    .janela{background:#2d2d2d;border-radius:8px;overflow:hidden;max-width:700px}
    .barra{background:#3c3c3c;color:#fff;padding:10px 14px;font-size:14px}
    pre{color:#d4d4d4;padding:16px;margin:0;font-size:13px;line-height:1.45;white-space:pre-wrap}
  </style></head><body>
  <div class="janela"><div class="barra">${titulo}</div><pre>${texto.replace(/</g, '&lt;')}</pre></div>
  </body></html>`;
}

async function printHtml(page, html, arquivo, largura = 900) {
  const tmp = path.join(imgDir, `_tmp_${arquivo}.html`);
  fs.writeFileSync(tmp, html, 'utf8');
  await page.goto(`file:///${tmp.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
  await page.setViewport({ width: largura, height: 800 });
  await page.screenshot({ path: path.join(imgDir, arquivo), fullPage: true });
  fs.unlinkSync(tmp);
}

async function capturar() {
  const resumo = lerJson('resumo-lighthouse.json');
  const testes = fs.readFileSync(path.join(resDir, 'testes.txt'), 'utf8');
  const eslint = fs.readFileSync(path.join(resDir, 'eslint.txt'), 'utf8');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Telas versão final
  await page.goto(`${BASE_FINAL}/`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(imgDir, '01-home-final.png'), fullPage: false });

  // Login limpo — página inteira para mostrar rodapé fixo embaixo
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`${BASE_FINAL}/login.html`, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 300));
  await page.screenshot({ path: path.join(imgDir, '02-login-final.png'), fullPage: true });

  await page.goto(`${BASE_FINAL}/login.html`, { waitUntil: 'networkidle0' });
  await page.type('#email', 'errado@email.com', { delay: 20 });
  await page.type('#senha', '000000', { delay: 20 });
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(imgDir, '03-login-erro-final.png'), fullPage: true });

  await page.goto(`${BASE_FINAL}/vagas.html`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(imgDir, '04-vagas-final.png'), fullPage: false });

  await page.type('#busca', 'recepção', { delay: 30 });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(imgDir, '05-vagas-filtro-final.png'), fullPage: false });

  // Rascunho inicial
  await page.goto(`${BASE_ANTES}/index.html`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(imgDir, '06-home-antes.png'), fullPage: false });

  await page.goto(`${BASE_ANTES}/login.html`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(imgDir, '07-login-antes.png'), fullPage: false });

  // Painéis Lighthouse com dados reais
  await printHtml(page, htmlLighthouse('Lighthouse — Rascunho inicial (medição real)', [
    { label: 'Início', ...resumo.rascunhoInicial[0] },
    { label: 'Login', ...resumo.rascunhoInicial[1] },
  ]), '08-lighthouse-antes.png');

  await printHtml(page, htmlLighthouse('Lighthouse — Versão final (medição real)', [
    { label: 'Início', ...resumo.versaoFinal[0] },
    { label: 'Login', ...resumo.versaoFinal[1] },
    { label: 'Vagas', ...resumo.versaoFinal[2] },
  ]), '09-lighthouse-final.png', 1000);

  // Terminal testes e eslint
  await printHtml(page, htmlTerminal('npm test — trabalho-mais', testes), '10-terminal-testes.png', 750);
  await printHtml(page, htmlTerminal('npm run lint — trabalho-mais', eslint || 'Sem erros.'), '11-terminal-eslint.png', 750);

  // GitHub Actions (repositório público)
  try {
    await page.goto('https://github.com/xdanielzdelfino/trabalho-mais/actions/runs/27022069876', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    await new Promise((r) => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(imgDir, '12-github-actions.png'), fullPage: false });
  } catch (e) {
    console.warn('GitHub screenshot falhou:', e.message);
  }

  // GitHub Pages
  try {
    await page.goto('https://xdanielzdelfino.github.io/trabalho-mais/', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    await page.screenshot({ path: path.join(imgDir, '13-site-publicado.png'), fullPage: false });
  } catch (e) {
    console.warn('Pages screenshot falhou:', e.message);
  }

  await browser.close();
  const lista = fs.readdirSync(imgDir).filter((f) => f.endsWith('.png'));
  console.log(`Capturas salvas em auditoria/imagens/ (${lista.length} arquivos)`);
  lista.forEach((f) => console.log(' -', f));
}

capturar().catch((err) => {
  console.error(err);
  process.exit(1);
});
