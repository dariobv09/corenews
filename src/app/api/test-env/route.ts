import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: any = {
    supabaseConfigured: isSupabaseConfigured(),
    openaiKeyConfigured: !!process.env.OPENAI_API_KEY,
    openaiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
    openaiKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'none',
    unsplashConfigured: !!process.env.UNSPLASH_ACCESS_KEY,
    googleSearchConfigured: !!process.env.GOOGLE_CUSTOM_SEARCH_API_KEY,
  };

  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      results.openaiTest = "Attempting simple chat completion...";
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 5
      });
      results.openaiTestSuccess = true;
      results.openaiTestResponse = completion.choices[0]?.message.content;
      
      // Test DALL-E 3
      results.dalleTest = "Attempting DALL-E 3 test generation...";
      const dalle = await openai.images.generate({
        model: 'dall-e-3',
        prompt: 'a simple red dot, minimalistic style',
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      });
      results.dalleTestSuccess = true;
      results.dalleImageUrl = dalle.data?.[0]?.url;
    } catch (err: any) {
      results.openaiTestSuccess = false;
      results.openaiError = err.message || err;
    }
  }

  return NextResponse.json(results);
}
