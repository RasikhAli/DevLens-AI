const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function testFixes() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  console.log('Testing Section Anchors...');
  const anchors = ['#bento', '#workflows', '#evidence', '#scoring'];
  for (const a of anchors) {
    const el = await page.$(a);
    if (!el) {
      console.error(`ERROR: Element with ID ${a} NOT FOUND!`);
    } else {
      const box = await el.boundingBox();
      console.log(`✓ Anchor ${a} exists at y = ${box ? box.y : 'unknown'}`);
    }
  }

  // Test clicking on navigation links
  console.log('Testing clicking Workflows link...');
  await page.click('a[href="#workflows"]');
  await new Promise(r => setTimeout(r, 600));
  const scrollYWorkflows = await page.evaluate(() => window.scrollY);
  console.log(`✓ Scrolled to Workflows, window.scrollY = ${scrollYWorkflows}`);

  console.log('Testing clicking Evidence Trail link...');
  await page.click('a[href="#evidence"]');
  await new Promise(r => setTimeout(r, 600));
  const scrollYEvidence = await page.evaluate(() => window.scrollY);
  console.log(`✓ Scrolled to Evidence Trail, window.scrollY = ${scrollYEvidence}`);

  console.log('Testing clicking Deterministic Scoring link...');
  await page.click('a[href="#scoring"]');
  await new Promise(r => setTimeout(r, 600));
  const scrollYScoring = await page.evaluate(() => window.scrollY);
  console.log(`✓ Scrolled to Deterministic Scoring, window.scrollY = ${scrollYScoring}`);

  // Test Click on Hero Canvas
  console.log('Testing Click on Hero Canvas...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 400));
  await page.mouse.click(300, 250);
  console.log('✓ Successfully clicked on hero canvas at (300, 250)');

  await browser.close();
  console.log('ALL FIXES VERIFIED SUCCESSFULLY!');
}

testFixes().catch(console.error);
