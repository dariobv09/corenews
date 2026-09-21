import React from 'react';

export interface ArticleImageProps {
  src?: string | null;
  alt: string;
}

export default function ArticleImage({ src, alt }: ArticleImageProps) {
  if (!src || !src.trim()) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        maxHeight: '400px',
        objectFit: 'cover',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        marginBottom: '32px',
        display: 'block',
      }}
    />
  );
}
