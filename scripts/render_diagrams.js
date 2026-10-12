const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

function getBrowserPath() {
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Browser not found');
}

async function renderSvgToPng(svgPath, pngPath, width, height) {
  const browser = await puppeteer.launch({
    executablePath: getBrowserPath(),
    headless: true,
    defaultViewport: { width, height, deviceScaleFactor: 2 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;">${svgContent}</body></html>`);
  await page.screenshot({ path: pngPath, omitBackground: true });
  await browser.close();
  console.log(`Rendered ${path.basename(pngPath)}`);
}

async function main() {
  const diagramsDir = path.join(__dirname, '..', 'docs', 'diagrams');
  await renderSvgToPng(
    path.join(diagramsDir, 'system_architecture.svg'),
    path.join(diagramsDir, 'system_architecture.png'),
    1160,
    620
  );
  await renderSvgToPng(
    path.join(diagramsDir, 'ingestion_pipeline.svg'),
    path.join(diagramsDir, 'ingestion_pipeline.png'),
    1160,
    620
  );
  console.log('Diagram rendering completed!');
}

main().catch(console.error);
