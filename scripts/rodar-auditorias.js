const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const saida = path.join(raiz, 'auditoria', 'resultados');
fs.mkdirSync(saida, { recursive: true });

function lh(url, arquivo) {
  const dest = path.join(saida, arquivo);
  execSync(
    `npx lighthouse "${url}" --only-categories=accessibility,performance --output=json --output-path="${dest}" --chrome-flags="--headless" --quiet`,
    { stdio: 'inherit' }
  );
  const j = JSON.parse(fs.readFileSync(dest, 'utf8'));
  return {
    url,
    performance: Math.round(j.categories.performance.score * 100),
    accessibility: Math.round(j.categories.accessibility.score * 100),
    fcp: j.audits['first-contentful-paint'].displayValue,
    lcp: j.audits['largest-contentful-paint'].displayValue,
  };
}

const baseFinal = process.env.BASE_FINAL || 'http://127.0.0.1:8080';
const baseAntes = process.env.BASE_ANTES || 'http://127.0.0.1:8081';

const resumo = {
  geradoEm: new Date().toISOString(),
  versaoFinal: [
    lh(`${baseFinal}/`, 'lh-final-index.json'),
    lh(`${baseFinal}/login.html`, 'lh-final-login.json'),
    lh(`${baseFinal}/vagas.html`, 'lh-final-vagas.json'),
  ],
  rascunhoInicial: [
    lh(`${baseAntes}/index.html`, 'lh-antes-index.json'),
    lh(`${baseAntes}/login.html`, 'lh-antes-login.json'),
  ],
};

fs.writeFileSync(path.join(saida, 'resumo-lighthouse.json'), JSON.stringify(resumo, null, 2));
console.log('Resumo salvo em auditoria/resultados/resumo-lighthouse.json');
