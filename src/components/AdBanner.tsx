'use client';

import React, { useEffect } from 'react';

interface AdBannerProps {
  slot: string;
  format?: string;
  responsive?: string;
  style?: React.CSSProperties;
}

export default function AdBanner({ slot, format = 'auto', responsive = 'true', style }: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-7071987980722498';

  useEffect(() => {
    if (clientId) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('Error initializing adsbygoogle block:', err);
      }
    }
  }, [clientId]);

  // Si no está configurada la variable, se muestra un esqueleto visual premium en desarrollo
  if (!clientId) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          background: 'var(--bg-subtle)',
          border: '1px dashed var(--border)',
          borderRadius: '12px',
          color: 'var(--text-faint)',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          margin: '28px 0',
          fontFamily: 'system-ui, sans-serif',
          ...style
        }}
      >
        [ Anuncio AdSense — Slot: {slot} ]
      </div>
    );
  }

  return (
    <div style={{ margin: '28px 0', overflow: 'hidden', ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
}
