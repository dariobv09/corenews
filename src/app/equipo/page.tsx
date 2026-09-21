import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Users, Mail, ShieldCheck, Cpu, Globe, TrendingUp, CheckCircle, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "Equipo Editorial | The Core News",
  description: "Conoce al equipo editorial y analistas de The Core News, liderado por Darío Balado. Especialistas en Inteligencia Artificial, tecnología, economía y geopolítica.",
  alternates: {
    canonical: "https://thecorenews.info/equipo",
  },
};

export default function EquipoPage() {
  const topics = [
    "Inteligencia Artificial",
    "Tecnología e Innovación",
    "Economía Global",
    "Geopolítica y Seguridad",
    "Fact-Checking y Triangulación",
  ];

  const methodologySteps = [
    {
      title: "1. Monitorización de Fuentes Primarias",
      desc: "Rastreo directo y continuo de papers académicos (arXiv, Nature), centros de investigación de IA (OpenAI, Anthropic, DeepMind), bancos centrales y organismos multilaterales.",
      icon: <Cpu style={{ width: 18, height: 18, color: 'var(--accent-blue)' }} />,
    },
    {
      title: "2. Triangulación y Verificación Rigurosa",
      desc: "Todo dato, cifra o acontecimiento relevante es contrastado con múltiples fuentes independientes reconocidas antes de ser redactado.",
      icon: <ShieldCheck style={{ width: 18, height: 18, color: 'var(--accent-violet)' }} />,
    },
    {
      title: "3. Síntesis Analítica sin Sensacionalismo",
      desc: "Estructuración concisa y objetiva de la información, distinguiendo claramente hechos comprobados de proyecciones o valoraciones de mercado.",
      icon: <TrendingUp style={{ width: 18, height: 18, color: 'var(--accent-blue)' }} />,
    },
    {
      title: "4. Transparencia y Corrección Continua",
      desc: "Acceso transparente a las fuentes originales de cada noticia y canal directo para la recepción y revisión de correcciones en tiempo real.",
      icon: <Globe style={{ width: 18, height: 18, color: 'var(--accent-violet)' }} />,
    },
  ];

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
        {/* Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Users style={{ width: 28, height: 28, color: 'var(--accent-blue)' }} />
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Equipo Editorial
          </h1>
        </div>

        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 40 }}>
          En <strong>The Core News</strong> combinamos automatización de inteligencia informativa con supervisión analítica humana experta para ofrecer resúmenes de alta fidelidad factual sobre los acontecimientos que transforman el mundo.
        </p>

        {/* Editor Profile Card */}
        <section style={{
          padding: '36px 32px',
          borderRadius: 20,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          marginBottom: 48,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            {/* Avatar / Initials */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: 26,
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: '0 8px 16px rgba(112, 147, 200, 0.25)'
            }}>
              DB
            </div>

            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Darío Balado
                </h2>
                <span style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  color: 'var(--accent-blue)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <Award style={{ width: 12, height: 12 }} />
                  Verificado
                </span>
              </div>

              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-blue)', marginBottom: 16 }}>
                Editor y Analista Principal
              </div>

              <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
                Analista especializado en Inteligencia Artificial, tecnología, economía global y geopolítica. Responsable de la verificación, redacción y publicación de contenidos en The Core News.
              </p>

              {/* Tags de especialidad */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {topics.map((topic) => (
                  <span
                    key={topic}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      padding: '4px 10px',
                      borderRadius: 6,
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {/* Email direct button */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 8,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                fontSize: 13,
                fontWeight: 500
              }}>
                <Mail style={{ width: 15, height: 15, color: 'var(--accent-blue)' }} />
                <a
                  href="mailto:thecorenews.info@gmail.com"
                  style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600 }}
                >
                  thecorenews.info@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Metodología Editorial */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            Metodología Editorial
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
            Nuestro proceso de trabajo sigue un protocolo estricto de contrastación multifuente para garantizar que cada noticia publicada en The Core News aporte valor factual real a nuestros lectores.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
            {methodologySteps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  padding: 22,
                  borderRadius: 14,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  {step.icon}
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {step.title}
                  </h3>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Callout box */}
        <section style={{
          padding: 28,
          borderRadius: 16,
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
              ¿Tienes una corrección o propuesta de información?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              Puedes contactar directamente con el equipo editorial para remitir correcciones de datos o sugerencias de análisis.
            </p>
          </div>
          <Link
            href="/contacto"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              borderRadius: 8,
              background: 'var(--accent-blue)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none'
            }}
          >
            Ir a Contacto
          </Link>
        </section>
      </main>
    </div>
  );
}
