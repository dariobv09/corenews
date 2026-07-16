'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import { Categoria, CarouselSlide, Noticia } from '@/types';

interface ExtendedSlide extends CarouselSlide {
  noticia?: Noticia | null;
}

interface CarouselsAdminClientProps {
  initialSlides: ExtendedSlide[];
}

const CATEGORY_LABELS: Record<Categoria, string> = {
  ia: 'Inteligencia Artificial',
  tecnologia: 'Tecnología',
  economia: 'Economía',
  politica: 'Geopolítica'
};

const CATEGORY_COLORS: Record<Categoria, string> = {
  ia: '#3b82f6', // Blue
  tecnologia: '#a855f7', // Purple
  economia: '#10b981', // Green
  politica: '#f59e0b' // Yellow/Orange
};

export default function CarouselsAdminClient({ initialSlides }: CarouselsAdminClientProps) {
  const [downloadingZip, setDownloadingZip] = useState<Record<string, boolean>>({});
  const [downloadingSingle, setDownloadingSingle] = useState<Record<string, boolean>>({});
  const [downloadingAllZip, setDownloadingAllZip] = useState(false);
  const [downloadingAllSeparately, setDownloadingAllSeparately] = useState(false);
  const [allSeparatelyProgress, setAllSeparatelyProgress] = useState('');

  // Group slides by category
  const slidesByCategory: Record<Categoria, ExtendedSlide[]> = {
    ia: [],
    tecnologia: [],
    economia: [],
    politica: []
  };

  initialSlides.forEach((slide) => {
    slidesByCategory[slide.categoria].push(slide);
  });

  const categoriesWithSlides = (Object.keys(slidesByCategory) as Categoria[]).filter(
    (cat) => slidesByCategory[cat].length > 0
  );

  /**
   * Helper to download a single image using Blobs
   */
  const handleDownloadSingle = async (slide: ExtendedSlide) => {
    setDownloadingSingle(prev => ({ ...prev, [slide.id]: true }));
    try {
      const response = await fetch(slide.image_url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const filename = `thecorenews_${slide.categoria}_${slide.id}.jpg`;
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error downloading single image:', err);
      // Fallback
      window.open(slide.image_url, '_blank');
    } finally {
      setDownloadingSingle(prev => ({ ...prev, [slide.id]: false }));
    }
  };

  /**
   * Helper to download all category images as a ZIP file using JSZip
   */
  const handleDownloadZip = async (categoria: Categoria) => {
    setDownloadingZip(prev => ({ ...prev, [categoria]: true }));
    try {
      const zip = new JSZip();
      const categorySlides = slidesByCategory[categoria];
      const todayStr = new Date().toISOString().split('T')[0];

      // Download all images in parallel
      const fetchPromises = categorySlides.map(async (slide, idx) => {
        const response = await fetch(slide.image_url);
        const blob = await response.blob();
        const cleanTitle = (slide.noticia?.titulo || `slide_${idx}`)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .substring(0, 30);
        
        zip.file(`${idx + 1}_${cleanTitle}.jpg`, blob);
      });

      await Promise.all(fetchPromises);

      // Generate ZIP content
      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);

      // Trigger download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `carrusel_tiktok_${categoria}_${todayStr}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(`Error generating ZIP for ${categoria}:`, err);
      alert('Hubo un error al generar el archivo ZIP.');
    } finally {
      setDownloadingZip(prev => ({ ...prev, [categoria]: false }));
    }
  };

  /**
   * Helper to download all generated slides (across all categories) in a single ZIP file
   */
  const handleDownloadAllZip = async () => {
    setDownloadingAllZip(true);
    try {
      const zip = new JSZip();
      const todayStr = new Date().toISOString().split('T')[0];

      // Download all images in parallel
      const fetchPromises = initialSlides.map(async (slide, idx) => {
        const response = await fetch(slide.image_url);
        const blob = await response.blob();
        const cleanTitle = (slide.noticia?.titulo || `slide_${idx}`)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .substring(0, 30);
        
        zip.file(`${slide.categoria}_${idx + 1}_${cleanTitle}.jpg`, blob);
      });

      await Promise.all(fetchPromises);

      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const blobUrl = URL.createObjectURL(content);

      // Trigger download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `corenews_tiktok_todas_${todayStr}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error generating all-slides ZIP:', err);
      alert('Hubo un error al generar el archivo ZIP.');
    } finally {
      setDownloadingAllZip(false);
    }
  };

  /**
   * Helper to download all images sequentially to the camera roll / download folder (mobile friendly)
   */
  const handleDownloadAllSeparately = async () => {
    setDownloadingAllSeparately(true);
    try {
      for (let i = 0; i < initialSlides.length; i++) {
        const slide = initialSlides[i];
        setAllSeparatelyProgress(`${i + 1}/${initialSlides.length}`);

        const response = await fetch(slide.image_url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const filename = `thecorenews_${slide.categoria}_${slide.id}.jpg`;
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);

        // Delay 350ms to allow mobile browsers to handle multiple files sequentially
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    } catch (err) {
      console.error('Error downloading images sequentially:', err);
      alert('Hubo un error durante la descarga masiva.');
    } finally {
      setDownloadingAllSeparately(false);
      setAllSeparatelyProgress('');
    }
  };

  if (categoriesWithSlides.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '80px 24px',
        backgroundColor: '#0a0a0c',
        borderRadius: '12px',
        border: '1px solid #1f1f23'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>🎬</div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>
          No hay diapositivas generadas hoy
        </h2>
        <p style={{ fontSize: '14px', color: '#a1a1aa', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          Las imágenes para TikTok se generan automáticamente al final del pipeline diario de noticias. En cuanto el Agente Coordinador complete la actualización del día, aparecerán aquí agrupadas para su descarga.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Panel de descargas masivas global */}
      <div style={{
        backgroundColor: '#0a0a0c',
        border: '1px solid #1f1f23',
        borderRadius: '16px',
        padding: '24px 32px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
            ⚡ Descarga Rápida (Todas las Categorías)
          </h2>
          <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
            Descarga las {initialSlides.length} fotos de hoy a la vez. Ideal para subir rápidamente a TikTok.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {/* Botón de Descargar Todo Suelto (Recomendado para Móvil) */}
          <button
            onClick={handleDownloadAllSeparately}
            disabled={downloadingAllSeparately || downloadingAllZip}
            style={{
              backgroundColor: '#1f1f23',
              color: '#ffffff',
              border: '1px solid #27272a',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: (downloadingAllSeparately || downloadingAllZip) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            {downloadingAllSeparately ? (
              <>
                <span className="spinner" style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Guardando ({allSeparatelyProgress})...
              </>
            ) : (
              '📱 Guardar todas las fotos en la galería'
            )}
          </button>

          {/* Botón de Descargar Todo como un ZIP */}
          <button
            onClick={handleDownloadAllZip}
            disabled={downloadingAllSeparately || downloadingAllZip}
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: (downloadingAllSeparately || downloadingAllZip) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s'
            }}
          >
            {downloadingAllZip ? (
              <>
                <span className="spinner" style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  border: '2px solid #000000',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Creando ZIP...
              </>
            ) : (
              '📦 Descargar Todo (.ZIP)'
            )}
          </button>
        </div>
      </div>

      {categoriesWithSlides.map((cat) => {
        const categorySlides = slidesByCategory[cat];
        const isZipLoading = downloadingZip[cat];

        return (
          <div key={cat} style={{
            border: '1px solid #1f1f23',
            borderRadius: '16px',
            backgroundColor: '#0a0a0c',
            padding: '32px'
          }}>
            {/* Category Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              borderBottom: '1px solid #1f1f23',
              paddingBottom: '20px',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: CATEGORY_COLORS[cat]
                }} />
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  {CATEGORY_LABELS[cat]}
                </h2>
                <span style={{
                  fontSize: '12px',
                  backgroundColor: '#1f1f23',
                  color: '#a1a1aa',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 600
                }}>
                  {categorySlides.length} {categorySlides.length === 1 ? 'noticia' : 'noticias'}
                </span>
              </div>

              <button
                onClick={() => handleDownloadZip(cat)}
                disabled={isZipLoading}
                style={{
                  backgroundColor: isZipLoading ? '#1a1a1e' : '#ffffff',
                  color: isZipLoading ? '#71717a' : '#000000',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: isZipLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
              >
                {isZipLoading ? (
                  <>
                    <span className="spinner" style={{
                      display: 'inline-block',
                      width: '12px',
                      height: '12px',
                      border: '2px solid #71717a',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    Comprimiendo ZIP...
                  </>
                ) : (
                  <>
                    📥 Descargar ZIP del lote
                  </>
                )}
              </button>
            </div>

            {/* Instruction for Mobile */}
            <p style={{
              fontSize: '12px',
              color: '#71717a',
              marginTop: '-16px',
              marginBottom: '24px',
              fontStyle: 'italic'
            }}>
              💡 TIP MÓVIL: Si estás en tu móvil, mantén presionada cualquier imagen para guardarla directamente en tu galería o usa los botones individuales.
            </p>

            {/* Grid of slides */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '24px'
            }}>
              {categorySlides.map((slide, idx) => {
                const isSingleLoading = downloadingSingle[slide.id];
                return (
                  <div key={slide.id} style={{
                    backgroundColor: '#121214',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Image Preview Container */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '177.77%', // 16:9 vertical aspect ratio (1792/1024)
                      backgroundColor: '#000000',
                      cursor: 'pointer'
                    }}>
                      <img
                        src={slide.image_url}
                        alt={slide.noticia?.titulo || `TikTok Slide ${idx + 1}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>

                    {/* Meta info */}
                    <div style={{
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      flexGrow: 1
                    }}>
                      <div style={{ flexGrow: 1 }}>
                        <h3 style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          margin: 0,
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {slide.noticia?.titulo || 'Diapositiva del día'}
                        </h3>
                        <p style={{
                          fontSize: '11px',
                          color: '#71717a',
                          margin: '4px 0 0 0',
                          fontWeight: 500
                        }}>
                          {slide.noticia?.importancia ? `Importancia: ${slide.noticia.importancia}` : 'Folleto Informativo'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDownloadSingle(slide)}
                        disabled={isSingleLoading}
                        style={{
                          backgroundColor: '#1f1f23',
                          color: '#ffffff',
                          border: '1px solid #27272a',
                          padding: '10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: isSingleLoading ? 'not-allowed' : 'pointer',
                          textAlign: 'center',
                          transition: 'background-color 0.2s',
                          width: '100%'
                        }}
                      >
                        {isSingleLoading ? 'Descargando...' : '💾 Guardar Foto'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Embedded CSS for animations */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
