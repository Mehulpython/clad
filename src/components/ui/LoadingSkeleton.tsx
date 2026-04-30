"use client";

export default function LoadingSkeleton({ rows = 3, type = 'card' }: { rows?: number; type?: 'card' | 'list' | 'text' }) {
  if (type === 'card') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {Array.from({ length: rows * 2 }).map((_, i) => (
          <div key={i} style={{
            aspectRatio: '1',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(110deg, var(--color-muted) 30%, var(--color-border) 50%, var(--color-muted) 70%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{
            height: 56,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(110deg, var(--color-muted) 30%, var(--color-border) 50%, var(--color-muted) 70%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          height: 16,
          borderRadius: 8,
          width: `${80 - i * 10}%`,
          background: 'linear-gradient(110deg, var(--color-muted) 30%, var(--color-border) 50%, var(--color-muted) 70%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  );
}
