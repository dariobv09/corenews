import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowLeft, MessageSquare, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto | The Core News",
  description: "Ponte en contacto con el equipo de The Core News para consultas editoriales, correcciones o sugerencias de información.",
  alternates: {
    canonical: "https://thecorenews.info/contacto",
  },
};

export default function ContactoPage() {
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
          <Mail style={{ width: 24, height: 24, color: 'var(--accent-blue)' }} />
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Contacto Editorial
          </h1>
        </div>

        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 36 }}>
          En <strong>The Core News</strong> valoramos la transparencia, la precisión de la información y la comunicación directa con nuestros lectores y colaboradores.
        </p>

        <div style={{
          padding: '28px 32px',
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          marginBottom: 40
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare style={{ width: 18, height: 18, color: 'var(--accent-blue)' }} />
            Correo Oficial de Atención
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Para consultas generales, correcciones de noticias, sugerencias o asuntos legales y de privacidad, escríbenos directamente a nuestra cuenta oficial:
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            borderRadius: 10,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            fontWeight: 700,
            fontSize: 16,
            color: 'var(--accent-blue)',
            marginTop: 8
          }}>
            <Mail style={{ width: 18, height: 18 }} />
            <a href="mailto:thecorenews.info@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
              thecorenews.info@gmail.com
            </a>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div style={{ padding: 24, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 0, color: 'var(--text-primary)' }}>
              Correcciones e Verificación
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Si identificas cualquier imprecisión técnica o de datos en nuestros informes de IA, Economía o Geopolítica, contáctanos indicando el enlace del artículo.
            </p>
          </div>

          <div style={{ padding: 24, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginTop: 0, color: 'var(--text-primary)' }}>
              Prensa y Colaboraciones
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Para propuestas de investigación conjunta, sindicación de contenidos o consultas de medios, escríbenos con el asunto <em>[Prensa/Colaboración]</em>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
