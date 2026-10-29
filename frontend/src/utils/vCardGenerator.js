/**
 * vCard Generator Utility (RFC 6350 Compliant)
 * Memungkinkan mitra menyimpan nomor prospek, konsumen, atau downline
 * langsung ke buku telepon HP / WhatsApp (Android & iOS) dengan sekali klik.
 */

// Format nomor HP ke standar internasional WhatsApp (+62...)
export function formatPhoneInternational(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return '+' + cleaned;
}

/**
 * Menghasilkan string vCard 3.0 untuk 1 kontak
 */
export function generateSingleVCard({
  name = 'Prospek Bionet',
  phone = '',
  email = '',
  company = 'Bionet Juara Perkasa',
  title = 'Prospek Kemitraan Herbal',
  note = 'Kontak prospek resmi dari Bionet Network CRM',
  city = '',
}) {
  const formattedPhone = formatPhoneInternational(phone);
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name.trim()} (Bionet)`,
    `N:${name.trim()};;;;`,
    `ORG:${company}`,
    title ? `TITLE:${title}` : '',
    formattedPhone ? `TEL;TYPE=CELL,VOICE,PREF:${formattedPhone}` : '',
    email ? `EMAIL;TYPE=INTERNET,WORK:${email}` : '',
    city ? `ADR;TYPE=WORK:;;;${city};;;Indonesia` : '',
    note ? `NOTE:${note.replace(/\n/g, '\\n')}` : '',
    `REV:${now}`,
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');
}

/**
 * Mengunduh file .vcf untuk 1 kontak
 */
export function downloadVCardContact(contact) {
  const vcfContent = generateSingleVCard(contact);
  const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const sanitizedName = (contact.name || 'kontak_bionet').replace(/[^a-zA-Z0-9]/g, '_');

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${sanitizedName}_bionet.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Mengunduh file .vcf massal (Batch Export) berisi seluruh daftar kontak
 */
export function downloadBatchVCard(contacts = [], batchTitle = 'semua_prospek_bionet') {
  if (!contacts || contacts.length === 0) return;

  const allVcards = contacts
    .map((c) =>
      generateSingleVCard({
        name: c.name || c.full_name || c.username,
        phone: c.phone || c.whatsapp,
        email: c.email || '',
        company: 'Bionet Network System',
        title: c.product_interest || c.package_name || 'Prospek Herbal Bionet',
        note: `Status: ${c.status || 'Active'} | Kota: ${c.city || 'Indonesia'} | Ditambahkan via CRM Bionet`,
        city: c.city || '',
      })
    )
    .join('\r\n\r\n');

  const blob = new Blob([allVcards], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${batchTitle}_${new Date().toISOString().slice(0, 10)}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
