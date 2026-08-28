'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Shield, BookOpen, Globe, Info, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      padding: '48px 24px 32px',
      marginTop: 'auto',
      color: 'var(--text-muted)',
      fontSize: '14px'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          marginBottom: '40px'
        }}>
          {/* Col 1: Marca e info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 13
              }}>
                C
              </div>
              <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                The Core News
              </span>
            </div>
            <p style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Inteligencia automatizada y análisis contrastado sobre Inteligencia Artificial, Tecnología, Economía y Geopolítica Global.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--accent-blue)' }}>
              <Mail style={{ width: 15, height: 15 }} />
              <a href="mailto:thecorenews.info@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                thecorenews.info@gmail.com
              </a>
            </div>
          </div>

          {/* Col 2: Secciones */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: '14px' }}>
              Categorías de Noticias
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/noticias/ia" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Inteligencia Artificial
                </Link>
              </li>
              <li>
                <Link href="/noticias/tecnologia" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Tecnología y Ciberseguridad
                </Link>
              </li>
              <li>
                <Link href="/noticias/economia" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Economía Global
                </Link>
              </li>
              <li>
                <Link href="/noticias/politica" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Geopolítica Internacional
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Transparencia Editorial */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: '14px' }}>
              Transparencia Editorial
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/sobre-nosotros" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/politica-editorial" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Política Editorial y Fact-Checking
                </Link>
              </li>
              <li>
                <Link href="/contacto" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Contacto Editorial
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legalidad y AdSense */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary)', marginBottom: '14px' }}>
              Políticas y Privacidad
            </h4>
            <p style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-faint)', marginBottom: '12px' }}>
              Cumplimos estrictamente con el RGPD, LSSI-CE y las Políticas de Programa de Google AdSense para la protección de datos y publicidad responsable.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <Shield style={{ width: 14, height: 14, color: 'var(--accent-blue)' }} />
              Sitio Verificado y Seguro
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '12px',
          color: 'var(--text-faint)'
        }}>
          <div>
            © {new Date().getFullYear()} <strong>The Core News</strong>. Todos los derechos reservados.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/sobre-nosotros" style={{ color: 'inherit', textDecoration: 'none' }}>Sobre Nosotros</Link>
            <Link href="/contacto" style={{ color: 'inherit', textDecoration: 'none' }}>Contacto</Link>
            <Link href="/politica-editorial" style={{ color: 'inherit', textDecoration: 'none' }}>Política Editorial</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
