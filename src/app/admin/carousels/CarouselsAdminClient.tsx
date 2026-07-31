'use client';

import React, { useState } from 'react';
import { CarouselSlide, Noticia } from '@/types';

interface ExtendedSlide extends CarouselSlide {
  noticia?: Noticia | null;
}

interface CarouselsAdminClientProps {
  initialSlides: ExtendedSlide[];
  todayNoticias: Noticia[];
}

export default function CarouselsAdminClient({ initialSlides, todayNoticias }: CarouselsAdminClientProps) {
  const [slides, setSlides] = useState<ExtendedSlide[]>(initialSlides);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [saveProgress, setSaveProgress] = useState('');

  // Optional manual generator state
  const [showManualStudio, setShowManualStudio] = useState(false);
  const [contextText, setContextText] = useState('');
  const [artStyle, setArtStyle] = useState('Fotorealista');
  const [colorTone, setColorTone] = useState('Vibrante');
  const [overlayText, setOverlayText] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');

  // 1. Guardar todas las fotos en iPhone / Galería nativa
  const handleSaveAllNative = async () => {
    if (slides.length === 0) return;
    setIsSavingAll(true);
    setSaveProgress('Preparando fotos para guardar en Galería...');

    try {
      const filesToShare: File[] = [];

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        setSaveProgress(`Descargando foto ${i + 1} de ${slides.length}...`);
        
        const rawFileName = slide.image_url.split('/').pop() || `slide_${i}.jpg`;
        const directUrl = slide.image_url.startsWith('http')
          ? slide.image_url
          : `https://bnywcdwwqdcyztqguios.supabase.co/storage/v1/object/public/tiktok-carousel/${rawFileName}`;
        
        const response = await fetch(directUrl);
        const arrayBuffer = await response.arrayBuffer();
        const file = new File([arrayBuffer], `noticia_${i + 1}.jpg`, { type: 'image/jpeg' });
        filesToShare.push(file);
      }

      if (navigator.canShare && navigator.canShare({ files: filesToShare })) {
        setSaveProgress('Abriendo menú de iPhone... Selecciona "Guardar X imágenes"');
        await navigator.share({
          files: filesToShare,
          title: 'Fotos para TikTok',
          text: 'Fotos generadas por IA para TikTok'
        });
        setSaveProgress('¡Fotos enviadas al menú de guardado!');
      } else {
        setSaveProgress('Guardando fotos una a una en descargas...');
        for (let i = 0; i < filesToShare.length; i++) {
          const file = filesToShare[i];
          const blobUrl = URL.createObjectURL(file);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
          await new Promise(r => setTimeout(r, 400));
        }
        setSaveProgress('¡Fotos descargadas!');
      }
    } catch (err: any) {
      console.error('Error guardando en Galería:', err);
      setSaveProgress('Error al guardar. Prueba descargándolas una a una.');
    } finally {
      setIsSavingAll(false);
    }
  };

  // 2. Descarga de foto individual mediante Blob JPEG de 154 KB
  const handleDownloadSingleBlob = async (slide: ExtendedSlide, index: number) => {
    try {
      const rawFileName = slide.image_url.split('/').pop() || `slide_${index}.jpg`;
      const directUrl = slide.image_url.startsWith('http')
        ? slide.image_url
        : `https://bnywcdwwqdcyztqguios.supabase.co/storage/v1/object/public/tiktok-carousel/${rawFileName}`;
      
      const res = await fetch(directUrl);
      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `noticia_${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error descargando imagen:', err);
      window.open(slide.image_url, '_blank');
    }
  };

  // 3. Generación Manual Opcional
  const handleGeneratePromptManual = async () => {
    if (!contextText.trim()) return alert('Ingresa un texto para el prompt.');
    setIsGeneratingPrompt(true);
    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextText, style: artStyle, colorTone, overlayText })
      });
      const data = await res.json();
      if (data.success && data.prompt) setGeneratedPrompt(data.prompt);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGenerateImageManual = async () => {
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/generate-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regenerate: true,
          custom_prompt: generatedPrompt,
          manual_text: contextText,
          overlay_text: overlayText
        })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) setManualImageUrl(data.imageUrl);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div style={{
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      padding: '24px',
      maxWidth: '1300px',
      margin: '0 auto',
      backgroundColor: '#0a0a0c',
      color: '#ffffff',
      minHeight: '100vh'
    }}>
      
      {/* 🚀 BARRA DE ACCIÓN PRINCIPAL SUPER SIMPLE Y AUTOMÁTICA */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#0a0a0c',
        padding: '16px 0',
        borderBottom: '1px solid #1f1f23',
        marginBottom: '24px',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* BOTÓN GIGANTE PARA GUARDAR EN GALERÍA EN IPHONE/MÓVIL */}
          <button
            onClick={handleSaveAllNative}
            disabled={isSavingAll || slides.length === 0}
            style={{
              backgroundColor: '#007aff', // iOS Blue
              color: '#ffffff',
              border: 'none',
              padding: '18px 28px',
              borderRadius: '14px',
              fontSize: '18px',
              fontWeight: 800,
              cursor: isSavingAll ? 'not-allowed' : 'pointer',
              flex: 1,
              minWidth: '280px',
              boxShadow: '0 4px 20px rgba(0,122,255,0.4)',
              transition: 'all 0.2s'
            }}
          >
            {isSavingAll ? saveProgress : `📱 GUARDAR TODAS EN GALERÍA DE IPHONE (${slides.length})`}
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#1c1c1e',
              color: '#ffffff',
              border: '1px solid #2c2c2e',
              padding: '18px 24px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🔄 Actualizar
          </button>

          <button
            onClick={() => setShowManualStudio(!showManualStudio)}
            style={{
              backgroundColor: 'transparent',
              color: '#3b82f6',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              padding: '14px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {showManualStudio ? '✖️ Ocultar Creador Manual' : '✨ Generar Foto Personalizada con IA'}
          </button>
        </div>

        {saveProgress && (
          <p style={{ margin: '12px 0 0 0', color: '#3b82f6', fontWeight: 700, fontSize: '14px' }}>
            {saveProgress}
          </p>
        )}
      </div>

      {/* 🛠️ CREADOR MANUAL OPCIONAL (SI EL USUARIO QUIERE CREAR UNA FOTO CON PROMPT PROPIO) */}
      {showManualStudio && (
        <div style={{
          backgroundColor: '#121214',
          border: '1px solid #27272a',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#3b82f6' }}>
            ✨ Estudió de Creación Manual con Prompt Personalizado (DALL-E 3)
          </h3>
          
          <textarea
            rows={3}
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            placeholder="Ingresa la noticia o idea para la foto..."
            style={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              color: '#fff',
              padding: '12px',
              borderRadius: '8px'
            }}
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleGeneratePromptManual}
              disabled={isGeneratingPrompt}
              style={{
                backgroundColor: '#1f1f23',
                color: '#fff',
                border: '1px solid #3b82f6',
                padding: '12px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isGeneratingPrompt ? 'Generando Prompt...' : '1. Generar Prompt (ChatGPT)'}
            </button>

            <button
              onClick={handleGenerateImageManual}
              disabled={isGeneratingImage || !generatedPrompt}
              style={{
                backgroundColor: !generatedPrompt ? '#27272a' : '#3b82f6',
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: !generatedPrompt ? 'not-allowed' : 'pointer'
              }}
            >
              {isGeneratingImage ? 'Generando en DALL-E 3...' : '2. Generar Imagen Final'}
            </button>
          </div>

          {generatedPrompt && (
            <textarea
              rows={2}
              readOnly
              value={generatedPrompt}
              style={{ backgroundColor: '#0a0a0c', color: '#a1a1aa', border: '1px solid #3b82f6', padding: '8px', borderRadius: '6px', fontSize: '12px' }}
            />
          )}

          {manualImageUrl && (
            <div style={{ width: '220px', aspectRatio: '9/16', borderRadius: '12px', overflow: 'hidden', border: '2px solid #3b82f6', marginTop: '12px' }}>
              <img src={manualImageUrl} alt="Resultado manual" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
        </div>
      )}

      {/* 📷 VISTA PRINCIPAL: GRID AUTOMÁTICO CON TODAS LAS FOTOS LISTAS PARA TIKTOK */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#a1a1aa', marginBottom: '16px', letterSpacing: '0.05em' }}>
        FOTOS GENERADAS AUTOMÁTICAMENTE PARA TIKTOK ({slides.length})
      </h2>

      {slides.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', fontSize: '18px', color: '#a1a1aa' }}>
          Cargando fotos del servidor... Si no aparecen, pulsa Actualizar.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '28px'
        }}>
          {slides.map((slide, idx) => {
            const rawFileName = slide.image_url.split('/').pop() || `slide_${idx}.jpg`;
            const directUrl = slide.image_url.startsWith('http')
              ? slide.image_url
              : `https://bnywcdwwqdcyztqguios.supabase.co/storage/v1/object/public/tiktok-carousel/${rawFileName}`;
            const proxyUrl = `/api/carousel-image/${rawFileName}`;

            return (
              <div key={slide.id || idx} style={{
                border: '1px solid #1f1f23',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#121214',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
              }}>
                
                {/* MARCO VERTICAL 9:16 EN ALTA RESOLUCIÓN */}
                <div style={{ width: '100%', aspectRatio: '9/16', backgroundColor: '#000000', position: 'relative' }}>
                  <img
                    src={directUrl}
                    alt={slide.noticia?.titulo || `Foto TikTok ${idx + 1}`}
                    onError={(e) => {
                      if (e.currentTarget.src !== proxyUrl) {
                        e.currentTarget.src = proxyUrl;
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>

                {/* PIE CON DESCARGA EN 1 CLIC */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#ffffff', lineHeight: 1.4 }}>
                    {idx + 1}. {slide.noticia?.titulo}
                  </p>

                  <button
                    onClick={() => handleDownloadSingleBlob(slide, idx)}
                    style={{
                      backgroundColor: '#22c55e', // Green HD
                      color: '#ffffff',
                      border: 'none',
                      padding: '14px',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    ⬇️ DESCARGAR FOTO {idx + 1} (JPEG HD)
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
