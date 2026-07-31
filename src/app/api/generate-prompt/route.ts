import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { contextText, style, colorTone, overlayText } = await request.json();

    if (!contextText || contextText.trim().length === 0) {
      return NextResponse.json({ error: 'Falta el texto de contexto de la noticia.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY || '';
    let promptResult = '';

    if (apiKey && apiKey !== 'your-openai-api-key') {
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un director de fotografía y diseñador visual para TikTok. Crea un prompt descriptivo, detallado y evocativo en inglés para DALL-E 3 basándote en la noticia, el estilo artístico, el tono de color y el texto superpuesto solicitados. El estilo debe ser apto para una publicación vertical 9:16 de prensa y tecnología. Retorna ÚNICAMENTE el prompt en inglés.'
          },
          {
            role: 'user',
            content: `Noticia: "${contextText}"\nEstilo Artístico: ${style || 'Fotorealista'}\nTono de Color: ${colorTone || 'Vibrante'}\nTexto Superpuesto: ${overlayText || 'Ninguno'}`
          }
        ],
        max_tokens: 150
      });

      promptResult = response.choices[0]?.message.content?.trim() || '';
    }

    if (!promptResult) {
      promptResult = `A high-resolution vertical 9:16 photography depicting: ${contextText.substring(0, 100)}. Style: ${style || 'Photorealistic'}, Palette: ${colorTone || 'Vibrant'}. Clean editorial composition, professional lighting.`;
    }

    return NextResponse.json({
      success: true,
      prompt: promptResult
    });

  } catch (err: any) {
    console.error('Error generando prompt:', err);
    return NextResponse.json({ error: err.message || err }, { status: 500 });
  }
}
