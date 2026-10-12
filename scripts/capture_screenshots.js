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
  throw new Error('Neither Chrome nor Edge was found at standard locations.');
}

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setTheme(page, theme) {
  await page.evaluate((t) => {
    localStorage.setItem('theme', t);
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, theme);
  await sleep(400);
}

async function main() {
  console.log('--- Step 0: Removing Old Screenshots ---');
  if (fs.existsSync(SCREENSHOT_DIR)) {
    const files = fs.readdirSync(SCREENSHOT_DIR);
    for (const f of files) {
      if (f.endsWith('.png')) {
        fs.unlinkSync(path.join(SCREENSHOT_DIR, f));
        console.log(`  Removed old screenshot: ${f}`);
      }
    }
  }

  const browserPath = getBrowserPath();
  console.log(`Using browser at: ${browserPath}`);

  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars'],
  });

  const page = await browser.newPage();

  console.log('--- Step 1: Verify and Test Sign-Up Flow ---');
  await page.goto(`${BASE_URL}/sign-up`, { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Take initial Sign-Up screenshots (dark and light)
  await setTheme(page, 'dark');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signup_dark_mode.png') });
  console.log('Saved signup_dark_mode.png');

  await setTheme(page, 'light');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signup_light_mode.png') });
  console.log('Saved signup_light_mode.png');

  // Fill out the signup form with new credentials
  const testUser = {
    name: 'Alex Morgan',
    email: `alex.morgan.${Date.now()}@devlens.ai`,
    password: 'Password@123',
  };

  console.log(`Registering new account: ${testUser.email}`);
  await page.type('input[placeholder="e.g. Alex Morgan"]', testUser.name);
  await page.type('input[placeholder="alex@company.com"]', testUser.email);
  await page.type('input[type="password"]', testUser.password);
  await page.click('button[type="submit"]');

  await sleep(2000);
  console.log('Account registered successfully! Now testing Login flow with these credentials...');

  // Clear cookies to test sign-in flow from scratch
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCookies');

  console.log('--- Step 2: Testing Sign-In Flow with newly created credentials ---');
  await page.goto(`${BASE_URL}/sign-in`, { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Take Sign-In screenshots (dark and light)
  await setTheme(page, 'dark');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signin_dark_mode.png') });
  console.log('Saved signin_dark_mode.png');

  await setTheme(page, 'light');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'signin_light_mode.png') });
  console.log('Saved signin_light_mode.png');

  // Sign in using the newly registered credentials
  console.log(`Logging in with: ${testUser.email}`);
  await page.type('input[placeholder="name@company.com"]', testUser.email);
  await page.type('input[type="password"]', testUser.password);
  await page.click('button[type="submit"]');

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await sleep(1500);

  console.log('Successfully logged in! Current URL:', page.url());

  // Define screens to capture for both modes
  const screens = [
    { name: 'landing_hero', url: `${BASE_URL}/` },
    {
      name: 'landing_workflows',
      url: `${BASE_URL}/`,
      scrollTarget: '#workflows'
    },
    { name: 'dashboard', url: `${BASE_URL}/dashboard` },
    { name: 'profiles', url: `${BASE_URL}/profiles` },
    { name: 'candidate_dossier', url: `${BASE_URL}/profiles/dev-1` },
    { name: 'compare', url: `${BASE_URL}/compare` },
    { name: 'jobs_matching', url: `${BASE_URL}/jobs` },
    { name: 'reports', url: `${BASE_URL}/reports` },
    { name: 'settings', url: `${BASE_URL}/settings` },
  ];

  for (const screen of screens) {
    console.log(`Navigating to ${screen.name} (${screen.url})...`);
    await page.goto(screen.url, { waitUntil: 'networkidle2' });
    if (screen.scrollTarget) {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
      }, screen.scrollTarget);
      await sleep(600);
    } else {
      await sleep(1200);
    }

    // Dark Mode
    await setTheme(page, 'dark');
    await sleep(500);
    const darkPath = path.join(SCREENSHOT_DIR, `${screen.name}_dark_mode.png`);
    await page.screenshot({ path: darkPath, fullPage: false });
    console.log(`  ✓ Saved ${screen.name}_dark_mode.png`);

    // Light Mode
    await setTheme(page, 'light');
    await sleep(500);
    const lightPath = path.join(SCREENSHOT_DIR, `${screen.name}_light_mode.png`);
    await page.screenshot({ path: lightPath, fullPage: false });
    console.log(`  ✓ Saved ${screen.name}_light_mode.png`);
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
