const path = require('path');
const puppeteer = require('puppeteer');

const imgDir = path.join(__dirname, '..', 'auditoria', 'imagens');
const URL_PAGES = 'https://xdanielzdelfino.github.io/trabalho-mais/';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(URL_PAGES, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 1500));

  const css = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    return { minHeight: body.minHeight, display: body.display };
  });
  console.log('CSS no Pages:', css);

  await page.screenshot({
    path: path.join(imgDir, '13-site-publicado.png'),
    fullPage: false,
  });
  console.log('13-site-publicado.png atualizado');
  await browser.close();
})();
