const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const raizTrabalho = path.join(__dirname, '..', '..');
const mdPath = path.join(raizTrabalho, 'Relatorio_F113_TrabalhoDigital.md');
const pdfPath = path.join(raizTrabalho, 'Relatorio_F113_TrabalhoDigital.pdf');
const htmlPath = path.join(raizTrabalho, 'Relatorio_F113_TrabalhoDigital.html');
const imgDir = path.join(__dirname, '..', 'auditoria', 'imagens');
const lhPath = path.join(__dirname, '..', 'auditoria', 'resultados', 'resumo-lighthouse.json');

function lerJson(arquivo) {
  const txt = fs.readFileSync(arquivo, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(txt);
}

const diagramas = {
  'DIAGRAMA-CI': () => `
<div class="diagrama">
  <div class="diag-titulo">Pipeline CI/CD — Trabalho+</div>
  <div class="diag-linha">
    <div class="diag-box">Push / PR<br><small>branch main</small></div>
    <div class="diag-seta">→</div>
    <div class="diag-box destaque">GitHub Actions<br><small>ubuntu-latest</small></div>
    <div class="diag-seta">→</div>
    <div class="diag-box">npm ci</div>
    <div class="diag-seta">→</div>
    <div class="diag-box">npm run lint</div>
    <div class="diag-seta">→</div>
    <div class="diag-box">npm test</div>
  </div>
  <div class="diag-linha centro">
    <div class="diag-seta-baixo">↓ sucesso</div>
    <div class="diag-box destaque">GitHub Pages<br><small>deploy automático</small></div>
    <div class="diag-seta">→</div>
    <div class="diag-box">Site publicado<br><small>trabalho-mais</small></div>
  </div>
  <p class="diag-nota">Rollback: reverter o commit problemático na main e fazer push — o Pages republica a versão anterior.</p>
</div>`,

  'DIAGRAMA-MONITOR': () => `
<div class="diagrama">
  <div class="diag-titulo">Plano de monitoramento pós-lançamento (a implementar)</div>
  <div class="diag-linha centro">
    <div class="diag-box">Usuário</div>
    <div class="diag-seta">→</div>
    <div class="diag-box destaque">Site no ar<br><small>GitHub Pages</small></div>
  </div>
  <div class="diag-linha centro">
    <div class="diag-col">
      <div class="diag-seta-baixo">↓</div>
      <div class="diag-box">Google Analytics 4<br><small>visitas, cadastros, buscas</small></div>
    </div>
    <div class="diag-col">
      <div class="diag-seta-baixo">↓</div>
      <div class="diag-box">UptimeRobot<br><small>site fora do ar</small></div>
    </div>
    <div class="diag-col">
      <div class="diag-seta-baixo">↓</div>
      <div class="diag-box">Alertas manuais<br><small>LCP &gt; 2,5 s · erros de login</small></div>
    </div>
  </div>
  <p class="diag-nota">Ferramentas ainda não instaladas — protótipo acadêmico. O plano está documentado para a fase com usuários reais.</p>
</div>`,

  'GRAFICO-CARGA': () => {
    const resDir = path.join(__dirname, '..', 'auditoria', 'resultados');
    const antes = lerJson(path.join(resDir, 'carga-antes.txt'));
    const depois = lerJson(path.join(resDir, 'carga-final.txt'));
    const maxRef = Math.max(antes.maxMs, depois.maxMs, antes.mediaMs, depois.mediaMs) * 1.2;
    const barra = (valor, cor) => {
      const pct = Math.max(4, Math.round((valor / maxRef) * 100));
      return `<div class="barra-wrap"><div class="barra" style="width:${pct}%;background:${cor}"></div><span>${valor} ms</span></div>`;
    };
    return `
<div class="grafico">
  <div class="diag-titulo">Teste de carga — 20 requisições à página inicial</div>
  <table class="grafico-tabela">
    <tr><th>Métrica</th><th>Rascunho</th><th>Versão final</th><th>Variação</th></tr>
    <tr><td>Tempo médio</td><td>${antes.mediaMs} ms</td><td><strong>${depois.mediaMs} ms</strong></td><td>−${(antes.mediaMs - depois.mediaMs).toFixed(2)} ms</td></tr>
    <tr><td>Tempo mínimo</td><td>${antes.minMs} ms</td><td><strong>${depois.minMs} ms</strong></td><td>+${(depois.minMs - antes.minMs).toFixed(2)} ms</td></tr>
    <tr><td>Tempo máximo</td><td>${antes.maxMs} ms</td><td><strong>${depois.maxMs} ms</strong></td><td>−${(antes.maxMs - depois.maxMs).toFixed(2)} ms</td></tr>
  </table>
  <p><strong>Tempo máximo por requisição</strong> (menor pico = mais estável)</p>
  <p class="graf-leg">Rascunho ${barra(antes.maxMs, '#c62828')}</p>
  <p class="graf-leg">Final ${barra(depois.maxMs, '#1a5f2a')}</p>
  <p class="diag-nota">Ferramenta: script medir-carga.js (20 GET consecutivos). A diferença principal de performance percebida pelo usuário está no LCP (seção 2.1).</p>
</div>`;
  },

  'GRAFICO-METRICAS': () => {
    const lh = lerJson(lhPath);
    const a11yAntes = lh.rascunhoInicial[0].accessibility;
    const a11yDepois = lh.versaoFinal[0].accessibility;
    const lcpAntes = 2.0;
    const lcpDepois = 0.9;
    const barra = (valor, max, cor) => {
      const pct = Math.round((valor / max) * 100);
      return `<div class="barra-wrap"><div class="barra" style="width:${pct}%;background:${cor}"></div><span>${valor}</span></div>`;
    };
    return `
<div class="grafico">
  <div class="diag-titulo">Evolução das métricas medidas (página inicial)</div>
  <table class="grafico-tabela">
    <tr><th>Métrica</th><th>Rascunho</th><th>Versão final</th><th>Variação</th></tr>
    <tr><td>Acessibilidade (Lighthouse)</td><td>${a11yAntes}</td><td><strong>${a11yDepois}</strong></td><td>+${a11yDepois - a11yAntes} pts</td></tr>
    <tr><td>LCP (s)</td><td>${lcpAntes}</td><td><strong>${lcpDepois}</strong></td><td>−${(lcpAntes - lcpDepois).toFixed(1)} s</td></tr>
    <tr><td>Performance (Lighthouse)</td><td>${lh.rascunhoInicial[0].performance}</td><td><strong>${lh.versaoFinal[0].performance}</strong></td><td>+${lh.versaoFinal[0].performance - lh.rascunhoInicial[0].performance} pts</td></tr>
  </table>
  <p><strong>Acessibilidade</strong> (escala 0–100)</p>
  <p class="graf-leg">Antes ${barra(a11yAntes, 100, '#c62828')}</p>
  <p class="graf-leg">Depois ${barra(a11yDepois, 100, '#1a5f2a')}</p>
  <p><strong>LCP — Largest Contentful Paint</strong> (segundos; menor é melhor)</p>
  <p class="graf-leg">Antes ${barra(lcpAntes, 2.5, '#c62828')}</p>
  <p class="graf-leg">Depois ${barra(lcpDepois, 2.5, '#1a5f2a')}</p>
</div>`;
  },
};

const ordemImagens = [
  { arquivo: '01-home-final.png', legenda: 'Página inicial (versão final)' },
  { arquivo: '14-rodape-flutuando-antes.png', legenda: 'Login com rodapé flutuando no meio (antes da correção)' },
  { arquivo: '02-login-final.png', legenda: 'Login com rodapé fixo no final da tela (depois)' },
  { arquivo: '03-login-erro-final.png', legenda: 'Erro de login inline, sem alert()' },
  { arquivo: '04-vagas-final.png', legenda: 'Listagem de vagas' },
  { arquivo: '05-vagas-filtro-final.png', legenda: 'Filtro de vagas em tempo real' },
  { arquivo: '06-home-antes.png', legenda: 'Rascunho inicial — página inicial (antes das correções)' },
  { arquivo: '07-login-antes.png', legenda: 'Rascunho inicial — login' },
  { arquivo: '08-lighthouse-antes.png', legenda: 'Scores Lighthouse do rascunho' },
  { arquivo: '09-lighthouse-final.png', legenda: 'Scores Lighthouse da versão final' },
  { arquivo: '10-terminal-testes.png', legenda: 'Saída do npm test' },
  { arquivo: '11-terminal-eslint.png', legenda: 'Saída do npm run lint' },
  { arquivo: '12-github-actions.png', legenda: 'Pipeline CI/CD no GitHub Actions' },
  { arquivo: '13-site-publicado.png', legenda: 'Site publicado no GitHub Pages' },
];

function mdParaHtml(md) {
  const linhas = md.split(/\r?\n/);
  const saida = [];
  let emCode = false;
  let codeBuf = [];
  let emTabela = false;
  let tabelaBuf = [];

  const flushCode = () => {
    if (!codeBuf.length) return;
    saida.push(`<pre><code>${codeBuf.join('\n').replace(/</g, '&lt;')}</code></pre>`);
    codeBuf = [];
    emCode = false;
  };

  const flushTabela = () => {
    if (!tabelaBuf.length) return;
    const rows = tabelaBuf.filter((l) => !/^\|[\s\-:|]+\|$/.test(l));
    const htmlRows = rows.map((linha, i) => {
      const cols = linha.split('|').slice(1, -1).map((c) => c.trim());
      const tag = i === 0 ? 'th' : 'td';
      return `<tr>${cols.map((c) => `<${tag}>${inline(c)}</${tag}>`).join('')}</tr>`;
    });
    saida.push(`<table>${htmlRows.join('')}</table>`);
    tabelaBuf = [];
    emTabela = false;
  };

  const inline = (t) => t
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  for (const linha of linhas) {
    if (linha.startsWith('```')) {
      if (emCode) flushCode();
      else emCode = true;
      continue;
    }
    if (emCode) { codeBuf.push(linha); continue; }

    if (linha.trim().startsWith('|')) {
      emTabela = true;
      tabelaBuf.push(linha);
      continue;
    }
    if (emTabela) flushTabela();

    if (linha.startsWith('# ')) { saida.push(`<h1>${inline(linha.slice(2))}</h1>`); continue; }
    if (linha.startsWith('## ')) { saida.push(`<h2>${inline(linha.slice(3))}</h2>`); continue; }
    if (linha.startsWith('### ')) { saida.push(`<h3>${inline(linha.slice(4))}</h3>`); continue; }
    if (linha.trim() === '---') { saida.push('<hr>'); continue; }

    const diag = linha.match(/^<!--\s*(\S+)\s*-->$/);
    if (diag && diagramas[diag[1]]) {
      flushTabela();
      saida.push(diagramas[diag[1]]());
      continue;
    }

    if (linha.startsWith('- ')) { saida.push(`<li>${inline(linha.slice(2))}</li>`); continue; }
    if (linha.trim() === '') { saida.push(''); continue; }
    saida.push(`<p>${inline(linha)}</p>`);
  }
  flushCode();
  flushTabela();

  return saida.join('\n').replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
}

function galeriaHtml() {
  if (!fs.existsSync(imgDir)) return '';
  return ordemImagens.map((item, i) => {
    const caminho = path.join(imgDir, item.arquivo);
    if (!fs.existsSync(caminho)) return '';
    const b64 = fs.readFileSync(caminho).toString('base64');
    const leg = `Fig ${i + 1} — ${item.legenda}`;
    return `<figure><img src="data:image/png;base64,${b64}" alt="${leg}"><figcaption>${leg}</figcaption></figure>`;
  }).filter(Boolean).join('\n');
}

function tabelaLh() {
  const lh = lerJson(lhPath);
  const r = (d) => `<tr><td>${d.label || ''}</td><td>${d.versao || ''}</td><td>${d.performance}</td><td><strong>${d.accessibility}</strong></td><td>${d.fcp}</td><td>${d.lcp}</td></tr>`;
  return `<table>
    <tr><th>Página</th><th>Versão</th><th>Performance</th><th>Acessibilidade</th><th>FCP</th><th>LCP</th></tr>
    ${r({ label: 'Início', versao: 'Rascunho', ...lh.rascunhoInicial[0] })}
    ${r({ label: 'Início', versao: 'Final', ...lh.versaoFinal[0] })}
    ${r({ label: 'Login', versao: 'Final', ...lh.versaoFinal[1] })}
    ${r({ label: 'Vagas', versao: 'Final', ...lh.versaoFinal[2] })}
  </table>
  <p><em>Medição Lighthouse em ${lh.geradoEm}</em></p>`;
}

async function main() {
  const md = fs.readFileSync(mdPath, 'utf8');
  const corpo = mdParaHtml(md);

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório F113 — Trabalho+</title>
<style>
  @page { margin: 20mm 15mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.55; color: #222; }
  h1 { color: #1a5f2a; font-size: 18pt; border-bottom: 2px solid #2e8b57; padding-bottom: 6px; margin-top: 24px; }
  h2 { color: #2e8b57; font-size: 14pt; margin-top: 22px; }
  h3 { color: #333; font-size: 12pt; }
  p, li { margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 10pt; }
  th, td { border: 1px solid #bbb; padding: 6px 8px; text-align: left; }
  th { background: #e8f5e9; }
  pre { background: #f4f4f4; padding: 10px; font-size: 9pt; white-space: pre-wrap; border-radius: 4px; }
  code { font-family: Consolas, monospace; font-size: 9pt; }
  a { color: #1a5f2a; }
  hr { border: none; border-top: 1px solid #ccc; margin: 20px 0; }
  figure { margin: 18px 0; text-align: center; page-break-inside: avoid; }
  figure img { max-width: 100%; border: 1px solid #ccc; border-radius: 4px; }
  figcaption { font-size: 9pt; color: #444; margin-top: 6px; }
  .diagrama, .grafico { border: 1px solid #ccc; border-radius: 8px; padding: 14px; margin: 16px 0; background: #fafafa; page-break-inside: avoid; }
  .diag-titulo { font-weight: 700; color: #1a5f2a; margin-bottom: 12px; text-align: center; font-size: 10.5pt; }
  .diag-linha { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px; margin: 8px 0; }
  .diag-linha.centro { justify-content: center; }
  .diag-box { background: #fff; border: 2px solid #2e8b57; border-radius: 6px; padding: 8px 12px; text-align: center; font-size: 9pt; min-width: 90px; }
  .diag-box.destaque { background: #e8f5e9; font-weight: 600; }
  .diag-box small { display: block; color: #555; font-weight: 400; margin-top: 2px; }
  .diag-seta { font-size: 14pt; color: #2e8b57; font-weight: 700; }
  .diag-seta-baixo { font-size: 12pt; color: #2e8b57; font-weight: 700; margin: 4px 0; }
  .diag-col { display: flex; flex-direction: column; align-items: center; margin: 0 10px; }
  .diag-nota { font-size: 8.5pt; color: #555; margin-top: 10px; font-style: italic; }
  .grafico-tabela { font-size: 9pt; }
  .graf-leg { margin: 4px 0; font-size: 9pt; }
  .barra-wrap { display: inline-flex; align-items: center; gap: 8px; width: 70%; vertical-align: middle; }
  .barra { height: 14px; border-radius: 3px; min-width: 2px; }
  .barra-wrap span { min-width: 36px; font-weight: 600; }
</style>
</head>
<body>
<h2>Medições Lighthouse</h2>
${tabelaLh()}
${corpo}
<hr>
<h1>Anexo — Capturas de tela</h1>
${galeriaHtml()}
</body>
</html>`;

  fs.writeFileSync(htmlPath, html, 'utf8');

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: '15mm', bottom: '15mm', left: '12mm', right: '12mm' },
  });
  await browser.close();
  console.log('PDF gerado:', pdfPath);
}

main().catch((e) => { console.error(e); process.exit(1); });
