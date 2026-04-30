import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Style Guides & Fashion Resources — Clad",
  description:
    "Free fashion resources: color theory cheat sheet, body type style guide, occasion dressing reference, seasonal essentials, material care guide, and wardrobe statistics.",
  keywords: [
    "color theory cheat sheet",
    "body type style guide",
    "occasion dressing guide",
    "seasonal wardrobe essentials",
    "fabric care guide",
    "fashion statistics",
  ],
  openGraph: {
    title: "Free Style Guides & Fashion Resources — Clad",
    description:
      "Color theory, body type guides, occasion dressing, seasonal checklists — all free.",
    type: "website",
  },
};

// ─── Color Theory Data ─────────────────────────────────────
const complementaryPairs = [
  { a: "#e53935", b: "#42a5f5", name: "Red ↔ Blue" },
  { a: "#43a047", b: "#ab47bc", name: "Green ↔ Purple" },
  { a: "#fb8c00", b: "#1e88e5", name: "Orange ↔ Blue" },
  { a: "#8e24aa", b: "#7cb342", name: "Violet ↔ Lime" },
  { a: "#e53935", name: "Red ↔ Teal", b: "#26a69a" },
  { a: "#1e88e5", b: "#fdd835", name: "Blue ↔ Yellow" },
];

const analogousTrios = [
  { colors: ["#1565c0", "#42a5f5", "#90caf9"], name: "Ocean Blues" },
  { colors: ["#2e7d32", "#66bb6a", "#a5d6a7"], name: "Forest Greens" },
  { colors: ["#c62828", "#ef5350", "#ef9a9a"], name: "Warm Reds" },
  { colors: ['#f9a825', '#fdd835', '#fff176'], name: "Sunny Yellows" },
];

// ─── Body Type Guide ──────────────────────────────────────
const bodyTypes = [
  {
    type: "Slim",
    works: ["Fitted cuts that follow your natural line", "Layering to add visual bulk", "Structured pieces (blazers with padding)", "Turtlenecks and crewnecks (add upper-body mass impression"],
    avoid: ["Oversized silhouettes (swallow you)", "Skinny jeans without layers (emphasizes thinness)", "Vertical stripes head-to-toe (over-elongates)"],
  },
  {
    type: "Athletic",
    works: ["Slim-straight and tapered fits (show shape)", "V-neck shirts (balance broad shoulders)", "Raw/selvedge denim (complements muscular build)", "Fitted blazers (follows natural taper)"],
    avoid: ["Too-tight clothing (looks like compression gear)", "Boxy/oversized tops (hides your physique)", "Double-breasted suits (adds unnecessary bulk)"],
  },
  {
    type: "Average",
    works: ["Classic straight-leg cuts", "Regular-fit everything (most versatile)", "Smart casual is your sweet spot", "Earth tones and neutrals (universally flattering)"],
    avoid: ["Extreme trends (works better on distinct body types)", "Ill-fitting 'safe' sizes (fit matters more than cut)"],
  },
  {
    type: "Broad",
    works: ["Darker colors on areas you want to minimize", "V-necks (elongate face, draw eye down)", "Structured shoulders (create clean lines)", "Monochromatic looks (streamlined silhouette)"],
    avoid: ["Horizontal stripes across chest/torso", "Bulky fabrics (adds volume)", "Turtlenecks (can shorten neck appearance)"],
  },
  {
    type: "Plus-Size",
    works: ["Structured garments (define shape vs. hiding it)", "Vertical lines and seams (elongate)", "High-quality fabrics (drape better)", "Bold accessories (draw attention upward)", "Single-color outfits (streamlining effect)"],
    avoid: ["Super-skinny anything (uncomfortable + unflattering)", "Cheap, stiff fabrics (don't drape well)", "Multiple bold patterns in one outfit"],
  },
];

// ─── Occasion Guide ───────────────────────────────────────
const occasions = [
  { occasion: "Casual", formality: "1-2", keyPieces: "Jeans, t-shirts, sneakers", colors: "Anything goes", tip: "Fit is more important than brand. Well-fitted basics > expensive trendy items." },
  { occasion: "Work (Business Casual)", formality: "3", keyPieces: "Chinos, button-ups, blazer optional, loafers", colors: "Navy, gray, white, brown, pastels", tip: "One structured piece elevates any outfit. A blazer or even a nice sweater changes everything." },
  { occasion: "Party / Night Out", formality: "2-4", keyPieces: "Statement top or jacket, dark bottoms, boots or stylish shoes", colors: "Dark base + bold accent (red, metallic, neon)", tip: "Pick ONE statement element. Don't compete with yourself." },
  { occasion: "Date Night", formality: "3", keyPieces: "Dark sweater or nice shirt, well-fitted pants, leather shoes/boots", colors: "Dark neutrals (navy, black, charcoal) + warm accent", tip: "Look effortful but not overdone. Grooming matters as much as clothes here." },
  { occasion: "Gym / Athletic", formality: "1", keyPieces: "Moisture-wicking top, athletic shorts/leggings, proper trainers", colors: "Dark colors (hide sweat), bright accents for energy", tip: "Invest in good shoes and socks. Everything else is secondary to performance." },
  { occasion: "Formal (Black Tie Optional)", formality: "5", keyPieces: "Suit (dark navy or black), dress shirt, silk tie, polished oxfords", colors: "Navy, black, white, burgundy accents", tip: "Get the suit tailored. Off-the-rack never fits perfectly, and it shows." },
  { occasion: "Outdoor / Active", formality: "1-2", keyPieces: "Layers, durable bottoms, appropriate footwear, weather-ready outerwear", colors: "Earth tones (practical + hide dirt)", tip: "Check weather before dressing. The right outerwear makes or breaks outdoor comfort." },
  { occasion: "Travel", formality: "2-3", keyPieces: "Comfortable but presentable, layers, wrinkle-resistant fabrics", colors: "Neutrals base (mix & match easily)", tip: "Roll don't fold. Pack 3 bottoms + 5 tops = 15+ outfit combos in a carry-on." },
  { occasion: "Brunch / Day Social", formality: "2", keyPieces: "Polo or casual button-up, chinos or nice shorts, clean sneakers or loafers", colors: "Light, fresh colors (white, light blue, tan, pastels)", tip: "The European formula: look like you didn't try, but make sure every piece is quality." },
  { occasion: "Interview", formality: "4", keyPieces: "Suit or blazer + trousers, crisp dress shirt, conservative tie (optional), polished dress shoes", colors: "Navy, charcoal, white, subtle patterns only", tip: "One step above the company's daily norm. Research the culture beforehand." },
  { occasion: "Concert", formality: "1-3", keyPieces: "Band tee or graphic top, jeans or dark pants, comfortable boots/sneakers", colors: "Dark base, concert-appropriate accent", tip: "Comfort > style. You'll be standing for hours. Break in those shoes first." },
];

// ─── Seasonal Essentials ───────────────────────────────────
const seasons = [
  {
    season: "🌸 Spring",
    items: [
      "Light denim or colored chinos (2 pairs)",
      "Cotton Oxford shirts (light blue, white, pink)",
      "Lightweight knit sweater or cardigan (1-2)",
      "Transitional jacket: trench coat or field jacket (1)",
      "Clean white sneakers (1 pair)",
      "Loafers or canvas shoes (1 pair)",
      "Light scarf for breezy days (1)",
      "Rain jacket or umbrella (1)",
    ],
  },
  {
    season: "☀️ Summer",
    items: [
      "Linen or cotton shorts (2 pairs)",
      "Linen or seersucker button-up shirts (2-3)",
      "Quality polo shirts (2-3)",
      "T-shirts in solid colors, high quality (3-4)",
      "Canvas sneakers or sandals (2 pairs)",
      "Lightweight sunglasses (1 pair)",
      "Canvas tote or crossbody bag (1)",
      "Swimwear (as needed)",
    ],
  },
  {
    season: "🍂 Fall",
    items: [
      "Dark wash jeans (2 pairs: slim + straight)",
      "Flannel or overshirt (1-2)",
      "Medium-weight sweaters (crewneck, v-neck) (2-3)",
      "Quilted vest or gilet (1)",
      "Boots: Chelsea or chukka (1 pair)",
      "Light jacket: bomber or Harrington (1)",
      "Heavier transitional coat (1)",
      "Beanie or lightweight hat (1)",
    ],
  },
  {
    season: "❄️ Winter",
    items: [
      "Wool trousers (at least 1 pair, dark color)",
      "Heavy sweaters: cable-knit, shawl-collar (2-3)",
      "Thermal or merino base layer tops (2)",
      "Proper overcoat: wool peacoat or topcoat (1)",
      "Insulated boots or sturdy leather boots (1-2 pairs)",
      "Leather gloves (1 pair)",
      "Scarf: wool or cashmere (1-2)",
      "Warm hat: beanie or fedora (1)",
    ],
  },
];

// ─── Material Care Guide ───────────────────────────────────
const materials = [
  { material: "Cotton", care: "Easy", machineWash: "✅ Yes", special: "Shrinks — wash cold, tumble dry low. Iron while damp for best results." },
  { material: "Linen", care: "Moderate", machineWash: "✅ Gentle", special: "Wrinkles are part of its charm. Wash cold, air dry. Don't over-iron." },
  { material: "Denim", care: "Easy", machineWash: "✅ Yes", special: "Wash inside out to preserve color. Don't over-wash — spot clean when possible. Air dry to prevent fading." },
  { material: "Wool", care: "Delicate", machineWash: "❌ No (usually)", special: "Dry clean or hand wash cold. Lay flat to dry. Use cedar to prevent moths. Store folded, not hung." },
  { material: "Cashmere", care: "Very Delicate", machineWash: "❌ No", special: "Hand wash cold with gentle detergent. Roll in towel (don't wring). Lay flat. Store folded with cedar." },
  { material: "Silk", care: "Delicate", machineWash: "❌ No", special: "Dry clean recommended. If hand washing: cold water, mild detergent, don't wring. Iron on low with a cloth barrier." },
  { material: "Leather (Genuine)", care: "Specialist", machineWash: "❌ Never", special: "Professional cleaning only. Condition every 6 months. Store with shoe trees. Keep away from water." },
  { material: "Polyester / Synthetic", care: "Easy", machineWash: "✅ Yes", special: "Machine washable and wrinkle-resistant. Low ironing needed. Less breathable — avoid in hot weather." },
  { material: "Velvet", care: "Delicate", machineWash: "❌ No", special: "Dry clean recommended. Steam to remove wrinkles (never iron directly). Brush gently to restore pile direction." },
  { material: "Corduroy", care: "Easy-Moderate", machineWash: "✅ Yes", special: "Wash inside out to protect ridges. Air dry to prevent shrinkage. Iron on low while damp, with ridges aligned." },
];

// ─── Wardrobe Statistics ───────────────────────────────────
const stats = [
  { stat: "80/20", context: "Average person wears 20% of their clothes 80% of the time" },
  { stat: "92M tons", context: "Textile waste generated globally each year" },
  { stat: "7-10 wears", context: "Average times a garment is worn before being discarded" },
  { stat: "$1,900/year", context: "Average annual clothing spend per American adult" },
  { stat: "85 items", context: "Average number of items in a person's wardrobe" },
  { stat: "12-18 orphans", context: "Average orphan pieces (items that combine with ≤3 others) per wardrobe" },
  { stat: "45-75 hrs/yr", context: "Time spent annually on daily outfit decisions" },
  { stat: "2,700 gal", context: "Water needed to produce ONE cotton t-shirt" },
];

export default function ResourcesPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
            <span className="text-sm text-gray-400">100% Free</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Style{" "}
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Guides
            </span>{" "}
            & Resources
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Practical fashion knowledge you can use right now. Color theory, body
            types, occasion dressing, seasonal checklists, fabric care — all in one
            place.
          </p>
        </div>

        {/* Color Theory Cheat Sheet */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">🎨 Color Theory Cheat Sheet</h2>
          <p className="text-gray-400 text-sm mb-6">
            Understanding color harmony is the fastest way to improve your outfits.
            Here are the combinations that always work.
          </p>

          <div className="glass-card p-6 sm:p-8 mb-6">
            <h3 className="font-semibold mb-4 text-purple-300">
              Complementary Pairs (Opposites Attract)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Colors opposite on the wheel create maximum contrast and energy. Best when
              one color dominates and the other accents.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {complementaryPairs.map((pair, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div
                    className="w-10 h-10 rounded-lg shrink-0 border border-white/10"
                    style={{ backgroundColor: pair.a }}
                  />
                  <span className="text-xs text-gray-400">↔</span>
                  <div
                    className="w-10 h-10 rounded-lg shrink-0 border border-white/10"
                    style={{ backgroundColor: pair.b }}
                  />
                  <span className="text-sm font-medium">{pair.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 sm:p-8">
            <h3 className="font-semibold mb-4 text-blue-300">
              Analogous Trios (Neighbors Blend)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Adjacent colors on the wheel create harmonious, calming palettes. Safe,
              cohesive, and hard to mess up.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {analogousTrios.map((trio, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <p className="text-sm font-medium mb-3">{trio.name}</p>
                  <div className="flex gap-2">
                    {trio.colors.map((color, ci) => (
                      <div
                        key={ci}
                        className="w-10 h-10 rounded-lg border border-white/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Body Type Guide */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">👤 Body Type Style Guide</h2>
          <p className="text-gray-400 text-sm mb-6">
            Dressing for your body type isn&apos;t about limitations — it&apos;s about knowing what
            works and owning it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bodyTypes.map((bt) => (
              <div key={bt.type} className="glass-card p-5">
                <h3 className="font-bold text-lg mb-3 text-purple-300">
                  {bt.type}
                </h3>
                <div className="mb-3">
                  <p className="text-xs font-medium text-green-400 mb-1">
                    ✅ Works For You
                  </p>
                  <ul className="space-y-1">
                    {bt.works.map((w) => (
                      <li key={w} className="text-xs text-gray-400 flex gap-1">
                        <span className="shrink-0">·</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-red-400 mb-1">
                    ❌ Avoid
                  </p>
                  <ul className="space-y-1">
                    {bt.avoid.map((a) => (
                      <li key={a} className="text-xs text-gray-400 flex gap-1">
                        <span className="shrink-0">·</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Occasion Dressing Guide */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">📋 Occasion Dressing Quick Reference</h2>
          <p className="text-gray-400 text-sm mb-6">
            The right outfit for every situation. Bookmark this table.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full glass-card overflow-hidden">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-semibold">Occasion</th>
                  <th className="text-left p-4 text-sm font-semibold">Formality</th>
                  <th className="text-left p-4 text-sm font-semibold hidden sm:table-cell">Key Pieces</th>
                  <th className="text-left p-4 text-sm font-semibold hidden md:table-cell">Colors</th>
                  <th className="text-left p-4 text-sm font-semibold hidden lg:table-cell">Pro Tip</th>
                </tr>
              </thead>
              <tbody>
                {occasions.map((occ, oi) => (
                  <tr
                    key={oi}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 text-sm font-medium">{occ.occasion}</td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-gray-400">
                        {occ.formality}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400 hidden sm:table-cell">
                      {occ.keyPieces}
                    </td>
                    <td className="p-4 text-xs text-gray-400 hidden md:table-cell">
                      {occ.colors}
                    </td>
                    <td className="p-4 text-xs text-gray-500 hidden lg:table-cell max-w-[200px]">
                      {occ.tip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Seasonal Essentials */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">🗓️ Seasonal Essentials Checklist</h2>
          <p className="text-gray-400 text-sm mb-6">
            The core pieces you need for each season. Build gradually — you don&apos;t need
            everything at once.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {seasons.map((season) => (
              <div key={season.season} className="glass-card p-5">
                <h3 className="font-bold text-lg mb-4">{season.season}</h3>
                <ul className="space-y-2">
                  {season.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-gray-300"
                    >
                      <span className="text-green-400 mt-0.5 shrink-0">☑️</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Material Care Guide */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">🧵 Material Care Guide</h2>
          <p className="text-gray-400 text-sm mb-6">
            Make your clothes last longer. Proper care extends garment life by years.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full glass-card overflow-hidden">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-semibold">Material</th>
                  <th className="text-left p-4 text-sm font-semibold">Care Level</th>
                  <th className="text-left p-4 text-sm font-semibold">Machine Wash?</th>
                  <th className="text-left p-4 text-sm font-semibold hidden sm:table-cell">Special Instructions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((mat, mi) => (
                  <tr
                    key={mi}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 text-sm font-medium">{mat.material}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          mat.care === "Easy"
                            ? "bg-green-500/15 text-green-300"
                            : mat.care === "Easy-Moderate"
                            ? "bg-yellow-500/15 text-yellow-300"
                            : mat.care === "Moderate"
                            ? "bg-orange-500/15 text-orange-300"
                            : "bg-red-500/15 text-red-300"
                        }`}
                      >
                        {mat.care}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{mat.machineWash}</td>
                    <td className="p-4 text-xs text-gray-400 hidden sm:table-cell max-w-[280px]">
                      {mat.special}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Wardrobe Statistics */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">📊 Wardrobe Statistics That Matter</h2>
          <p className="text-gray-400 text-sm mb-6">
            Numbers that explain why a digital wardrobe changes everything.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((st, si) => (
              <div
                key={si}
                className="glass-card p-4 text-center hover:border-purple-500/20 transition-all"
              >
                <p className="text-xl sm:text-2xl font-bold text-purple-400 mb-1">
                  {st.stat}
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {st.context}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-white/5">
          <h2 className="text-2xl font-bold mb-4">
            Want AI to Apply All of This Automatically?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Clad uses color theory, occasion matching, weather data, and garment analysis
            to generate perfect outfits from your actual wardrobe.
          </p>
          <a href="/upload" className="btn-primary text-lg px-10 py-4 inline-block">
            Try Clad Free →
          </a>
        </div>
      </div>
    </main>
  );
}
