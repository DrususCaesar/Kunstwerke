import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

// Museums-dunkler Hintergrund + Gold-Akzent, passend zu den Design-Tokens
// (oklch(0.16 0.012 50) / oklch(0.78 0.13 75)) — s. src/index.css.
const BG = '#211f1a';
const GOLD = '#cfa858';

function svgIcon(size, padding) {
  const inner = size - padding * 2;
  const stroke = Math.max(3, size * 0.035);
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}"/>
  <rect x="${padding}" y="${padding}" width="${inner}" height="${inner}" rx="${inner * 0.1}" fill="none" stroke="${GOLD}" stroke-width="${stroke}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${inner * 0.16}" fill="${GOLD}"/>
</svg>`;
}

mkdirSync('public/icons', { recursive: true });

const targets = [
  { file: 'public/icons/icon-192.png', size: 192, padding: 34 },
  { file: 'public/icons/icon-512.png', size: 512, padding: 90 },
  { file: 'public/icons/maskable-512.png', size: 512, padding: 128 },
];

for (const t of targets) {
  await sharp(Buffer.from(svgIcon(t.size, t.padding))).png().toFile(t.file);
  console.log('wrote', t.file);
}
