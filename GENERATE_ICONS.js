const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Créer le dossier icons s'il n'existe pas
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Tailles d'icônes requises
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Créer SVG simple "FP" (Fine Parfumerie) noir/or
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0a0a0a"/>
  <rect x="2" y="2" width="${size - 4}" height="${size - 4}" fill="none" stroke="#c5a059" stroke-width="1" opacity="0.3"/>
  <text
    x="50%"
    y="55%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="Georgia, serif"
    font-size="${size * 0.45}"
    font-weight="normal"
    fill="#c5a059"
  >FP</text>
</svg>
`;

// Générer toutes les icônes
async function generateIcons() {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   La Fine Parfumerie - Icon Generator  ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');

  for (const size of sizes) {
    const svg = Buffer.from(createIconSVG(size));
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`  ✓ icon-${size}x${size}.png`);
  }

  // Apple touch icon (180x180)
  const appleSvg = Buffer.from(createIconSVG(180));
  await sharp(appleSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('  ✓ apple-touch-icon.png (180x180)');

  // Favicon ICO (multi-size)
  const favicon32 = Buffer.from(createIconSVG(32));
  await sharp(favicon32)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, 'public', 'favicon.png'));
  console.log('  ✓ favicon.png (32x32)');

  // OG Image pour partage social (1200x630)
  const ogSVG = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#151515;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#grad)"/>

  <!-- Bordure dorée -->
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#c5a059" stroke-width="1" opacity="0.3"/>
  <rect x="50" y="50" width="1100" height="530" fill="none" stroke="#c5a059" stroke-width="1" opacity="0.15"/>

  <!-- Logo FP -->
  <text
    x="600"
    y="240"
    text-anchor="middle"
    font-family="Georgia, Times, serif"
    font-size="80"
    font-weight="normal"
    fill="#c5a059"
  >La Fine</text>

  <text
    x="600"
    y="340"
    text-anchor="middle"
    font-family="Georgia, Times, serif"
    font-size="100"
    font-style="italic"
    fill="#c5a059"
  >Parfumerie</text>

  <!-- Ligne décorative -->
  <line x1="400" y1="400" x2="800" y2="400" stroke="#c5a059" stroke-width="1" opacity="0.5"/>

  <!-- Sous-titre -->
  <text
    x="600"
    y="470"
    text-anchor="middle"
    font-family="Helvetica, Arial, sans-serif"
    font-size="28"
    letter-spacing="8"
    fill="#d4c4a8"
  >PARFUMS DE LUXE</text>

  <text
    x="600"
    y="520"
    text-anchor="middle"
    font-family="Helvetica, Arial, sans-serif"
    font-size="20"
    letter-spacing="4"
    fill="#8a8a8a"
  >STRASBOURG</text>
</svg>
  `;

  await sharp(Buffer.from(ogSVG))
    .resize(1200, 630)
    .jpeg({ quality: 90 })
    .toFile(path.join(__dirname, 'public', 'og-image.jpg'));
  console.log('  ✓ og-image.jpg (1200x630)');

  // Twitter card image (carrée 1200x1200 pour meilleur rendu)
  const twitterSVG = `
<svg width="1200" height="1200" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="1200" fill="#0a0a0a"/>
  <rect x="60" y="60" width="1080" height="1080" fill="none" stroke="#c5a059" stroke-width="2" opacity="0.2"/>

  <text
    x="600"
    y="520"
    text-anchor="middle"
    font-family="Georgia, Times, serif"
    font-size="180"
    fill="#c5a059"
  >FP</text>

  <text
    x="600"
    y="700"
    text-anchor="middle"
    font-family="Helvetica, Arial, sans-serif"
    font-size="36"
    letter-spacing="12"
    fill="#d4c4a8"
  >LA FINE PARFUMERIE</text>
</svg>
  `;

  await sharp(Buffer.from(twitterSVG))
    .resize(1200, 1200)
    .jpeg({ quality: 90 })
    .toFile(path.join(__dirname, 'public', 'twitter-image.jpg'));
  console.log('  ✓ twitter-image.jpg (1200x1200)');

  console.log('');
  console.log('════════════════════════════════════════');
  console.log('  Toutes les icônes ont été générées !');
  console.log('  Dossier: /public/icons/');
  console.log('════════════════════════════════════════');
  console.log('');
}

generateIcons().catch(console.error);
