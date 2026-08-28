import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpenCheck, CheckSquare, Shield, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Política Editorial y Verificación | The Core News",
  description: "Conoce nuestra política de verificación de hechos, estándares éticos y criterios de selección de fuentes en The Core News.",
  alternates: {
    canonical: "https://thecorenews.info/politica-editorial",
  },
};

export default function PoliticaEditorialPage() {
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
          <BookOpenCheck style={{ width: 26, height: 26, color: 'var(--accent-blue)' }} />
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Política Editorial y Fact-Checking
          </h1>
        </div>

        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 40 }}>
          En <strong>The Core News</strong> seguimos estándares de verificación periodística y tecnológica rigurosos para garantizar que la información publicada sea precisa, contrastada y libre de desinformación.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckSquare style={{ width: 18, height: 18, color: 'var(--accent-blue)' }} />
              1. Proceso de Verificación de Noticias
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              Cada noticia o informe pasa por un proceso de triangulación de datos. Ninguna información se publica basándose en una única afirmación en redes sociales o comunicados sin verificar. Consultamos comunicados oficiales de empresas, repositorios académicos, documentos gubernamentales y agencias de noticias reconocidas.
            </p>
          </section>

          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield style={{ width: 18, height: 18, color: 'var(--accent-violet)' }} />
              2. Política de Correcciones
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              Si un hecho o dato evoluciona o se detecta un error de interpretación, actualizamos el artículo de inmediato señalando de forma transparente la fecha de modificación y la aclaración correspondiente. Los lectores pueden notificar imprecisiones a través de <a href="mailto:thecorenews.info@gmail.com" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>thecorenews.info@gmail.com</a>.
            </p>
          </section>

          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText style={{ width: 18, height: 18, color: 'var(--accent-blue)' }} />
              3. Independencia y Transparencia Financiera
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
              Nuestras coberturas no están influenciadas por patrocinadores comerciales ni intereses políticos. Los anuncios mostrados mediante redes publicitarias automatizadas (como Google AdSense) están claramente diferenciados del contenido editorial.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
