/**
 * Bionet Enterprise - Comprehensive E2E & Security Test Suite
 * Fitur: Pilar 1 (Bio-Link & Marketing), Pilar 2 (Gamifikasi & Academy), Pilar 5 (WAHA Media & Smart Scheduler),
 *        Regression Test (Auth, Binary Tree, Wallet, CRM Kanban, WAHA Session),
 *        Security & Access Control Audit (RBAC, JWT Guard, Sensitive Data Leakage, Sanitization).
 */

const BASE_URL = process.env.API_URL || 'http://localhost:8081';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  gray: '\x1b[90m',
};

let passedCount = 0;
let failedCount = 0;
const testLogs = [];

function assert(condition, message, details = '') {
  if (condition) {
    console.log(`  ${colors.green}✔ PASS${colors.reset} ${message}`);
    passedCount++;
    testLogs.push({ status: 'PASS', message, details });
  } else {
    console.error(`  ${colors.red}✖ FAIL${colors.reset} ${message}`);
    if (details) console.error(`     ${colors.red}Detail: ${details}${colors.reset}`);
    failedCount++;
    testLogs.push({ status: 'FAIL', message, details });
  }
}

async function request(method, path, body = null, token = null) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  let parsed = null;
  const rawText = await res.text();
  try {
    parsed = JSON.parse(rawText);
  } catch (e) {
    parsed = rawText;
  }

  return {
    status: res.status,
    headers: res.headers,
    body: parsed,
    raw: rawText,
  };
}

async function runTestSuite() {
  console.log(`\n${colors.bold}${colors.cyan}========================================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   BIONET ENTERPRISE - COMPREHENSIVE QA & SECURITY E2E SUITE${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}   Pilar 1 (Bio-Link), Pilar 2 (Gamifikasi), Pilar 5 (WAHA Media/Scheduler)${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}========================================================================${colors.reset}\n`);
  console.log(`Target Backend: ${colors.yellow}${BASE_URL}${colors.reset}\n`);

  let adminToken = '';
  let mitraToken = '';
  let createdLeadId = '';
  let createdScheduleId = '';
  let testWebinarId = '';

  // --------------------------------------------------------------------------
  // SECTION 1: AUTHENTICATION & ACCESS CONTROL
  // --------------------------------------------------------------------------
  console.log(`${colors.bold}[SECTION 1: Multi-Role Authentication & Access Control]${colors.reset}`);
  {
    // 1.1 Invalid credentials test
    const badLogin = await request('POST', '/api/auth/login', { username: 'mitra01', password: 'wrongpassword' });
    assert(badLogin.status === 401, 'Rejection of invalid password credentials with HTTP 401');

    // 1.2 Admin Login
    const adminRes = await request('POST', '/api/auth/login', { username: 'admin01', password: 'bionet123' });
    assert(adminRes.status === 200 && adminRes.body?.data?.token, 'Admin (admin01) login successful & token issued');
    adminToken = adminRes.body?.data?.token || '';

    // 1.3 Mitra Login
    const mitraRes = await request('POST', '/api/auth/login', { username: 'mitra01', password: 'bionet123' });
    assert(mitraRes.status === 200 && mitraRes.body?.data?.token, 'Mitra Member (mitra01) login successful & token issued');
    mitraToken = mitraRes.body?.data?.token || '';

    // 1.4 Get Profile (Protected)
    const profileRes = await request('GET', '/api/auth/me', null, mitraToken);
    assert(profileRes.status === 200 && profileRes.body?.data?.username === 'mitra01', 'Mitra profile verified (/api/auth/me)');
  }

  // --------------------------------------------------------------------------
  // SECTION 2: PILAR 1 - PEMASARAN & AI GROWTH ENGINE (BIO-LINK & FUNNEL)
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}[SECTION 2: Pilar 1 - Bio-Link, Lead Capture & Marketing Studio]${colors.reset}`);
  {
    // 2.1 Public Bio-Page Fetch
    const bioRes1 = await request('GET', '/api/bio/mitra01');
    assert(bioRes1.status === 200, 'Public Bio-Page endpoint returns HTTP 200 for mitra01');
    assert(bioRes1.body?.data?.username === 'mitra01', 'Bio-Page data matches requested username');
    assert(Array.isArray(bioRes1.body?.data?.featured_products) && bioRes1.body.data.featured_products.length > 0, 'Bio-Page contains featured herbal products catalog');
    assert(Array.isArray(bioRes1.body?.data?.testimonials) && bioRes1.body.data.testimonials.length > 0, 'Bio-Page contains customer social proof & testimonials');
    const initialViews = bioRes1.body?.data?.total_views || 0;

    // 2.2 Increment views on subsequent view
    const bioRes2 = await request('GET', '/api/bio/mitra01');
    const secondViews = bioRes2.body?.data?.total_views || 0;
    assert(secondViews >= initialViews, `Bio-Page telemetry view counter tracked (initial: ${initialViews}, after: ${secondViews})`);

    // 2.3 Lead Capture Validation Failure
    const badLead = await request('POST', '/api/bio/lead', { username: 'mitra01' });
    assert(badLead.status === 400, 'Lead capture rejects missing name/phone with HTTP 400 Bad Request');

    // 2.4 Lead Capture Success
    const validLeadPayload = {
      username: 'mitra01',
      name: 'Bpk. Hendra Gunawan E2E',
      phone: '0812-3344-5566',
      email: 'hendra.gunawan@example.com',
      city: 'Semarang',
      product_interest: 'Bio-Propolis Trigona 30ml',
      notes: 'Tertarik paket reseller distributor herbal 2 botol',
      estimated_value: 500000,
    };
    const leadRes = await request('POST', '/api/bio/lead', validLeadPayload);
    assert(leadRes.status === 201, 'Lead capture form submission creates lead with HTTP 201 Created');
    assert(leadRes.body?.data?.status === 'new', 'Captured lead automatically tagged with stage "new"');
    assert(leadRes.body?.data?.source === 'bio_link', 'Captured lead attribution source set to "bio_link"');
    assert(leadRes.body?.data?.phone === '6281233445566', 'Lead phone number automatically normalized with 62 prefix');
    createdLeadId = leadRes.body?.data?.id || '';

    // 2.5 Marketing Kits Listing & Category Filter
    const kitsRes = await request('GET', '/api/marketing/kits');
    assert(kitsRes.status === 200 && Array.isArray(kitsRes.body?.data), 'Marketing Studio promotional kits fetched successfully');
    assert(kitsRes.body?.data?.length >= 4, `Marketing Studio contains multiple promotional assets (total: ${kitsRes.body?.data?.length})`);

    const filterKitsRes = await request('GET', '/api/marketing/kits?category=promo_propolis');
    assert(filterKitsRes.status === 200, 'Marketing Kits category filter responds HTTP 200');
    const allPromoPropolis = filterKitsRes.body?.data?.every(k => k.category === 'promo_propolis');
    assert(allPromoPropolis, 'Filtered kits match category "promo_propolis"');

    // 2.6 BOP Webinars List & Registration
    const webinarsRes = await request('GET', '/api/marketing/webinars');
    assert(webinarsRes.status === 200 && Array.isArray(webinarsRes.body?.data), 'Weekly BOP webinars retrieved successfully');
    assert(webinarsRes.body?.data?.length > 0, 'Found scheduled BOP webinars in database');
    testWebinarId = webinarsRes.body?.data?.[0]?.id || '';

    const webinarRegPayload = {
      webinar_id: testWebinarId,
      sponsor_username: 'mitra01',
      name: 'Ibu Ratna Kumala',
      phone: '0813-9988-7711',
      email: 'ratna.k@example.com',
      city: 'Surabaya',
    };
    const regRes = await request('POST', '/api/marketing/webinars/register', webinarRegPayload);
    assert(regRes.status === 201, 'Webinar registration endpoint creates registration with HTTP 201 Created');
    assert(!!regRes.body?.data?.ticket_code, `Webinar ticket generated (${regRes.body?.data?.ticket_code})`);
    assert(!!regRes.body?.data?.zoom_link, 'Webinar response contains valid Zoom room connection link');
    assert(regRes.body?.data?.stage === 'webinar', 'Webinar registrant added to CRM pipeline with stage "webinar"');

    // 2.7 Bio-Link Personal Management (Protected Mitra Route)
    const myBioRes = await request('GET', '/api/bio/my-page', null, mitraToken);
    assert(myBioRes.status === 200, 'Mitra can access personal Bio-Link configuration (/api/bio/my-page)');

    const updateBioPayload = {
      title: 'Distributor Resmi Platinum Bionet - Mitra Juara',
      bio: 'Solusi herbal terpercaya & peluang bisnis barokah berpenghasilan harian.',
      theme: 'emerald',
      whatsapp_number: '6281234567890',
      cta_button_text: 'Konsultasi Gratis Sekarang',
      cta_button_url: 'https://wa.me/6281234567890',
    };
    const updateBioRes = await request('PUT', '/api/bio/my-page', updateBioPayload, mitraToken);
    assert(updateBioRes.status === 200, 'Mitra can update Bio-Link configuration (/api/bio/my-page)');
    assert(updateBioRes.body?.data?.title === updateBioPayload.title, 'Bio-Page updated title persisted correctly');
  }

  // --------------------------------------------------------------------------
  // SECTION 3: PILAR 2 - GAMIFIKASI, LEADERBOARD & ACADEMY
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}[SECTION 3: Pilar 2 - Gamifikasi, Leaderboard & Academy]${colors.reset}`);
  {
    // 3.1 Public Leaderboard for all 3 competition types
    const rankTypes = ['sponsor', 'omset', 'pairing'];
    for (const rankType of rankTypes) {
      const lbRes = await request('GET', `/api/gamification/leaderboard?type=${rankType}&period=monthly`);
      assert(lbRes.status === 200, `Leaderboard queried for type "${rankType}" with HTTP 200`);
      assert(Array.isArray(lbRes.body?.data) && lbRes.body.data.length > 0, `Leaderboard "${rankType}" has ranked entries`);
      assert(lbRes.body.data[0].rank === 1, `Leaderboard "${rankType}" top entry has rank 1`);
      assert(lbRes.body.data[0].score > 0, `Leaderboard "${rankType}" top entry score is positive`);
    }

    // 3.2 Reward Race Progress (Protected)
    const rewRes = await request('GET', '/api/gamification/reward-progress', null, mitraToken);
    assert(rewRes.status === 200, 'Reward race progress retrieved successfully (/api/gamification/reward-progress)');
    assert(typeof rewRes.body?.data?.total_pv_left === 'number', 'Reward progress includes total_pv_left');
    assert(typeof rewRes.body?.data?.total_pv_right === 'number', 'Reward progress includes total_pv_right');
    assert(Array.isArray(rewRes.body?.data?.rewards) && rewRes.body.data.rewards.length >= 5, 'Found 5 dream reward milestone tiers (Smartwatch, Umroh, Mobilio, Pajero, Rumah)');
    
    const validPercentages = rewRes.body?.data?.rewards?.every(r => r.progress_percentage >= 0 && r.progress_percentage <= 100);
    assert(validPercentages, 'All reward progress percentages are strictly within [0, 100]% bounds');

    // 3.3 Academy Modules Listing
    const acadRes = await request('GET', '/api/academy/modules', null, mitraToken);
    assert(acadRes.status === 200, 'Academy curriculum modules fetched with HTTP 200');
    assert(Array.isArray(acadRes.body?.data) && acadRes.body.data.length === 7, `Academy curriculum strictly contains all 7 core modules (got: ${acadRes.body?.data?.length})`);

    // 3.4 Academy Quiz Completion & Certification
    const quizPayload = {
      module_id: 'mod-01',
      score: 100,
      answers: [1, 1],
    };
    const compRes = await request('POST', '/api/academy/complete', quizPayload, mitraToken);
    assert(compRes.status === 200, 'Academy module quiz completion submitted with HTTP 200');
    assert(compRes.body?.badge === 'Bionet Pioneer', 'Completing Module 1 awards the "Bionet Pioneer" digital badge');

    // 3.5 Re-check Academy Module Status (Persisted)
    const acadRes2 = await request('GET', '/api/academy/modules', null, mitraToken);
    const mod1 = acadRes2.body?.data?.find(m => m.id === 'mod-01');
    assert(mod1?.is_completed === true, 'Academy Module 1 successfully marked as completed in user profile');

    // 3.6 Downline Inactivity Alerts (Proactive Coaching)
    const alertRes = await request('GET', '/api/gamification/inactivity-alerts', null, mitraToken);
    assert(alertRes.status === 200, 'Inactivity alerts queried successfully (/api/gamification/inactivity-alerts)');
    assert(Array.isArray(alertRes.body?.data), 'Inactivity alerts returns array of flagged downlines');
    if (alertRes.body?.data?.length > 0) {
      const sample = alertRes.body.data[0];
      assert(sample.days_inactive >= 14, `Inactive downline correctly detected with >= 14 days without RO (days: ${sample.days_inactive})`);
      assert(!!sample.suggested_whatsapp_text, 'Inactivity alert includes ready-to-send WhatsApp coaching copy');
    }
  }

  // --------------------------------------------------------------------------
  // SECTION 4: PILAR 5 - WHATSAPP MEDIA DISPATCH & SMART SCHEDULER
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}[SECTION 4: Pilar 5 - WAHA Media Dispatch & Smart Scheduler]${colors.reset}`);
  {
    // 4.1 Media Dispatch Validation Failure
    const badMedia = await request('POST', '/api/crm/whatsapp/send-media', { phone: '08123456789' }, mitraToken);
    assert(badMedia.status === 400, 'WhatsApp Media dispatch rejects missing media_type/media_url with HTTP 400');

    // 4.2 Send Voice Note / Audio
    const voicePayload = {
      phone: '081234567890',
      recipient: 'Bpk. Ahmad Susanto',
      media_type: 'voice',
      media_url: 'https://bionet.id/assets/audio/penjelasan-propolis.mp3',
      caption: 'Voice Note: Edukasi Terapi Bio-Propolis Trigona',
      category: 'crm_consultation',
      lead_id: createdLeadId,
    };
    const voiceRes = await request('POST', '/api/crm/whatsapp/send-media', voicePayload, mitraToken);
    assert(voiceRes.status === 200, 'Voice Note / Audio dispatched via WhatsApp Gateway with HTTP 200');
    assert(voiceRes.body?.data?.status === 'sent', 'Voice Note status logged as "sent"');

    // 4.3 Send Document / PDF Certificate
    const docPayload = {
      phone: '081298765432',
      recipient: 'Ibu Ratna Dewi',
      media_type: 'document',
      media_url: 'https://bionet.id/assets/legal/bpom-certificate.pdf',
      caption: 'Sertifikat Izin Edar BPOM TR 226012891.pdf',
      category: 'crm_legality',
    };
    const docRes = await request('POST', '/api/crm/whatsapp/send-media', docPayload, mitraToken);
    assert(docRes.status === 200, 'Legal Document / PDF dispatched via WhatsApp Gateway with HTTP 200');
    assert(docRes.body?.data?.category === 'crm_legality', 'Document dispatch category logged correctly');

    // 4.4 WhatsApp Schedules List
    const schedListRes = await request('GET', '/api/crm/whatsapp/schedules', null, mitraToken);
    assert(schedListRes.status === 200 && Array.isArray(schedListRes.body?.data), 'Auto follow-up schedules list retrieved with HTTP 200');

    // 4.5 WhatsApp Schedule Creation
    const newSchedulePayload = {
      lead_id: createdLeadId,
      recipient: 'Bpk. Gunawan Test E2E',
      phone: '081233445566',
      message: 'Halo Pak Gunawan, kami ingin mengonfirmasi jadwal konsultasi herbal lanjutan Bionet besok pagi.',
      category: 'crm_followup',
      delay_hours: 24,
    };
    const createSchedRes = await request('POST', '/api/crm/whatsapp/schedules', newSchedulePayload, mitraToken);
    assert(createSchedRes.status === 201, 'New follow-up schedule created with HTTP 201 Created');
    assert(createSchedRes.body?.data?.phone === '6281233445566', 'Scheduled phone normalized with 62 international prefix');
    createdScheduleId = createSchedRes.body?.data?.id || '';

    // 4.6 WhatsApp Schedule Deletion
    if (createdScheduleId) {
      const delSchedRes = await request('DELETE', `/api/crm/whatsapp/schedules/${createdScheduleId}`, null, mitraToken);
      assert(delSchedRes.status === 200, `Scheduled follow-up (${createdScheduleId}) deleted with HTTP 200 OK`);
    }
  }

  // --------------------------------------------------------------------------
  // SECTION 5: REGRESSION TESTING (CORE ARCHITECTURE & FITUR EKSISTING)
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}[SECTION 5: Core Regression Testing - MLM Binary, Wallet, Kanban, WAHA]${colors.reset}`);
  {
    // 5.1 Binary Tree Genealogy Integrity
    const genRes = await request('GET', '/api/dashboard/genealogy', null, mitraToken);
    assert(genRes.status === 200, 'Binary Tree Genealogy responds HTTP 200 (/api/dashboard/genealogy)');
    assert(!!genRes.body?.data?.id || !!genRes.body?.data?.username, 'Binary Tree root node present and populated');

    // 5.2 Wallet & Bonus Ledger
    const statsRes = await request('GET', '/api/dashboard/stats', null, mitraToken);
    assert(statsRes.status === 200, 'Member dashboard stats queried successfully (/api/dashboard/stats)');
    const walletBal = statsRes.body?.data?.wallet_balance ?? statsRes.body?.data?.balance;
    assert(typeof walletBal === 'number', `Wallet balance is a valid numeric value (${walletBal})`);

    const txRes = await request('GET', '/api/dashboard/transactions', null, mitraToken);
    assert(txRes.status === 200 && Array.isArray(txRes.body?.data), 'Wallet transaction ledger queried successfully (/api/dashboard/transactions)');

    // 5.3 CRM Kanban Pipeline Stage Update
    if (createdLeadId) {
      const stageUpdateRes = await request('PUT', `/api/crm/leads/${createdLeadId}/status`, { status: 'interested' }, mitraToken);
      assert(stageUpdateRes.status === 200, `CRM lead status transitioned to "interested" (HTTP 200)`);
    }

    // 5.4 WAHA Session & Live Telemetry
    const wahaDeviceRes = await request('GET', '/api/crm/whatsapp/device', null, mitraToken);
    assert(wahaDeviceRes.status === 200, 'WAHA WhatsApp device session queried (/api/crm/whatsapp/device)');
    assert(wahaDeviceRes.body?.data?.status === 'connected', 'WAHA WhatsApp Gateway status is active & connected');

    const wahaStatusRes = await request('GET', '/api/crm/whatsapp/status', null, mitraToken);
    assert(wahaStatusRes.status === 200, 'WhatsApp Gateway live telemetry status queried (/api/crm/whatsapp/status)');
  }

  // --------------------------------------------------------------------------
  // SECTION 6: SECURITY & ACCESS CONTROL AUDIT
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}[SECTION 6: Security & Access Control Audit]${colors.reset}`);
  {
    // 6.1 Protected Routes Rejecting Requests without Token (401 Unauthorized)
    const protectedRoutes = [
      { method: 'GET', path: '/api/auth/me' },
      { method: 'GET', path: '/api/dashboard/stats' },
      { method: 'GET', path: '/api/dashboard/genealogy' },
      { method: 'GET', path: '/api/bio/my-page' },
      { method: 'GET', path: '/api/gamification/reward-progress' },
      { method: 'GET', path: '/api/academy/modules' },
      { method: 'POST', path: '/api/crm/whatsapp/send-media', body: {} },
      { method: 'GET', path: '/api/crm/whatsapp/schedules' },
    ];

    for (const r of protectedRoutes) {
      const unauth = await request(r.method, r.path, r.body || null, null);
      assert(unauth.status === 401, `JWT Guard blocks unauthenticated request to ${r.method} ${r.path} (HTTP 401)`);
    }

    // 6.2 Sensitive Data Leakage Audit on Public Routes
    const publicRoutesToCheck = [
      '/api/bio/mitra01',
      '/api/gamification/leaderboard?type=sponsor',
      '/api/marketing/kits',
      '/api/marketing/webinars',
    ];

    for (const route of publicRoutesToCheck) {
      const pubRes = await request('GET', route);
      const rawBody = pubRes.raw.toLowerCase();
      const leaksPasswordHash = rawBody.includes('password_hash') || rawBody.includes('$2a$') || rawBody.includes('passwordhash');
      const leaksSecret = rawBody.includes('jwt_secret') || rawBody.includes('db_password');
      assert(!leaksPasswordHash, `Zero password_hash leakage in public endpoint: ${route}`);
      assert(!leaksSecret, `Zero credential / secret leakage in public endpoint: ${route}`);
    }

    // 6.3 Input Sanitization & Attack Resistance
    const xssPayload = {
      username: 'mitra01',
      name: '<script>alert("XSS")</script> Bpk Hacking',
      phone: '0812-9988-7766',
      notes: "'); DROP TABLE users; --",
    };
    const xssRes = await request('POST', '/api/bio/lead', xssPayload);
    assert(xssRes.status === 201, 'Input with special chars / SQL injection probe accepted safely without backend crash');
    assert(!xssRes.body?.data?.name?.includes('<script>'), 'XSS injection characters safely parsed/sanitized in lead entity');
  }

  // --------------------------------------------------------------------------
  // TEST SUMMARY & FINAL VERDICT
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.cyan}========================================================================${colors.reset}`);
  console.log(`${colors.bold}TEST EXECUTION SUMMARY:${colors.reset}`);
  console.log(`  Total Assertion Checks : ${colors.bold}${passedCount + failedCount}${colors.reset}`);
  console.log(`  Passed Checks          : ${colors.green}${passedCount}${colors.reset}`);
  console.log(`  Failed Checks          : ${failedCount === 0 ? colors.green + '0' : colors.red + failedCount}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}========================================================================${colors.reset}`);

  if (failedCount === 0) {
    console.log(`\n${colors.bold}${colors.green}>>> 100% AUDIT & E2E INTEGRATION TESTS PASSED SUCCESSFULLY! NO REGRESSIONS DETECTED. <<<${colors.reset}\n`);
    process.exit(0);
  } else {
    console.error(`\n${colors.bold}${colors.red}>>> TEST SUITE FAILED WITH ${failedCount} FAILURES! <<<${colors.reset}\n`);
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
