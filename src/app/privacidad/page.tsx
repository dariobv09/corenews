import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, UserCheck, Database, FileCheck2, Share2, UserX, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad | The Core News",
  description: "Política de Privacidad y protección de datos de The Core News conforme al RGPD y la LOPD-GDD. Conoce cómo gestionamos y protegemos tus datos personales.",
  alternates: {
    canonical: "https://thecorenews.info/privacidad",
  },
};

export default function PrivacidadPage() {
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
          <Shield style={{ width: 28, height: 28, color: 'var(--accent-blue)' }} />
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Política de Privacidad
          </h1>
        </div>

        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 36 }}>
          En <strong>The Core News</strong> nos comprometemos con la total transparencia y la máxima protección de los datos personales de nuestros usuarios y lectores, en estricto cumplimiento del <strong>Reglamento General de Protección de Datos (RGPD UE 2016/679)</strong> y de la <strong>Ley Orgánica 3/2018 (LOPD-GDD)</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Section 1: Responsable del Tratamiento */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <UserCheck style={{ width: 20, height: 20, color: 'var(--accent-blue)' }} />
              1. Responsable del Tratamiento
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 12 }}>
                El responsable del tratamiento de los datos personales recabados a través de esta plataforma es:
              </p>
              <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>Denominación:</strong> The Core News</li>
                <li><strong>Sitio Web:</strong> <a href="https://thecorenews.info" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>https://thecorenews.info</a></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong>Correo electrónico de contacto:</strong>
                  <a href="mailto:thecorenews.info@gmail.com" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                    thecorenews.info@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: Datos que se recogen */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <Database style={{ width: 20, height: 20, color: 'var(--accent-violet)' }} />
              2. Datos que se Recogen y Finalidad
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 14 }}>
                Recogemos únicamente la información estrictamente necesaria para garantizar el servicio editorial y la correcta operativa técnica de la web:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                    Formularios y Comunicaciones Directas:
                  </strong>
                  Cuando el usuario contacta voluntariamente con nosotros por correo electrónico o formularios de soporte, recopilamos su nombre, dirección de correo y el contenido del mensaje exclusivamente para responder a su consulta, sugerencia o solicitud de corrección editorial.
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                    Cookies y Datos de Navegación de Google AdSense / Google Analytics:
                  </strong>
                  A través de cookies técnicas y de personalización de Google AdSense se pueden recopilar identificadores de dispositivo, dirección IP anonimizada, tipo de navegador e interacciones con los contenidos para la medición estadística de audiencias y la entrega de anuncios publicitarios adaptados a las directrices de Google.
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Legitimación */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <FileCheck2 style={{ width: 20, height: 20, color: 'var(--accent-blue)' }} />
              3. Legitimación del Tratamiento
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 12 }}>
                La base legal que fundamenta el tratamiento de tus datos personales depende de la interacción realizada:
              </p>
              <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li>
                  <strong>Consentimiento expreso (Art. 6.1.a RGPD):</strong> Otorgado libremente al remitirnos un correo de contacto o al aceptar voluntariamente la instalación de cookies en el navegador.
                </li>
                <li>
                  <strong>Interés legítimo (Art. 6.1.f RGPD):</strong> Necesario para garantizar la seguridad técnica del portal, prevenir accesos fraudulentos y mantener la estabilidad de la plataforma de noticias.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Destinatarios */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <Share2 style={{ width: 20, height: 20, color: 'var(--accent-violet)' }} />
              4. Destinatarios de los Datos
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 12 }}>
                <strong>The Core News</strong> no vende, alquila ni comparte datos de carácter personal con terceras partes ajenas a la prestación del servicio. Los únicos destinatarios externos autorizados son proveedores técnicos indispensables:
              </p>
              <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li>
                  <strong>Google Ireland Limited / Google LLC:</strong> Para la gestión de publicidad digital contextualizada (Google AdSense) y análisis métrico agregado (Google Analytics), bajo las cláusulas contractuales tipo y acuerdos de transferencia internacional reconocidos por la Unión Europea.
                </li>
                <li>
                  <strong>Proveedores de infraestructura en la nube:</strong> Proveedores de alojamiento seguro (Vercel Inc.) y base de datos (Supabase Inc.) sujetos a acuerdos de encargado de tratamiento que aseguran la debida confidencialidad.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5: Derechos de los Usuarios */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <UserX style={{ width: 20, height: 20, color: 'var(--accent-blue)' }} />
              5. Derechos de los Usuarios
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 12 }}>
                Conforme a la normativa europea de protección de datos, tienes derecho a ejercer en cualquier momento:
              </p>
              <ul style={{ paddingLeft: 20, margin: '0 0 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>Derecho de Acceso:</strong> Saber con exactitud qué datos personales tuyos estamos tratando.</li>
                <li><strong>Derecho de Rectificación:</strong> Modificar cualquier dato que resulte inexacto, desactualizado o incompleto.</li>
                <li><strong>Derecho de Supresión:</strong> Solicitar la eliminación total de tus datos personales cuando ya no sean requeridos.</li>
                <li><strong>Derecho de Oposición y Limitación:</strong> Oponerte al tratamiento o solicitar la restricción temporal de su procesamiento.</li>
                <li><strong>Derecho a retirar el consentimiento:</strong> En cualquier momento, sin que ello afecte a la licitud del tratamiento previo.</li>
              </ul>

              <div style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                flexWrap: 'wrap'
              }}>
                <Mail style={{ width: 20, height: 20, color: 'var(--accent-blue)', flexShrink: 0 }} />
                <span>
                  Para ejercer cualquiera de estos derechos, envía un correo a:{" "}
                  <a
                    href="mailto:thecorenews.info@gmail.com"
                    style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    thecorenews.info@gmail.com
                  </a>{" "}
                  indicando en el asunto <em>"Protección de Datos - Ejercicio de Derechos"</em>.
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
