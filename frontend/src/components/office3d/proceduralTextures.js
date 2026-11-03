import * as THREE from 'three';

/**
 * Creates high-resolution procedural canvas textures for the 3D Virtual Office.
 * 100% client-side, zero image HTTP requests, instant loading, crisp rendering.
 */

/**
 * Executive Penthouse Marble Floor with Glowing Cyber Grid
 */
export function createFloorTexture(isNight = true) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  if (isNight) {
    // Deep obsidian marble background
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
    bgGrad.addColorStop(0, '#040711');
    bgGrad.addColorStop(0.5, '#080d1e');
    bgGrad.addColorStop(1, '#050914');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle marble veining
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 150 * i + 40);
      ctx.bezierCurveTo(300, 120 * i, 700, 180 * i + 60, 1024, 160 * i);
      ctx.stroke();
    }

    // Modern architectural large tile grid (8x8 tiles)
    const gridSize = 128;
    ctx.lineWidth = 1.5;

    for (let x = 0; x <= 1024; x += gridSize) {
      // Glow line
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();

      // Sharp grid seam
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }

    for (let y = 0; y <= 1024; y += gridSize) {
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Glowing intersection nodes
    for (let x = 0; x <= 1024; x += gridSize) {
      for (let y = 0; y <= 1024; y += gridSize) {
        const dotGrad = ctx.createRadialGradient(x, y, 0, x, y, 8);
        dotGrad.addColorStop(0, 'rgba(0, 242, 254, 0.8)');
        dotGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.4)');
        dotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = dotGrad;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else {
    // Day Executive Luxury: Warm polished white Italian Carrara marble
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(0.5, '#f1f5f9');
    bgGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Marble veins
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 200 * i);
      ctx.bezierCurveTo(400, 180 * i + 30, 600, 220 * i - 20, 1024, 190 * i);
      ctx.stroke();
    }

    // Clean subtle gold/platinum grid seams
    const gridSize = 128;
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.2)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= 1024; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1024);
      ctx.stroke();
    }
    for (let y = 0; y <= 1024; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

/**
 * Procedural Skyscraper Window Patterns for Exterior Skyline
 */
export function createSkyscraperTexture(style = 'mixed', isNight = true) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Building facade background
  ctx.fillStyle = isNight ? '#0b1120' : '#475569';
  ctx.fillRect(0, 0, 256, 512);

  const cols = 8;
  const rows = 28;
  const padX = 6;
  const padY = 4;
  const w = (256 - padX * (cols + 1)) / cols;
  const h = (512 - padY * (rows + 1)) / rows;

  const windowColorsNight = [
    'rgba(0, 242, 254, 0.95)',   // Neon cyan
    'rgba(16, 185, 129, 0.9)',   // Emerald
    'rgba(245, 158, 11, 0.95)',  // Warm gold
    'rgba(224, 231, 255, 0.95)', // Crisp white
    'rgba(168, 85, 247, 0.8)',   // Neon violet
    'rgba(15, 23, 42, 0.3)',     // Dark/unlit
    'rgba(15, 23, 42, 0.3)',     // Dark/unlit
  ];

  const windowColorsDay = [
    'rgba(241, 245, 249, 0.95)', // Sun reflection
    'rgba(186, 230, 253, 0.85)', // Sky blue reflection
    'rgba(148, 163, 184, 0.4)',  // Tinted glass
  ];

  const colors = isNight ? windowColorsNight : windowColorsDay;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padX + c * (w + padX);
      const y = padY + r * (h + padY);

      // Random window color or dark window
      const color = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Executive Holographic Terminal Display Canvas Texture (Desk Screen)
 */
export function createHoloScreenTexture(userName = 'Mitra Eksekutif', rank = 'Diamond Leader') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Dark translucent holographic background
  ctx.fillStyle = 'rgba(4, 15, 30, 0.92)';
  ctx.fillRect(0, 0, 1024, 512);

  // Hologram outer cyber border
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 6;
  ctx.strokeRect(10, 10, 1004, 492);

  // Corner brackets
  ctx.lineWidth = 10;
  const cornerLen = 50;
  // Top Left
  ctx.beginPath();
  ctx.moveTo(10, 10 + cornerLen);
  ctx.lineTo(10, 10);
  ctx.lineTo(10 + cornerLen, 10);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(1014 - cornerLen, 10);
  ctx.lineTo(1014, 10);
  ctx.lineTo(1014, 10 + cornerLen);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(10, 502 - cornerLen);
  ctx.lineTo(10, 502);
  ctx.lineTo(10 + cornerLen, 502);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(1014 - cornerLen, 502);
  ctx.lineTo(1014, 502);
  ctx.lineTo(1014, 502 - cornerLen);
  ctx.stroke();

  // Header Bar
  ctx.fillStyle = 'rgba(0, 242, 254, 0.15)';
  ctx.fillRect(20, 20, 984, 60);

  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 26px "Segoe UI", Roboto, sans-serif';
  ctx.fillText('⚡ BIONET EXECUTIVE HUD • LIVE REAL-TIME TERMINAL', 40, 60);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 20px "Segoe UI", Roboto, sans-serif';
  ctx.fillText('● SYSTEM STATUS: ONLINE 100%', 720, 60);

  // User & Rank Info
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Selamat Datang, ${userName}`, 40, 130);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 22px "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`🏆 Rank Terverifikasi: ${rank} (Qualified Bonus Eksekutif)`, 40, 165);

  // Performance Metric Cards
  // Card 1: Bonus Hari Ini
  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
  ctx.fillRect(40, 200, 280, 120);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 200, 280, 120);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px "Segoe UI", sans-serif';
  ctx.fillText('ESTIMASI KOMISI HARI INI', 60, 235);
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 30px "Segoe UI", sans-serif';
  ctx.fillText('Rp 4.750.000', 60, 280);
  ctx.fillStyle = '#6ee7b7';
  ctx.font = '14px "Segoe UI", sans-serif';
  ctx.fillText('▲ +18.4% vs kemarin', 60, 305);

  // Card 2: Binary Balance (Left vs Right)
  ctx.fillStyle = 'rgba(0, 242, 254, 0.12)';
  ctx.fillRect(340, 200, 300, 120);
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 2;
  ctx.strokeRect(340, 200, 300, 120);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px "Segoe UI", sans-serif';
  ctx.fillText('OMSET PASANGAN (PV)', 360, 235);
  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 24px "Segoe UI", sans-serif';
  ctx.fillText('Kiri: 12.450 | Kanan: 14.200', 360, 280);
  ctx.fillStyle = '#38bdf8';
  ctx.font = '14px "Segoe UI", sans-serif';
  ctx.fillText('🔥 124 Pasang Menunggu Cair Malam Ini', 360, 305);

  // Card 3: Leads CRM & TikTok Ads
  ctx.fillStyle = 'rgba(236, 72, 153, 0.12)';
  ctx.fillRect(660, 200, 320, 120);
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 2;
  ctx.strokeRect(660, 200, 320, 120);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px "Segoe UI", sans-serif';
  ctx.fillText('TIKTOK ADS & SMART CRM', 680, 235);
  ctx.fillStyle = '#f43f5e';
  ctx.font = 'bold 30px "Segoe UI", sans-serif';
  ctx.fillText('+48 Leads Baru', 680, 280);
  ctx.fillStyle = '#fda4af';
  ctx.font = '14px "Segoe UI", sans-serif';
  ctx.fillText('⚡ Auto-Followup WhatsApp Aktif', 680, 305);

  // Mini Chart Visualization at bottom
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fillRect(40, 345, 940, 130);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
  ctx.strokeRect(40, 345, 940, 130);

  // Render 14 gradient bars representing daily performance
  const barCount = 18;
  const barW = 36;
  const startX = 60;
  const baseY = 450;
  const heights = [40, 55, 48, 65, 75, 60, 85, 70, 95, 80, 88, 92, 100, 85, 90, 98, 105, 110];

  for (let i = 0; i < barCount; i++) {
    const x = startX + i * 50;
    const h = heights[i % heights.length];
    const grad = ctx.createLinearGradient(x, baseY, x, baseY - h);
    grad.addColorStop(0, '#00f2fe');
    grad.addColorStop(1, '#10b981');
    ctx.fillStyle = grad;
    ctx.fillRect(x, baseY - h, barW, h);

    // Glowing tip
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, baseY - h - 3, barW, 3);
  }

  // Scanline overlay effect
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  for (let y = 0; y < 512; y += 4) {
    ctx.fillRect(0, y, 1024, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedural TikTok Ads & Viral Leads Screen Canvas Texture
 */
export function createTikTokScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 910; // 9:16 vertical ratio
  const ctx = canvas.getContext('2d');

  // Dark Cyberpunk TikTok gradient backdrop
  const bg = ctx.createLinearGradient(0, 0, 512, 910);
  bg.addColorStop(0, '#09090b');
  bg.addColorStop(0.3, '#180728');
  bg.addColorStop(0.7, '#081726');
  bg.addColorStop(1, '#020617');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 910);

  // TikTok RGB Neon Frame
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 894);

  // Top Status Bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(16, 16, 480, 50);

  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.fillText('♪ TikTok Ads Viral Hub', 30, 48);

  ctx.fillStyle = '#ec4899';
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  ctx.fillText('LIVE CAMPAIGN', 350, 48);

  // Main Video Mockup Card
  const cardGrad = ctx.createLinearGradient(30, 90, 482, 500);
  cardGrad.addColorStop(0, 'rgba(236, 72, 153, 0.25)');
  cardGrad.addColorStop(1, 'rgba(0, 242, 254, 0.2)');
  ctx.fillStyle = cardGrad;
  ctx.fillRect(30, 85, 452, 430);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 85, 452, 430);

  // Play button circle
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.beginPath();
  ctx.arc(256, 280, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Play triangle
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(246, 260);
  ctx.lineTo(276, 280);
  ctx.lineTo(246, 300);
  ctx.closePath();
  ctx.fill();

  // Video Caption
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.fillText('🔥 Solusi Herbal & Peluang Kemitraan', 50, 450);
  ctx.fillStyle = '#38bdf8';
  ctx.font = '16px "Segoe UI", sans-serif';
  ctx.fillText('#BionetHerbal #PeluangBisnis2026 #MitraJuara', 50, 480);

  // Floating Right Action Icons (Like, Comment, Share)
  const icons = [
    { label: '84.2K', color: '#ec4899', symbol: '♥' },
    { label: '3.6K', color: '#38bdf8', symbol: '💬' },
    { label: '12.4K', color: '#10b981', symbol: '↗' },
  ];

  icons.forEach((ic, idx) => {
    const y = 200 + idx * 75;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(440, y, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = ic.color;
    ctx.font = 'bold 20px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ic.symbol, 440, y + 7);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Segoe UI", sans-serif';
    ctx.fillText(ic.label, 440, y + 26);
  });
  ctx.textAlign = 'left';

  // Leads Analytics Section
  ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
  ctx.fillRect(30, 540, 452, 220);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 540, 452, 220);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.fillText('📊 PERFORMA LEADS CRM HARI INI', 50, 580);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Segoe UI", sans-serif';
  ctx.fillText('+142 Calon Mitra', 50, 630);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '16px "Segoe UI", sans-serif';
  ctx.fillText('Konversi Masuk WhatsApp: 64%', 50, 665);
  ctx.fillText('Biaya per Lead (CPL): Rp 1.850 (Sangat Efisien)', 50, 695);
  ctx.fillText('Follow-up Otomatis AI: 100% Terkirim', 50, 725);

  // Big Bottom CTA
  const ctaGrad = ctx.createLinearGradient(30, 780, 482, 860);
  ctaGrad.addColorStop(0, '#ec4899');
  ctaGrad.addColorStop(1, '#00f2fe');
  ctx.fillStyle = ctaGrad;
  ctx.roundRect(30, 785, 452, 75, 14);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('KLIK UNTUK KELOLA LEADS & CRM ➔', 256, 830);
  ctx.textAlign = 'left';

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedural Cyber Vault Keypad & Status Texture
 */
export function createVaultKeypadTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Titanium safe face
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 512, 512);

  // Gold border
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 492);

  // Vault Logo / Header
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 24px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🔒 CYBER VAULT KOMISI MITRA', 256, 60);

  // Digital readout screen
  ctx.fillStyle = '#022c22';
  ctx.fillRect(40, 90, 432, 90);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 90, 432, 90);

  ctx.fillStyle = '#10b981';
  ctx.font = '16px "Segoe UI", sans-serif';
  ctx.fillText('SALDO SIAP PENARIKAN (WITHDRAWAL)', 256, 120);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 32px "Segoe UI", sans-serif';
  ctx.fillText('Rp 48.500.000', 256, 160);

  // Dial wheel center pattern
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(256, 330, 110, 0, Math.PI * 2);
  ctx.stroke();

  // Tick marks
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const x1 = 256 + Math.cos(angle) * 85;
    const y1 = 330 + Math.sin(angle) * 85;
    const x2 = 256 + Math.cos(angle) * 105;
    const y2 = 330 + Math.sin(angle) * 105;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Keypad center button
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(256, 330, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  ctx.fillText('SECURE', 256, 336);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 16px "Segoe UI", sans-serif';
  ctx.fillText('⚡ KLIK UNTUK PENARIKAN BONUS', 256, 475);
  ctx.textAlign = 'left';

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Procedural Star / Particle Glow Texture
 */
export function createGlowPointTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.2, 'rgba(0, 242, 254, 0.8)');
  grad.addColorStop(0.6, 'rgba(16, 185, 129, 0.2)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  return new THREE.CanvasTexture(canvas);
}
