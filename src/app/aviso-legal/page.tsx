import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale, Building2, BookOpenCheck, ShieldAlert, Gavel, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Aviso Legal | The Core News",
  description: "Aviso legal, términos y condiciones de uso de The Core News en estricto cumplimiento de la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI-CE).",
  alternates: {
    canonical: "https://thecorenews.info/aviso-legal",
  },
};

export default function AvisoLegalPage() {
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
          <Scale style={{ width: 28, height: 28, color: 'var(--accent-blue)' }} />
          <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Aviso Legal
          </h1>
        </div>

        <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 36 }}>
          El presente Aviso Legal regula el acceso, navegación y uso del sitio web <strong>thecorenews.info</strong> en cumplimiento de las obligaciones estipuladas en la legislación española.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Section 1: Titular del Sitio Web */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <Building2 style={{ width: 20, height: 20, color: 'var(--accent-blue)' }} />
              1. Datos Identificativos del Titular
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 12 }}>
                En cumplimiento del artículo 10 de la <strong>Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE)</strong>, se ponen a disposición de los usuarios los datos identificativos del responsable del portal:
              </p>
              <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li><strong>Titular del portal:</strong> The Core News</li>
                <li><strong>Sitio Web Oficial:</strong> <a href="https://thecorenews.info" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>thecorenews.info</a></li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <strong>Correo electrónico de contacto:</strong>
                  <a href="mailto:thecorenews.info@gmail.com" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>
                    thecorenews.info@gmail.com
                  </a>
                </li>
                <li><strong>Actividad principal:</strong> Portal editorial independiente de noticias, análisis e inteligencia automatizada en IA, Tecnología, Economía y Geopolítica.</li>
              </ul>
            </div>
          </section>

          {/* Section 2: Uso del Sitio Web */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <FileCheck style={{ width: 20, height: 20, color: 'var(--accent-violet)' }} />
              2. Condiciones de Uso del Sitio Web
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 12 }}>
                El acceso y utilización de este sitio web confiere la condición de <strong>USUARIO</strong>, quien acepta plenamente y sin reservas todas las disposiciones incluidas en este Aviso Legal desde el momento en que accede a cualquiera de sus páginas.
              </p>
              <p style={{ marginBottom: 12 }}>
                El usuario se compromete a hacer un uso lícito, diligente y responsable de los contenidos y servicios del portal, absteniéndose de:
              </p>
              <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>Realizar actividades ilícitas, fraudulentas o contrarias al orden público y a la buena fe.</li>
                <li>Provocar daños en los sistemas lógicos o físicos de The Core News, de sus servidores en la nube o de terceros.</li>
                <li>Introducir o difundir virus informáticos, malware o cualquier código dañino para la infraestructura tecnológica.</li>
                <li>Intentar vulnerar los mecanismos de autenticación, medidas de seguridad o realizar scraping abusivo que degrade el rendimiento del servicio.</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Propiedad Intelectual */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <BookOpenCheck style={{ width: 20, height: 20, color: 'var(--accent-blue)' }} />
              3. Propiedad Intelectual e Industrial
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 12 }}>
                Todos los derechos de propiedad intelectual e industrial del sitio web <strong>The Core News</strong>, incluyendo a título enunciativo sus textos, redacciones analíticas, marcas, logotipos, elementos gráficos, diseño de interfaz, bases de datos y código fuente, son de titularidad exclusiva de The Core News o de sus respectivos licenciantes.
              </p>
              <p style={{ marginBottom: 12 }}>
                Queda expresamente prohibida la reproducción, distribución, comunicación pública, transformación o explotación comercial de la totalidad o parte de los contenidos de este portal con fines lucrativos sin autorización previa, expresa y por escrito de The Core News.
              </p>
              <div style={{ padding: 14, borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--border)', fontSize: 14 }}>
                <strong>Citas informativas y prensa:</strong> Se autoriza la cita y referencia periodística de los análisis publicados, siempre que se mencione de forma visible y explícita la autoría de <em>The Core News</em> y se incluya un enlace hipertextual directo a la noticia original en <code>thecorenews.info</code>.
              </div>
            </div>
          </section>

          {/* Section 4: Exclusión de Responsabilidad */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <ShieldAlert style={{ width: 20, height: 20, color: 'var(--accent-violet)' }} />
              4. Exclusión de Garantías y Responsabilidad
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 12 }}>
                Los contenidos de The Core News se elaboran mediante rigurosos procesos de recopilación y síntesis informativa contrastada. Sin embargo, no se garantiza la total ausencia de errores tipográficos o involuntarios, ni la disponibilidad continua e ininterrumpida de la web.
              </p>
              <p style={{ marginBottom: 12 }}>
                <strong>Aviso de no asesoramiento:</strong> La información sobre mercados, activos financieros, desarrollos de inteligencia artificial o acontecimientos geopolíticos se proporciona exclusivamente con carácter informativo y divulgativo, y no constituye bajo ningún concepto recomendación de inversión, asesoramiento financiero ni dictamen legal.
              </p>
              <p style={{ margin: 0 }}>
                The Core News declina cualquier responsabilidad sobre el contenido de páginas web de terceros enlazadas como fuentes primarias o referencias documentales, sobre las cuales no ejerce control editorial alguno.
              </p>
            </div>
          </section>

          {/* Section 5: Ley aplicable */}
          <section style={{ padding: 28, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 19, fontWeight: 700, marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
              <Gavel style={{ width: 20, height: 20, color: 'var(--accent-blue)' }} />
              5. Ley Aplicable y Jurisdicción
            </h2>
            <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0, marginBottom: 12 }}>
                Las presentes condiciones y cualquier controversia derivada del uso del sitio web se regirán e interpretarán de conformidad con la <strong>legislación española</strong>, en particular por la <strong>LSSI-CE (Ley 34/2002)</strong> y la normativa europea aplicable.
              </p>
              <p style={{ margin: 0 }}>
                Para la resolución de cualquier conflicto judicial derivado de este portal, las partes se someterán a los juzgados y tribunales competentes conforme a la normativa vigente en materia de jurisdicción y competencia procesal.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
