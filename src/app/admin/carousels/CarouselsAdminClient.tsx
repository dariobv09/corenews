'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import { Categoria, CarouselSlide, Noticia } from '@/types';

interface ExtendedSlide extends CarouselSlide {
  noticia?: Noticia | null;
}

interface CarouselsAdminClientProps {
  initialSlides: ExtendedSlide[];
  todayNoticias: Noticia[];
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

export default function CarouselsAdminClient({ initialSlides, todayNoticias }: CarouselsAdminClientProps) {
  const [slides, setSlides] = useState<ExtendedSlide[]>(initialSlides);
  const [downloadingZip, setDownloadingZip] = useState<Record<string, boolean>>({});
  const [downloadingSingle, setDownloadingSingle] = useState<Record<string, boolean>>({});
  const [downloadingAllZip, setDownloadingAllZip] = useState(false);
  const [downloadingAllSeparately, setDownloadingAllSeparately] = useState(false);
  const [allSeparatelyProgress, setAllSeparatelyProgress] = useState('');

  // Generation states
  const [generatingSlide, setGeneratingSlide] = useState<Record<string, boolean>>({});
  const [generatingAll, setGeneratingAll] = useState(false);

  const getProxyUrl = (url: string) => {
    if (url && url.startsWith('http')) {
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      const queryIndex = filename.indexOf('?');
      if (queryIndex !== -1) {
        const cleanName = filename.substring(0, queryIndex);
        const query = filename.substring(queryIndex);
        return `/api/carousel-image/${cleanName}${query}`;
      }
      return `/api/carousel-image/${filename}`;
    }
    return url;
  };

  // Group slides by category dynamically from current state
  const slidesByCategory: Record<Categoria, ExtendedSlide[]> = {
    ia: [],
    tecnologia: [],
    economia: [],
    politica: []
  };

  (slides || []).forEach((slide) => {
    if (slide && slide.categoria && slidesByCategory[slide.categoria]) {
      slidesByCategory[slide.categoria].push(slide);
    }
  });

  const categoriesWithSlides = (Object.keys(slidesByCategory) as Categoria[]).filter(
    (cat) => slidesByCategory[cat].length > 0
  );

  // Identify which today's news items are missing a slide
  const newsMissingSlides = (todayNoticias || []).filter(
    (noticia) => noticia && noticia.id && !slides.some((s) => s.noticia_id === noticia.id)
  );

  /**
   * Generates or regenerates a single slide on demand
   */
  const handleGenerateSlide = async (noticiaId: string, regenerate = false) => {
    setGeneratingSlide(prev => ({ ...prev, [noticiaId]: true }));
    try {
      const res = await fetch('/api/generate-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticia_id: noticiaId, regenerate })
      });
      const data = await res.json();
      
      if (data.success && data.slide) {
        // Add or update the slide in client state
        setSlides(prev => {
          const filtered = prev.filter(s => s.noticia_id !== noticiaId);
          const noticiaObj = todayNoticias.find(n => n.id === noticiaId);
          const newExtendedSlide: ExtendedSlide = {
            ...data.slide,
            noticia: noticiaObj
          };
          return [newExtendedSlide, ...filtered];
        });
      } else {
        alert(`Error al generar la imagen: ${data.error || 'Respuesta inválida del servidor.'}`);
      }
    } catch (err: any) {
      console.error('Error generating slide:', err);
      alert(`Error de red: ${err.message || err}`);
    } finally {
      setGeneratingSlide(prev => ({ ...prev, [noticiaId]: false }));
    }
  };

  /**
   * Generates all missing slides sequentially to avoid server timeouts and rate limits
   */
  const handleGenerateAllMissing = async () => {
    setGeneratingAll(true);
    const missing = todayNoticias.filter(
      (noticia) => !slides.some((s) => s.noticia_id === noticia.id)
    );
    
    for (let i = 0; i < missing.length; i++) {
      const noticia = missing[i];
      try {
        await handleGenerateSlide(noticia.id);
        // Small cooldown between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.error(e);
      }
    }
    setGeneratingAll(false);
  };

  /**
   * Helper to download a single image using Blobs
   */
  const handleDownloadSingle = async (slide: ExtendedSlide) => {
    setDownloadingSingle(prev => ({ ...prev, [slide.id]: true }));
    try {
      const response = await fetch(getProxyUrl(slide.image_url));
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
      window.open(getProxyUrl(slide.image_url), '_blank');
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

      const fetchPromises = categorySlides.map(async (slide, idx) => {
        const response = await fetch(getProxyUrl(slide.image_url));
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

      const fetchPromises = slides.map(async (slide, idx) => {
        const response = await fetch(getProxyUrl(slide.image_url));
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
   * Helper to download all images to the camera roll / gallery (mobile friendly)
   */
  const handleDownloadAllSeparately = async () => {
    setDownloadingAllSeparately(true);
    setAllSeparatelyProgress('Preparando...');
    try {
      const fetchPromises = slides.map(async (slide, idx) => {
        const response = await fetch(getProxyUrl(slide.image_url));
        const blob = await response.blob();
        return new File(
          [blob],
          `corenews_${slide.categoria}_${idx + 1}.jpg`,
          { type: 'image/jpeg' }
        );
      });

      const filesList = await Promise.all(fetchPromises);

      // 2. Try Web Share API (native share sheet on iOS)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: filesList })) {
        await navigator.share({
          files: filesList,
          title: 'Fotos Core News',
          text: 'Diapositivas de TikTok de hoy'
        });
        return;
      }

      // 3. Fallback: Sequential downloads
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        setAllSeparatelyProgress(`${i + 1}/${slides.length}`);

        const response = await fetch(getProxyUrl(slide.image_url));
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

        // Delay to allow mobile browsers to handle multiple files
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    } catch (err) {
      console.error('Error in batch photo saving:', err);
    } finally {
      setDownloadingAllSeparately(false);
      setAllSeparatelyProgress('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      
      {/* ⚠️ Noticias sin diapositiva Panel (On-demand creator) */}
      {newsMissingSlides.length > 0 && (
        <div style={{
          backgroundColor: '#111115',
          border: '1px solid #f59e0b40',
          borderRadius: '16px',
          padding: '24px 28px',
          boxShadow: '0 4px 30px rgba(245, 158, 11, 0.05)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
            borderBottom: '1px solid #27272a',
            paddingBottom: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ Noticias pendientes de diapositiva ({newsMissingSlides.length})
              </h2>
              <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
                Crea las imágenes personalizadas para las noticias de hoy bajo demanda.
              </p>
            </div>

            {newsMissingSlides.length > 1 && (
              <button
                onClick={handleGenerateAllMissing}
                disabled={generatingAll}
                style={{
                  backgroundColor: '#f59e0b',
                  color: '#000000',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: generatingAll ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
              >
                {generatingAll ? (
                  <>
                    <span className="spinner" />
                    Generando todo...
                  </>
                ) : (
                  '✨ Generar todas'
                )}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {newsMissingSlides.map((noticia) => {
              const isGenerating = generatingSlide[noticia.id];
              return (
                <div key={noticia.id} style={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: (CATEGORY_COLORS[noticia.categoria] || '#71717a') + '20',
                        color: CATEGORY_COLORS[noticia.categoria] || '#71717a',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        letterSpacing: '0.05em'
                      }}>
                        {CATEGORY_LABELS[noticia.categoria] || 'General'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: '#ffffff', lineHeight: 1.4 }}>
                      {noticia.titulo}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleGenerateSlide(noticia.id)}
                    disabled={isGenerating || generatingAll}
                    style={{
                      backgroundColor: '#1f1f23',
                      color: '#ffffff',
                      border: '1px solid #27272a',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: (isGenerating || generatingAll) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexShrink: 0,
                      transition: 'background-color 0.2s'
                    }}
                  >
                    {isGenerating ? (
                      <>
                        <span className="spinner" />
                        Creando...
                      </>
                    ) : (
                      '🎬 Crear Foto'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {slides.length === 0 ? (
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
            Usa el panel superior para generar las diapositivas de las noticias publicadas hoy de forma instantánea.
          </p>
        </div>
      ) : (
        <>
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
                Descarga las {slides.length} fotos de hoy a la vez. Ideal para subir rápidamente a TikTok.
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
                    <span className="spinner" />
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
                    <span className="spinner" style={{ borderTop: '2px solid transparent', borderColor: '#000000' }} />
                    Comprimiendo...
                  </>
                ) : (
                  '📥 Descargar todas (ZIP)'
                )}
              </button>
            </div>
          </div>

          {/* Render Categories */}
          {categoriesWithSlides.map((cat) => {
            const categorySlides = slidesByCategory[cat];
            const isZipLoading = downloadingZip[cat];

            return (
              <div key={cat} style={{
                backgroundColor: '#0a0a0c',
                border: '1px solid #1f1f23',
                borderRadius: '16px',
                padding: '32px'
              }}>
                {/* Category Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderBottom: '1px solid #1c1c1f',
                  paddingBottom: '16px',
                  marginBottom: '32px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '6px',
                      height: '24px',
                      backgroundColor: CATEGORY_COLORS[cat],
                      borderRadius: '3px'
                    }} />
                    <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                      {CATEGORY_LABELS[cat]}
                    </h2>
                    <span style={{
                      backgroundColor: '#1f1f23',
                      color: '#a1a1aa',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '12px'
                    }}>
                      {categorySlides.length} {categorySlides.length === 1 ? 'foto' : 'fotos'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownloadZip(cat)}
                    disabled={isZipLoading}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      border: '1px solid #27272a',
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
                        <span className="spinner" />
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
                    const isSlideGenerating = slide.noticia_id ? generatingSlide[slide.noticia_id] : false;

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
                          width: '100%',
                          aspectRatio: '9/16',
                          backgroundColor: '#000000',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: 'pointer'
                        }}>
                          {isSlideGenerating ? (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'rgba(0,0,0,0.85)',
                              gap: '12px',
                              zIndex: 10
                            }}>
                              <span className="spinner" style={{ width: '24px', height: '24px' }} />
                              <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600 }}>Regenerando imagen...</span>
                            </div>
                          ) : null}
                          <img
                            src={getProxyUrl(`${slide.image_url}?t=${slide.created_at ? new Date(slide.created_at).getTime() : Date.now()}`)}
                            alt={slide.noticia?.titulo || `TikTok Slide ${idx + 1}`}
                            style={{
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

                          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
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
                                flexGrow: 1
                              }}
                            >
                              {isSingleLoading ? '...' : '💾 Descargar'}
                            </button>
                            <button
                              onClick={() => slide.noticia_id && handleGenerateSlide(slide.noticia_id, true)}
                              disabled={isSlideGenerating || isSingleLoading}
                              title="Volver a generar esta imagen con otro fondo"
                              style={{
                                backgroundColor: '#22c55e15',
                                color: '#22c55e',
                                border: '1px solid #22c55e30',
                                padding: '10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: (isSlideGenerating || isSingleLoading) ? 'not-allowed' : 'pointer',
                                textAlign: 'center',
                                transition: 'background-color 0.2s',
                                flexShrink: 0
                              }}
                            >
                              {isSlideGenerating ? '...' : '🔄 Recrear'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Embedded CSS for animations */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spinner {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid currentColor;
          border-top: 2px solid transparent;
          borderRadius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
