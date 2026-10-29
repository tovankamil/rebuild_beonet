/**
 * Comprehensive Multi-Role & All-Menu E2E Test Suite
 * Tests all 5 roles (Admin, Keuangan, CS, Gudang, Member) across all endpoints and RBAC barriers.
 */

const BASE_URL = process.env.API_URL || 'http://localhost:8081';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let passed = 0;
let failed = 0;

async function run(name, fn) {
  process.stdout.write(`  ⏳ ${name} ... `);
  const start = Date.now();
  try {
    await fn();
    console.log(`${colors.green}✔ PASS${colors.reset} (${Date.now() - start}ms)`);
    passed++;
  } catch (err) {
    console.log(`${colors.red}✖ FAIL${colors.reset} (${Date.now() - start}ms)`);
    console.error(`     ${colors.red}${err.message}${colors.reset}`);
    failed++;
  }
}

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  let data = null;
  const text = await res.text();
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

async function login(username, password = 'bionet123') {
  const res = await request('POST', '/api/auth/login', { username, password });
  if (res.status !== 200 || !res.data.data?.token) {
    throw new Error(`Login failed for ${username}: ${JSON.stringify(res.data)}`);
  }
  return res.data.data.token;
}

async function main() {
  console.log(`\n${colors.bold}${colors.cyan}======================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  BIONET COMPREHENSIVE MULTI-ROLE & FULL-MENU AUDIT   ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}======================================================${colors.reset}`);
  console.log(`Target: ${colors.yellow}${BASE_URL}${colors.reset}\n`);

  // 1. PUBLIC ENDPOINTS
  console.log(`${colors.bold}--- 1. PUBLIC & ANONYMOUS ENDPOINTS ---${colors.reset}`);
  await run('Ping Healthcheck (/api/ping)', async () => {
    const res = await request('GET', '/api/ping');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Kemendagri Provinces (/api/regions/provinces)', async () => {
    const res = await request('GET', '/api/regions/provinces');
    if (res.status !== 200 || !Array.isArray(res.data.data)) throw new Error(`Status ${res.status}`);
  });
  await run('Kemendagri Search (/api/regions/search?q=Jakarta)', async () => {
    const res = await request('GET', '/api/regions/search?q=Jakarta');
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Public Storefront Lead Capture (/api/public/leads)', async () => {
    const res = await request('POST', '/api/public/leads', {
      sponsor_username: 'mitra01',
      name: 'Calon Mitra Test',
      phone: '081299998888',
      city: 'Jakarta',
      notes: 'Tertarik paket Platinum',
    });
    if (res.status !== 201 && res.status !== 200) throw new Error(`Status ${res.status}`);
  });

  // 2. MEMBER ROLE (mitra01)
  console.log(`\n${colors.bold}--- 2. ROLE MEMBER (mitra01) ---${colors.reset}`);
  const memberToken = await login('mitra01');
  await run('Member Profile (/api/auth/me)', async () => {
    const res = await request('GET', '/api/auth/me', null, memberToken);
    if (res.status !== 200 || res.data.data.role !== 'member') throw new Error(`Unexpected data: ${JSON.stringify(res.data)}`);
  });
  await run('Member Overview Stats (/api/dashboard/stats)', async () => {
    const res = await request('GET', '/api/dashboard/stats', null, memberToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Member Binary Genealogy (/api/dashboard/genealogy)', async () => {
    const res = await request('GET', '/api/dashboard/genealogy', null, memberToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Member Referrals (/api/dashboard/referrals)', async () => {
    const res = await request('GET', '/api/dashboard/referrals', null, memberToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Member PIN Inventory (/api/pins/my-pins)', async () => {
    const res = await request('GET', '/api/pins/my-pins', null, memberToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Member Products (/api/products)', async () => {
    const res = await request('GET', '/api/products', null, memberToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Member CRM Leads (/api/leads)', async () => {
    const res = await request('GET', '/api/leads', null, memberToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Member Meetings & BOP (/api/meetings)', async () => {
    const res = await request('GET', '/api/meetings', null, memberToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Member RBAC Guard - Block Admin Overview (/api/admin/overview)', async () => {
    const res = await request('GET', '/api/admin/overview', null, memberToken);
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });
  await run('Member RBAC Guard - Block Warehouse Overview (/api/warehouse/overview)', async () => {
    const res = await request('GET', '/api/warehouse/overview', null, memberToken);
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 3. ADMIN ROLE (admin01)
  console.log(`\n${colors.bold}--- 3. ROLE ADMIN (admin01) ---${colors.reset}`);
  const adminToken = await login('admin01');
  await run('Admin Executive Overview (/api/admin/overview)', async () => {
    const res = await request('GET', '/api/admin/overview', null, adminToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Admin User Directory (/api/admin/users)', async () => {
    const res = await request('GET', '/api/admin/users', null, adminToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Admin Transactions Ledger (/api/admin/transactions)', async () => {
    const res = await request('GET', '/api/admin/transactions', null, adminToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Admin Binary Points (/api/admin/points)', async () => {
    const res = await request('GET', '/api/admin/points', null, adminToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Admin PIN Master (/api/admin/pins)', async () => {
    const res = await request('GET', '/api/admin/pins', null, adminToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Admin Orders Fulfillment (/api/admin/orders)', async () => {
    const res = await request('GET', '/api/admin/orders', null, adminToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Admin Withdrawals Approval (/api/admin/withdrawals)', async () => {
    const res = await request('GET', '/api/admin/withdrawals', null, adminToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Admin Fraud & Risk Telemetry (/api/admin/fraud/overview)', async () => {
    const res = await request('GET', '/api/admin/fraud/overview', null, adminToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Admin Live Monitoring Overview (/api/admin/monitoring/overview)', async () => {
    const res = await request('GET', '/api/admin/monitoring/overview', null, adminToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Admin WhatsApp Gateway Status (/api/admin/whatsapp/status)', async () => {
    const res = await request('GET', '/api/admin/whatsapp/status', null, adminToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Admin RBAC Matrix (/api/admin/rbac/matrix)', async () => {
    const res = await request('GET', '/api/admin/rbac/matrix', null, adminToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });

  // 4. KEUANGAN / FINANCE ROLE (finance01)
  console.log(`\n${colors.bold}--- 4. ROLE KEUANGAN (finance01) ---${colors.reset}`);
  const financeToken = await login('finance01');
  await run('Finance Overview Access (/api/admin/overview)', async () => {
    const res = await request('GET', '/api/admin/overview', null, financeToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Finance Transactions Access (/api/admin/transactions)', async () => {
    const res = await request('GET', '/api/admin/transactions', null, financeToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Finance Withdrawals Access (/api/admin/withdrawals)', async () => {
    const res = await request('GET', '/api/admin/withdrawals', null, financeToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Finance Fraud Overview Access (/api/admin/fraud/overview)', async () => {
    const res = await request('GET', '/api/admin/fraud/overview', null, financeToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Finance RBAC Guard - Block User Deletion (/api/admin/users/fake-id)', async () => {
    const res = await request('DELETE', '/api/admin/users/fake-id', null, financeToken);
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });
  await run('Finance RBAC Guard - Block RBAC Matrix Toggle (/api/admin/rbac/matrix)', async () => {
    const res = await request('GET', '/api/admin/rbac/matrix', null, financeToken);
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 5. CUSTOMER SERVICE ROLE (cs01)
  console.log(`\n${colors.bold}--- 5. ROLE CUSTOMER SERVICE (cs01) ---${colors.reset}`);
  const csToken = await login('cs01');
  await run('CS User Directory Access (/api/admin/users)', async () => {
    const res = await request('GET', '/api/admin/users', null, csToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('CS Chat Conversations (/api/chat/conversations)', async () => {
    const res = await request('GET', '/api/chat/conversations', null, csToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('CS Leads Pipeline (/api/leads)', async () => {
    const res = await request('GET', '/api/leads', null, csToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('CS RBAC Guard - Block Fraud Scan (/api/admin/fraud/scan)', async () => {
    const res = await request('POST', '/api/admin/fraud/scan', null, csToken);
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // 6. GUDANG / WAREHOUSE ROLE (gudang01)
  console.log(`\n${colors.bold}--- 6. ROLE GUDANG / LOGISTIK (gudang01) ---${colors.reset}`);
  const gudangToken = await login('gudang01');
  await run('Warehouse Overview (/api/warehouse/overview)', async () => {
    const res = await request('GET', '/api/warehouse/overview', null, gudangToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Warehouse Inventory (/api/warehouse/inventory)', async () => {
    const res = await request('GET', '/api/warehouse/inventory', null, gudangToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Warehouse Orders (/api/warehouse/orders)', async () => {
    const res = await request('GET', '/api/warehouse/orders', null, gudangToken);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });
  await run('Warehouse RBAC Guard - Block Financial Ledger (/api/admin/transactions)', async () => {
    const res = await request('GET', '/api/admin/transactions', null, gudangToken);
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
  });

  // SUMMARY
  console.log(`\n${colors.bold}------------------------------------------------------${colors.reset}`);
  console.log(` HASIL PENGUJIAN MENYELURUH SEMUA FITUR & ROLE:`);
  console.log(` Total Tes Endpoint & RBAC: ${passed + failed}`);
  console.log(` ${colors.green}✔ Lulus: ${passed}${colors.reset}`);
  console.log(` ${failed > 0 ? colors.red : colors.green}✖ Gagal: ${failed}${colors.reset}`);
  console.log(`${colors.bold}------------------------------------------------------${colors.reset}\n`);

  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

