const fs = require('fs');

// ==========================================
// 1. UPDATE Header.jsx
// ==========================================
let header = fs.readFileSync('frontend/src/components/Header.jsx', 'utf8');

// Add onOpenTikTok prop to Header
if (!header.includes('onOpenTikTok')) {
  header = header.replace(
    '  onOpenOffice3D,\r\n  onOpenMidtrans,\r\n}',
    '  onOpenOffice3D,\r\n  onOpenMidtrans,\r\n  onOpenTikTok,\r\n}'
  );
  if (!header.includes('onOpenTikTok')) {
    header = header.replace(
      '  onOpenOffice3D,\n  onOpenMidtrans,\n}',
      '  onOpenOffice3D,\n  onOpenMidtrans,\n  onOpenTikTok,\n}'
    );
  }
}

// Add TikTok Sandbox button right after Kantor 3D button
const tiktokBtn = `
        {/* TikTok Sandbox Quick Trigger */}
        <button
          type="button"
          onClick={() => {
            if (onOpenTikTok) onOpenTikTok();
            else window.dispatchEvent(new CustomEvent('synetiq:open-tiktok-sandbox'));
          }}
          title="Masuk dengan TikTok Developer Sandbox (login_mlm)"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white border border-cyan-400/50 hover:border-cyan-400 transition-all text-xs font-bold active:scale-95 shadow-xs cursor-pointer group"
        >
          <svg className="w-3.5 h-3.5 fill-current text-white drop-shadow-[0.5px_0.5px_0px_#00f2fe]" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
          <span className="hidden sm:inline">Masuk TikTok (login_mlm)</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 font-mono">Sandbox</span>
        </button>
`;

if (!header.includes('Masuk TikTok (login_mlm)')) {
  header = header.replace(
    '<span className="hidden sm:inline">Kantor 3D</span>\r\n          </button>\r\n        )}',
    '<span className="hidden sm:inline">Kantor 3D</span>\r\n          </button>\r\n        )}' + tiktokBtn
  );
  if (!header.includes('Masuk TikTok (login_mlm)')) {
    header = header.replace(
      '<span className="hidden sm:inline">Kantor 3D</span>\n          </button>\n        )}',
      '<span className="hidden sm:inline">Kantor 3D</span>\n          </button>\n        )}' + tiktokBtn
    );
  }
}

fs.writeFileSync('frontend/src/components/Header.jsx', header, 'utf8');
console.log('Header.jsx updated successfully!');

// ==========================================
// 2. UPDATE App.jsx
// ==========================================
let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');

if (!app.includes("import TikTokIntegrationModal from './components/crm/TikTokIntegrationModal';")) {
  app = app.replace(
    "import { VirtualOffice3DModal } from './components/office3d';",
    "import { VirtualOffice3DModal } from './components/office3d';\r\nimport TikTokIntegrationModal from './components/crm/TikTokIntegrationModal';"
  );
}

if (!app.includes('const [tikTokModalOpen, setTikTokModalOpen] = useState(false);')) {
  app = app.replace(
    'const [office3DOpen, setOffice3DOpen] = useState(false);',
    'const [office3DOpen, setOffice3DOpen] = useState(false);\r\n  const [tikTokModalOpen, setTikTokModalOpen] = useState(false);\r\n  const [tikTokModalTab, setTikTokModalTab] = useState("sandbox-login");'
  );
}

if (!app.includes('synetiq:open-tiktok-sandbox')) {
  app = app.replace(
    "window.addEventListener('synetiq:open-midtrans', handleOpenMidtrans);",
    "window.addEventListener('synetiq:open-midtrans', handleOpenMidtrans);\r\n\r\n    const handleOpenTikTok = (e) => {\r\n      setTikTokModalTab(e?.detail?.tab || 'sandbox-login');\r\n      setTikTokModalOpen(true);\r\n    };\r\n    window.addEventListener('synetiq:open-tiktok-sandbox', handleOpenTikTok);\r\n    window.addEventListener('bionet:open-tiktok-sandbox', handleOpenTikTok);"
  );
  app = app.replace(
    "window.removeEventListener('synetiq:open-midtrans', handleOpenMidtrans);",
    "window.removeEventListener('synetiq:open-midtrans', handleOpenMidtrans);\r\n      window.removeEventListener('synetiq:open-tiktok-sandbox', handleOpenTikTok);\r\n      window.removeEventListener('bionet:open-tiktok-sandbox', handleOpenTikTok);"
  );
}

if (!app.includes('onOpenTikTok={() => { setTikTokModalTab("sandbox-login"); setTikTokModalOpen(true); }}')) {
  app = app.replace(
    'onOpenOffice3D={() => setOffice3DOpen(true)}',
    'onOpenOffice3D={() => setOffice3DOpen(true)}\r\n          onOpenTikTok={() => { setTikTokModalTab("sandbox-login"); setTikTokModalOpen(true); }}'
  );
}

// Render TikTokIntegrationModal globally
const modalSnippet = `
      {/* TikTok Integration Modal & Sandbox Suite */}
      <TikTokIntegrationModal
        isOpen={tikTokModalOpen}
        onClose={() => setTikTokModalOpen(false)}
        currentUser={user}
        initialTab={tikTokModalTab}
        onLeadInjected={() => {
          fetchStats();
        }}
      />
`;

if (!app.includes('<TikTokIntegrationModal')) {
  app = app.replace(
    '</VirtualOffice3DModal>',
    '</VirtualOffice3DModal>' + modalSnippet
  );
}

fs.writeFileSync('frontend/src/App.jsx', app, 'utf8');
console.log('App.jsx updated successfully!');
