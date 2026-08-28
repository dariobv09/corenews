import React from "react";
import { getNewsById } from "@/lib/data";
import { Categoria, Noticia } from "@/types";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Newspaper,
  Zap,
  ExternalLink
} from "lucide-react";
import AdBanner from "@/components/AdBanner";

const CATEGORY_NAMES: Record<string, string> = {
  ia: "Inteligencia Artificial",
  tecnologia: "Tecnología Avanzada y Ciberseguridad",
  economia: "Economía Global y Mercados",
  politica: "Geopolítica y Relaciones Internacionales",
};

const SECTION_LABELS: Record<string, { title: string; accent: 'blue' | 'violet' }> = {
  hecho_principal:    { title: '1. Hecho principal',       accent: 'blue' },
  desarrollo:         { title: '2. Desarrollo del evento', accent: 'violet' },
  actores:            { title: '3. Actores implicados',     accent: 'blue' },
  contexto:           { title: '4. Contexto',             accent: 'violet' },
  datos_verificables: { title: '5. Datos verificables',    accent: 'blue' },
  estado_actual:      { title: '6. Estado actual',        accent: 'violet' },
};

interface PageProps {
  params: Promise<{ categoria: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria, id } = await params;
  const noticia = await getNewsById(id);

  if (!noticia) {
    return {
      title: "Noticia no encontrada | The Core News",
      description: "El artículo solicitado no está disponible o no existe.",
    };
  }

  const title = `${noticia.titulo} | The Core News`;
  const description = noticia.meta_description || noticia.subtitulo || "Análisis e inteligencia estratégica de noticias verificadas.";
  const url = `https://thecorenews.info/noticias/${categoria}/${id}`;
  const logoUrl = "https://thecorenews.info/apple-icon.jpg";

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "The Core News",
      images: [
        {
          url: logoUrl,
          width: 800,
          height: 600,
          alt: noticia.titulo,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [logoUrl],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { categoria, id } = await params;
  const noticia = await getNewsById(id);

  if (!noticia) {
    return notFound();
  }

  const categoryLabel = CATEGORY_NAMES[categoria] || categoria;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": noticia.titulo,
    "description": noticia.subtitulo || noticia.meta_description,
    "datePublished": noticia.fecha_actualizacion,
    "dateModified": noticia.fecha_actualizacion,
    "author": {
      "@type": "Organization",
      "name": "The Core News",
      "url": "https://thecorenews.info"
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Core News",
      "logo": {
        "@type": "ImageObject",
        "url": "https://thecorenews.info/apple-icon.jpg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://thecorenews.info/noticias/${categoria}/${id}`
    }
  };

  const sections = [
    { key: 'hecho_principal',    content: noticia.hecho_principal },
    { key: 'desarrollo',         content: noticia.desarrollo },
    { key: 'actores',            content: noticia.actores },
    { key: 'contexto',           content: noticia.contexto },
    { key: 'datos_verificables', content: noticia.datos_verificables },
    { key: 'estado_actual',      content: noticia.estado_actual },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
        {/* Barra de navegación superior */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
            <Link
              href="/"
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                border: '1px solid var(--border)', background: 'transparent',
                color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.2s'
              }}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              Volver a The Core News
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen style={{ width: 14, height: 14, color: 'var(--text-faint)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 600 }}>
                {categoryLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Contenido principal del artículo */}
        <article style={{ maxWidth: 820, margin: '0 auto', padding: '48px 24px 80px' }}>
          <header style={{ marginBottom: 32 }}>
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
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, lineHeight: 1.2,
              letterSpacing: '-0.025em', color: 'var(--text-primary)',
              fontFamily: 'system-ui, -apple-system, sans-serif', marginBottom: 20
            }}>
              {noticia.titulo}
            </h1>

            {noticia.subtitulo && (
              <p style={{
                fontSize: 18,
                fontWeight: 400,
                lineHeight: 1.6,
                color: 'var(--text-muted)',
                marginBottom: 24,
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                {noticia.subtitulo}
              </p>
            )}
          </header>

          {/* Bloque de anuncios en medio del artículo editorial completo */}
          <AdBanner slot="article_header_top" />

          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 40 }} />

          {/* Secciones de contenido */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 44 }}>
            {sections.map(({ key, content }) => {
              if (!content) return null;
              const meta = SECTION_LABELS[key];
              const isBlue = meta?.accent === 'blue';
              return (
                <section key={key}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{
                      width: 3, height: 22, borderRadius: 2,
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
                  }}
                  dangerouslySetInnerHTML={{
                    __html: content.split('\n\n').map(para => `<p style="margin-bottom: 1.4em;">${para.trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`).join('')
                  }}
                  />
                </section>
              );
            })}
          </div>

          {/* Consecuencias */}
          {noticia.consecuencias && (
            <section style={{
              marginTop: 40,
              padding: '24px 28px',
              borderRadius: 16,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
              borderLeft: '4px solid var(--accent-blue)',
            }}>
              <h3 style={{
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--accent-blue)',
                marginBottom: 16,
                marginTop: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <Zap style={{ width: 14, height: 14 }} />
                Posibles Consecuencias y Proyección
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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

                  text = text.replace(/^\*\*.*?\*\*/, '').replace(/^:\s*/, '').trim();

                  return (
                    <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, flexShrink: 0
                      }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
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

          {/* Declaraciones */}
          {noticia.declaraciones && (
            <section style={{
              marginTop: 36,
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

          {/* Anuncio inferior del artículo */}
          <AdBanner slot="article_footer_bottom" />

          {/* Fuentes */}
          {noticia.fuentes && noticia.fuentes.length > 0 && (
            <section style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
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
                      </div>
                    </div>

                    {fuente.url && (
                      <a
                        href={fuente.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 12, fontWeight: 600, color: 'var(--accent-blue)',
                          textDecoration: 'none', padding: '6px 12px', borderRadius: 6,
                          border: '1px solid var(--border)', background: 'var(--bg-card)',
                          transition: 'all 0.2s'
                        }}
                      >
                        Visitar
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
    </>
  );
}
