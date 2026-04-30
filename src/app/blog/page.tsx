import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/data/blog-posts";

export const metadata: Metadata = {
  title: "Clad Blog — AI Fashion Tips, Style Guides & Wardrobe Advice",
  description:
    "Expert guides on AI-powered wardrobes, color theory, capsule building, outfit formulas, and sustainable fashion. Level up your style intelligence with Clad.",
  keywords: [
    "AI fashion blog",
    "wardrobe tips",
    "style guide",
    "outfit advice",
    "capsule wardrobe guide",
    "color theory fashion",
    "digital wardrobe",
  ],
  openGraph: {
    title: "Clad Blog — AI Fashion Tips & Style Guides",
    description:
      "Expert guides on AI-powered wardrobes, color theory, capsule building, and more.",
    type: "website",
  },
};

const categories = [...new Set(blogPosts.map((p) => p.category))];

export default function BlogPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
            <span className="text-sm text-gray-400">Style Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            The{" "}
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Clad Blog
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            AI-powered fashion intelligence. From wardrobe fundamentals to advanced
            style theory — practical guides for dressing better with technology.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#e879f9]/15 text-[#e879f9] border border-[#e879f9]/20">
            All Posts
          </span>
          {categories.map((cat) => (
            <span
              key={cat}
              className="px-3 py-1 rounded-full text-xs font-medium text-gray-400 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass-card p-6 group hover:border-purple-500/30 transition-all duration-300 flex flex-col"
            >
              {/* Category badge */}
              <span className="text-xs font-mono text-purple-400 tracking-wider uppercase mb-3">
                {post.category}
              </span>

              {/* Title */}
              <h2 className="text-lg font-semibold mb-2 group-hover:text-purple-300 transition-colors line-clamp-2">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                {post.excerpt}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-gray-600 pt-4 border-t border-white/5">
                <span>{post.readTime}</span>
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 pt-12 border-t border-white/5">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Build Your Smart Wardrobe?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            All the strategies in these articles? Clad automates them for you.
          </p>
          <a href="/upload" className="btn-primary text-lg px-10 py-4 inline-block">
            Get Started Free →
          </a>
        </div>
      </div>
    </main>
  );
}
