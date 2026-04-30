"use client";

import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  badge?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, description, badge, action }: Props) {
  return (
    <div style={{ marginBottom: 32 }}>
      {badge && (
        <span className="badge badge-primary" style={{ marginBottom: 12, display: 'inline-flex' }}>
          {badge}
        </span>
      )}
      <h1 style={{
        fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        color: 'var(--color-foreground)',
        letterSpacing: '-0.02em',
        marginBottom: description ? 8 : 0,
      }}>
        {title}
      </h1>
      {description && (
        <p style={{
          fontSize: 15,
          color: 'var(--color-muted-foreground)',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.6,
          maxWidth: 520,
        }}>
          {description}
        </p>
      )}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
