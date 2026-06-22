'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Categoria, Noticia, Fuente, Informe, AgentLog } from '@/types';
import {
  Brain,
  Terminal,
  RefreshCw,
  FileText,
  ExternalLink,
  Database,
  X,
  ChevronRight,
  Clock,
  BookOpen,
  ArrowLeft,
  Newspaper,
  Zap
} from 'lucide-react';

interface DashboardClientProps {
  initialNoticias: Noticia[];
  initialInformes: Record<Categoria, Informe | null>;
}

const CATEGORIAS: { key: Categoria; label: string; description: string }[] = [
  { key: 'ia',         label: 'Inteligencia Artificial', description: 'Modelos, agentes, regulación y hardware de IA' },
  { key: 'tecnologia', label: 'Tecnología',              description: 'Semiconductores, ciberseguridad e infraestructura' },
  { key: 'economia',   label: 'Economía',                description: 'Mercados, bancos centrales y macroeconomía' },
  { key: 'politica',   label: 'Política Internacional',  description: 'Geopolítica, diplomacia y conflictos globales' },
];

const SECTION_LABELS: Record<string, { title: string; accent: 'blue' | 'violet' }> = {
  hecho_principal:    { title: '1. Hecho principal',       accent: 'blue' },
  desarrollo:         { title: '2. Desarrollo del evento', accent: 'violet' },
  actores:            { title: '3. Actores implicados',     accent: 'blue' },
  contexto:           { title: '4. Contexto',             accent: 'violet' },
  datos_verificables: { title: '5. Datos verificables',    accent: 'blue' },
  estado_actual:      { title: '6. Estado actual',        accent: 'violet' },
};

export default function DashboardClient({ initialNoticias, initialInformes }: DashboardClientProps) {
  const [activeTab, setActiveTab]         = useState<Categoria>('ia');
  const [noticias, setNoticias]           = useState<Noticia[]>(initialNoticias);
  const [informes, setInformes]           = useState<Record<Categoria, Informe | null>>(initialInformes);
  const [selectedNoticia, setSelectedNoticia] = useState<Noticia | null>(null);
  const [showSintesis, setShowSintesis]   = useState(false);

  const [isUpdating, setIsUpdating]       = useState(false);
  const [showLogs, setShowLogs]           = useState(false);
  const [logs, setLogs]                   = useState<AgentLog[]>([]);
  const [lastUpdated, setLastUpdated]     = useState<string | null>(null);
  const [isSupabase, setIsSupabase]       = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  /* ── Polling de estado ─────────────────────────── */
  useEffect(() => {
    fetchLogsAndStatus();
    const iv = setInterval(fetchLogsAndStatus, 2500);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showLogs && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, showLogs]);

  const fetchLogsAndStatus = async () => {
    try {
      const res = await fetch('/api/logs');
      if (!res.ok) return;
      const data = await res.json();
      setLogs(data.logs || []);
      setIsUpdating(data.isUpdating);
      setLastUpdated(data.lastUpdated);
      setIsSupabase(data.isSupabaseConfigured);
      if (isUpdating && !data.isUpdating) reloadDashboardData();
    } catch { /* silent */ }
  };

  const reloadDashboardData = async () => {
    try {
      const newsRes = await fetch(`/api/news?t=${Date.now()}`);
      if (newsRes.ok) {
        const data = await newsRes.json();
        setNoticias(data.noticias || []);
        setInformes(data.informes || {});
      }
    } catch { /* silent */ }
  };

  const triggerUpdate = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    setShowLogs(true);
    setLogs([]);
    try {
      const res = await fetch('/api/update', { method: 'POST' });
      if (!res.ok) throw new Error('Error al iniciar la actualización.');
    } catch (e: any) {
      alert(e.message || 'Error de red.');
      setIsUpdating(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredNoticias = noticias.filter(n => n.categoria === activeTab);
  const activeInforme    = informes[activeTab];
  const activeCat        = CATEGORIAS.find(c => c.key === activeTab)!;

  /* ── Vista artículo abierto ────────────────────── */
  if (selectedNoticia) {
    return (
      <ArticleReader
        noticia={selectedNoticia}
        onClose={() => setSelectedNoticia(null)}
      />
    );
  }

  /* ── Dashboard principal ───────────────────────── */
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ═══ HEADER ════════════════════════════════ */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Brain style={{ width: 18, height: 18, color: '#fff' }} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, letterSpacing: '-0.02em', textTransform: 'lowercase' }}>
                  corenews
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.05em' }}>
                  ANÁLISIS MULTIAGENTE
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Badge DB */}
              <span style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 20,
                background: 'var(--bg-subtle)', color: 'var(--text-muted)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 5
              }}>
                <Database style={{ width: 11, height: 11 }} />
                {isSupabase ? 'Supabase' : 'Local'}
              </span>

              {/* Badge última actualización */}
              <span style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 20,
                background: 'var(--bg-subtle)', color: 'var(--text-muted)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 5
              }}>
                <Clock style={{ width: 11, height: 11 }} />
                {formatDate(lastUpdated)}
              </span>

              {/* Terminal logs */}
              <button
                onClick={() => setShowLogs(!showLogs)}
                title="Terminal de agentes"
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  border: `1px solid ${showLogs ? 'var(--accent-blue)' : 'var(--border)'}`,
                  background: showLogs ? 'rgba(112,147,200,0.08)' : 'var(--bg-subtle)',
                  color: showLogs ? 'var(--accent-blue)' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}
              >
                <Terminal style={{ width: 13, height: 13 }} />
                Terminal
                {isUpdating && (
                  <span className="animate-soft-pulse" style={{
                    width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-violet)'
                  }} />
                )}
              </button>

              {/* Actualizar */}
              <button
                onClick={triggerUpdate}
                disabled={isUpdating}
                style={{
                  padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  border: 'none',
                  background: isUpdating
                    ? 'var(--bg-subtle)'
                    : 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                  color: isUpdating ? 'var(--text-muted)' : '#fff',
                  transition: 'opacity 0.2s',
                  opacity: isUpdating ? 0.6 : 1,
                  boxShadow: isUpdating ? 'none' : '0 2px 12px rgba(112,147,200,0.35)'
                }}
              >
                <RefreshCw style={{ width: 13, height: 13 }} className={isUpdating ? 'animate-spin' : ''} />
                {isUpdating ? 'Analizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═══ CUERPO PRINCIPAL ══════════════════════ */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Navegación por categorías */}
        <nav style={{ display: 'flex', gap: 6, marginBottom: 40, flexWrap: 'wrap' }}>
          {CATEGORIAS.map(cat => {
            const isActive = activeTab === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => { setActiveTab(cat.key); setShowSintesis(false); }}
                style={{
                  padding: '8px 18px', borderRadius: 24, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  border: isActive ? '1px solid transparent' : '1px solid var(--border)',
                  background: isActive
                    ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))'
                    : 'var(--bg-card)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  boxShadow: isActive ? '0 2px 14px rgba(112,147,200,0.3)' : 'none'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>

        {/* Cabecera sección */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: 'var(--text-primary)',
            letterSpacing: '-0.02em', marginBottom: 6,
            fontFamily: 'Poppins, system-ui, sans-serif'
          }}>
            {activeCat.label}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              {activeCat.description}
              <span style={{ marginLeft: 10, padding: '2px 8px', borderRadius: 10,
                background: 'var(--bg-subtle)', color: 'var(--text-faint)',
                fontSize: 11, border: '1px solid var(--border)' }}>
                {filteredNoticias.length} análisis
              </span>
            </p>

            {/* Botón síntesis del día */}
            {activeInforme && (
              <button
                onClick={() => setShowSintesis(!showSintesis)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: '1px solid var(--border)',
                  background: showSintesis ? 'var(--bg-subtle)' : 'var(--bg-card)',
                  color: showSintesis ? 'var(--accent-violet)' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}
              >
                <FileText style={{ width: 13, height: 13 }} />
                Síntesis del Día
              </button>
            )}
          </div>
        </div>

        {/* ── SÍNTESIS EJECUTIVA (expandible) ──────── */}
        {showSintesis && activeInforme && (
          <div className="animate-fade-in" style={{
            marginBottom: 32, padding: '24px 28px', borderRadius: 16,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderLeft: '4px solid var(--accent-violet)'
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-violet)',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
              <FileText style={{ width: 14, height: 14 }} />
              Síntesis Ejecutiva del Día
            </h2>
            <MarkdownRenderer content={activeInforme.contenido} />
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)',
              fontSize: 11, color: 'var(--text-faint)', display: 'flex', gap: 16 }}>
              <span>Generado por Agente Redactor</span>
              <span>{new Date(activeInforme.fecha_generacion).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        )}

        {/* ── LISTA DE ARTÍCULOS ────────────────── */}
        {filteredNoticias.length === 0 ? (
          <EmptyState onUpdate={triggerUpdate} isUpdating={isUpdating} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredNoticias.map((noticia, idx) => (
              <ArticleCard
                key={noticia.id}
                noticia={noticia}
                index={idx}
                onClick={() => setSelectedNoticia(noticia)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ═══ TERMINAL DE AGENTES ══════════════════ */}
      {showLogs && (
        <AgentTerminal
          logs={logs}
          isUpdating={isUpdating}
          onClose={() => setShowLogs(false)}
          onReload={reloadDashboardData}
          logEndRef={logEndRef}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ARTICLE CARD — tarjeta de lista, estilo editorial
   ════════════════════════════════════════════════════ */
function ArticleCard({ noticia, index, onClick }: { noticia: Noticia; index: number; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  const isHigh = noticia.importancia === 'Alta';

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        padding: '28px 0', cursor: 'pointer',
        borderBottom: '1px solid var(--border)',
        transition: 'all 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>

          {/* Índice visual */}
          <div style={{ flexShrink: 0, paddingTop: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: isHigh ? 'rgba(167,139,250,0.1)' : 'var(--bg-subtle)',
              border: `1px solid ${isHigh ? 'rgba(167,139,250,0.3)' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              color: isHigh ? 'var(--accent-violet)' : 'var(--text-faint)'
            }}>
              {index + 1}
            </div>
          </div>

          {/* Contenido */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Tags superiores */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {isHigh && (
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                  padding: '2px 8px', borderRadius: 4,
                  background: 'rgba(167,139,250,0.12)', color: 'var(--accent-violet)',
                  border: '1px solid rgba(167,139,250,0.25)'
                }}>
                  ★ Relevancia Alta
                </span>
              )}
              <span style={{ fontSize: 11, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock style={{ width: 10, height: 10 }} />
                {new Date(noticia.fecha_actualizacion).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>

            {/* Título */}
            <h2 style={{
              fontSize: 19, fontWeight: 700, lineHeight: 1.3, marginBottom: 10,
              color: hovered ? 'var(--accent-blue)' : 'var(--text-primary)',
              letterSpacing: '-0.015em', transition: 'color 0.2s',
              fontFamily: 'Poppins, system-ui, sans-serif'
            }}>
              {noticia.titulo}
            </h2>

            {/* Subtítulo */}
            <p style={{
              fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 14
            }}>
              {noticia.subtitulo}
            </p>

            {/* Footer tarjeta */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              {/* Fuentes */}
              {noticia.fuentes && noticia.fuentes.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                    {noticia.fuentes.length} fuente{noticia.fuentes.length !== 1 ? 's' : ''} —
                  </span>
                  {noticia.fuentes.slice(0, 3).map((f, i) => (
                    <span key={i} style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 12,
                      background: 'var(--bg-subtle)', color: 'var(--text-muted)',
                      border: '1px solid var(--border)'
                    }}>
                      {f.nombre}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <span style={{
                fontSize: 12, fontWeight: 600, color: 'var(--accent-blue)',
                display: 'flex', alignItems: 'center', gap: 4,
                transform: hovered ? 'translateX(3px)' : 'translateX(0)',
                transition: 'transform 0.2s'
              }}>
                Leer análisis completo
                <ChevronRight style={{ width: 14, height: 14 }} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   ARTICLE READER — lector inmersivo a pantalla completa
   ════════════════════════════════════════════════════ */
function ArticleReader({ noticia, onClose }: { noticia: Noticia; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const sections = [
    { key: 'hecho_principal',    content: noticia.hecho_principal },
    { key: 'desarrollo',         content: noticia.desarrollo },
    { key: 'actores',            content: noticia.actores },
    { key: 'contexto',           content: noticia.contexto },
    { key: 'datos_verificables', content: noticia.datos_verificables },
    { key: 'estado_actual',      content: noticia.estado_actual },
  ];

  return (
    <div className="animate-fade-in" style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'var(--bg)', overflowY: 'auto'
    }}>
      {/* Barra de navegación del lector */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', transition: 'all 0.2s'
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Volver
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen style={{ width: 14, height: 14, color: 'var(--text-faint)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>Análisis Profundo</span>
          </div>
        </div>
      </div>

      {/* Contenido del artículo */}
      <article style={{ maxWidth: 820, margin: '0 auto', padding: '56px 24px 100px' }}>

        {/* Metadatos superiores */}
        <header style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            {noticia.importancia === 'Alta' && (
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '3px 10px', borderRadius: 4,
                background: 'rgba(167,139,250,0.12)', color: 'var(--accent-violet)',
                border: '1px solid rgba(167,139,250,0.25)'
              }}>
                ★ Relevancia Alta
              </span>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock style={{ width: 11, height: 11 }} />
              {new Date(noticia.fecha_actualizacion).toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
          </div>

          {/* Título principal */}
          <h1 style={{
            fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, lineHeight: 1.2,
            letterSpacing: '-0.025em', color: 'var(--text-primary)',
            fontFamily: 'Poppins, system-ui, sans-serif', marginBottom: 24
          }}>
            {noticia.titulo}
          </h1>

          {/* Subtítulo */}
          {noticia.subtitulo && (
            <p style={{
              fontSize: 18,
              fontWeight: 400,
              fontStyle: 'italic',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              marginBottom: 32,
              fontFamily: 'Poppins, system-ui, sans-serif'
            }}>
              {noticia.subtitulo}
            </p>
          )}
        </header>

        {/* Separador */}
        <div style={{ borderTop: '1px solid var(--border)', marginBottom: 48 }} />

        {/* Secciones del artículo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>
          {sections.map(({ key, content }) => {
            if (!content) return null;
            const meta = SECTION_LABELS[key];
            const isBlue = meta?.accent === 'blue';
            return (
              <section key={key} className="animate-fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{
                    width: 3, height: 24, borderRadius: 2,
                    background: isBlue ? 'var(--accent-blue)' : 'var(--accent-violet)',
                    flexShrink: 0
                  }} />
                  <h2 style={{
                    fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', margin: 0,
                    color: isBlue ? 'var(--accent-blue)' : 'var(--accent-violet)'
                  }}>
                    {meta?.title || key}
                  </h2>
                </div>
                <div style={{
                  fontSize: 16, lineHeight: 1.85, color: 'var(--text-primary)',
                  paddingLeft: 13
                }}>
                  {content.split('\n\n').map((para, i) => (
                    <p key={i} style={{ marginBottom: '1.4em', margin: i > 0 ? '1.4em 0 0' : '0' }}>
                      {para.trim()}
                    </p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── SECCIÓN DE POSIBLES CONSECUENCIAS ────── */}
        {noticia.consecuencias && (
          <section style={{
            marginTop: 48,
            padding: '28px 32px',
            borderRadius: 16,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderLeft: '4px solid var(--accent-blue)',
            fontFamily: 'Poppins, system-ui, sans-serif'
          }}>
            <h3 style={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--accent-blue)',
              marginBottom: 20,
              marginTop: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <Zap style={{ width: 14, height: 14 }} />
              Posibles Consecuencias
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {noticia.consecuencias.split('\n').filter(line => line.trim()).map((line, i) => {
                let icon = '🔮';
                let title = 'Proyecciones a futuro';
                let text = line.trim();

                if (line.includes('Precedentes Históricos') || line.includes('📚')) {
                  icon = '📚';
                  title = 'Precedentes Históricos';
                  text = line.replace(/^(📚|Precedentes Históricos|:\s*)+/i, '').replace(/^\*\*Precedentes Históricos:\*\*/i, '').trim();
                } else if (line.includes('Efecto Dominó') || line.includes('🌀')) {
                  icon = '🌀';
                  title = 'Efecto Dominó';
                  text = line.replace(/^(🌀|Efecto Dominó|:\s*)+/i, '').replace(/^\*\*Efecto Dominó:\*\*/i, '').trim();
                } else {
                  text = line.replace(/^(🔮|Proyecciones a futuro|:\s*)+/i, '').replace(/^\*\*Proyecciones a futuro:\*\*/i, '').trim();
                }

                // Clean double asterisks if any from the title/text start
                text = text.replace(/^\*\*.*?\*\*/, '').replace(/^:\s*/, '').trim();

                return (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }}>
                      {icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {title}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)' }}>
                        {text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}


        {/* ── SECCIÓN DE DECLARACIONES ────────────── */}
        {noticia.declaraciones && (
          <section style={{
            marginTop: 48,
            padding: '24px 28px',
            borderRadius: 12,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderLeft: '4px solid var(--accent-violet)'
          }}>
            <h3 style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--accent-violet)',
              marginBottom: 14,
              marginTop: 0
            }}>
              Declaraciones Oficiales Verificadas
            </h3>
            <div style={{
              fontSize: 15,
              lineHeight: 1.85,
              color: 'var(--text-primary)',
              fontStyle: 'italic'
            }}>
              {noticia.declaraciones.split('\n\n').map((para, i) => (
                <p key={i} style={{ marginBottom: i > 0 ? '1.2em' : 0, marginTop: 0 }}>
                  {para.trim()}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* ── FUENTES ─────────────────────────────── */}
        {noticia.fuentes && noticia.fuentes.length > 0 && (
          <section style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
            <h2 style={{
              fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 7
            }}>
              <Newspaper style={{ width: 14, height: 14 }} />
              Fuentes Consultadas ({noticia.fuentes.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {noticia.fuentes.map((fuente) => (
                <div key={fuente.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderRadius: 10,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  gap: 16, flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                      {fuente.nombre}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{fuente.tipo}</span>
                      {fuente.fecha_publicacion && (
                        <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                          {fuente.fecha_publicacion}
                        </span>
                      )}
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 4,
                        background: fuente.relevancia === 'Alta'
                          ? 'rgba(112,147,200,0.12)' : 'rgba(255,255,255,0.05)',
                        color: fuente.relevancia === 'Alta' ? 'var(--accent-blue)' : 'var(--text-faint)',
                        border: `1px solid ${fuente.relevancia === 'Alta' ? 'rgba(112,147,200,0.25)' : 'var(--border)'}`
                      }}>
                        {fuente.relevancia}
                      </span>
                    </div>
                  </div>

                  {fuente.url && (
                    <a
                      href={fuente.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
                        fontWeight: 600, color: 'var(--accent-blue)', textDecoration: 'none',
                        flexShrink: 0
                      }}
                    >
                      Ver original
                      <ExternalLink style={{ width: 12, height: 12 }} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   AGENT TERMINAL — panel flotante inferior
   ════════════════════════════════════════════════════ */
function AgentTerminal({
  logs, isUpdating, onClose, onReload, logEndRef
}: {
  logs: AgentLog[];
  isUpdating: boolean;
  onClose: () => void;
  onReload: () => void;
  logEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      height: 340, display: 'flex', flexDirection: 'column',
      background: '#0a0a0f', borderTop: '1px solid #1e1e28',
      fontFamily: '"Geist Mono", "Fira Code", monospace', fontSize: 12
    }}>
      {/* Header terminal */}
      <div style={{
        background: '#0f0f16', padding: '10px 16px', borderBottom: '1px solid #1e1e28',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28ca41' }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#8888aa' }}>
            terminal — ejecución multiagente
          </span>
          {isUpdating && (
            <span style={{
              fontSize: 10, color: '#7093c8',
              display: 'flex', alignItems: 'center', gap: 5
            }}>
              <span className="animate-soft-pulse" style={{
                width: 6, height: 6, borderRadius: '50%', background: '#7093c8',
                display: 'inline-block'
              }} />
              investigando en tiempo real
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onReload}
            style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 11,
              cursor: 'pointer', background: '#1a1a25', color: '#8888aa',
              border: '1px solid #2a2a38', transition: 'all 0.2s'
            }}
          >
            Recargar
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
              background: 'transparent', color: '#555570', border: 'none',
              display: 'flex', alignItems: 'center'
            }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* Stream de logs */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {logs.length === 0 ? (
          <div style={{ color: '#444460', fontStyle: 'italic' }}>
            {isUpdating ? '▶ preparando espacio de trabajo para los agentes...' : '$ pulsa "Actualizar" para iniciar el flujo de agentes'}
          </div>
        ) : (
          logs.map((log, i) => {
            let agentColor = '#7093c8';
            if (log.agent === 'Coordinador') agentColor = '#a78bfa';
            else if (log.agent === 'Verificador') agentColor = '#f59e0b';
            else if (log.agent === 'Redactor')   agentColor = '#34d399';
            else if (log.agent === 'Buscador')    agentColor = '#22d3ee';
            else if (log.agent === 'Sistema')     agentColor = '#666680';

            let msgColor = '#c5c5d8';
            if (log.type === 'success') msgColor = '#4ade80';
            else if (log.type === 'error')   msgColor = '#f87171';
            else if (log.type === 'warning') msgColor = '#fbbf24';

            return (
              <div key={i} style={{ display: 'flex', gap: 12, lineHeight: 1.5 }}>
                <span style={{ color: '#333350', whiteSpace: 'nowrap' }}>
                  [{new Date(log.timestamp).toLocaleTimeString('es-ES')}]
                </span>
                <span style={{ color: agentColor, fontWeight: 600, minWidth: 90, textAlign: 'right' }}>
                  {log.agent}:
                </span>
                <span style={{ color: msgColor }}>{log.message}</span>
              </div>
            );
          })
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   EMPTY STATE
   ════════════════════════════════════════════════════ */
function EmptyState({ onUpdate, isUpdating }: { onUpdate: () => void; isUpdating: boolean }) {
  return (
    <div style={{
      padding: '80px 24px', textAlign: 'center',
      border: '1px dashed var(--border)', borderRadius: 16,
      background: 'var(--bg-card)'
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
        background: 'var(--bg-subtle)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Zap style={{ width: 24, height: 24, color: 'var(--accent-blue)' }} />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Sin análisis para esta categoría
      </h3>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
        Los agentes aún no han recopilado información para hoy. Inicia el análisis para obtener los primeros informes.
      </p>
      <button
        onClick={onUpdate}
        disabled={isUpdating}
        style={{
          padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          cursor: isUpdating ? 'not-allowed' : 'pointer', border: 'none',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
          color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 7
        }}
      >
        <RefreshCw style={{ width: 14, height: 14 }} className={isUpdating ? 'animate-spin' : ''} />
        {isUpdating ? 'Analizando...' : 'Iniciar análisis'}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   MARKDOWN RENDERER — síntesis diaria
   ════════════════════════════════════════════════════ */
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-primary)' }}>
      {lines.map((line, idx) => {
        if (line.startsWith('## ')) {
          return (
            <h3 key={idx} style={{
              fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
              marginTop: 20, marginBottom: 8, paddingBottom: 6,
              borderBottom: '1px solid var(--border)'
            }}>
              {line.replace('## ', '')}
            </h3>
          );
        }
        if (line.startsWith('* **') && line.includes(':**')) {
          const titleEnd = line.indexOf(':**');
          const title = line.substring(4, titleEnd);
          const body  = line.substring(titleEnd + 3);
          return (
            <div key={idx} style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
              <span style={{ color: 'var(--accent-blue)', fontWeight: 700, flexShrink: 0 }}>•</span>
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--text-primary)' }}>{title}:</strong>
                <span style={{ color: 'var(--text-muted)' }}>{body}</span>
              </p>
            </div>
          );
        }
        if (line.startsWith('* ')) {
          return (
            <div key={idx} style={{ display: 'flex', gap: 8, padding: '3px 0' }}>
              <span style={{ color: 'var(--accent-blue)', fontWeight: 700, flexShrink: 0 }}>•</span>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{line.replace('* ', '')}</p>
            </div>
          );
        }
        if (!line.trim()) return <div key={idx} style={{ height: 6 }} />;
        if (line.trim().startsWith('*') && line.trim().endsWith('*')) {
          return (
            <p key={idx} style={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic', marginTop: 12 }}>
              {line.replace(/\*/g, '')}
            </p>
          );
        }
        return <p key={idx} style={{ color: 'var(--text-muted)', margin: '4px 0' }}>{line}</p>;
      })}
    </div>
  );
}
