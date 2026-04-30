"use client";

interface Props {
  label: string;
  color: string;
  category?: string;
  onClick?: () => void;
  selected?: boolean;
}

export default function ItemCard({ label, color, category, onClick, selected }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: 'var(--radius-lg)',
        background: color,
        border: selected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
        padding: 16,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 150ms ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        minHeight: 120,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {category && (
        <span style={{
          position: 'absolute',
          top: 10,
          right: 10,
          fontSize: 10,
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(0,0,0,0.3)',
          color: 'rgba(255,255,255,0.9)',
          fontFamily: 'var(--font-body)',
        }}>
          {category}
        </span>
      )}
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: isLightColor(color) ? 'var(--color-foreground)' : 'rgba(255,255,255,0.9)',
        fontFamily: 'var(--font-body)',
        textShadow: isLightColor(color) ? 'none' : '0 1px 3px rgba(0,0,0,0.3)',
      }}>
        {label}
      </span>
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
