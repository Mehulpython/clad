"use client";

interface Props {
  label: string;
  value: string | number;
  icon?: string;
  trend?: string;
  color?: string;
}

export default function StatCard({ label, value, icon, trend, color = 'var(--color-primary)' }: Props) {
  return (
    <div className="card-static" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {label}
        </span>
        {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
      </div>
      <div style={{
        fontSize: 28,
        fontWeight: 800,
        fontFamily: 'var(--font-display)',
        color,
        lineHeight: 1.2,
      }}>
        {value}
      </div>
      {trend && (
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-success)', fontFamily: 'var(--font-body)', marginTop: 4, display: 'block' }}>
          {trend}
        </span>
      )}
    </div>
  );
}
