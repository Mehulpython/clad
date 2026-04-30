"use client";

import { ReactNode } from "react";

interface Props {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon = "👗", title, description, action }: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 28,
        marginBottom: 16,
        border: '1px solid var(--color-border)',
      }}>
        {icon}
      </div>
      <h3 style={{
        fontSize: 18,
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        color: 'var(--color-foreground)',
        marginBottom: 8,
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: 14,
          color: 'var(--color-muted-foreground)',
          fontFamily: 'var(--font-body)',
          lineHeight: 1.6,
          maxWidth: 360,
          marginBottom: 24,
        }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
