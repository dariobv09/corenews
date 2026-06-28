'use client';

import React, { useState, useEffect } from 'react';
import { Shield, X, FileText, Check } from 'lucide-react';

export default function LegalPolicies() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'aviso' | 'privacidad' | 'cookies'>('aviso');
  const [showBanner, setShowBanner] = useState(false);

  // Comprobar si el usuario ya aceptó las cookies
  useEffect(() => {
    const accepted = localStorage.getItem('cookies-accepted');
    if (!accepted) {
      // Mostrar el banner tras un pequeño retardo
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookies-accepted', 'true');
    setShowBanner(false);
  };

  const handleOpenPolicies = (tab: 'aviso' | 'privacidad' | 'cookies') => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  return (
    <>
      {/* ── BOTÓN FLOTANTE REDONDO ────────────────── */}
      <button
        onClick={() => handleOpenPolicies('aviso')}
        title="Políticas Legales y Privacidad"
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '24px',
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 40,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.2s, color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.color = 'var(--accent-blue)';
          e.currentTarget.style.borderColor = 'var(--accent-blue)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        <Shield style={{ width: 20, height: 20 }} />
      </button>

      {/* ── BANNER DE COOKIES (OBLIGATORIO) ────────── */}
      {showBanner && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 48px)',
            maxWidth: '680px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '20px 24px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            zIndex: 45,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'fadeInUp 0.3s ease-out forwards',
          }}
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <FileText style={{ width: 22, height: 22, color: 'var(--accent-blue)', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Uso de Cookies y Privacidad
              </h4>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
                Este sitio web utiliza cookies propias y de terceros para optimizar tu navegación, recopilar estadísticas y mostrar publicidad relevante de <strong>Google AdSense</strong>. Al pulsar en aceptar, confirmas estar de acuerdo con su instalación y nuestra política de cookies.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleOpenPolicies('cookies')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Configurar / Leer Políticas
            </button>
            <button
              onClick={handleAcceptCookies}
              style={{
                background: 'var(--text-primary)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--bg)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Check style={{ width: 14, height: 14 }} />
              Aceptar cookies
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL DE POLÍTICAS LEGALES ────────────── */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '85vh',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield style={{ width: 18, height: 18, color: 'var(--accent-blue)' }} />
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Centro de Políticas Legales
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-faint)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                }}
              >
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Pestañas de navegación */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
              }}
            >
              <button
                onClick={() => setActiveTab('aviso')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderBottom: activeTab === 'aviso' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  background: 'transparent',
                  fontSize: '13px',
                  fontWeight: activeTab === 'aviso' ? 700 : 500,
                  color: activeTab === 'aviso' ? 'var(--accent-blue)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                Aviso Legal
              </button>
              <button
                onClick={() => setActiveTab('privacidad')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderBottom: activeTab === 'privacidad' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  background: 'transparent',
                  fontSize: '13px',
                  fontWeight: activeTab === 'privacidad' ? 700 : 500,
                  color: activeTab === 'privacidad' ? 'var(--accent-blue)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                Privacidad
              </button>
              <button
                onClick={() => setActiveTab('cookies')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderBottom: activeTab === 'cookies' ? '2px solid var(--accent-blue)' : '2px solid transparent',
                  background: 'transparent',
                  fontSize: '13px',
                  fontWeight: activeTab === 'cookies' ? 700 : 500,
                  color: activeTab === 'cookies' ? 'var(--accent-blue)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                Cookies
              </button>
            </div>

            {/* Contenido (Scrollable) */}
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                fontSize: '14px',
                lineHeight: '1.65',
                color: 'var(--text-primary)',
              }}
            >
              {activeTab === 'aviso' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>AVISO LEGAL</h3>
                  <p style={{ margin: 0 }}>
                    En cumplimiento del deber de información general integrado en el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan a continuación los siguientes datos de información general de este sitio web:
                  </p>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Titular / Responsable:</strong> the core news</li>
                    <li><strong>Correo electrónico de contacto:</strong> thecorenews.info@gmail.com</li>
                    <li><strong>Sitio Web:</strong> thecorenews.info</li>
                  </ul>
                  <h4 style={{ margin: '12px 0 6px 0', fontSize: '15px', fontWeight: 700 }}>Propiedad Intelectual y Uso del Sitio Web</h4>
                  <p style={{ margin: 0 }}>
                    El usuario se compromete a hacer un uso adecuado de los contenidos y servicios de la web. Queda prohibida la reproducción total o parcial de los contenidos de este sitio web sin la autorización expresa del titular.
                  </p>
                </div>
              )}

              {activeTab === 'privacidad' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>POLÍTICA DE PRIVACIDAD</h3>
                  
                  <h4 style={{ margin: '8px 0 4px 0', fontSize: '15px', fontWeight: 700 }}>1. Responsable del Tratamiento de Datos</h4>
                  <p style={{ margin: 0 }}>
                    El responsable del tratamiento de los datos recolectados en esta web es <strong>the core news</strong>, con correo electrónico de contacto: <strong>thecorenews.info@gmail.com</strong>.
                  </p>

                  <h4 style={{ margin: '8px 0 4px 0', fontSize: '15px', fontWeight: 700 }}>2. Datos que se recogen y Finalidad</h4>
                  <p style={{ margin: 0 }}>En este sitio web se recopilan datos a través de:</p>
                  <ul style={{ margin: '4px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li><strong>Formularios de contacto/comentarios:</strong> Para responder a las consultas de los usuarios.</li>
                    <li><strong>Cookies de terceros (Google AdSense):</strong> Para mostrar anuncios personalizados basados en las visitas anteriores del usuario a este u otros sitios web.</li>
                  </ul>

                  <h4 style={{ margin: '8px 0 4px 0', fontSize: '15px', fontWeight: 700 }}>3. Legitimación</h4>
                  <p style={{ margin: 0 }}>
                    El tratamiento de sus datos se realiza con base en el consentimiento del usuario al aceptar esta política de privacidad o el uso de cookies.
                  </p>

                  <h4 style={{ margin: '8px 0 4px 0', fontSize: '15px', fontWeight: 700 }}>4. Destinatarios de los datos</h4>
                  <p style={{ margin: 0 }}>
                    Los datos no se cederán a terceros salvo obligación legal. Sin embargo, utilizamos servicios de terceros como Google Adsense y Google Analytics, que pueden recopilar información anónima mediante cookies para sus propios fines de publicidad y estadísticas.
                  </p>

                  <h4 style={{ margin: '8px 0 4px 0', fontSize: '15px', fontWeight: 700 }}>5. Derechos de los usuarios</h4>
                  <p style={{ margin: 0 }}>
                    El usuario tiene derecho a acceder, rectificar, limitar o suprimir sus datos enviando un correo electrónico a <strong>thecorenews.info@gmail.com</strong>.
                  </p>
                </div>
              )}

              {activeTab === 'cookies' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700 }}>POLÍTICA DE COOKIES</h3>
                  <p style={{ margin: 0 }}>
                    Este sitio web utiliza cookies propias y de terceros para mejorar la experiencia de navegación del usuario y ofrecer publicidad de su interés.
                  </p>

                  <h4 style={{ margin: '8px 0 4px 0', fontSize: '15px', fontWeight: 700 }}>¿Qué es una cookie?</h4>
                  <p style={{ margin: 0 }}>
                    Una cookie es un pequeño archivo de texto que se almacena en su navegador cuando visita casi cualquier página web. Su utilidad es que la web sea capaz de recordar su visita cuando vuelva a navegar por esa página.
                  </p>

                  <h4 style={{ margin: '8px 0 4px 0', fontSize: '15px', fontWeight: 700 }}>Cookies utilizadas en este sitio web:</h4>
                  <ul style={{ margin: '4px 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <li><strong>Cookies técnicas:</strong> Necesarias para el correcto funcionamiento de la web.</li>
                    <li><strong>Cookies de Personalización (Google AdSense):</strong> Proveedores de terceros, incluido Google, utilizan cookies para publicar anuncios basándose en las visitas anteriores de un usuario a este sitio web o a otros sitios web. El uso de cookies de publicidad de Google permite a este y a sus socios publicar anuncios basados en las visitas de los usuarios a sus sitios o a otros sitios de Internet.</li>
                  </ul>

                  <h4 style={{ margin: '12px 0 4px 0', fontSize: '15px', fontWeight: 700 }}>Cómo desactivar las cookies</h4>
                  <p style={{ margin: 0 }}>
                    El usuario puede, en cualquier momento, permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador que utilice (Chrome, Firefox, Safari, Edge, etc.). Puede inhabilitar la publicidad personalizada de Google visitando la <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Configuración de anuncios de Google</a>.
                  </p>
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'var(--accent-blue)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 24px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
