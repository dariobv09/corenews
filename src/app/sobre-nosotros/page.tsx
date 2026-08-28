import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Cpu, ShieldCheck, Globe, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre Nosotros | The Core News",
  description: "Conoce la misión de The Core News: Inteligencia de noticias verificadas sobre Inteligencia Artificial, Tecnología, Economía y Geopolítica.",
  alternates: {
    canonical: "https://thecorenews.info/sobre-nosotros",
  },
};

export default function SobreNosotrosPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text-primary)" }}>
      {/* Header Bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px',
          display: 'flex', alignItems: 'center', height: 56 }}>
          <Link
            href="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-muted)', textDecoration: 'none'
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Volver a The Core News
          </Link>
        </div>
      </div>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Cpu style={{ width: 26, height: 26, color: 'var(--accent-violet)' }} />
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Sobre The Core News
          </h1>
        </div>

        <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 40 }}>
          <strong>The Core News</strong> es una plataforma independiente de inteligencia automatizada y síntesis estratégica de noticias globales centrada en cuatro pilares fundamentales: <strong>Inteligencia Artificial, Tecnología Avanzada, Economía Global y Geopolítica</strong>.
        </p>

        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
            Nuestra Misión Editorial
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-muted)' }}>
            En un entorno saturado de titulares sensacionalistas y datos sin contraste, nuestra misión es ofrecer resúmenes estructurados, datos totalmente verificables y contexto analítico claro para profesionales, investigadores y tomadores de decisiones.
          </p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 48 }}>
          <div style={{ padding: 24, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <ShieldCheck style={{ width: 22, height: 22, color: 'var(--accent-blue)', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0' }}>Verificación Rigurosa</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Cada acontecimiento publicado requiere la contrastación con múltiples fuentes oficiales de alta reputación.
            </p>
          </div>

          <div style={{ padding: 24, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Globe style={{ width: 22, height: 22, color: 'var(--accent-violet)', marginBottom: 12 }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0' }}>Enfoque Global</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Monitorizamos tendencias estratégicas en mercados internacionales, centros de investigación de IA y cancillerías.
            </p>
          </div>
        </div>

        <section style={{
          padding: '32px',
          borderRadius: 16,
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)'
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>
            Valores Editoriales
          </h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--text-muted)' }}>
              <CheckCircle style={{ width: 16, height: 16, color: 'var(--accent-blue)', flexShrink: 0 }} />
              <strong>Imparcialidad tecnológica y geopolítica:</strong> Priorizamos el dato factual objetivo.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--text-muted)' }}>
              <CheckCircle style={{ width: 16, height: 16, color: 'var(--accent-blue)', flexShrink: 0 }} />
              <strong>Transparencia de fuentes:</strong> Todos los artículos vinculan directamente a las fuentes primarias consultadas.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--text-muted)' }}>
              <CheckCircle style={{ width: 16, height: 16, color: 'var(--accent-blue)', flexShrink: 0 }} />
              <strong>Actualización continua:</strong> Cobertura diaria sobre avances en modelos de IA y ciberseguridad.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
