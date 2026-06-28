import React from "react";
import { getLatestNews, getNewsById } from "@/lib/data";
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

// Categorías del sistema corenews
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
  params: Promise<{ categoria: string }>;
  searchParams: Promise<{ id?: string }>;
}

// 1. CONFIGURACIÓN DE METADATOS DINÁMICOS
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const { id } = await searchParams;

  let noticia: Noticia | null = null;
  if (id) {
    noticia = await getNewsById(id);
  } else {
    const noticias = await getLatestNews(categoria as Categoria);
    noticia = noticias[0] || null;
  }

  if (!noticia) {
    return {
      title: "Noticia no encontrada | thecorenews",
      description: "El artículo solicitado no está disponible o no existe.",
    };
  }

  const title = `${noticia.titulo} | thecorenews`;
  const description = noticia.meta_description || noticia.subtitulo || "Análisis e inteligencia estratégica.";
  const url = `https://thecorenews.info/noticias/${categoria}${id ? `?id=${id}` : ""}`;
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
      siteName: "thecorenews",
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

export default async function Page({ params, searchParams }: PageProps) {
  const { categoria } = await params;
  const { id } = await searchParams;

  // Validar si la categoría existe en el diccionario
  if (!CATEGORY_NAMES[categoria]) {
    return notFound();
  }

  let noticia: Noticia | null = null;
  if (id) {
    noticia = await getNewsById(id);
  } else {
    const noticias = await getLatestNews(categoria as Categoria);
    noticia = noticias[0] || null;
  }

  if (!noticia) {
    return notFound();
  }

  // 2. DATOS ESTRUCTURADOS (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": noticia.titulo,
    "description": noticia.subtitulo,
    "datePublished": noticia.fecha_actualizacion,
    "dateModified": noticia.fecha_actualizacion,
    "author": {
      "@type": "Organization",
      "name": "thecorenews",
      "url": "https://thecorenews.info"
    },
    "publisher": {
      "@type": "Organization",
      "name": "thecorenews",
      "logo": {
        "@type": "ImageObject",
        "url": "https://thecorenews.info/apple-icon.jpg"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://thecorenews.info/noticias/${categoria}${id ? `?id=${id}` : ""}`
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
      {/* Inyectar JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
        {/* Barra de navegación superior del lector */}
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
              Volver a corenews
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen style={{ width: 14, height: 14, color: 'var(--text-faint)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 600 }}>
                {CATEGORY_NAMES[categoria]}
              </span>
            </div>
          </div>
        </div>

        {/* Contenido del artículo */}
        <article style={{ maxWidth: 820, margin: '0 auto', padding: '56px 24px 100px' }}>
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
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 800, lineHeight: 1.2,
              letterSpacing: '-0.025em', color: 'var(--text-primary)',
              fontFamily: 'Poppins, system-ui, sans-serif', marginBottom: 24
            }}>
              {noticia.titulo}
            </h1>

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

          <div style={{ borderTop: '1px solid var(--border)', marginBottom: 48 }} />

          {/* Secciones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 52 }}>
            {sections.map(({ key, content }) => {
              if (!content) return null;
              const meta = SECTION_LABELS[key];
              const isBlue = meta?.accent === 'blue';
              return (
                <section key={key}>
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

          {/* Declaraciones */}
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

          {/* Fuentes */}
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
