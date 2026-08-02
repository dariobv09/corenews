'use client';

import React, { useState, useEffect } from 'react';
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
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Manual Studio State (Optional)
  const [showManualStudio, setShowManualStudio] = useState(false);
  const [contextText, setContextText] = useState('');
  const [artStyle, setArtStyle] = useState('Fotorealista');
  const [colorTone, setColorTone] = useState('Vibrante');
  const [overlayText, setOverlayText] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState('');

  // Auto sync slides from prop changes
  useEffect(() => {
    setSlides(initialSlides);
  }, [initialSlides]);

  /**
   * Smart Download Handler supporting iOS / Mobile native Camera Roll saving
   * via Web Share API (navigator.share) and Desktop Proxy (/api/download?url=...)
   */
  const handleSmartDownload = async (imageUrl: string, customFilename?: string) => {
    const filename = customFilename || 'noticia-corenews.jpg';
    try {
      const isMobileOrIOS = typeof navigator !== 'undefined' && 
        (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
         (navigator.maxTouchPoints && navigator.maxTouchPoints > 2));

      // 1. Fetch image binary buffer natively from download proxy
      const downloadProxyUrl = `/api/download?url=${encodeURIComponent(imageUrl)}`;
      const res = await fetch(downloadProxyUrl);
      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });

      // 2. iOS / Mobile Web Share API path (opens native iPhone "Guardar en Fotos" sheet)
      if (isMobileOrIOS && typeof navigator !== 'undefined' && navigator.canShare) {
        const file = new File([blob], filename, { type: 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Guardar Noticia en Fotos',
            text: 'Imagen destacada de The Core News'
          });
          return;
        }
      }

      // 3. Desktop / Fallback path using /api/download proxy & ObjectURL blob
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      console.error('[FrontendDownload] Error al procesar descarga:', err);
      // Direct window open fallback to download proxy
      window.open(`/api/download?url=${encodeURIComponent(imageUrl)}`, '_blank');
    }
  };

  /**
   * Batch Save for iPhone / Mobile Camera Roll
   */
  const handleSaveAllNative = async () => {
    if (slides.length === 0) return;
    setIsSavingAll(true);
    setSaveProgress('Preparando imágenes para guardar...');

    try {
      const filesToShare: File[] = [];

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        setSaveProgress(`Procesando imagen ${i + 1} de ${slides.length}...`);
        
        const downloadProxyUrl = `/api/download?url=${encodeURIComponent(slide.image_url)}`;
        const response = await fetch(downloadProxyUrl);
        const arrayBuffer = await response.arrayBuffer();
        const file = new File([arrayBuffer], `noticia_${i + 1}.jpg`, { type: 'image/jpeg' });
        filesToShare.push(file);
      }

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: filesToShare })) {
        setSaveProgress('Abriendo menú de iPhone... Selecciona "Guardar X imágenes"');
        await navigator.share({
          files: filesToShare,
          title: 'Imágenes de Noticias - The Core News',
          text: 'Imágenes destacadas en formato vertical 9:16'
        });
        setSaveProgress('¡Imágenes enviadas al menú de Fotos de iPhone!');
      } else {
        setSaveProgress('Descargando imágenes una a una...');
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
        setSaveProgress('¡Descarga completada!');
      }
    } catch (err: any) {
      console.error('Error guardando en Galería:', err);
      setSaveProgress('Error en guardado masivo. Usa la descarga individual en cada imagen.');
    } finally {
      setIsSavingAll(false);
    }
  };

  // Manual Studio Handlers
  const handleGeneratePromptManual = async () => {
    if (!contextText.trim()) return alert('Ingresa un texto de noticia para generar el prompt.');
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
      
      {/* BARRA SUPERIOR DE ACCIÓN RÁPIDA */}
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
            {showManualStudio ? '✖️ Ocultar Creador Manual' : '✨ Generar Imagen Personalizada DALL-E'}
          </button>
        </div>

        {saveProgress && (
          <p style={{ margin: '12px 0 0 0', color: '#3b82f6', fontWeight: 700, fontSize: '14px' }}>
            {saveProgress}
          </p>
        )}
      </div>

      {/* ESTUDIO MANUAL OPCIONAL */}
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
            ✨ Estudio de Generación de Imagen Individual por Noticia (DALL-E 3)
          </h3>
          
          <textarea
            rows={3}
            value={contextText}
            onChange={(e) => setContextText(e.target.value)}
            placeholder="Escribe el texto de la noticia para generar su imagen destacada..."
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '240px' }}>
              <div style={{ width: '100%', aspectRatio: '9/16', borderRadius: '12px', overflow: 'hidden', border: '2px solid #3b82f6' }}>
                <img src={manualImageUrl} alt="Resultado manual" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <button
                onClick={() => handleSmartDownload(manualImageUrl, 'noticia-personalizada.jpg')}
                style={{
                  backgroundColor: '#22c55e',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                ⬇️ Guardar en Galería / Descargar
              </button>
            </div>
          )}
        </div>
      )}

      {/* GALERÍA PRINCIPAL DE IMÁGENES DESTACADAS POR NOTICIA */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#a1a1aa', marginBottom: '16px', letterSpacing: '0.05em' }}>
        IMÁGENES DESTACADAS DE NOTICIAS DE HOY ({slides.length})
      </h2>

      {slides.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', fontSize: '18px', color: '#a1a1aa' }}>
          Cargando imágenes del servidor... Si no aparecen, pulsa Actualizar.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '28px'
        }}>
          {slides.map((slide, idx) => {
            const rawFileName = slide.image_url.split('/').pop() || `noticia_${idx + 1}.jpg`;
            const directUrl = slide.image_url;
            const inlineProxyUrl = `/api/carousel-image/${rawFileName}`;
            const keyId = slide.id || `slide_${idx}`;
            const isLoaded = loadedImages[keyId];
            const isFailed = failedImages[keyId];

            return (
              <div key={keyId} style={{
                border: '1px solid #1f1f23',
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: '#121214',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
              }}>
                
                {/* MARCO VERTICAL 9:16 EN ALTA RESOLUCIÓN */}
                <div style={{
                  width: '100%',
                  aspectRatio: '9/16',
                  backgroundColor: '#18181b',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* SKELETON / LOADING UI TO PREVENT BLACK BOX */}
                  {!isLoaded && !isFailed && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: '#18181b',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px',
                      textAlign: 'center',
                      gap: '12px',
                      zIndex: 1
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid #3b82f6',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#a1a1aa' }}>
                        Cargando imagen HD...
                      </span>
                    </div>
                  )}

                  {/* INLINE IMAGE */}
                  <img
                    src={directUrl}
                    alt={slide.noticia?.titulo || `Imagen Noticia ${idx + 1}`}
                    onLoad={() => {
                      setLoadedImages(prev => ({ ...prev, [keyId]: true }));
                    }}
                    onError={(e) => {
                      // Fallback to inline proxy without attachment header
                      if (e.currentTarget.src !== inlineProxyUrl && !inlineProxyUrl.includes('undefined')) {
                        e.currentTarget.src = inlineProxyUrl;
                      } else {
                        setFailedImages(prev => ({ ...prev, [keyId]: true }));
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      opacity: isLoaded ? 1 : 0.01,
                      transition: 'opacity 0.3s ease-in-out'
                    }}
                  />
                </div>

                {/* BOTÓN DE DESCARGA E INTELIGENCIA DE GUARDADO PARA IPHONE Y NAVEGADOR */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#ffffff', lineHeight: 1.4 }}>
                    {idx + 1}. {slide.noticia?.titulo}
                  </p>

                  <button
                    onClick={() => handleSmartDownload(slide.image_url, `noticia_${idx + 1}.jpg`)}
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
                    📱 Guardar en Fotos / Descargar (JPEG)
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
