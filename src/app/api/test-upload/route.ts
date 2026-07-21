import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'supabaseAdmin is null' });
  }

  try {
    const testBuffer = Buffer.from('test-content');
    const fileName = `test_vercel_${Date.now()}.txt`;
    
    console.log(`[TestUpload] Intentando subir ${fileName} a Supabase Storage...`);
    const { data, error } = await supabaseAdmin.storage
      .from('tiktok-carousel')
      .upload(fileName, testBuffer, {
        contentType: 'text/plain',
        upsert: true
      });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message || error,
        details: error
      });
    }

    // Try to get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('tiktok-carousel')
      .getPublicUrl(fileName);

    // Try to delete it to clean up
    await supabaseAdmin.storage
      .from('tiktok-carousel')
      .remove([fileName]);

    return NextResponse.json({
      success: true,
      message: 'Subida exitosa desde Vercel!',
      publicUrl
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || err
    });
  }
}
