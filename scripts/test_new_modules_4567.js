process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_BACKEND_URL = 'http://localhost:8081';
const BASE_FRONTEND_URL = 'http://localhost:5173';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

async function req(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

let passed = 0;
let failed = 0;

function assert(condition, message, details = '') {
  if (condition) {
    passed++;
    console.log(`  ${colors.green}✔ PASS:${colors.reset} ${message}`);
  } else {
    failed++;
    console.log(`  ${colors.red}✖ FAIL:${colors.reset} ${message}`);
    if (details) console.log(`    ${colors.yellow}Details: ${details}${colors.reset}`);
  }
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}     AUDIT & VERIFIKASI LIVE: MODUL 4, 5, 6, DAN 7 BIONET       ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}`);

  // Login mitra
  const loginRes = await req(`${BASE_BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    body: { username: 'mitra01', password: 'bionet123' },
  });
  assert(loginRes.status === 200 && loginRes.data?.data?.token, 'Login mitra01 berhasil');
  const token = loginRes.data?.data?.token;

  // -----------------------------------------------------------------
  // 1. MODULE 5: DIGITAL MEMBER CARD & CERTIFICATE VERIFICATION
  // -----------------------------------------------------------------
  console.log(`\n${colors.bold}--- 1. MODULE 5: PUBLIC VERIFICATION ENDPOINTS ---${colors.reset}`);
  
  // Verify existing member
  const memberVerifRes = await req(`${BASE_BACKEND_URL}/api/public/verify/member/mitra01`);
  assert(
    memberVerifRes.status === 200 && memberVerifRes.data?.data?.username === 'mitra01',
    'Verifikasi publik KTA member aktif (@mitra01) mengembalikan profil resmi',
    JSON.stringify(memberVerifRes.data)
  );

  // Verify non-existent member
  const fakeMemberRes = await req(`${BASE_BACKEND_URL}/api/public/verify/member/non_existent_user_999`);
  assert(
    fakeMemberRes.status === 404,
    'Verifikasi publik member palsu mengembalikan 404 Not Found'
  );

  // Verify certificate
  const certRes = await req(`${BASE_BACKEND_URL}/api/public/verify/certificate/BIO-CERT-2026-PLATINUM-7HU`);
  assert(
    certRes.status === 200 && certRes.data?.data?.status === 'verified',
    'Verifikasi publik E-Sertifikat Kemitraan (BIO-CERT-...) valid & terverifikasi',
    JSON.stringify(certRes.data)
  );

  // Verify invalid certificate format
  const badCertRes = await req(`${BASE_BACKEND_URL}/api/public/verify/certificate/INVALID-FORMAT-123`);
  assert(
    badCertRes.status === 400,
    'Verifikasi format sertifikat salah menolak dengan 400 Bad Request'
  );

  // -----------------------------------------------------------------
  // 2. MODULE 4: PROSPECTING SIMULATION ENGINE
  // -----------------------------------------------------------------
  console.log(`\n${colors.bold}--- 2. MODULE 4: PROSPECTING SIMULATION ENGINE ---${colors.reset}`);
  
  const simRes = await req(`${BASE_BACKEND_URL}/api/prospecting/simulate`, {
    method: 'POST',
    body: {
      package_type: 'gold',
      duplication_factor: 2,
      months: 6,
    },
  });
  assert(
    simRes.status === 200 && simRes.data?.data?.package_type === 'gold',
    'Kalkulator simulasi prospek binary mengembalikan data proyeksi lengkap',
    JSON.stringify(simRes.data)
  );
  assert(
    simRes.data?.data?.total_downlines > 0 && Array.isArray(simRes.data?.data?.monthly_breakdown),
    'Proyeksi pertumbuhan menyertakan rincian bulan demi bulan dan reward tiers'
  );

  // -----------------------------------------------------------------
  // 3. MODULE 6: SMART RO REMINDER & CRM HUB
  // -----------------------------------------------------------------
  console.log(`\n${colors.bold}--- 3. MODULE 6: SMART RO REMINDER & CUSTOMER CRM ---${colors.reset}`);
  
  const roRes = await req(`${BASE_BACKEND_URL}/api/crm/ro-reminders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert(
    roRes.status === 200 && roRes.data?.data !== undefined,
    'Endpoint Smart RO Reminder berhasil diakses oleh mitra',
    JSON.stringify(roRes.data)
  );
  assert(
    Array.isArray(roRes.data?.data?.customers) && Array.isArray(roRes.data?.data?.dormant_downlines),
    'Data CRM mencakup daftar customer siklus 30-hari dan downline pasif > 45 hari'
  );

  // Log a follow-up action
  const logRes = await req(`${BASE_BACKEND_URL}/api/crm/ro-reminders/log`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      target_id: 'test-cust-1',
      type: 'customer',
      method: 'whatsapp',
      notes: 'Follow up stok habis via simulasi test',
    },
  });
  assert(
    logRes.status === 200 && logRes.data?.status === 'success',
    'Pencatatan aktivitas follow-up CRM WhatsApp berhasil disimpan'
  );

  // -----------------------------------------------------------------
  // 4. MODULE 7: PWA, WEB PUSH & SOUND NOTIFICATION
  // -----------------------------------------------------------------
  console.log(`\n${colors.bold}--- 4. MODULE 7: PWA ASSETS & WEB PUSH ---${colors.reset}`);
  
  // Public push key
  const pushKeyRes = await req(`${BASE_BACKEND_URL}/api/public/push/public-key`);
  assert(
    pushKeyRes.status === 200 && pushKeyRes.data?.data?.public_key,
    'VAPID Push Public Key tersedia untuk registrasi Service Worker PWA'
  );

  // Push notification test
  const pushTestRes = await req(`${BASE_BACKEND_URL}/api/notifications/push-test`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: { title: 'Uji Notifikasi Bionet', body: 'Bonus komisi Rp 150.000 masuk!' },
  });
  assert(
    pushTestRes.status === 200 && pushTestRes.data?.status === 'success',
    'Simulasi trigger Web Push Notification server berhasil'
  );

  // PWA manifest web asset
  const manifestRes = await req(`${BASE_FRONTEND_URL}/manifest.webmanifest`);
  assert(
    manifestRes.status === 200 && manifestRes.data?.name?.includes('Bionet'),
    'File PWA Web Manifest (manifest.webmanifest) aktif di frontend'
  );

  // Service Worker web asset
  const swRes = await req(`${BASE_FRONTEND_URL}/sw.js`);
  assert(
    swRes.status === 200 && typeof swRes.data === 'string' && swRes.data.includes('bionet-mitra'),
    'Service Worker (sw.js) aktif dengan caching app-shell offline'
  );

  // -----------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`HASIL AUDIT MODUL 4, 5, 6, 7:`);
  console.log(`  Total Tes  : ${passed + failed}`);
  console.log(`  ${colors.green}✔ Lulus    : ${passed}${colors.reset}`);
  console.log(`  ${failed > 0 ? colors.red : colors.green}✖ Gagal    : ${failed}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('\nFatal test execution error:', err);
  process.exit(1);
});
