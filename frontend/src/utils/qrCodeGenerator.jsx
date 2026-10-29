import React from 'react';

/**
 * Lightweight, 100% Offline QR Code Generator (Byte mode, Version 1-4, ECC M)
 * Zero external dependencies, runs offline in standard browser.
 */

// Galois Field Log / Exponent tables for GF(256)
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(function initGalois() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = val;
    LOG[val] = i;
    val = (val << 1) ^ (val & 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) {
    EXP[i] = EXP[i - 255];
  }
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

function polyMul(p1, p2) {
  const result = new Uint8Array(p1.length + p2.length - 1);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      result[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return result;
}

function getGeneratorPoly(degree) {
  let gen = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    gen = polyMul(gen, new Uint8Array([1, EXP[i]]));
  }
  return gen;
}

function calculateEcc(data, eccCount) {
  const gen = getGeneratorPoly(eccCount);
  const msg = new Uint8Array(data.length + eccCount);
  msg.set(data);

  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return msg.slice(data.length);
}

// Minimal specs for QR Version 3 (29x29) and Version 4 (33x33) ECC M
const QR_SPECS = [
  null,
  { version: 1, size: 21, dataBytes: 16, eccCount: 10, align: [] },
  { version: 2, size: 25, dataBytes: 28, eccCount: 16, align: [6, 18] },
  { version: 3, size: 29, dataBytes: 44, eccCount: 26, align: [6, 22] },
  { version: 4, size: 33, dataBytes: 64, eccCount: 36, align: [6, 26] },
  { version: 5, size: 37, dataBytes: 86, eccCount: 48, align: [6, 30] },
];

export function generateQrMatrix(text) {
  const utf8 = new TextEncoder().encode(text);
  let spec = QR_SPECS.find((s) => s && s.dataBytes >= utf8.length + 3);
  if (!spec) spec = QR_SPECS[QR_SPECS.length - 1];

  const size = spec.size;
  const matrix = Array.from({ length: size }, () => Array(size).fill(null));
  const isFunction = Array.from({ length: size }, () => Array(size).fill(false));

  function setFinder(r, c) {
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        const nr = r + i;
        const nc = c + j;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          isFunction[nr][nc] = true;
          if (
            (i >= 0 && i <= 6 && (j === 0 || j === 6)) ||
            (j >= 0 && j <= 6 && (i === 0 || i === 6)) ||
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)
          ) {
            matrix[nr][nc] = true;
          } else {
            matrix[nr][nc] = false;
          }
        }
      }
    }
  }

  // Set finders
  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    isFunction[6][i] = true;
    matrix[i][6] = i % 2 === 0;
    isFunction[i][6] = true;
  }

  // Alignment patterns
  if (spec.align.length > 0) {
    const coords = spec.align;
    for (const r of coords) {
      for (const c of coords) {
        if (
          (r === 6 && c === 6) ||
          (r === 6 && c === coords[coords.length - 1] && c === size - 7) ||
          (r === coords[coords.length - 1] && c === 6)
        ) {
          continue;
        }
        if (isFunction[r][c]) continue;
        for (let i = -2; i <= 2; i++) {
          for (let j = -2; j <= 2; j++) {
            const nr = r + i;
            const nc = c + j;
            isFunction[nr][nc] = true;
            matrix[nr][nc] =
              Math.max(Math.abs(i), Math.abs(j)) !== 1;
          }
        }
      }
    }
  }

  // Format info reserve
  for (let i = 0; i < 9; i++) {
    if (i < size) {
      isFunction[8][i] = true;
      isFunction[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    isFunction[8][size - 1 - i] = true;
    isFunction[size - 1 - i][8] = true;
  }
  matrix[size - 8][8] = true; // Dark module
  isFunction[size - 8][8] = true;

  // Encode Data Bits (Byte Mode = 0100)
  const bitStream = [];
  function pushBits(val, len) {
    for (let i = len - 1; i >= 0; i--) {
      bitStream.push((val >>> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode indicator
  pushBits(utf8.length, 8); // Character count
  for (const b of utf8) {
    pushBits(b, 8);
  }

  // Terminator
  const totalDataBits = spec.dataBytes * 8;
  const termLen = Math.min(4, totalDataBits - bitStream.length);
  pushBits(0, termLen);

  // Byte align
  while (bitStream.length % 8 !== 0) {
    bitStream.push(0);
  }

  // Pad bytes 0xEC, 0x11
  const pad = [0xec, 0x11];
  let pIdx = 0;
  while (bitStream.length < totalDataBits) {
    pushBits(pad[pIdx % 2], 8);
    pIdx++;
  }

  // Convert bitStream to Uint8Array
  const dataBytes = new Uint8Array(spec.dataBytes);
  for (let i = 0; i < spec.dataBytes; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitStream[i * 8 + b];
    }
    dataBytes[i] = byteVal;
  }

  // Compute ECC
  const eccBytes = calculateEcc(dataBytes, spec.eccCount);

  // Combine data + ecc
  const allBits = [];
  for (const b of dataBytes) {
    for (let i = 7; i >= 0; i--) allBits.push((b >>> i) & 1);
  }
  for (const b of eccBytes) {
    for (let i = 7; i >= 0; i--) allBits.push((b >>> i) & 1);
  }

  // Populate Matrix (right-to-left upward/downward snake)
  let bitIdx = 0;
  let upwards = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column
    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (let c = right; c >= right - 1; c--) {
        if (!isFunction[r][c]) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx++] : 0;
          // Apply Standard Mask 0 ((r + c) % 2 === 0)
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = (bit === 1) ^ mask;
        }
      }
    }
    upwards = !upwards;
  }

  // Write format info (Mask 0, ECC M: 101010000010010)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  let fIdx = 0;
  for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[fIdx++] === 1;
  matrix[8][7] = formatBits[fIdx++] === 1;
  matrix[8][8] = formatBits[fIdx++] === 1;
  matrix[7][8] = formatBits[fIdx++] === 1;
  for (let i = 5; i >= 0; i--) matrix[i][8] = formatBits[fIdx++] === 1;

  fIdx = 0;
  for (let i = size - 1; i >= size - 7; i--) matrix[size - 1 - (size - 1 - i)][8] = formatBits[fIdx++] === 1;
  for (let i = size - 8; i < size; i++) matrix[8][i] = formatBits[14 - (size - 1 - i)] === 1;

  return matrix;
}

/**
 * SVG QR Code Component
 */
export function QrCodeSvg({
  value,
  size = 140,
  fgColor = '#0b0f19',
  bgColor = '#ffffff',
  className = '',
}) {
  const matrix = React.useMemo(() => {
    try {
      return generateQrMatrix(value || 'https://bionet.id');
    } catch (e) {
      console.warn('QR matrix error:', e);
      return [];
    }
  }, [value]);

  if (!matrix.length) return null;

  const count = matrix.length;
  const cellSize = 100 / count;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <rect width="100" height="100" fill={bgColor} />
      {matrix.map((row, r) =>
        row.map((cell, c) => {
          if (!cell) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.05}
              height={cellSize + 0.05}
              fill={fgColor}
            />
          );
        })
      )}
    </svg>
  );
}

/**
 * Draws QR Matrix to HTML5 Canvas
 */
export function drawQrToCanvas(ctx, text, x, y, size, fgColor = '#0b0f19', bgColor = '#ffffff') {
  try {
    const matrix = generateQrMatrix(text);
    const count = matrix.length;
    const cellSize = size / count;

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, size, size);

    ctx.fillStyle = fgColor;
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (matrix[r][c]) {
          ctx.fillRect(x + c * cellSize, y + r * cellSize, cellSize + 0.5, cellSize + 0.5);
        }
      }
    }
  } catch (e) {
    console.warn('drawQrToCanvas error:', e);
  }
}
