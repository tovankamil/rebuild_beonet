/**
 * Automated Live API & E2E Test Suite for Rebuild Bionet
 * Menguji integrasi langsung terhadap server RESTful API Golang
 * 
 * Penggunaan:
 *   node scripts/test_live_api.js [BASE_URL]
 *   Default URL: http://localhost:8080
 */

const BASE_URL = process.argv[2] || 'http://localhost:8080';

let authToken = '';
let passedCount = 0;
let failedCount = 0;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

async function runTest(testName, fn) {
  const start = Date.now();
  process.stdout.write(`  ⏳ ${testName} ... `);
  try {
    await fn();
    const duration = Date.now() - start;
    console.log(`${colors.green}✔ PASS${colors.reset} (${duration}ms)`);
    passedCount++;
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`${colors.red}✖ FAIL${colors.reset} (${duration}ms)`);
    console.error(`     ${colors.red}Error: ${err.message}${colors.reset}`);
    failedCount++;
  }
}

async function request(method, path, body = null, headers = {}) {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: res.status, headers: res.headers, data };
}

async function main() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   BIONET REBUILD - 100% UUID LIVE API & E2E TESTS   ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`Target Server: ${colors.yellow}${BASE_URL}${colors.reset}\n`);

  // 1. Healthcheck / Ping
  await runTest('1. Healthcheck Ping (GET /api/ping)', async () => {
    const res = await request('GET', '/api/ping');
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    if (!res.data || res.data.status !== 'success') {
      throw new Error(`Invalid response structure: ${JSON.stringify(res.data)}`);
    }
  });

  // 2. CORS Preflight
  await runTest('2. CORS Preflight Check (OPTIONS /api/auth/login)', async () => {
    const res = await request('OPTIONS', '/api/auth/login', null, {
      'Origin': 'http://localhost:5173',
      'Access-Control-Request-Method': 'POST',
    });
    if (res.status !== 204) throw new Error(`Expected HTTP 204, got ${res.status}`);
  });

  // 3. Negative Login - Wrong Password
  await runTest('3. Auth Login - Wrong Password Rejection', async () => {
    const res = await request('POST', '/api/auth/login', {
      username: 'mitra01',
      password: 'wrong_password_xyz',
    });
    if (res.status !== 401) throw new Error(`Expected HTTP 401, got ${res.status}`);
  });

  // 4. Positive Login - Demo Account
  await runTest('4. Auth Login - Valid Credentials (mitra01 / bionet123)', async () => {
    const res = await request('POST', '/api/auth/login', {
      username: 'mitra01',
      password: 'bionet123',
    });
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}. Msg: ${JSON.stringify(res.data)}`);
    if (!res.data.data?.token) throw new Error('Token JWT tidak ditemukan pada payload response');
    authToken = res.data.data.token;
  });

  // 5. Protected Endpoint without Token
  await runTest('5. Security Guard - Block Unauthorized Request without Bearer Token', async () => {
    const res = await request('GET', '/api/dashboard/stats');
    if (res.status !== 401) throw new Error(`Expected HTTP 401, got ${res.status}`);
  });

  // 6. User Profile Me
  await runTest('6. User Profile (GET /api/auth/me)', async () => {
    const res = await request('GET', '/api/auth/me', null, {
      'Authorization': `Bearer ${authToken}`,
    });
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    if (res.data.data.username !== 'mitra01') {
      throw new Error(`Expected username mitra01, got ${res.data.data.username}`);
    }
  });

  // 7. Dashboard Overview Stats
  await runTest('7. Dashboard Overview Stats (GET /api/dashboard/stats)', async () => {
    const res = await request('GET', '/api/dashboard/stats', null, {
      'Authorization': `Bearer ${authToken}`,
    });
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    const stats = res.data.data;
    if (typeof stats.wallet_balance !== 'number') throw new Error('Invalid wallet_balance type');
    if (typeof stats.point_left !== 'number') throw new Error('Invalid point_left type');
    if (typeof stats.point_right !== 'number') throw new Error('Invalid point_right type');
  });

  // 8. Genealogy Binary Tree
  await runTest('8. Genealogy Binary Tree (GET /api/dashboard/genealogy)', async () => {
    const res = await request('GET', '/api/dashboard/genealogy', null, {
      'Authorization': `Bearer ${authToken}`,
    });
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    if (!res.data.data) throw new Error('Root binary tree node is missing');
  });

  // 9. Direct Referrals
  await runTest('9. Direct Referrals Sponsor List (GET /api/dashboard/referrals)', async () => {
    const res = await request('GET', '/api/dashboard/referrals', null, {
      'Authorization': `Bearer ${authToken}`,
    });
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    if (!Array.isArray(res.data.data)) throw new Error('Expected array of referrals');
  });

  // 10. Wallet Transactions Ledger
  await runTest('10. Wallet Transactions Ledger (GET /api/dashboard/transactions)', async () => {
    const res = await request('GET', '/api/dashboard/transactions', null, {
      'Authorization': `Bearer ${authToken}`,
    });
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    if (!Array.isArray(res.data.data)) throw new Error('Expected array of transactions');
  });

  // 11. Bank Account Save & Retrieve
  await runTest('11. Bank Account Management (POST & GET /api/dashboard/bank)', async () => {
    const payload = {
      bank_name: 'BCA (Bank Central Asia)',
      account_number: '8271928371',
      account_name: 'Mitra Bionet Juara',
    };

    const postRes = await request('POST', '/api/dashboard/bank', payload, {
      'Authorization': `Bearer ${authToken}`,
    });
    if (postRes.status !== 200) throw new Error(`Expected HTTP 200, got ${postRes.status}`);

    const getRes = await request('GET', '/api/dashboard/bank', null, {
      'Authorization': `Bearer ${authToken}`,
    });
    if (getRes.status !== 200) throw new Error(`Expected HTTP 200 on fetch bank, got ${getRes.status}`);
    if (getRes.data.data.account_number !== '8271928371') {
      throw new Error(`Expected account_number 8271928371, got ${getRes.data.data.account_number}`);
    }
  });

  // 12. Withdrawals History
  await runTest('12. Withdrawals History (GET /api/dashboard/withdrawals)', async () => {
    const res = await request('GET', '/api/dashboard/withdrawals', null, {
      'Authorization': `Bearer ${authToken}`,
    });
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    if (!Array.isArray(res.data.data)) throw new Error('Expected array of withdrawals');
  });

  // 13. PIN Inventory & Packages
  await runTest('13. PIN Packages & Inventory (GET /api/pins/packages & /api/pins/my-pins)', async () => {
    const [pkgRes, pinRes] = await Promise.all([
      request('GET', '/api/pins/packages', null, { 'Authorization': `Bearer ${authToken}` }),
      request('GET', '/api/pins/my-pins', null, { 'Authorization': `Bearer ${authToken}` }),
    ]);
    if (pkgRes.status !== 200) throw new Error(`Expected HTTP 200 on packages, got ${pkgRes.status}`);
    if (pinRes.status !== 200) throw new Error(`Expected HTTP 200 on pins, got ${pinRes.status}`);
  });

  // 14. Products Catalog
  await runTest('14. Products Catalog (GET /api/products)', async () => {
    const res = await request('GET', '/api/products', null, {
      'Authorization': `Bearer ${authToken}`,
    });
    if (res.status !== 200) throw new Error(`Expected HTTP 200, got ${res.status}`);
    if (!Array.isArray(res.data.data)) throw new Error('Expected array of products');
  });

  // Summary
  console.log(`\n${colors.bold}----------------------------------------------------${colors.reset}`);
  console.log(` Hasil Akhir Pengujian:`);
  console.log(` Total Uji: ${passedCount + failedCount}`);
  console.log(` ${colors.green}✔ Lulus: ${passedCount}${colors.reset}`);
  console.log(` ${failedCount > 0 ? colors.red : colors.green}✖ Gagal: ${failedCount}${colors.reset}`);
  console.log(`${colors.bold}----------------------------------------------------${colors.reset}\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\n${colors.red}Fatal Execution Error:${colors.reset}`, err);
  process.exit(1);
});
