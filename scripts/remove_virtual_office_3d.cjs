const fs = require('fs');
const path = require('path');

// 1. UPDATE App.jsx
let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// remove import
app = app.replace(/import\s*\{\s*VirtualOffice3DModal\s*\}\s*from\s*'\.\/components\/office3d';\r?\n?/, '');

// remove modal tabs
app = app.replace(/\s*'office-3d',\r?\n/, '\r\n');
app = app.replace(/\s*'virtual-office',\r?\n/, '\r\n');

// remove office3DOpen state
app = app.replace(/\s*const \[office3DOpen, setOffice3DOpen\] = useState\(false\);/, '');

// remove handleOpenOffice3D function
app = app.replace(/\s*const handleOpenOffice3D = \(\) => \{\r?\n\s*setOffice3DOpen\(true\);\r?\n\s*\};/, '');

// remove event listeners
app = app.replace(/\s*window\.addEventListener\('synetiq:open-office3d', handleOpenOffice3D\);/, '');
app = app.replace(/\s*window\.addEventListener\('bionet:open-office3d', handleOpenOffice3D\);/, '');
app = app.replace(/\s*window\.removeEventListener\('synetiq:open-office3d', handleOpenOffice3D\);/, '');
app = app.replace(/\s*window\.removeEventListener\('bionet:open-office3d', handleOpenOffice3D\);/, '');

// remove tab match
app = app.replace(/\s*else if \(activeTab === 'office-3d' \|\| activeTab === 'virtual-office'\) setOffice3DOpen\(true\);/, '');

// remove onOpenOffice3D props
app = app.replace(/\s*onOpenOffice3D=\{\(\) => setOffice3DOpen\(true\)\}/g, '');

// remove VirtualOffice3DModal component render
const modalRegex = /\{\/\* Executive 3D Virtual Office Penthouse Modal \*\/\}[\s\S]*?<VirtualOffice3DModal[\s\S]*?<\/VirtualOffice3DModal>/;
app = app.replace(modalRegex, '');
const modalSelfCloseRegex = /\{\/\* Executive 3D Virtual Office Penthouse Modal \*\/\}[\s\S]*?<VirtualOffice3DModal[\s\S]*?\/>/;
app = app.replace(modalSelfCloseRegex, '');

fs.writeFileSync('frontend/src/App.jsx', app, 'utf8');
console.log('App.jsx updated: virtual office 3D removed');

// 2. UPDATE Header.jsx
let header = fs.readFileSync('frontend/src/components/Header.jsx', 'utf8');

// remove Box import
header = header.replace(/\s*Box,/, '');

// remove onOpenOffice3D prop from Header argument
header = header.replace(/\s*onOpenOffice3D,\r?\n?/, '\r\n');

// remove Kantor 3D button
const headerOfficeBtn = /\{\/\* Fitur Utama: Kantor Virtual 3D Eksekutif Mitra \*\/\}[\s\S]*?<\/button>\s*\)\}/;
header = header.replace(headerOfficeBtn, '');

fs.writeFileSync('frontend/src/components/Header.jsx', header, 'utf8');
console.log('Header.jsx updated: virtual office 3D removed');

// 3. UPDATE OverviewTab.jsx
let overview = fs.readFileSync('frontend/src/components/OverviewTab.jsx', 'utf8');
const bannerRegex = /\{\/\* Virtual Office 3D Penthouse Executive Showcase Banner \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
overview = overview.replace(bannerRegex, '');
if (overview.includes('Kantor Virtual 3D Eksekutif Mitra')) {
  const fallbackRegex = /\{\/\* Virtual Office 3D Penthouse Executive Showcase Banner \*\/\}[\s\S]*?<span>🚀 Masuk Kantor 3D<\/span>\s*<\/button>\s*<\/div>/;
  overview = overview.replace(fallbackRegex, '');
}

fs.writeFileSync('frontend/src/components/OverviewTab.jsx', overview, 'utf8');
console.log('OverviewTab.jsx updated: virtual office 3D banner removed');

// 4. DELETE frontend/src/components/office3d directory
const office3dDir = path.join('frontend', 'src', 'components', 'office3d');
if (fs.existsSync(office3dDir)) {
  fs.rmSync(office3dDir, { recursive: true, force: true });
  console.log('frontend/src/components/office3d directory deleted successfully');
}

