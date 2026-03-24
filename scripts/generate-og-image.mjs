/**
 * Génère public/og-portail-1200x630.png (aperçu Facebook / Discord / X).
 * Exécuter : node scripts/generate-og-image.mjs
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outPath = path.join(root, 'public', 'og-portail-1200x630.png');
const logoPath = path.join(root, 'public', 'logo-cea.png');

const W = 1200;
const H = 630;

const svg = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#102a43"/>
        <stop offset="50%" stop-color="#153a52"/>
        <stop offset="100%" stop-color="#0a1218"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`,
);

const base = await sharp(svg).png().toBuffer();

const logoBuf = await sharp(logoPath)
  .resize({ width: 300, height: 300, fit: 'inside' })
  .png()
  .toBuffer();

const { width: lw, height: lh } = await sharp(logoBuf).metadata();
const left = Math.round((W - lw) / 2);
const top = Math.round((H - lh) / 2 - 24);

await sharp(base)
  .composite([{ input: logoBuf, left, top }])
  .png({ compressionLevel: 9 })
  .toFile(outPath);

console.log('OK →', outPath);
