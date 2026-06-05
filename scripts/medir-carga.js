const http = require('http');
const { performance } = require('perf_hooks');

const url = process.argv[2] || 'http://127.0.0.1:8080/';
const total = Number(process.argv[3] || 20);
const tempos = [];

function umaReq(endereco) {
  return new Promise((resolve, reject) => {
    const t0 = performance.now();
    http.get(endereco, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(performance.now() - t0));
    }).on('error', reject);
  });
}

(async () => {
  for (let i = 0; i < total; i++) tempos.push(await umaReq(url));
  const soma = tempos.reduce((a, b) => a + b, 0);
  const resultado = {
    data: new Date().toISOString(),
    url,
    requisicoes: total,
    mediaMs: Number((soma / total).toFixed(2)),
    minMs: Number(Math.min(...tempos).toFixed(2)),
    maxMs: Number(Math.max(...tempos).toFixed(2)),
  };
  console.log(JSON.stringify(resultado, null, 2));
})();
