import React from 'react';
import Link from 'next/link';

export interface AuthorCardProps {
  name?: string | null;
}

export default function AuthorCard({ name }: AuthorCardProps) {
  const authorName = name && name.trim() ? name.trim() : 'Darío Balado';
  const initial = authorName.charAt(0).toUpperCase() || 'D';

  return (
    <Link
      href="/equipo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        fontSize: '13px',
        color: 'var(--text-muted)',
        padding: '6px 14px 6px 6px',
        borderRadius: '20px',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border)',
        transition: 'all 0.2s ease',
        width: 'fit-content',
      }}
    >
      <div
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '12px',
          lineHeight: 1,
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        {initial}
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          Por {authorName}
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          · Editor en The Core News
        </span>
      </div>
    </Link>
  );
}
