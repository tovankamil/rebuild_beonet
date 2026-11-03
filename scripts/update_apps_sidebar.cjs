const fs = require('fs');
let s = fs.readFileSync('frontend/src/components/dashlite/AppsSidebar.jsx', 'utf8');

// 1. Add TikTok Sandbox submenu item under admin leads
if (!s.includes("title: 'Masuk TikTok (login_mlm)'")) {
  s = s.replace(
    "{ id: 'ai-marketing', title: 'Studio Konten AI & Generator Video', desc: 'Copywriting BPOM & video TikTok / Reels', icon: Video },",
    "{ id: 'ai-marketing', title: 'Studio Konten AI & Generator Video', desc: 'Copywriting BPOM & video TikTok / Reels', icon: Video },\r\n          { id: 'leads', subView: 'tiktok-sandbox', title: 'Masuk TikTok (login_mlm)', desc: 'Login Kit & Sandbox sbawhzed8x3yk47hhl', icon: Video, action: 'open_tiktok_sandbox' },"
  );

  // Add under member leads
  s = s.replace(
    "{ id: 'leads', subView: 'ro-reminders', title: 'Smart RO Reminder & Retensi', desc: 'Prediksi habisnya herbal & downline pasif', icon: Droplets },\r\n      ],",
    "{ id: 'leads', subView: 'ro-reminders', title: 'Smart RO Reminder & Retensi', desc: 'Prediksi habisnya herbal & downline pasif', icon: Droplets },\r\n        { id: 'leads', subView: 'tiktok-sandbox', title: 'Masuk TikTok (login_mlm)', desc: 'Login Kit & Sandbox sbawhzed8x3yk47hhl', icon: Video, action: 'open_tiktok_sandbox' },\r\n      ],"
  );
}

// 2. Add action handling for open_tiktok_sandbox
const actionCheck = `    } else if (sub.action === 'open_tiktok_sandbox' || sub.subView === 'tiktok-sandbox') {
      window.dispatchEvent(new CustomEvent('synetiq:open-tiktok-sandbox'));
      setHoveredMenu(null);
      return;
`;

if (!s.includes("sub.action === 'open_tiktok_sandbox'")) {
  s = s.replace(
    "} else if (sub.action === 'open_herbal_farm' || sub.id === 'herbal-farm') {",
    actionCheck + "    } else if (sub.action === 'open_herbal_farm' || sub.id === 'herbal-farm') {"
  );
}

fs.writeFileSync('frontend/src/components/dashlite/AppsSidebar.jsx', s, 'utf8');
console.log('SUCCESS: AppsSidebar.jsx updated');
