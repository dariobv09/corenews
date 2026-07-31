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
  // Source Selection State
  const [sourceType, setSourceType] = useState<'latest' | 'important' | 'manual'>('latest');
  const [selectedNoticiaId, setSelectedNoticiaId] = useState<string>('');
  const [contextText, setContextText] = useState<string>('');

  // Visual Configuration State
  const [artStyle, setArtStyle] = useState<string>('Fotorealista');
  const [colorTone, setColorTone] = useState<string>('Vibrante');
  const [overlayText, setOverlayText] = useState<string>('');

  // Prompt Generation State
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);

  // DALL-E Image Generation State
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [statusState, setStatusState] = useState<'Inactivo' | 'Analizando Noticia...' | 'Generando Imagen...' | '¡Imagen Lista!'>('Inactivo');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Result Image State
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [currentSlideData, setCurrentSlideData] = useState<ExtendedSlide | null>(null);

  // Library registration feedback
  const [saveLibraryMessage, setSaveLibraryMessage] = useState<string>('');

  // Initialize with latest news item on load
  useEffect(() => {
    if (todayNoticias && todayNoticias.length > 0) {
      const latest = todayNoticias[0];
      setSelectedNoticiaId(latest.id);
      setContextText(`[${latest.categoria.toUpperCase()}] ${latest.titulo}\n\n${latest.hecho_principal}`);
    }
  }, [todayNoticias]);

  // Handle Source Dropdown Changes
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'latest' | 'important' | 'manual';
    setSourceType(value);
    setGeneratedPrompt('');

    if (value === 'latest' && todayNoticias.length > 0) {
      const noticia = todayNoticias[0];
      setSelectedNoticiaId(noticia.id);
      setContextText(`[${noticia.categoria.toUpperCase()}] ${noticia.titulo}\n\n${noticia.hecho_principal}`);
    } else if (value === 'important') {
      const highNews = todayNoticias.find(n => n.importancia === 'Alta') || todayNoticias[0];
      if (highNews) {
        setSelectedNoticiaId(highNews.id);
        setContextText(`[${highNews.categoria.toUpperCase()}] ${highNews.titulo}\n\n${highNews.hecho_principal}`);
      }
    } else if (value === 'manual') {
      setSelectedNoticiaId('');
      setContextText('');
    }
  };

  // BOTÓN 1: Generar Prompt de Imagen (ChatGPT)
  const handleGeneratePrompt = async () => {
    if (!contextText.trim()) {
      alert('Por favor ingresa o selecciona el contexto de la noticia.');
      return;
    }

    setIsGeneratingPrompt(true);
    setStatusState('Analizando Noticia...');
    setStatusMessage('ChatGPT está analizando el contexto y construyendo el prompt de imagen...');

    try {
      const res = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contextText,
          style: artStyle,
          colorTone,
          overlayText
        })
      });

      const data = await res.json();
      if (data.success && data.prompt) {
        setGeneratedPrompt(data.prompt);
        setStatusState('Inactivo');
        setStatusMessage('Prompt optimizado generado correctamente. Haz clic en "Generar Imagen Final" para invocar a DALL-E 3.');
      } else {
        alert(`Error al generar el prompt: ${data.error || 'Error desconocido'}`);
        setStatusState('Inactivo');
      }
    } catch (err: any) {
      console.error('Error generando prompt:', err);
      alert(`Error de conexión: ${err.message || err}`);
      setStatusState('Inactivo');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // BOTÓN 2: Generar Imagen Final (DALL-E)
  const handleGenerateImage = async (customPromptOverride?: string) => {
    const promptToUse = customPromptOverride || generatedPrompt;
    setIsGeneratingImage(true);
    setStatusState('Generando Imagen...');
    setStatusMessage('Invocando a OpenAI DALL-E 3 (1024x1792 vertical 9:16)...');
    setSaveLibraryMessage('');

    try {
      const payload: any = {
        regenerate: true,
        custom_prompt: promptToUse,
        overlay_text: overlayText
      };

      if (sourceType !== 'manual' && selectedNoticiaId) {
        payload.noticia_id = selectedNoticiaId;
      } else {
        payload.manual_text = contextText;
      }

      const res = await fetch('/api/generate-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setCurrentImageUrl(data.imageUrl);
        setCurrentSlideData(data.slide || null);
        setStatusState('¡Imagen Lista!');
        setStatusMessage('¡Diapositiva vertical 9:16 para TikTok generada con éxito!');
      } else {
        alert(`Error al generar la imagen con DALL-E: ${data.error || 'Error en el servidor.'}`);
        setStatusState('Inactivo');
        setStatusMessage('La generación falló. Revisa el saldo de OpenAI o la conexión.');
      }
    } catch (err: any) {
      console.error('Error generando imagen:', err);
      alert(`Error de red: ${err.message || err}`);
      setStatusState('Inactivo');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // DESCARGAR IMAGEN OPTIMIZADA PARA TIKTOK (JPEG Blob directo de 154 KB)
  const handleDownloadOptimizedImage = async () => {
    if (!currentImageUrl) return;
    try {
      setStatusMessage('Descargando imagen binaria en HD para TikTok...');
      const response = await fetch(currentImageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      const blobUrl = URL.createObjectURL(blob);

      const filename = `tiktok_corenews_${Date.now()}.jpg`;
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      setStatusMessage('¡Imagen descargada exitosamente!');
    } catch (err) {
      console.error('Error descargando imagen:', err);
      window.open(currentImageUrl, '_blank');
    }
  };

  // GUARDAR EN BIBLIOTECA DE MEDIOS CORENEWS
  const handleSaveToLibrary = async () => {
    if (!currentImageUrl || !selectedNoticiaId) {
      setSaveLibraryMessage('La imagen ya está activa en la biblioteca o es de ingreso manual.');
      return;
    }
    setSaveLibraryMessage('✓ Guardada correctamente en la base de datos de The Core News.');
  };

  return (
    <div style={{
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      backgroundColor: '#0a0a0c',
      color: '#ffffff',
      minHeight: '100vh',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      
      {/* 🏛️ HEADER CORPORATIVO DE THE CORE NEWS */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1f1f23',
        paddingBottom: '20px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '8px', height: '24px', backgroundColor: '#3b82f6', borderRadius: '3px' }} />
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
              the core news
            </h1>
            <p style={{ fontSize: '12px', color: '#a1a1aa', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CREADOR PRIVADO DE CONTENIDO PARA TIKTOK (DALL-E 3 + CHATGPT)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{
            fontSize: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            padding: '4px 12px',
            borderRadius: '16px',
            fontWeight: 600
          }}>
            OpenAI API Conectada
          </span>
        </div>
      </header>

      {/* 📐 ESTRUCTURA EN 2 COLUMNAS (IZQUIERDA 40%, DERECHA 60%) */}
      <div style={{
        display: 'flex',
        gap: '32px',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}>

        {/* ══════════════════════════════════════════════════════════════
            SECCIÓN 1: PANEL DE CONTROL DE ENTRADA (Izquierda, 40% de ancho)
            ══════════════════════════════════════════════════════════════ */}
        <div style={{
          flex: '1 1 380px',
          maxWidth: '450px',
          backgroundColor: '#121214',
          border: '1px solid #1f1f23',
          borderRadius: '16px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
        }}>
          
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#ffffff', borderBottom: '1px solid #27272a', paddingBottom: '12px' }}>
            ⚙️ 1. Configuración de Entrada
          </h2>

          {/* Selector de Fuente */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#a1a1aa' }}>
              Seleccionar Fuente de Noticia
            </label>
            <select
              value={sourceType}
              onChange={handleSourceChange}
              style={{
                width: '100%',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                color: '#ffffff',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="latest">Última Noticia de la Web</option>
              <option value="important">Noticia Importante de los últimos 5 días</option>
              <option value="manual">Ingresar Texto Manual</option>
            </select>
          </div>

          {/* Área de Texto de la Noticia */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#a1a1aa' }}>
              Contexto de la Noticia para la IA
            </label>
            <textarea
              rows={5}
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Escribe o pega aquí el contenido de la noticia para generar el prompt..."
              style={{
                width: '100%',
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                color: '#ffffff',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                lineHeight: '1.5',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Configurador de Estilo Visual */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#18181b',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #27272a'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#3b82f6' }}>
              🎨 Configurador de Estilo Visual
            </span>

            {/* Estilo Artístico */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: '#a1a1aa' }}>Estilo Artístico</label>
              <select
                value={artStyle}
                onChange={(e) => setArtStyle(e.target.value)}
                style={{
                  backgroundColor: '#121214',
                  border: '1px solid #27272a',
                  color: '#ffffff',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              >
                <option value="Fotorealista">Fotorealista (Prensa HD)</option>
                <option value="Ilustración Vectorial">Ilustración Vectorial</option>
                <option value="Arte 3D">Arte 3D (Render CGI)</option>
                <option value="Minimalista">Minimalista</option>
                <option value="Cyberpunk">Cyberpunk (Neón)</option>
              </select>
            </div>

            {/* Tono de Color */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: '#a1a1aa' }}>Tono de Color</label>
              <select
                value={colorTone}
                onChange={(e) => setColorTone(e.target.value)}
                style={{
                  backgroundColor: '#121214',
                  border: '1px solid #27272a',
                  color: '#ffffff',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              >
                <option value="Vibrante">Vibrante (Colores intensos)</option>
                <option value="Monocromático">Monocromático</option>
                <option value="Oscuro">Oscuro (Cinematográfico)</option>
                <option value="Pastel">Pastel (Tonos suaves)</option>
              </select>
            </div>

            {/* Texto Superpuesto */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: '#a1a1aa' }}>Texto superpuesto en imagen (Opcional)</label>
              <input
                type="text"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                placeholder="Ej: ALERTA IA 2026..."
                style={{
                  backgroundColor: '#121214',
                  border: '1px solid #27272a',
                  color: '#ffffff',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* BOTÓN 1: Generar Prompt de Imagen (ChatGPT) */}
          <button
            onClick={handleGeneratePrompt}
            disabled={isGeneratingPrompt}
            style={{
              backgroundColor: '#1f1f23',
              color: '#ffffff',
              border: '1px solid #3b82f6',
              padding: '14px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: isGeneratingPrompt ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background-color 0.2s'
            }}
          >
            {isGeneratingPrompt ? 'Analizando Noticia con ChatGPT...' : '✨ 1. Generar Prompt de Imagen (ChatGPT)'}
          </button>

          {/* Campo de Texto Solo Lectura con el Prompt Generado */}
          {generatedPrompt && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#3b82f6' }}>
                Prompt Resultante (ChatGPT para DALL-E 3)
              </label>
              <textarea
                rows={3}
                readOnly
                value={generatedPrompt}
                style={{
                  width: '100%',
                  backgroundColor: '#0a0a0c',
                  border: '1px solid #3b82f6',
                  color: '#a1a1aa',
                  padding: '10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* BOTÓN 2: Generar Imagen Final (DALL-E 3) */}
          <button
            onClick={() => handleGenerateImage()}
            disabled={isGeneratingImage || !generatedPrompt}
            style={{
              backgroundColor: !generatedPrompt ? '#27272a' : '#3b82f6',
              color: !generatedPrompt ? '#71717a' : '#ffffff',
              border: 'none',
              padding: '16px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: (!generatedPrompt || isGeneratingImage) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: generatedPrompt ? '0 4px 20px rgba(59, 130, 246, 0.4)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {isGeneratingImage ? 'Generando en DALL-E 3...' : '🎬 2. Generar Imagen Final (DALL-E)'}
          </button>

        </div>

        {/* ══════════════════════════════════════════════════════════════
            SECCIÓN 2: VISUALIZADOR Y DESCARGA DE RESULTADOS (Derecha, 60% de ancho)
            ══════════════════════════════════════════════════════════════ */}
        <div style={{
          flex: '1 1 500px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>

          {/* Marco grande de visualización en relación de aspecto 9:16 (TikTok) */}
          <div style={{
            width: '100%',
            maxWidth: '380px',
            margin: '0 auto',
            aspectRatio: '9/16',
            backgroundColor: '#121214',
            border: '2px solid #27272a',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 40px rgba(0,0,0,0.7)'
          }}>
            {isGeneratingImage ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #3b82f6',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                  Generando imagen vertical 9:16 con DALL-E 3...
                </span>
              </div>
            ) : currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt="Imagen generada para TikTok"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '32px',
                textAlign: 'center',
                color: '#71717a'
              }}>
                <span style={{ fontSize: '48px' }}>🎬</span>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#a1a1aa' }}>
                  La imagen generada aparecerá aquí
                </span>
                <span style={{ fontSize: '12px' }}>
                  Relación de aspecto vertical 9:16 optimizada para TikTok
                </span>
              </div>
            )}
          </div>

          {/* Barra de Estado de Generación */}
          <div style={{
            backgroundColor: '#121214',
            border: '1px solid #1f1f23',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: statusState === '¡Imagen Lista!' ? '#22c55e' : isGeneratingImage || isGeneratingPrompt ? '#f59e0b' : '#71717a'
              }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                Estado: {statusState}
              </span>
            </div>

            <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
              {statusMessage || 'Esperando inicio de flujo.'}
            </span>
          </div>

          {/* Panel de Acciones de la Imagen */}
          <div style={{
            backgroundColor: '#121214',
            border: '1px solid #1f1f23',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            
            {/* BOTÓN PRINCIPAL DESTACADO: Descargar Imagen Optimizada para TikTok */}
            <button
              onClick={handleDownloadOptimizedImage}
              disabled={!currentImageUrl}
              style={{
                backgroundColor: !currentImageUrl ? '#27272a' : '#22c55e', // Corporate Green / Success
                color: !currentImageUrl ? '#71717a' : '#ffffff',
                border: 'none',
                padding: '18px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 800,
                cursor: !currentImageUrl ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: currentImageUrl ? '0 4px 20px rgba(34, 197, 94, 0.4)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              ⬇️ Descargar Imagen Optimizada para TikTok (JPEG HD)
            </button>

            {/* Fila de botones secundarios */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleGenerateImage(generatedPrompt)}
                disabled={!currentImageUrl || isGeneratingImage}
                style={{
                  flex: 1,
                  backgroundColor: '#1f1f23',
                  color: '#ffffff',
                  border: '1px solid #27272a',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: (!currentImageUrl || isGeneratingImage) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                🔄 Regenerar Imagen (Mismo Prompt)
              </button>

              <button
                onClick={() => handleGenerateImage()}
                disabled={!currentImageUrl || isGeneratingImage}
                style={{
                  flex: 1,
                  backgroundColor: '#1f1f23',
                  color: '#ffffff',
                  border: '1px solid #27272a',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: (!currentImageUrl || isGeneratingImage) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                ✨ Generar Nueva Variante (DALL-E)
              </button>
            </div>

            {/* Botón Opcional: Guardar en Biblioteca de Medios CoreNews */}
            <button
              onClick={handleSaveToLibrary}
              disabled={!currentImageUrl}
              style={{
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: !currentImageUrl ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              💾 Guardar en Biblioteca de Medios CoreNews
            </button>

            {saveLibraryMessage && (
              <span style={{ fontSize: '12px', color: '#22c55e', textAlign: 'center', fontWeight: 600 }}>
                {saveLibraryMessage}
              </span>
            )}

          </div>

        </div>

      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
