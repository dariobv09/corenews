import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { Noticia } from '@/types';

/**
 * Splits text into lines based on max character length for 9:16 vertical layout
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
 * Escapes XML safe characters for SVG
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
 * matching the exact corporate reference image.
 */
function createSvgOverlay(
  title: string,
  width: number,
  height: number
): string {
  const titleLines = wrapText(title, 20); // 20 characters max for elegant serif wrapping

  // Subtle gradient overlay for readability (darkens bottom 55% and top 15%)
  const backgroundOverlay = `
    <defs>
      <linearGradient id="bottomOverlay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0, 0, 0, 0)" />
        <stop offset="40%" stop-color="rgba(0, 0, 0, 0.4)" />
        <stop offset="75%" stop-color="rgba(0, 0, 0, 0.85)" />
        <stop offset="100%" stop-color="rgba(0, 0, 0, 0.95)" />
      </linearGradient>
      <linearGradient id="topOverlay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0, 0, 0, 0.7)" />
        <stop offset="100%" stop-color="rgba(0, 0, 0, 0)" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="200" fill="url(#topOverlay)" />
    <rect x="0" y="${height * 0.45}" width="${width}" height="${height * 0.55}" fill="url(#bottomOverlay)" />
  `;

  // Draw header brand info matching reference image exactly
  const brandSvg = `
    <text x="160" y="94" font-family="'Georgia', 'Times New Roman', serif" font-weight="700" font-size="28" fill="#ffffff" letter-spacing="-0.01em">the core news</text>
    <text x="160" y="122" font-family="'Inter', 'Helvetica', 'Arial', sans-serif" font-weight="500" font-size="14" fill="#a1a1aa" letter-spacing="0.08em">ANÁLISIS VERIFICADO</text>
  `;

  // Position title inside the lower half with serif font matching reference image
  const lineSpacing = 66;
  const totalTextHeight = titleLines.length * lineSpacing;
  const textStartY = height - 120 - totalTextHeight;

  const titleSvg = titleLines.map((line, idx) => 
    `<text x="80" y="${textStartY + idx * lineSpacing}" font-family="'Georgia', 'Times New Roman', serif" font-weight="700" font-size="56" fill="#ffffff" letter-spacing="-0.01em">${escapeXml(line)}</text>`
  ).join('');

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${backgroundOverlay}
      ${brandSvg}
      ${titleSvg}
    </svg>
  `;
}

/**
 * Creates the round black & white corporate logo
 */
async function createCorporateLogo(): Promise<Buffer> {
  const svgLogo = `
    <svg width="84" height="84" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg">
      <circle cx="42" cy="42" r="42" fill="#000000" stroke="#ffffff" stroke-width="3" />
      <text x="42" y="32" font-family="'Inter', sans-serif" font-weight="900" font-size="13" fill="#ffffff" text-anchor="middle" letter-spacing="0.05em">THE</text>
      <text x="42" y="47" font-family="'Inter', sans-serif" font-weight="900" font-size="13" fill="#ffffff" text-anchor="middle" letter-spacing="0.05em">CORE</text>
      <text x="42" y="62" font-family="'Inter', sans-serif" font-weight="900" font-size="13" fill="#ffffff" text-anchor="middle" letter-spacing="0.05em">NEWS</text>
    </svg>
  `;
  return Buffer.from(svgLogo);
}

/**
 * Composites the background image, round logo, and SVG texts into a final high-quality JPEG
 */
export async function createNewsSlide(
  noticia: Noticia,
  bgImageBuffer: Buffer,
  log?: (msg: string) => void
): Promise<Buffer> {
  const width = 1024;
  const height = 1792;

  log?.(`[SharpDesigner] Componiendo imagen final para: "${noticia.titulo.substring(0, 40)}..."`);

  // 1. Prepare Circular Logo
  const logoBuffer = await createCorporateLogo();

  // 2. Generate SVG Overlay (Text and Gradients)
  const overlaySvgString = createSvgOverlay(noticia.titulo, width, height);
  const overlayBuffer = Buffer.from(overlaySvgString);

  // 3. Composite everything together
  const compositeQueue: any[] = [
    { input: overlayBuffer, top: 0, left: 0 },
    { input: logoBuffer, top: 60, left: 60 }
  ];

  return await sharp(bgImageBuffer)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .composite(compositeQueue)
    .jpeg({ quality: 90, progressive: true })
    .toBuffer();
}
