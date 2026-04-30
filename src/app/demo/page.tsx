import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "Clad Demo — See the AI Smart Wardrobe in Action",
  description:
    "Explore Clad's AI-powered wardrobe features with real sample data. See outfit generation, gap analysis, weekly planning, and more — no sign-up required.",
  keywords: [
    "AI wardrobe demo",
    "smart closet preview",
    "outfit generator example",
    "Clad app demo",
    "digital wardrobe sample",
  ],
  openGraph: {
    title: "Clad Demo — AI Smart Wardrobe in Action",
    description:
      "See Clad's AI wardrobe features with real sample data. No sign-up required.",
    type: "website",
  },
};

// ─── Sample Wardrobe Data ──────────────────────────────────
const sampleItems = [
  { name: "Navy Blazer", emoji: "🧥", color: "#1e293b", category: "Outerwear", tag: "Formal" },
  { name: "White Oxford Shirt", emoji: "👔", color: "#f8fafc", category: "Tops", tag: "Smart" },
  { name: "Dark Wash Jeans", emoji: "👖", color: "#334155", category: "Bottoms", tag: "Casual" },
  { name: "Brown Leather Loafers", emoji: "👞", color: "#78350f", category: "Footwear", tag: "Smart" },
  { name: "Black Turtleneck", emoji: "🎽", color: "#111827", category: "Tops", tag: "Elevated" },
  { name: "Light Blue Chinos", emoji: "🩳", color: "#93c5fd", category: "Bottoms", tag: "Smart-Casual" },
  { name: "Gray Crewneck Sweater", emoji: "🧥", color: "#6b7280", category: "Tops", tag: "Casual" },
  { name: "White Sneakers", emoji: "👟", color: "#f1f5f9", category: "Footwear", tag: "Casual" },
  { name: "Tan Trench Coat", emoji: "🧥", color: "#d97706", category: "Outerwear", tag: "Transitional" },
  { name: "Black Leather Belt", emoji: "🎀", color: "#000000", category: "Accessories", tag: "Essential" },
  { name: "Aviator Sunglasses", emoji: "🕶️", color: "#374151", category: "Accessories", tag: "Statement" },
  { name: "Navy Watch", emoji: "⌚", color: "#1e3a5f", category: "Accessories", tag: "Classic" },
];

// ─── Sample Outfits ───────────────────────────────────────
const sampleOutfits = [
  {
    name: "Smart Casual Friday",
    context: "48°F · Overcast · Work",
    items: [0, 1, 2, 3, 9], // indices into sampleItems
    reasoning:
      'Navy blazer + white oxford creates a sharp, professional foundation. Dark jeans keep it approachable — not too formal for casual Friday. Brown leather loafers add warmth and coordinate with a matching belt. The navy-on-navy (blazer + watch) creates subtle tonal harmony. Perfect for presentation days or client meetings where you want to look polished without wearing a full suit.',
    colorTheory: "Complementary navy-white base with warm brown leather accents",
  },
  {
    name: "Weekend Brunch",
    context: "62°F · Sunny · Casual Social",
    items: [5, 6, 7],
    reasoning:
      'Light blue chinos + gray crewneck is a classic smart-casual combo that feels effortless. The blue-gray analogous palette is calming and universally flattering. White sneakers keep it relaxed and modern. This outfit says "I put thought into this" without trying too hard — ideal for brunch dates, coffee meetups, or weekend errands where you might run into someone.',
    colorTheory: "Analogous blue-gray palette with white neutral anchor",
  },
  {
    name: "Date Night Edge",
    context: "55°F · Clear Evening · Date Night",
    items: [4, 2, 3, 10, 11],
    reasoning:
      'The black turtleneck is a power move — slimming, sophisticated, and slightly European. Paired with dark jeans and brown leather boots, it hits that sweet spot between dressed-up and relaxed. Aviator sunglasses transition this from day-to-evening. The navy watch adds a classic touch that prevents the all-dark palette from feeling flat. Confident, intentional, memorable.',
    colorTheory: "Monochromatic dark base with warm leather contrast",
  },
];

// ─── Gap Analysis Data ─────────────────────────────────────
const gaps = [
  {
    priority: "Critical" as const,
    icon: "🔴",
    item: "Light Blue Dress Shirt",
    reason: "You have 0 light-colored dress shirts. Adding one unlocks 12 new work-appropriate combinations.",
    combos: "+12 outfits",
  },
  {
    priority: "High" as const,
    icon: "🟠",
    item: "White Canvas Sneakers",
    reason: "Your only white sneakers are leather dress style. A canvas pair adds summer/casual versatility.",
    combos: "+8 outfits",
  },
  {
    priority: "Medium" as const,
    icon: "🟡",
    item: "Olive Field Jacket",
    reason: "No casual outerwear between your blazer and trench coat. Fills the weekend layering gap.",
    combos: "+15 outfits",
  },
];

// ─── Weekly Planner Preview ───────────────────────────────
const weekDays = [
  { day: "Mon", label: "Smart Casual Friday", temp: "51°F", items: [0, 1, 2, 3] },
  { day: "Tue", label: "Comfort Focus", temp: "54°F", items: [5, 6, 7] },
  { day: "Wed", label: "Meeting Ready", temp: "49°F", items: [0, 4, 2, 3] },
  { day: "Thu", label: "Casual Thursday", temp: "58°F", items: [6, 4, 7] },
  { day: "Fri", label: "Date Night", temp: "53°F", items: [8, 4, 2, 3] },
];

// ─── FAQ Data ─────────────────────────────────────────────
const faqs = [
  {
    q: "What is Clad?",
    a: "Clad is an AI-powered smart wardrobe application. You upload photos of your clothes, our AI (powered by GPT-4o Vision) analyzes each piece, and then generates outfit combinations tailored to your style, the weather, and your schedule.",
  },
  {
    q: "How does the AI analyze my clothes?",
    a: "When you upload a photo, GPT-4o Vision examines the image and identifies: clothing type, primary & secondary colors, pattern, material, formality level (1-5), appropriate occasions, and suitable seasons. Each analysis includes a confidence score so you know how certain the AI is.",
  },
  {
    q: "Is my wardrobe data private?",
    a: "Yes. Your wardrobe data is encrypted and stored in your own private database. You're the only person who can see your items and outfits. We never share or sell your clothing data. AI processing uses anonymized requests — images are analyzed and discarded, not stored by the AI provider.",
  },
  {
    q: "What photos work best?",
    a: "For best results: use natural daylight, photograph one item per shot, fill the frame with the garment, show the complete piece (collar to hem), and use a plain background. Well-lit, wrinkle-free photos produce 92%+ analysis accuracy.",
  },
  {
    q: "Can I use Clad for free?",
    a: "Absolutely! The free tier includes 25 wardrobe items, 3 outfit generations per day, and full AI analysis. Upgrade to Pro ($6.99/mo) for 200 items, unlimited generation, and the weekly planner. Studio ($14.99/mo) adds unlimited items, deep gap analysis, and unlimited pre-purchase scanning.",
  },
  {
    q: "Does it work for all types of clothing?",
    a: "Yes! Clad handles western wear (jeans, blazers, dresses, suits) and ethnic wear (kurtas, sarees, sherwanis, kurtas) equally well. Our AI model was trained on diverse global fashion, not just Western catalogs. It recognizes 40+ clothing types across tops, bottoms, dresses, outerwear, footwear, and accessories.",
  },
];

// ─── Demo Schema ──────────────────────────────────────────
const demoSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Clad Demo",
  applicationCategory: "LifestyleApplication",
  description:
    "Interactive demo of Clad's AI-powered smart wardrobe features including outfit generation, gap analysis, and weekly planning.",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function DemoPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-sm text-gray-400">Live Demo — No Sign-Up Required</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-6">
            See{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Clad
            </span>{" "}
            in Action
          </h1>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Explore every feature with real sample data. This is exactly what users
            experience when they digitize their wardrobe — outfit generation, gap
            analysis, weekly planning, and more.
          </p>

          <a href="/upload" className="btn-primary text-lg px-8 py-4 inline-block">
            Build Your Own Wardrobe →
          </a>
        </div>
      </section>

      {/* Sample Wardrobe Grid */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Sample Digital Wardrobe
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
            12 items uploaded and analyzed by AI. In a real wardrobe, this would be
            30-100+ pieces — each tagged, categorized, and ready for outfit generation.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sampleItems.map((item, i) => (
              <div
                key={i}
                className="glass-card p-4 group hover:border-purple-500/30 transition-all duration-300"
              >
                {/* Visual */}
                <div
                  className="aspect-square rounded-xl flex flex-col items-center justify-center gap-2 mb-3 border border-white/5 group-hover:border-purple-500/20 transition-colors"
                  style={{ backgroundColor: item.color }}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-[10px] text-white/60 font-medium">
                    {item.name}
                  </span>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20">
                    {item.tag}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{item.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outfit Generation Demo */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            AI Outfit Generation
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
            Three AI-generated outfits from the sample wardrobe above. Each includes
            color theory explanation and styling reasoning.
          </p>

          <div className="space-y-6">
            {sampleOutfits.map((outfit, oi) => (
              <div key={oi} className="glass-card p-6 glow-pulse">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{outfit.name}</h3>
                    <p className="text-xs text-gray-500">{outfit.context}</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-green-500/15 text-green-300 border border-green-500/20 w-fit">
                    ✓ AI Generated
                  </span>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                  {outfit.items.map((ii) => {
                    const item = sampleItems[ii];
                    return (
                      <div
                        key={ii}
                        className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border border-white/5"
                        style={{ backgroundColor: item.color }}
                      >
                        <span className="text-lg">{item.emoji}</span>
                        <span className="text-[9px] text-white/70 text-center leading-tight px-1">
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reasoning */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/5 space-y-2">
                  <p className="text-sm text-gray-400 italic">
                    &ldquo;{outfit.reasoning}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-purple-400">🎨 Color Theory:</span>
                    <span className="text-xs text-gray-500">{outfit.colorTheory}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gap Analysis Preview */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Gap Analysis Preview
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
            The AI scans the wardrobe and identifies missing pieces ranked by impact.
            Each suggestion shows how many new outfits it would unlock.
          </p>

          <div className="glass-card p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-400">Wardrobe Score</span>
              <span className="text-2xl font-bold text-yellow-400">72/100</span>
            </div>

            <div className="w-full h-2 bg-white/5 rounded-full mb-8 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                style={{ width: "72%" }}
              />
            </div>

            <h3 className="font-semibold mb-4">Recommended Additions</h3>
            <div className="space-y-3">
              {gaps.map((gap, gi) => (
                <div
                  key={gi}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                >
                  <span className="text-lg">{gap.icon}</span>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{gap.item}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        gap.priority === "Critical"
                          ? "bg-red-500/15 text-red-300 border border-red-500/20"
                          : gap.priority === "High"
                          ? "bg-orange-500/15 text-orange-300 border border-orange-500/20"
                          : "bg-yellow-500/15 text-yellow-300 border border-yellow-500/20"
                      }`}>
                        {gap.priority} Priority
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-300 border border-green-500/20">
                        {gap.combos}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{gap.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Planner Preview */}
      <section className="px-6 py-16 bg-gradient-to-b from-transparent via-indigo-900/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">
            Weekly Planner Preview
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
            Auto-generated 5-day outfit schedule with weather-aware selections.
            Tap any day to regenerate.
          </p>

          <div className="grid grid-cols-5 gap-3">
            {weekDays.map((wd, wi) => (
              <div
                key={wi}
                className="glass-card p-3 text-center hover:border-purple-500/30 transition-all"
              >
                <div className="text-xs font-mono text-purple-400 mb-2">
                  {wd.day}
                </div>
                <div className="text-[10px] text-gray-500 mb-3">
                  {wd.temp}
                </div>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {wd.items.map((ii) => {
                    const item = sampleItems[ii];
                    return (
                      <div
                        key={ii}
                        className="aspect-square rounded-lg flex items-center justify-center text-xs border border-white/5"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.emoji}
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 line-clamp-1">
                  {wd.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Recap */}
      <section id="how-it-works" className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            How Clad Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Upload Your Clothes",
                desc: "Photograph each piece of clothing. Batch upload up to 20 at once. GPT-4o Vision analyzes type, color, material, occasions, and formality — automatically.",
                icon: "📸",
              },
              {
                step: "02",
                title: "AI Generates Outfits",
                desc: "Get 3-5 styled combinations based on weather, occasion, mood, and what you own. Color theory engine ensures harmony. Every outfit includes AI reasoning.",
                icon: "✨",
              },
              {
                step: "03",
                title: "Look Great Every Day",
                desc: "Weekly planner auto-schedules your outfits. Gap analysis reveals what to buy next. Pre-purchase scanner stops bad decisions. Your closet, upgraded.",
                icon: "🔥",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="glass-card p-6 sm:p-8 relative group hover:border-purple-500/30 transition-all duration-300"
              >
                <span className="text-5xl mb-4 block">{step.icon}</span>
                <span className="text-xs font-mono text-purple-400 tracking-wider uppercase mb-2 block">
                  Step {step.step}
                </span>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-purple-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, fi) => (
              <details
                key={fi}
                className="glass-card p-5 group cursor-pointer hover:border-purple-500/20 transition-all"
              >
                <summary className="font-medium text-sm list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-gray-500 group-open:rotate-45 transition-transform text-lg ml-2 shrink-0">
                    +
                  </span>
                </summary>
                <p className="text-sm text-gray-400 mt-3 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 px-2">
          Like What You See? Build Your Own.
        </h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          This demo used 12 sample items. Imagine what Clad does with your entire
          wardrobe.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/upload" className="btn-primary text-lg px-10 py-4 inline-block">
            Start Free — Upload Your Wardrobe →
          </a>
          <a href="/blog" className="btn-secondary text-lg px-8 py-4 inline-block">
            Read the Blog
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} Clad. Built with ❤️ and GPT-4o.</p>
      </footer>
    </main>
  );
}
