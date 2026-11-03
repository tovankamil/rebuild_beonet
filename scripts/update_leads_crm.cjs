const fs = require('fs');
let c = fs.readFileSync('frontend/src/components/crm/LeadsCRMTab.jsx', 'utf8');

// 1. Add tikTokModalInitialTab state
if (!c.includes('tikTokModalInitialTab')) {
  c = c.replace(
    'const [tikTokModalOpen, setTikTokModalOpen] = useState(false);',
    'const [tikTokModalOpen, setTikTokModalOpen] = useState(false);\r\n  const [tikTokModalInitialTab, setTikTokModalInitialTab] = useState("sandbox-login");'
  );
}

// 2. Update Header Action button
const oldPattern = /<button[\s\S]*?onClick=\{\(\) => setTikTokModalOpen\(true\)\}[\s\S]*?<span>Integrasi TikTok Ads<\/span>[\s\S]*?<\/button>/;

const newBtn = `<button
              type="button"
              onClick={() => { setTikTokModalInitialTab("sandbox-login"); setTikTokModalOpen(true); }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/95 hover:bg-black border border-cyan-400/60 hover:border-cyan-400 text-white font-bold text-xs transition flex items-center space-x-2 shadow-lg shadow-cyan-950/40 group cursor-pointer active:scale-95"
              title="Masuk dengan TikTok Developer Sandbox (login_mlm)"
            >
              <svg className="w-4 h-4 fill-current text-white drop-shadow-[1px_1px_0px_#00f2fe]" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
              <span>Masuk dengan TikTok (login_mlm)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 font-mono">Sandbox</span>
            </button>`;

c = c.replace(oldPattern, newBtn);

// 3. Add initialTab prop
c = c.replace(
  '<TikTokIntegrationModal\r\n        isOpen={tikTokModalOpen}\r\n        onClose={() => setTikTokModalOpen(false)}',
  '<TikTokIntegrationModal\r\n        isOpen={tikTokModalOpen}\r\n        onClose={() => setTikTokModalOpen(false)}\r\n        initialTab={tikTokModalInitialTab}'
);

fs.writeFileSync('frontend/src/components/crm/LeadsCRMTab.jsx', c, 'utf8');
console.log('SUCCESS: LeadsCRMTab.jsx updated');

