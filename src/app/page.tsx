import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clad — Your Wardrobe, Powered by AI",
  description: "Upload your clothes. Get daily outfit suggestions. Never ask 'what should I wear?' again.",
  keywords: ["AI wardrobe", "outfit generator", "smart closet", "fashion AI", "style assistant"],
  openGraph: {
    title: "Clad — AI Smart Wardrobe",
    description: "Your personal AI stylist. Upload your wardrobe, get outfit suggestions every day.",
    type: "website",
  },
};

export default function Home() {
  return (
    <main style={{ minHeight: '100vh' }}>
      {/* ─── Hero ──────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 24px 80px' }}>
        {/* Background decorations */}
        <div style={{
          position: 'absolute', top: -100, right: -200,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(190,24,93,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -200,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,119,6,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          {/* Badge */}
          <div className="animate-in" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            background: 'rgba(190,24,93,0.06)', border: '1px solid var(--color-border)',
            marginBottom: 32,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>
              Powered by GPT-4o Vision
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-in delay-100" style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            marginBottom: 24,
            fontFamily: 'var(--font-display)',
            color: 'var(--color-foreground)',
          }}>
            Your closet,{" "}
            <span className="text-gradient">but smart</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-in delay-200" style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--color-muted-foreground)',
            maxWidth: 560,
            margin: '0 auto 40px',
            lineHeight: 1.7,
            fontFamily: 'var(--font-body)',
          }}>
            Photograph every piece of clothing you own. Our AI categorizes it, learns
            your style, and generates perfect outfit combinations — every single day.
          </p>

          {/* CTA Buttons */}
          <div className="animate-in delay-300" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <a href="/upload" className="btn-primary" style={{ fontSize: 17, padding: '16px 36px' }}>
              Start Free →
            </a>
            <a href="#how-it-works" className="btn-secondary" style={{ fontSize: 17, padding: '15px 32px' }}>
              How it works
            </a>
          </div>

          {/* Social proof */}
          <p className="animate-in delay-400" style={{
            marginTop: 32, fontSize: 13, color: 'var(--color-muted-foreground)',
            fontFamily: 'var(--font-body)',
          }}>
            No credit card needed · 25 items free · Set up in 2 minutes
          </p>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────── */}
      <section id="how-it-works" className="section" style={{ background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <span className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>
              How it works
            </span>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-foreground)',
            }}>
              Three steps to your{" "}
              <span className="text-gradient">best-dressed life</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {[
              {
                step: "01",
                title: "Upload your wardrobe",
                desc: "Point your camera at each piece of clothing. Our AI identifies everything — color, pattern, material, occasion.",
                icon: "📸",
                color: 'var(--color-primary)',
              },
              {
                step: "02",
                title: "Get outfit suggestions",
                desc: "Every morning, tap one button. Get 3-5 styled outfits based on weather, occasion, mood, and what you own.",
                icon: "✨",
                color: 'var(--color-secondary)',
              },
              {
                step: "03",
                title: "Look great, feel confident",
                desc: "Never stand in front of your closet wondering what to wear. Know exactly what combinations work.",
                icon: "🔥",
                color: 'var(--color-accent)',
              },
            ].map((step, i) => (
              <div
                key={step.step}
                className={`card animate-in delay-${(i + 1) * 100}`}
                style={{ padding: '32px 28px', textAlign: 'center' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-lg)',
                  background: `linear-gradient(135deg, ${step.color}15, ${step.color}08)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, margin: '0 auto 20px',
                  border: `1px solid ${step.color}20`,
                }}>
                  {step.icon}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: step.color,
                  fontFamily: 'var(--font-body)',
                  display: 'block', marginBottom: 8,
                }}>
                  Step {step.step}
                </span>
                <h3 style={{
                  fontSize: 20, fontWeight: 700, color: 'var(--color-foreground)',
                  fontFamily: 'var(--font-display)', marginBottom: 12,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 14, color: 'var(--color-muted-foreground)',
                  lineHeight: 1.7, fontFamily: 'var(--font-body)',
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature Highlights ─────────────────────────────── */}
      <section className="section">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
            {/* Left: Features */}
            <div>
              <span className="badge badge-accent" style={{ marginBottom: 16, display: 'inline-flex' }}>
                AI-Powered
              </span>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontFamily: 'var(--font-display)',
                color: 'var(--color-foreground)',
                marginBottom: 32,
              }}>
                AI that actually{" "}
                <span className="text-gradient">understands fashion</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[
                  "GPT-4o Vision identifies any clothing item — western wear, ethnic pieces, accessories",
                  "Color theory engine ensures every outfit is harmonious",
                  "Weather-aware suggestions — no wool suits in summer",
                  "'Should I buy this?' scanner checks against your entire wardrobe",
                  "Weekly planner auto-generates 7 days of outfits",
                  "Gap analysis tells you exactly what's missing",
                ].map((feature) => (
                  <div key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(5,150,105,0.1)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', marginTop: 2,
                    }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 14, color: 'var(--color-muted-foreground)', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Outfit Preview Card */}
            <div className="card-static animate-float" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>
                  Today&apos;s Outfit
                </span>
                <span className="badge badge-primary">
                  48°F · Rainy
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: "Navy Blazer", color: "#1e293b", icon: "🧥" },
                  { label: "White Oxford", color: "#f8fafc", icon: "👔" },
                  { label: "Dark Jeans", color: "#334155", icon: "👖" },
                  { label: "Brown Loafers", color: "#78350f", icon: "👞" },
                  { label: "Navy Belt", color: "#1e293b", icon: "🎀" },
                  { label: "Watch", color: "#1f2937", icon: "⌚" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      aspectRatio: '1', borderRadius: 'var(--radius-md)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 4,
                      background: item.color, border: '1px solid var(--color-border)',
                      transition: 'all 150ms ease', cursor: 'default',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <span style={{
                      fontSize: 10, color: item.color === '#f8fafc' ? 'var(--color-foreground)' : 'rgba(255,255,255,0.7)',
                      textAlign: 'center', lineHeight: 1.2, padding: '0 4px', fontFamily: 'var(--font-body)',
                    }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 20, padding: '14px 16px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-muted)', border: '1px solid var(--color-border)',
              }}>
                <p style={{
                  fontSize: 12, color: 'var(--color-muted-foreground)', fontStyle: 'italic',
                  lineHeight: 1.6, fontFamily: 'var(--font-body)',
                }}>
                  &quot;Navy + white creates a sharp, professional look. The brown leather adds warmth.
                  Perfect for rainy-day office wear.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─────────────────────────────────────── */}
      <section style={{ padding: '48px 24px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32, textAlign: 'center' }}>
          {[
            { value: "50K+", label: "Items Scanned" },
            { value: "120K+", label: "Outfits Generated" },
            { value: "4.9★", label: "User Rating" },
            { value: "<2min", label: "Setup Time" },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800,
                fontFamily: 'var(--font-display)', color: 'var(--color-primary)',
                marginBottom: 4,
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────── */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            fontFamily: 'var(--font-display)',
            color: 'var(--color-foreground)',
            marginBottom: 16,
          }}>
            Ready to never ask{" "}
            <span className="text-gradient">&quot;what do I wear?&quot;</span>{" "}
            again?
          </h2>
          <p style={{
            fontSize: 16, color: 'var(--color-muted-foreground)',
            marginBottom: 36, lineHeight: 1.7, fontFamily: 'var(--font-body)',
          }}>
            Join thousands of people who let AI handle their daily style decisions.
          </p>
          <a href="/upload" className="btn-primary" style={{ fontSize: 17, padding: '16px 40px' }}>
            Build Your Free Wardrobe →
          </a>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '32px 24px',
        textAlign: 'center',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12,
          }}>
            👗
          </span>
          <span style={{ fontWeight: 700, color: 'var(--color-foreground)', fontFamily: 'var(--font-display)' }}>Clad</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)' }}>
          © {new Date().getFullYear()} Clad. Your wardrobe, powered by AI.
        </p>
      </footer>
    </main>
  );
}
