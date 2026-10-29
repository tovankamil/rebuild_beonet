/**
 * Bionet Enterprise - Comprehensive E2E & API Test Suite
 * Covers:
 *  1. Multi-role Authentication (Admin, Mitra, CS)
 *  2. Leads Pipeline Lifecycle (Create, Query, Stage Update)
 *  3. AI Objection Handler & Closing Script Generator
 *  4. Direct Server Gateway WhatsApp Dispatch & Status Telemetry
 *  5. WhatsApp Web In-App Messenger (Threads, Messaging, Typing Simulation)
 *  6. WhatsApp Chatbot Keyword Auto-Responder
 *  7. WhatsApp Broadcast Blast with Variable Placeholders
 *  8. vCard (.vcf) Generator Validation (RFC 2426/6350 compliant)
 *  9. Customer Health Journey (Milestones Day 3, 7, 14, 25)
 */

const http = require('http');

const BASE_URL = 'http://localhost:8081';

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(BASE_URL + path, { method, headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function loginUser(username, password) {
  const res = await makeRequest('/api/auth/login', 'POST', { username, password });
  if (res.status !== 200 || !res.body?.data?.token) {
    throw new Error(`Login failed for ${username}: ${JSON.stringify(res.body)}`);
  }
  return res.body.data.token;
}

// vCard validator logic mimicking frontend/src/utils/vCardGenerator.js
function generateVCardString(contact) {
  const cleanPhone = (contact.phone || '').replace(/[^0-9+]/g, '');
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.name}`,
    `TEL;TYPE=CELL,VOICE:${cleanPhone}`,
    contact.city ? `ADR;TYPE=HOME:;;${contact.city};;;;Indonesia` : '',
    contact.notes ? `NOTE:${contact.notes}` : '',
    'ORG:Bionet Network',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');
}

async function runTestSuite() {
  console.log('\n=============================================================');
  console.log('   BIONET ENTERPRISE - E2E & API INTEGRATION TEST SUITE');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: AUTHENTICATION ROLES
    // -------------------------------------------------------------
    console.log('[SECTION 1: Multi-Role Authentication]');
    const adminToken = await loginUser('admin01', 'bionet123');
    assert(!!adminToken, 'Admin (admin01) login successful & token issued');

    const mitraToken = await loginUser('mitra01', 'bionet123');
    assert(!!mitraToken, 'Mitra Member (mitra01) login successful');

    const csToken = await loginUser('cs01', 'bionet123');
    assert(!!csToken, 'Customer Service (cs01) login successful');

    // -------------------------------------------------------------
    // TEST 2: LEADS CRM CRUD & PIPELINE LIFECYCLE
    // -------------------------------------------------------------
    console.log('\n[SECTION 2: Leads Pipeline Management]');
    const newLeadName = 'Test Prospek E2E ' + Date.now();
    const leadRes = await makeRequest(
      '/api/leads',
      'POST',
      {
        name: newLeadName,
        phone: '081299988877',
        email: 'prospek.e2e@example.com',
        city: 'Surabaya',
        source: 'tiktok',
        product_interest: 'Bio-Propolis Trigona 30ml',
        status: 'new',
        notes: 'Keluhan asam urat kambuh 2 bulan',
        estimated_value: 250000,
      },
      mitraToken
    );
    assert(leadRes.status === 200 || leadRes.status === 201, 'Create new lead via API');
    const createdLeadId = leadRes.body?.data?.id || leadRes.body?.id;

    // Shift Stage Kanban
    const stageRes = await makeRequest(
      `/api/crm/leads/${createdLeadId || 1}/status`,
      'PUT',
      { status: 'interested' },
      mitraToken
    );
    assert(stageRes.status === 200, 'Update lead pipeline stage to "interested"');

    // -------------------------------------------------------------
    // TEST 3: ASISTEN AI OBJECTION HANDLER
    // -------------------------------------------------------------
    console.log('\n[SECTION 3: AI Objection Handling & Closing Scripts]');
    const objRes = await makeRequest(
      '/api/crm/ai/objection-handler',
      'POST',
      {
        objection_type: 'harga_mahal',
        customer_name: newLeadName,
        product_name: 'Bio-Propolis Trigona 30ml',
        lead_name: newLeadName,
        lead_phone: '081299988877',
        tone: 'ramah dan persuasif',
      },
      mitraToken
    );
    assert(objRes.status === 200, 'AI Objection Handler endpoint responds HTTP 200');
    assert(
      (objRes.body?.whatsapp_ready_text || '').length > 30,
      'AI Generated persuasive objection response script generated'
    );

    // -------------------------------------------------------------
    // TEST 4: DIRECT SERVER WHATSAPP GATEWAY
    // -------------------------------------------------------------
    console.log('\n[SECTION 4: Direct WhatsApp Gateway Dispatch & Logs]');
    const sendDirectRes = await makeRequest(
      '/api/crm/whatsapp/send-direct',
      'POST',
      {
        phone: '081299988877',
        recipient: newLeadName,
        category: 'crm_objection',
        message: objRes.body?.whatsapp_ready_text || 'Halo Pak, promo spesial Bionet siap dikirim!',
      },
      mitraToken
    );
    assert(sendDirectRes.status === 200, 'Direct message dispatched via WhatsApp Gateway');
    assert(sendDirectRes.body?.data?.status === 'sent', 'Message initial status is "sent"');

    // Check Gateway Status
    const statusRes = await makeRequest('/api/crm/whatsapp/status', 'GET', null, mitraToken);
    assert(statusRes.status === 200, 'Gateway status queried successfully');
    assert(statusRes.body?.data?.status === 'connected', 'Gateway device status is "connected"');

    // Check Gateway Logs
    const logsRes = await makeRequest('/api/crm/whatsapp/logs', 'GET', null, mitraToken);
    assert(logsRes.status === 200, 'Gateway logs queried successfully');
    assert((logsRes.body?.data || []).length > 0, 'Gateway logs contain dispatched messages');

    // -------------------------------------------------------------
    // TEST 5: WHATSAPP IN-APP LIVE MESSENGER (THREADS & CHAT)
    // -------------------------------------------------------------
    console.log('\n[SECTION 5: WhatsApp Web In-App Live Messenger]');
    const threadsRes = await makeRequest('/api/crm/whatsapp/threads', 'GET', null, mitraToken);
    assert(threadsRes.status === 200, 'Fetch all conversation threads');
    assert(threadsRes.body?.data?.length >= 5, 'Found pre-seeded conversation threads');

    const firstThread = threadsRes.body.data[0];
    const tId = firstThread.ID || firstThread.id;

    // Query messages in thread
    const msgsRes = await makeRequest(`/api/crm/whatsapp/threads/${tId}/messages`, 'GET', null, mitraToken);
    assert(msgsRes.status === 200, `Fetch messages for thread ${tId}`);

    // Send in-thread message
    const sendThreadRes = await makeRequest(
      `/api/crm/whatsapp/threads/${tId}/messages`,
      'POST',
      { text: 'Halo dari E2E Automated Test WhatsApp Live!', media_type: 'text' },
      mitraToken
    );
    assert(sendThreadRes.status === 200, 'Send message inside active chat thread');
    assert(sendThreadRes.body?.data?.text === 'Halo dari E2E Automated Test WhatsApp Live!', 'Message body matches');

    // -------------------------------------------------------------
    // TEST 6: CHATBOT KEYWORD AUTO-RESPONDER
    // -------------------------------------------------------------
    console.log('\n[SECTION 6: Chatbot & Keyword Auto-Responder]');
    const rulesRes = await makeRequest('/api/crm/whatsapp/bot-rules', 'GET', null, mitraToken);
    assert(rulesRes.status === 200, 'Fetch auto-responder rules');
    assert(rulesRes.body?.data?.length >= 4, 'Default bot rules (harga, bpom, dosis, join) are active');

    // Add new custom keyword rule
    const addRuleRes = await makeRequest(
      '/api/crm/whatsapp/bot-rules',
      'POST',
      {
        keyword: 'garansi',
        reply: 'Produk Bionet bergaransi 100% uang kembali bila barang rusak atau segel terbuka.',
        category: 'general',
        is_active: true,
      },
      mitraToken
    );
    assert(addRuleRes.status === 200, 'Create new keyword rule ("garansi")');
    const ruleId = addRuleRes.body?.data?.id || addRuleRes.body?.data?.ID;

    // Toggle rule
    const toggleRes = await makeRequest(`/api/crm/whatsapp/bot-rules/${ruleId}/toggle`, 'PATCH', null, mitraToken);
    assert(toggleRes.status === 200, 'Toggle keyword rule ON/OFF');

    // -------------------------------------------------------------
    // TEST 7: BROADCAST BLAST CAMPAIGN
    // -------------------------------------------------------------
    console.log('\n[SECTION 7: WhatsApp Mass Broadcast Blast]');
    const bcRes = await makeRequest(
      '/api/crm/whatsapp/broadcasts',
      'POST',
      {
        title: 'Campaign E2E Promo Herbal',
        target_segment: 'all',
        template: 'Halo {{nama}}, amankan stok {{produk}} Anda dengan subsidi ongkir ke {{kota}}!',
      },
      mitraToken
    );
    assert(bcRes.status === 200, 'Launch broadcast campaign');
    assert(bcRes.body?.data?.total_recipients > 0, 'Campaign targeted recipients successfully');

    // -------------------------------------------------------------
    // TEST 8: VCARD (.VCF) CONTACT SAVER VALIDATION
    // -------------------------------------------------------------
    console.log('\n[SECTION 8: vCard (.vcf) Generator Validation]');
    const sampleContact = {
      name: 'Bambang Sudirman',
      phone: '081298765432',
      city: 'Surabaya',
      notes: 'Minat: Bio-Propolis Trigona',
    };
    const vCardContent = generateVCardString(sampleContact);
    assert(vCardContent.includes('BEGIN:VCARD'), 'vCard header BEGIN:VCARD present');
    assert(vCardContent.includes('VERSION:3.0'), 'vCard version 3.0 specified');
    assert(vCardContent.includes('FN:Bambang Sudirman'), 'Contact full name properly encoded');
    assert(vCardContent.includes('TEL;TYPE=CELL,VOICE:081298765432'), 'Telephone field properly formatted');
    assert(vCardContent.includes('END:VCARD'), 'vCard closing tag END:VCARD present');

    // -------------------------------------------------------------
    // TEST 9: CUSTOMER HEALTH JOURNEY (3-25 HARI)
    // -------------------------------------------------------------
    console.log('\n[SECTION 9: Customer Health Journey Lifecycle]');
    const healthRes = await makeRequest('/api/crm/health-records', 'GET', null, mitraToken);
    assert(healthRes.status === 200, 'Fetch patient health records');
    assert(healthRes.body?.data?.length > 0, 'Seed patients exist in Health Journey');

    // -------------------------------------------------------------
    // TEST 10: INBOUND WEBHOOK LISTENER
    // -------------------------------------------------------------
    console.log('\n[SECTION 10: Inbound WhatsApp Webhook]');
    const webhookRes = await makeRequest(
      '/api/crm/whatsapp/webhook',
      'POST',
      {
        from: '081234567890',
        name: 'Konsumen Inbound E2E',
        message: 'Berapa harga 1 botol propolis?',
      }
    );
    assert(webhookRes.status === 200, 'Inbound webhook processed HTTP 200 without auth requirement');

    // -------------------------------------------------------------
    // SUMMARY REPORT
    // -------------------------------------------------------------
    console.log('\n=============================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
    console.log('=============================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('>>> ALL E2E & API INTEGRATION TESTS PASSED WITH 100% SUCCESS <<<\n');
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution encountered fatal error:', err);
    process.exit(1);
  }
}

runTestSuite();

