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
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-pink-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8 animate-in">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-gray-400">Powered by GPT-4o Vision</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] sm:leading-[0.95] mb-6 animate-in px-2" style={{ animationDelay: "0.1s" }}>
            Your closet,{" "}
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              but smart
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed animate-in px-2" style={{ animationDelay: "0.2s" }}>
            Photograph every piece of clothing you own. Our AI categorizes it, learns
            your style, and generates perfect outfit combinations — every single day.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in" style={{ animationDelay: "0.3s" }}>
            <a href="/upload" className="btn-primary text-lg px-8 py-4">
              Start Free →
            </a>
            <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4">
              How it works
            </a>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-gray-600 animate-in" style={{ animationDelay: "0.4s" }}>
            No credit card needed · 25 items free · Set up in 2 minutes
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Three steps to your best-dressed life
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: "01",
                title: "Upload your wardrobe",
                desc: "Point your camera at each piece of clothing, or import from your gallery. Our AI identifies everything — color, pattern, material, occasion.",
                icon: "📸",
              },
              {
                step: "02",
                title: "Get outfit suggestions",
                desc: "Every morning (or whenever you want), tap one button. Get 3-5 styled outfits based on weather, occasion, mood, and what you actually own.",
                icon: "✨",
              },
              {
                step: "03",
                title: "Look great, feel confident",
                desc: "Never stand in front of your closet wondering what to wear again. Know exactly what combinations work. Build your personal style over time.",
                icon: "🔥",
              },
            ].map((step) => (
              <div key={step.step} className="glass-card p-6 sm:p-8 relative group hover:border-purple-500/30 transition-all duration-300">
                <span className="text-5xl mb-4 block">{step.icon}</span>
                <span className="text-xs font-mono text-purple-400 tracking-wider uppercase mb-2 block">
                  Step {step.step}
                </span>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="px-6 py-20 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                AI that actually{" "}
                <span className="text-purple-400">understands fashion</span>
              </h2>
              <ul className="space-y-4">
                {[
                  "GPT-4o Vision identifies any clothing item from a photo — western wear, ethnic pieces, accessories",
                  "Color theory engine ensures every outfit is harmonious (complementary, analogous, monochromatic)",
                  "Weather-aware suggestions — no wool suits in summer, always rain-ready",
                  "'Should I buy this?' scanner checks new items against your entire wardrobe before you spend",
                  "Weekly planner auto-generates 7 days of outfits every Sunday evening",
                  "Gap analysis tells you exactly what's missing and what would create the most new looks",
                ].map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mockup card */}
            <div className="glass-card p-6 glow-pulse">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">Today&apos;s Outfit</span>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                  48°F · Rainy
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Navy Blazer", color: "#1e293b", emoji: "🧥" },
                  { label: "White Oxford", color: "#f8fafc", emoji: "👔" },
                  { label: "Dark Jeans", color: "#334155", emoji: "👖" },
                  { label: "Brown Loafers", color: "#78350f", emoji: "👞" },
                  { label: "Navy Belt", color: "#1e293b", emoji: "🎀" },
                  { label: "Watch", color: "#1f2937", emoji: "⌚" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border border-white/5 hover:border-purple-500/30 transition-colors cursor-default"
                    style={{ backgroundColor: item.color }}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-[10px] text-white/70 text-center leading-tight px-1">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/5">
                <p className="text-xs text-gray-400 italic">
                  &quot;Navy + white creates a sharp, professional look. The brown leather adds warmth.
                  Perfect for rainy-day office wear.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 px-2">Ready to never ask &quot;what do I wear?&quot; again?</h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          Join thousands of people who let AI handle their daily style decisions.
        </p>
        <a href="/upload" className="btn-primary text-lg px-10 py-4 inline-block">
          Build Your Free Wardrobe →
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} Clad. Built with ❤️ and GPT-4o.</p>
      </footer>
    </main>
  );
}
