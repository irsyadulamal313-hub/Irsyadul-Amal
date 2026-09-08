import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 1. Exact official vector logo of Yayasan Irsyadul Amal Indonesia
const logoSvg = `<svg viewBox="0 0 500 500" width="500" height="500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <path id="top-arc" d="M 68,250 A 182,182 0 1,1 432,250" fill="none" />
    <path id="bottom-arc" d="M 125,295 A 182,182 0 0,0 375,295" fill="none" />
  </defs>

  <!-- Outer ring -->
  <circle cx="250" cy="250" r="235" stroke="#009B9E" stroke-width="26" fill="#FFFFFF" />

  <!-- Inner solid circle -->
  <circle cx="250" cy="250" r="172" stroke="#009B9E" stroke-width="6" fill="#009B9E" />

  <!-- Arched text: IRSYADUL AMAL INDONESIA -->
  <text fill="#009B9E" font-size="36" font-weight="800" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" letter-spacing="0.08em">
    <textPath href="#top-arc" startOffset="50%" text-anchor="middle">
      IRSYADUL AMAL INDONESIA
    </textPath>
  </text>

  <!-- Arched text: YAYASAN -->
  <text fill="#009B9E" font-size="38" font-weight="800" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" letter-spacing="0.14em">
    <textPath href="#bottom-arc" startOffset="50%" text-anchor="middle">
      YAYASAN
    </textPath>
  </text>

  <!-- Center emblem graphics -->
  <g fill="#FFFFFF" stroke="#FFFFFF" stroke-linejoin="round" stroke-linecap="round">
    <!-- Open Book (Qur'an) -->
    <path
      d="M 130,250 L 130,310 L 250,380 L 370,310 L 370,250 L 354,250 L 354,298 L 250,360 L 146,298 L 146,250 Z"
      fill="#FFFFFF"
      stroke="none"
    />
    <path
      d="M 148,312 L 250,372 L 352,312 L 340,300 L 250,350 L 160,300 Z"
      fill="#FFFFFF"
      stroke="none"
    />

    <!-- Left pillar -->
    <rect x="160" y="180" width="28" height="120" rx="8" fill="#FFFFFF" />
    <rect x="188" y="226" width="30" height="22" fill="#FFFFFF" />

    <!-- Right pillar -->
    <rect x="312" y="180" width="28" height="120" rx="8" fill="#FFFFFF" />
    <rect x="282" y="226" width="30" height="22" fill="#FFFFFF" />

    <!-- Center Arch (Letter A / Dome) -->
    <path
      d="M 198,160 C 198,132 220,126 250,126 C 280,126 302,132 302,160 L 302,320 L 260,320 L 260,250 L 240,250 L 240,320 L 198,320 Z"
      fill="#FFFFFF"
    />

    <!-- Inner arch cutout -->
    <path
      d="M 226,172 C 226,160 236,152 250,152 C 264,152 274,160 274,172 L 274,226 L 226,226 Z"
      fill="#009B9E"
    />

    <!-- Center vertical slit -->
    <rect x="238" y="260" width="24" height="42" rx="4" fill="#009B9E" />
  </g>
</svg>`;

// 2. Open Graph / Share Preview image (1200 x 630 px)
// Clean, professional, elegant design, dominant teal/green (#008284, #006769, #009B9E, #F0FAFA)
// Featuring official IRSYADUL AMAL logo and title "IRSYADUL AMAL - Lembaga Sosial & Kemanusiaan"
const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGradient" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#052E2B" />
      <stop offset="45%" stop-color="#004D40" />
      <stop offset="85%" stop-color="#006769" />
      <stop offset="100%" stop-color="#008284" />
    </linearGradient>

    <!-- Subtle mesh radial glow -->
    <radialGradient id="tealGlow" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#00B4B6" stop-opacity="0.25" />
      <stop offset="60%" stop-color="#009B9E" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#006769" stop-opacity="0" />
    </radialGradient>

    <!-- Logo container shadow -->
    <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#021E1C" flood-opacity="0.45" />
    </filter>

    <!-- Card shadow -->
    <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="20" stdDeviation="30" flood-color="#021B19" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect width="1200" height="630" fill="url(#bgGradient)" />
  <rect width="1200" height="630" fill="url(#tealGlow)" />

  <!-- Elegant Islamic Geometric / Ambient Vector Accents -->
  <g opacity="0.07" stroke="#FFFFFF" stroke-width="1.5" fill="none">
    <circle cx="1200" cy="0" r="450" />
    <circle cx="1200" cy="0" r="320" />
    <circle cx="1200" cy="0" r="180" />
    <circle cx="0" cy="630" r="380" />
    <circle cx="0" cy="630" r="260" />
    <circle cx="0" cy="630" r="140" />
  </g>

  <!-- Central Content Layout -->
  <g transform="translate(100, 75)">
    <!-- Main Framed Card -->
    <rect
      width="1000"
      height="480"
      rx="28"
      fill="#FFFFFF"
      fill-opacity="0.06"
      stroke="#4FD1C5"
      stroke-opacity="0.3"
      stroke-width="1.5"
      filter="url(#cardShadow)"
    />

    <!-- Badge at top -->
    <g transform="translate(60, 48)">
      <rect width="280" height="36" rx="18" fill="#4FD1C5" fill-opacity="0.2" stroke="#4FD1C5" stroke-opacity="0.4" />
      <circle cx="20" cy="18" r="5" fill="#4FD1C5" />
      <text x="36" y="23" fill="#E6FFFA" font-size="14" font-weight="700" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" letter-spacing="0.08em">
        PORTAL RESMI LEMBAGA
      </text>
    </g>

    <!-- Brand Typography & Description -->
    <g transform="translate(60, 150)">
      <!-- Main Title -->
      <text fill="#FFFFFF" font-size="52" font-weight="800" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" letter-spacing="-0.02em">
        IRSYADUL AMAL
      </text>

      <!-- Subtitle Tagline -->
      <text y="54" fill="#81E6D9" font-size="28" font-weight="700" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" letter-spacing="0.01em">
        Lembaga Sosial &amp; Kemanusiaan
      </text>

      <!-- Description Body -->
      <text y="106" fill="#E2E8F0" font-size="19" font-weight="400" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" opacity="0.9">
        Menebar kebaikan dan kemaslahatan umat melalui program
      </text>
      <text y="136" fill="#E2E8F0" font-size="19" font-weight="400" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" opacity="0.9">
        pendidikan, dakwah, sosial kemanusiaan, dan wakaf produktif.
      </text>

      <!-- Meta Pill Tags -->
      <g transform="translate(0, 185)">
        <rect width="130" height="34" rx="8" fill="#FFFFFF" fill-opacity="0.12" />
        <text x="65" y="22" text-anchor="middle" fill="#E6FFFA" font-size="13" font-weight="600" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
          Pendidikan
        </text>

        <rect x="142" width="130" height="34" rx="8" fill="#FFFFFF" fill-opacity="0.12" />
        <text x="207" y="22" text-anchor="middle" fill="#E6FFFA" font-size="13" font-weight="600" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
          Sosial &amp; Yatim
        </text>

        <rect x="284" width="130" height="34" rx="8" fill="#FFFFFF" fill-opacity="0.12" />
        <text x="349" y="22" text-anchor="middle" fill="#E6FFFA" font-size="13" font-weight="600" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
          Wakaf Qur'an
        </text>

        <rect x="426" width="140" height="34" rx="8" fill="#FFFFFF" fill-opacity="0.12" />
        <text x="496" y="22" text-anchor="middle" fill="#E6FFFA" font-size="13" font-weight="600" font-family="'Plus Jakarta Sans', system-ui, sans-serif">
          Garut, Jabar
        </text>
      </g>
    </g>

    <!-- Official Logo Emblem on the right -->
    <g transform="translate(680, 80)" filter="url(#logoShadow)">
      <!-- Outer circular halo glow -->
      <circle cx="160" cy="160" r="160" fill="#FFFFFF" fill-opacity="0.1" />
      <circle cx="160" cy="160" r="148" fill="#FFFFFF" />

      <!-- Official Logo SVG embedded inside circular badge -->
      <g transform="translate(25, 25) scale(0.54)">
        <circle cx="250" cy="250" r="235" stroke="#009B9E" stroke-width="26" fill="#FFFFFF" />
        <circle cx="250" cy="250" r="172" stroke="#009B9E" stroke-width="6" fill="#009B9E" />
        <text fill="#009B9E" font-size="36" font-weight="800" font-family="'Plus Jakarta Sans', system-ui, sans-serif" letter-spacing="0.08em">
          <textPath href="#top-arc-og" startOffset="50%" text-anchor="middle">
            IRSYADUL AMAL INDONESIA
          </textPath>
        </text>
        <text fill="#009B9E" font-size="38" font-weight="800" font-family="'Plus Jakarta Sans', system-ui, sans-serif" letter-spacing="0.14em">
          <textPath href="#bottom-arc-og" startOffset="50%" text-anchor="middle">
            YAYASAN
          </textPath>
        </text>
        <g fill="#FFFFFF" stroke="#FFFFFF" stroke-linejoin="round" stroke-linecap="round">
          <path d="M 130,250 L 130,310 L 250,380 L 370,310 L 370,250 L 354,250 L 354,298 L 250,360 L 146,298 L 146,250 Z" fill="#FFFFFF" stroke="none" />
          <path d="M 148,312 L 250,372 L 352,312 L 340,300 L 250,350 L 160,300 Z" fill="#FFFFFF" stroke="none" />
          <rect x="160" y="180" width="28" height="120" rx="8" fill="#FFFFFF" />
          <rect x="188" y="226" width="30" height="22" fill="#FFFFFF" />
          <rect x="312" y="180" width="28" height="120" rx="8" fill="#FFFFFF" />
          <rect x="282" y="226" width="30" height="22" fill="#FFFFFF" />
          <path d="M 198,160 C 198,132 220,126 250,126 C 280,126 302,132 302,160 L 302,320 L 260,320 L 260,250 L 240,250 L 240,320 L 198,320 Z" fill="#FFFFFF" />
          <path d="M 226,172 C 226,160 236,152 250,152 C 264,152 274,160 274,172 L 274,226 L 226,226 Z" fill="#009B9E" />
          <rect x="238" y="260" width="24" height="42" rx="4" fill="#009B9E" />
        </g>
      </g>
    </g>

    <!-- Footer URL in card -->
    <g transform="translate(60, 420)">
      <circle cx="8" cy="8" r="4" fill="#38B2AC" />
      <text x="22" y="12" fill="#B2F5EA" font-size="14" font-weight="600" font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" letter-spacing="0.04em">
        https://irsyadul-amal.vercel.app/
      </text>
    </g>
  </g>

  <!-- Hidden defs for OG textpaths -->
  <defs>
    <path id="top-arc-og" d="M 68,250 A 182,182 0 1,1 432,250" fill="none" />
    <path id="bottom-arc-og" d="M 125,295 A 182,182 0 0,0 375,295" fill="none" />
  </defs>
</svg>`;

// Helper to create valid ICO file containing PNG streams
function createIco(pngBuffers: { width: number; height: number; buffer: Buffer }[]): Buffer {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved. Must always be 0.
  header.writeUInt16LE(1, 2); // Image type: 1 for icon (.ICO)
  header.writeUInt16LE(count, 4); // Number of images

  let currentOffset = headerSize + dirEntrySize * count;
  const dirEntries: Buffer[] = [];

  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0); // Width
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1); // Height
    entry.writeUInt8(0, 2); // Color count (0 if >=8bpp)
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Size of image data
    entry.writeUInt32LE(currentOffset, 12); // Offset of image data
    dirEntries.push(entry);
    currentOffset += item.buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngBuffers.map((b) => b.buffer)]);
}

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('Generating official branding assets in', publicDir);

  // 1. Save SVG files
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), logoSvg.trim());
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), logoSvg.trim());

  const logoBuffer = Buffer.from(logoSvg);

  // 2. Generate PNG Favicons
  console.log('Generating PNG favicons...');
  const png16 = await sharp(logoBuffer).resize(16, 16).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);

  const png32 = await sharp(logoBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);

  const png48 = await sharp(logoBuffer).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), png48);

  const png180 = await sharp(logoBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon-precomposed.png'), png180);

  const png192 = await sharp(logoBuffer).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), png192);

  const png512 = await sharp(logoBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);
  fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), png512);

  // 3. Generate multi-resolution favicon.ico (16, 32, 48)
  console.log('Generating favicon.ico...');
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

  // 4. Generate Open Graph share image (1200 x 630 px)
  console.log('Generating og-image.png (1200x630)...');
  const ogBuffer = Buffer.from(ogSvg);
  const ogPng = await sharp(ogBuffer).resize(1200, 630).png({ quality: 95 }).toBuffer();
  fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogPng);
  fs.writeFileSync(path.join(publicDir, 'og-image.jpg'), await sharp(ogPng).jpeg({ quality: 90 }).toBuffer());

  // 5. Generate PWA Web Manifest
  const manifest = {
    name: 'IRSYADUL AMAL – Lembaga Sosial & Kemanusiaan',
    short_name: 'IRSYADUL AMAL',
    description: 'Lembaga Sosial & Kemanusiaan IRSYADUL AMAL - Portal Resmi & Informasi Donasi',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0FAFA',
    theme_color: '#008284',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };

  fs.writeFileSync(path.join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2));

  console.log('All brand assets generated successfully!');
}

main().catch((err) => {
  console.error('Error generating brand assets:', err);
  process.exit(1);
});
