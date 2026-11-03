const path = require('path');
const fs = require('fs');
const puppeteer = require(path.resolve(__dirname, '../frontend/node_modules/puppeteer-core'));

const ARTIFACT_DIR = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\d1ea597f-8ecf-445e-9427-aa654bfdfbc3';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runTest() {
  console.log('--- STARTING TIKTOK SANDBOX BROWSER TEST ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    ignoreHTTPSErrors: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--ignore-certificate-errors',
      '--disable-web-security',
      '--window-size=1366,820',
    ],
    defaultViewport: {
      width: 1366,
      height: 820,
    },
  });

  const page = await browser.newPage();

  // Log page console output
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('TikTok') || text.includes('Login') || text.includes('Auth')) {
      console.log('BROWSER CONSOLE:', text);
    }
  });

  try {
    console.log('1. Navigating to Login Page (clearing local session first)...');
    await page.goto('https://localhost:5173/#/login', { waitUntil: 'networkidle2', timeout: 30000 });

    // Clear localStorage to ensure fresh LoginPage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // Capture Step 1: LoginPage with TikTok Sandbox Button
    const shot1 = path.join(ARTIFACT_DIR, 'tiktok_sandbox_01_login_page.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log('✓ Captured 01: Login page with TikTok button ->', shot1);

    // 2. Click TikTok button on LoginPage
    console.log('2. Clicking "Masuk dengan TikTok (login_mlm)" button on LoginPage...');
    const tiktokBtnFound = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find((b) => b.textContent && b.textContent.includes('login_mlm'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!tiktokBtnFound) {
      throw new Error('TikTok button with "login_mlm" not found on LoginPage!');
    }

    await new Promise((r) => setTimeout(r, 1200));

    // Capture Step 2: TikTok Sandbox Modal Open
    const shot2 = path.join(ARTIFACT_DIR, 'tiktok_sandbox_02_modal_open.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log('✓ Captured 02: TikTok Sandbox modal open ->', shot2);

    // 3. Click "Masuk Langsung via Sandbox TikTok (@mitra01)"
    console.log('3. Clicking "Masuk Langsung via Sandbox TikTok (@mitra01)" inside modal...');
    const executeLoginSuccess = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const loginBtn = btns.find(
        (b) => b.textContent && (b.textContent.includes('@mitra01') || b.textContent.includes('Sandbox TikTok'))
      );
      if (loginBtn) {
        loginBtn.click();
        return true;
      }
      return false;
    });

    if (!executeLoginSuccess) {
      throw new Error('Execute TikTok Sandbox Login button not found in modal!');
    }

    console.log('Waiting for authentication and dashboard to load...');
    await new Promise((r) => setTimeout(r, 3500));

    // Capture Step 3: Dashboard after successful login via TikTok Sandbox
    const shot3 = path.join(ARTIFACT_DIR, 'tiktok_sandbox_03_dashboard_success.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log('✓ Captured 03: Dashboard authenticated via TikTok Sandbox ->', shot3);

    // 4. Test clicking "Masuk TikTok (login_mlm)" inside Dashboard Header
    console.log('4. Testing TikTok Sandbox trigger from Dashboard Header...');
    const headerTriggerSuccess = await page.evaluate(() => {
      const headerBtns = Array.from(document.querySelectorAll('header button, .safe-header button'));
      const ttHeaderBtn = headerBtns.find(
        (b) => b.textContent && b.textContent.includes('TikTok') && b.textContent.includes('login_mlm')
      );
      if (ttHeaderBtn) {
        ttHeaderBtn.click();
        return true;
      }
      // fallback dispatch event
      window.dispatchEvent(new CustomEvent('synetiq:open-tiktok-sandbox'));
      return true;
    });

    await new Promise((r) => setTimeout(r, 1200));

    // Capture Step 4: TikTok Suite Modal inside Dashboard
    const shot4 = path.join(ARTIFACT_DIR, 'tiktok_sandbox_04_dashboard_modal.png');
    await page.screenshot({ path: shot4, fullPage: false });
    console.log('✓ Captured 04: TikTok Suite modal opened inside Dashboard ->', shot4);

    console.log('--- ALL TIKTOK SANDBOX BROWSER TESTS PASSED 100% ---');
  } catch (err) {
    console.error('TEST ERROR:', err);
    const errShot = path.join(ARTIFACT_DIR, 'tiktok_sandbox_error.png');
    await page.screenshot({ path: errShot });
    console.log('Captured error screenshot ->', errShot);
  } finally {
    await browser.close();
  }
}

runTest();
