"use client";

interface ClothingItem {
  label: string;
  color: string;
  emoji?: string;
}

interface Props {
  items: ClothingItem[];
  title?: string;
  subtitle?: string;
  score?: number;
  onSelect?: () => void;
  selected?: boolean;
}

export default function OutfitCard({ items, title, subtitle, score, onSelect, selected }: Props) {
  return (
    <div
      className="card"
      onClick={onSelect}
      style={{
        padding: 20,
        cursor: onSelect ? 'pointer' : 'default',
        borderColor: selected ? 'var(--color-primary)' : undefined,
      }}
    >
      {(title || subtitle || score !== undefined) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            {title && <h4 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-foreground)' }}>{title}</h4>}
            {subtitle && <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', marginTop: 2 }}>{subtitle}</p>}
          </div>
          {score !== undefined && (
            <span className="badge badge-primary">{score}/100</span>
          )}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, 1fr)`, gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            aspectRatio: '1',
            borderRadius: 'var(--radius-md)',
            background: item.color,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            border: '1px solid var(--color-border)',
          }}>
            {item.emoji && <span style={{ fontSize: 18 }}>{item.emoji}</span>}
            <span style={{
              fontSize: 9,
              fontWeight: 600,
              textAlign: 'center',
              padding: '0 4px',
              lineHeight: 1.2,
              fontFamily: 'var(--font-body)',
              color: isLightColor(item.color) ? 'var(--color-foreground)' : 'rgba(255,255,255,0.8)',
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
