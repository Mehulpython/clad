"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/wardrobe", label: "Wardrobe", emoji: "👔" },
  { href: "/generate", label: "Generate", emoji: "✨" },
  { href: "/outfits", label: "Outfits", emoji: "👗" },
  { href: "/planner", label: "Planner", emoji: "📅" },
  { href: "/shop", label: "Shop", emoji: "🛍️" },
  { href: "/scan", label: "Scan", emoji: "🔍" },
  { href: "/gap-analysis", label: "Gaps", emoji: "📊" },
  { href: "/stats", label: "Stats", emoji: "📈" },
  { href: "/settings", label: "Settings", emoji: "⚙️" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/10 px-4 py-2 md:static md:border-b md:border-t-0 md:px-6 md:py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold shrink-0 mr-4"
        >
          ⚡ <span className="text-[#e879f9]">Clad</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "px-3 py-2 rounded-lg text-sm font-medium transition-all " +
                  (isActive
                    ? "bg-[#e879f9]/15 text-[#e879f9]"
                    : "text-gray-400 hover:text-white hover:bg-white/5")
                }
              >
                {item.emoji} {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Nav — scrollable horizontal */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {NAV_ITEMS.slice(0, 7).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all " +
                  (isActive
                    ? "bg-[#e879f9]/15 text-[#e879f9]"
                    : "text-gray-400 hover:text-white")
                }
              >
                {item.emoji}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
