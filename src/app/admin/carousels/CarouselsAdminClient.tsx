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

  // 1. Direct Web Share API for iOS/Android native saving
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
        const proxyUrl = `/api/carousel-image/${rawFileName}`;
        
        const response = await fetch(proxyUrl);
        const blob = await response.blob();
        
        const file = new File([blob], `noticia_${i + 1}.jpg`, { type: 'image/jpeg' });
        filesToShare.push(file);
      }

      // Check native Web Share API (iOS Safari / Android Chrome)
      if (navigator.canShare && navigator.canShare({ files: filesToShare })) {
        setSaveProgress('Abriendo menú de iPhone... Selecciona "Guardar X imágenes"');
        await navigator.share({
          files: filesToShare,
          title: 'Fotos para TikTok',
          text: 'Fotos generadas por IA para TikTok'
        });
        setSaveProgress('¡Fotos enviadas al menú de guardado!');
      } else {
        // Fallback: Download each image directly
        setSaveProgress('Guardando fotos una a una...');
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
      setSaveProgress('Error al guardar. Prueba manteniéndolas presionadas.');
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      color: '#000000',
      minHeight: '100vh'
    }}>
      
      {/* 🚀 BARRA DE ACCIÓN PRINCIPAL SUPER SIMPLE Y GIGANTE */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#ffffff',
        padding: '16px 0',
        borderBottom: '2px solid #000000',
        marginBottom: '24px',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          
          {/* BOTÓN GIGANTE PARA GUARDAR EN GALERÍA EN IPHONE/MÓVIL */}
          <button
            onClick={handleSaveAllNative}
            disabled={isSavingAll || slides.length === 0}
            style={{
              backgroundColor: '#007aff', // iOS Blue
              color: '#ffffff',
              border: 'none',
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: isSavingAll ? 'not-allowed' : 'pointer',
              flex: 1,
              minWidth: '260px',
              boxShadow: '0 4px 12px rgba(0,122,255,0.3)'
            }}
          >
            {isSavingAll ? saveProgress : `📱 GUARDAR TODAS EN GALERÍA DE IPHONE (${slides.length})`}
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#e5e5ea',
              color: '#000000',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 Actualizar
          </button>
        </div>

        {saveProgress && (
          <p style={{ margin: '8px 0 0 0', color: '#007aff', fontWeight: 'bold', fontSize: '14px' }}>
            {saveProgress}
          </p>
        )}
      </div>

      {/* 📱 CONSEJO DIRECTO DE IPHONE / MÓVIL */}
      <div style={{
        backgroundColor: '#fffbe6',
        border: '1px solid #ffe58f',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '24px',
        fontSize: '14px',
        lineHeight: 1.4
      }}>
        💡 <b>MÓVIL / IPHONE:</b> Si estás en el móvil, dale al botón azul de arriba o <b>mantén presionada cualquier foto</b> y pulsa <i>"Guardar en Fotos"</i>.
      </div>

      {/* 📷 LISTA ULTRA BÁSICA DE FOTOS LISTAS PARA TIKTOK */}
      {slides.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '18px' }}>
          Cargando fotos del servidor... Si no aparecen, dale a Actualizar.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {slides.map((slide, idx) => {
            const rawFileName = slide.image_url.split('/').pop() || `slide_${idx}.jpg`;
            const directUrl = slide.image_url.startsWith('http')
              ? slide.image_url
              : `https://bnywcdwwqdcyztqguios.supabase.co/storage/v1/object/public/tiktok-carousel/${rawFileName}`;
            const proxyUrl = `/api/carousel-image/${rawFileName}`;

            return (
              <div key={slide.id || idx} style={{
                border: '2px solid #000000',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#f2f2f7',
                display: 'flex',
                flexDirection: 'column'
              }}>
                
                {/* LA IMAGEN DIRECTA VISIBLE AL 100% */}
                <div style={{ width: '100%', aspectRatio: '9/16', backgroundColor: '#000000' }}>
                  <img
                    src={directUrl}
                    alt={slide.noticia?.titulo || `Foto TikTok ${idx + 1}`}
                    onError={(e) => {
                      // Fallback to proxy if CDN fails
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

                {/* PIE DE FOTO ULTRA SIMPLE */}
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#000000', lineHeight: 1.3 }}>
                    {idx + 1}. {slide.noticia?.titulo}
                  </p>

                  <a
                    href={proxyUrl}
                    download={`noticia_${idx + 1}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      backgroundColor: '#34c759', // iOS Green
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    ⬇️ DESCARGAR FOTO {idx + 1}
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
