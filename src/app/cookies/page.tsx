import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Info, ShieldCheck, Cpu, SlidersHorizontal, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Cookies | The Core News",
  description: "Información detallada sobre el uso de cookies técnicas, cookies analíticas y de publicidad de Google AdSense en The Core News.",
  alternates: {
    canonical: "https://thecorenews.info/cookies",
  },
};

export default function CookiesPage() {
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
          <FileText style={{ width: 28, height: 28, color: 'var(--accent-blue)' }} />
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Política de Cookies
          </h1>
        </div>

        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 36 }}>
          En <strong>The Core News</strong> utilizamos cookies y tecnologías de almacenamiento similares para garantizar la correcta operatividad técnica del portal, comprender el comportamiento de los lectores y mostrar publicidad relevante a través de <strong>Google AdSense</strong>.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Section 1: ¿Qué es una cookie? */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <Info style={{ width: 20, height: 20, color: 'var(--accent-blue)' }} />
              ¿Qué es una cookie?
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 12 }}>
                Una cookie es un pequeño fichero de texto que los sitios web descargan en tu navegador (ordenador, smartphone o tablet) al acceder a determinadas páginas. Las cookies permiten a una plataforma web, entre otras funciones, almacenar y recuperar datos sobre los hábitos de navegación del usuario o de su equipo y reconocerlo en visitas posteriores para facilitar su experiencia y ofrecerle contenido afín a sus preferencias.
              </p>
              <p style={{ margin: 0 }}>
                Las cookies no pueden dañar tu dispositivo ni contienen código ejecutable. Tampoco recopilan información confidencial sin tu conocimiento y consentimiento previo.
              </p>
            </div>
          </section>

          {/* Section 2: Cookies técnicas */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <ShieldCheck style={{ width: 20, height: 20, color: 'var(--accent-violet)' }} />
              Cookies Técnicas (Estrictamente Necesarias)
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 12 }}>
                Son aquellas imprescindibles para la navegación y el funcionamiento seguro y óptimo de The Core News. Permiten, por ejemplo:
              </p>
              <ul style={{ paddingLeft: 20, margin: '0 0 14px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Controlar el tráfico y la comunicación de datos en servidores de alto rendimiento.</li>
                <li>Garantizar la protección contra ataques cibernéticos y accesos no autorizados.</li>
                <li>Almacenar localmente las preferencias de visualización del lector (como el tema claro u oscuro del portal).</li>
                <li>Recordar la aceptación del consentimiento de cookies para no solicitarlo repetidamente en cada página.</li>
              </ul>
              <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)', fontSize: 14 }}>
                <strong>Aviso normativo:</strong> Estas cookies no requieren el consentimiento previo del usuario, ya que son indispensables para el servicio digital solicitado.
              </div>
            </div>
          </section>

          {/* Section 3: Cookies de publicidad y personalización de Google AdSense */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <Cpu style={{ width: 20, height: 20, color: 'var(--accent-blue)' }} />
              Cookies de Personalización y Publicidad de Google AdSense
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 12 }}>
                The Core News utiliza los servicios publicitarios de <strong>Google AdSense</strong> para financiar la cobertura periodística independiente. Proveedores de terceros, incluido Google, utilizan cookies para publicar anuncios basándose en las visitas anteriores de un usuario a este sitio web o a otros portales de Internet.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
                <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                    Cookies de publicidad de Google (DoubleClick):
                  </strong>
                  Permiten a Google y a sus empresas colaboradoras mostrar anuncios relevantes en función de los intereses inferidos por tus patrones de navegación por la red, evitando además repetir anuncios que ya hayas visualizado.
                </div>
                <div style={{ padding: 16, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                    Anuncios No Personalizados:
                  </strong>
                  En caso de no consentir la personalización publicitaria, Google AdSense mostrará anuncios contextuales basados únicamente en el contenido de la noticia que estés leyendo, sin elaborar perfiles de usuario.
                </div>
              </div>
              <p style={{ margin: 0 }}>
                Para conocer más detalles sobre el uso que Google hace de los datos procedentes de sitios asociados, puedes consultar la{" "}
                <a
                  href="https://policies.google.com/technologies/partner-sites"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}
                >
                  Política de Privacidad y Términos de Google
                </a>.
              </p>
            </div>
          </section>

          {/* Section 4: Cómo desactivar las cookies */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <SlidersHorizontal style={{ width: 20, height: 20, color: 'var(--accent-violet)' }} />
              Gestión y Desactivación de Cookies
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 14 }}>
                Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo en cualquier momento mediante la configuración de las opciones de tu navegador o a través de las herramientas de personalización publicitaria de Google:
              </p>

              {/* Enlace destacado a Google Ad Settings */}
              <div style={{
                padding: '18px 20px',
                borderRadius: 14,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: 15, marginBottom: 4 }}>
                    Configuración de Anuncios de Google
                  </strong>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    Inhabilita o personaliza la publicidad dirigida de Google en todos tus dispositivos.
                  </span>
                </div>
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: 'var(--accent-blue)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 13,
                    textDecoration: 'none'
                  }}
                >
                  Ir a Google Ad Settings
                  <ExternalLink style={{ width: 14, height: 14 }} />
                </a>
              </div>

              <p style={{ margin: '0 0 10px 0', fontWeight: 600, color: 'var(--text-primary)' }}>
                Configuración según tu navegador:
              </p>
              <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong>Google Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies y otros datos de sitios.</li>
                <li><strong>Mozilla Firefox:</strong> Opciones &gt; Privacidad y Seguridad &gt; Cookies y datos del sitio.</li>
                <li><strong>Apple Safari:</strong> Preferencias &gt; Privacidad &gt; Bloquear todas las cookies.</li>
                <li><strong>Microsoft Edge:</strong> Configuración &gt; Privacidad, búsqueda y servicios &gt; Cookies y permisos del sitio.</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
