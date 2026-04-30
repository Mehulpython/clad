"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/wardrobe", label: "Wardrobe", icon: "👔" },
  { href: "/generate", label: "Generate", icon: "✨" },
  { href: "/outfits", label: "Outfits", icon: "👗" },
  { href: "/planner", label: "Planner", icon: "📅" },
  { href: "/shop", label: "Shop", icon: "🛍️" },
  { href: "/scan", label: "Scan", icon: "🔍" },
  { href: "/gap-analysis", label: "Gaps", icon: "📊" },
  { href: "/stats", label: "Stats", icon: "📈" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(253, 242, 248, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--color-border)',
      padding: '4px 8px',
      paddingBottom: 'max(4px, env(safe-area-inset-bottom))',
    }}
    className="md:static md:border-b md:border-t-0 md:px-6 md:py-3"
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 700,
            textDecoration: 'none',
            color: 'var(--color-foreground)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
            marginRight: 16,
          }}
        >
          <span style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}>
            👗
          </span>
          <span style={{ color: 'var(--color-primary)' }}>Clad</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 150ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: isActive ? 'rgba(190, 24, 93, 0.08)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto scrollbar-hide" style={{ margin: '0 -8px', padding: '0 8px' }}>
          {NAV_ITEMS.slice(0, 7).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  flexShrink: 0,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 11,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 150ms ease',
                  background: isActive ? 'rgba(190, 24, 93, 0.08)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-muted-foreground)',
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
