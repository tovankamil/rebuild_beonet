process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'http://localhost:8081';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

async function req(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${BASE_URL}${path}`, {
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

async function run() {
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}       AUDIT & VERIFIKASI EXPANDED CRM SUITE BIONET             ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  // 1. Login mitra01
  const loginRes = await req('/api/auth/login', {
    method: 'POST',
    body: { username: 'mitra01', password: 'bionet123' },
  });
  assert(loginRes.status === 200 && loginRes.data?.data?.token, 'Login mitra01 berhasil');
  const token = loginRes.data?.data?.token;
  const authHeader = { Authorization: `Bearer ${token}` };

  // -------------------------------------------------------------
  // 2. CUSTOMER HEALTH JOURNEY (3-7-14-25 DAY RULE)
  // -------------------------------------------------------------
  console.log(`\n${colors.bold}--- 1. CUSTOMER HEALTH JOURNEY (3-7-14-25 DAY CYCLE) ---${colors.reset}`);
  
  // List health records
  const healthListRes = await req('/api/crm/health-records', { headers: authHeader });
  assert(
    healthListRes.status === 200 && Array.isArray(healthListRes.data?.data),
    'GET /api/crm/health-records mengembalikan daftar rekam kesehatan konsumen',
    JSON.stringify(healthListRes.data)
  );

  // Create new health record
  const newRecordRes = await req('/api/crm/health-records', {
    method: 'POST',
    headers: authHeader,
    body: {
      customer_name: 'Bapak Hadi Santoso',
      phone: '081298765432',
      chief_complaint: 'Asam Urat & Nyeri Sendi',
      dosage_instructions: '3 x 5 tetes/hari sesudah makan',
      health_notes: 'Kadar asam urat awal 8.5 mg/dL. Konsumsi rutin Bio-Herbal Drops.',
    },
  });
  assert(
    (newRecordRes.status === 200 || newRecordRes.status === 201) && newRecordRes.data?.data?.id,
    'POST /api/crm/health-records berhasil mendaftarkan pasien/konsumen baru',
    JSON.stringify(newRecordRes.data)
  );
  const recordId = newRecordRes.data?.data?.id;

  // Update milestone
  if (recordId) {
    const updateMilestoneRes = await req(`/api/crm/health-records/${recordId}/milestone`, {
      method: 'PUT',
      headers: authHeader,
      body: { milestone: 'day_7', notes: 'Hari ke-7: Nyeri sendi berangsur berkurang, tidur lebih nyenyak.' },
    });
    assert(
      updateMilestoneRes.status === 200 && updateMilestoneRes.data?.data?.current_milestone === 'day_7',
      'PUT /api/crm/health-records/:id/milestone berhasil memajukan siklus ke Hari ke-7',
      JSON.stringify(updateMilestoneRes.data)
    );
  }

  // -------------------------------------------------------------
  // 3. AI OBJECTION HANDLING ASSISTANT
  // -------------------------------------------------------------
  console.log(`\n${colors.bold}--- 2. AI OBJECTION HANDLING ASSISTANT ---${colors.reset}`);

  const objections = [
    { type: 'mahal', name: 'Ibu Rina' },
    { type: 'efek_samping', name: 'Pak Joko' },
    { type: 'obat_dokter', name: 'Ibu Maya' },
  ];

  for (const obj of objections) {
    const aiRes = await req('/api/crm/ai/objection-handler', {
      method: 'POST',
      headers: authHeader,
      body: {
        objection_type: obj.type,
        customer_name: obj.name,
        product_name: 'Bio-Herbal Drops',
      },
    });
    assert(
      aiRes.status === 200 && typeof aiRes.data?.data?.script === 'string' && aiRes.data.data.script.length > 50,
      `AI Objection Handler untuk keraguan '${obj.type}' menghasilkan skrip closing persuasif`,
      aiRes.data?.data?.script?.substring(0, 80) + '...'
    );
  }

  // -------------------------------------------------------------
  // 4. KANBAN PIPELINE DRAG & DROP STATUS UPDATE
  // -------------------------------------------------------------
  console.log(`\n${colors.bold}--- 3. KANBAN PIPELINE STATUS ENGINE ---${colors.reset}`);

  // Fetch current leads
  const leadsRes = await req('/api/leads', { headers: authHeader });
  assert(leadsRes.status === 200 && Array.isArray(leadsRes.data?.data), 'GET /api/leads berhasil memuat daftar prospek');
  
  const leadList = leadsRes.data?.data || [];
  if (leadList.length > 0) {
    const targetLead = leadList[0];
    const updateStageRes = await req(`/api/crm/leads/${targetLead.id}/status`, {
      method: 'PUT',
      headers: authHeader,
      body: { status: 'interested' },
    });
    assert(
      updateStageRes.status === 200 && updateStageRes.data?.data?.status === 'interested',
      `PUT /api/crm/leads/:id/status berhasil memindahkan prospek ke stage 'interested' (Kanban)`,
      JSON.stringify(updateStageRes.data)
    );
  }

  // -------------------------------------------------------------
  // 5. TESTIMONIAL & CONTENT VAULT
  // -------------------------------------------------------------
  console.log(`\n${colors.bold}--- 4. TESTIMONIAL & SOCIAL PROOF VAULT ---${colors.reset}`);

  const testiesRes = await req('/api/crm/testimonials', { headers: authHeader });
  assert(
    testiesRes.status === 200 && Array.isArray(testiesRes.data?.data) && testiesRes.data.data.length > 0,
    'GET /api/crm/testimonials mengembalikan bank testimoni terverifikasi BPOM',
    `Ditemukan ${testiesRes.data?.data?.length || 0} testimoni resmi`
  );

  // -------------------------------------------------------------
  // 6. PUBLIC WEBHOOK AUTO-CAPTURE (Meta & TikTok Ads)
  // -------------------------------------------------------------
  console.log(`\n${colors.bold}--- 5. PUBLIC WEBHOOK AUTO-CAPTURE (Ads & External Forms) ---${colors.reset}`);

  const ts = Date.now();
  const webhookPayload = {
    key: 'mitra01',
    name: `Prospek Iklan TikTok ${ts}`,
    phone: `0812${String(ts).slice(-8)}`,
    city: 'Surabaya',
    product_interest: 'Bio-Herbal Drops 30ml',
    source: 'TikTok Lead Ads',
  };

  const webhookRes = await req('/api/public/leads/webhook', {
    method: 'POST',
    body: webhookPayload,
  });
  assert(
    webhookRes.status === 200 && webhookRes.data?.status === 'success' && webhookRes.data?.data?.name === webhookPayload.name,
    'POST /api/public/leads/webhook berhasil menerima lead dari iklan eksternal secara otomatis',
    JSON.stringify(webhookRes.data)
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.cyan}================================================================${colors.reset}`);
  console.log(`HASIL AUDIT EXPANDED CRM SUITE:`);
  console.log(`  Total Tes  : ${passed + failed}`);
  console.log(`  ${colors.green}✔ Lulus    : ${passed}${colors.reset}`);
  console.log(`  ${failed > 0 ? colors.red : colors.green}✖ Gagal    : ${failed}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}================================================================${colors.reset}\n`);

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('\nFatal test error:', err);
  process.exit(1);
});

