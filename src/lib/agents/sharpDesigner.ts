import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { Noticia } from '@/types';

let poppinsBoldBase64 = '';
let poppinsRegularBase64 = '';

/**
 * Downloads Poppins fonts dynamically and caches them in the OS temp directory
 * to avoid redownloading in serverless environments.
 */
async function loadFonts(log?: (msg: string) => void) {
  if (poppinsBoldBase64 && poppinsRegularBase64) return;

  const tempDir = '/tmp'; // Vercel writable temp folder
  const boldPath = path.join(tempDir, 'Poppins-Bold.ttf');
  const regularPath = path.join(tempDir, 'Poppins-Regular.ttf');

  try {
    // Check local disk cache
    if (fs.existsSync(boldPath) && fs.existsSync(regularPath)) {
      log?.('[SharpDesigner] Cargando fuentes Poppins desde caché local (/tmp)...');
      poppinsBoldBase64 = fs.readFileSync(boldPath).toString('base64');
      poppinsRegularBase64 = fs.readFileSync(regularPath).toString('base64');
      return;
    }

    log?.('[SharpDesigner] Descargando fuentes Poppins Bold y Regular desde Google Fonts CDN...');
    
    // Download Bold
    const boldRes = await fetch('https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.ttf');
    const boldBuf = await boldRes.arrayBuffer();
    const boldBuffer = Buffer.from(boldBuf);
    poppinsBoldBase64 = boldBuffer.toString('base64');

    // Download Regular
    const regRes = await fetch('https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrFJDUc1NECFo.ttf');
    const regBuf = await regRes.arrayBuffer();
    const regBuffer = Buffer.from(regBuf);
    poppinsRegularBase64 = regBuffer.toString('base64');

    // Save to cache
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    fs.writeFileSync(boldPath, boldBuffer);
    fs.writeFileSync(regularPath, regBuffer);

    log?.('[SharpDesigner] ✓ Fuentes Poppins descargadas, inyectadas y guardadas en caché.');
  } catch (err: any) {
    log?.(`[SharpDesigner] ⚠ Error al configurar fuentes Poppins: ${err.message || err}. Usando fallback estándar.`);
  }
}

/**
 * Splits a text into lines based on max character length
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Escapes XML safe characters
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generates the SVG overlay containing typography styling, gradients, and texts
 */
function createSvgOverlay(
  title: string,
  width: number,
  height: number
): string {
  const titleLines = wrapText(title, 20); // 20-22 characters max for TikTok vertical layout

  let styleSection = '';
  if (poppinsBoldBase64 && poppinsRegularBase64) {
    styleSection = `
      @font-face {
        font-family: 'Poppins';
        src: url(data:font/truetype;charset=utf-8;base64,${poppinsRegularBase64}) format('truetype');
        font-weight: 400;
        font-style: normal;
      }
      @font-face {
        font-family: 'Poppins';
        src: url(data:font/truetype;charset=utf-8;base64,${poppinsBoldBase64}) format('truetype');
        font-weight: 700;
        font-style: normal;
      }
    `;
  }

  // Draw gradient overlay for text readability (covering bottom 55% of the slide)
  const backgroundOverlay = `
    <defs>
      <linearGradient id="overlayGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(3, 7, 18, 0)" />
        <stop offset="35%" stop-color="rgba(3, 7, 18, 0.6)" />
        <stop offset="70%" stop-color="rgba(3, 7, 18, 0.95)" />
        <stop offset="100%" stop-color="rgba(3, 7, 18, 1)" />
      </linearGradient>
    </defs>
    <rect x="0" y="${height * 0.45}" width="${width}" height="${height * 0.55}" fill="url(#overlayGrad)" />
  `;

  // Draw header brand info
  const brandSvg = `
    <text x="160" y="98" font-family="'Poppins', sans-serif" font-weight="700" font-size="28" fill="#ffffff" letter-spacing="-0.02em">the core news</text>
    <text x="160" y="125" font-family="'Poppins', sans-serif" font-weight="400" font-size="16" fill="#a1a1aa" letter-spacing="0.05em">ANÁLISIS VERIFICADO</text>
  `;

  // Position title inside the lower half
  const lineSpacing = 62;
  const totalTextHeight = titleLines.length * lineSpacing;
  const textStartY = height - 150 - totalTextHeight;

  const titleSvg = titleLines.map((line, idx) => 
    `<text x="80" y="${textStartY + idx * lineSpacing}" font-family="'Poppins', sans-serif" font-weight="700" font-size="52" fill="#ffffff">${escapeXml(line)}</text>`
  ).join('');

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          ${styleSection}
        </style>
      </defs>
      ${backgroundOverlay}
      ${brandSvg}
      ${titleSvg}
    </svg>
  `;
}

/**
 * Composites the background image, round logo, and SVG texts into a final high-quality JPEG
 */
export async function createNewsSlide(
  noticia: Noticia,
  bgImageBuffer: Buffer,
  log?: (msg: string) => void
): Promise<Buffer> {
  await loadFonts(log);

  const width = 1024;
  const height = 1792;

  log?.(`[SharpDesigner] Componiendo imagen final de Sharp para: "${noticia.titulo.substring(0, 50)}..."`);

  // 1. Prepare Circular Logo
  let logoBuffer: Buffer | null = null;
  const logoPath = path.join(process.cwd(), 'public', 'icon.jpg');
  
  if (fs.existsSync(logoPath)) {
    try {
      const circleSvg = Buffer.from('<svg><rect x="0" y="0" width="80" height="80" rx="40" ry="40"/></svg>');
      logoBuffer = await sharp(logoPath)
        .resize(80, 80)
        .composite([{ input: circleSvg, blend: 'dest-in' }])
        .png()
        .toBuffer();
    } catch (err: any) {
      log?.(`[SharpDesigner] ⚠ Error al redondear el logotipo corporativo: ${err.message || err}`);
    }
  }

  // 2. Generate SVG Overlay (Text and Gradients)
  const overlaySvgString = createSvgOverlay(noticia.titulo, width, height);
  const overlayBuffer = Buffer.from(overlaySvgString);

  // 3. Composite everything together
  const compositeQueue: any[] = [
    { input: overlayBuffer, top: 0, left: 0 }
  ];

  if (logoBuffer) {
    compositeQueue.push({ input: logoBuffer, top: 60, left: 60 });
  }

  return await sharp(bgImageBuffer)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .composite(compositeQueue)
    .jpeg({ quality: 85 })
    .toBuffer();
}
