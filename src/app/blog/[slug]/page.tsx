import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getPostBySlug, getAllPostSlugs } from "@/data/blog-posts";
import JsonLd from "@/components/JsonLd";

// ─── Static Params for SSG ──────────────────────────────
export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

// ─── Dynamic Metadata per post ───────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

// ─── Article Schema (JSON-LD) ─────────────────────────────
function getArticleSchema(post: (typeof blogPosts)[0]) {
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://clad.app";
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: `${BASE_URL}/icon-512.png`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Clad",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/icon-512.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${post.slug}`,
    },
  };
}

// ─── Page Component ───────────────────────────────────────
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  // Find related posts (same category, excluding current)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  // Convert HTML content to React nodes via dangerouslySetInnerHTML
  // Content is authored internally — safe to render
  return (
    <main className="min-h-screen px-6 py-12">
      <JsonLd data={getArticleSchema(post)} />

      <article className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#e879f9] transition-colors mb-8"
        >
          ← Back to all articles
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono text-purple-400 tracking-wider uppercase">
              {post.category}
            </span>
            <span className="text-gray-600">·</span>
            <span className="text-xs text-gray-500">{post.readTime}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-gray-400 mb-6">{post.excerpt}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500 pb-8 border-b border-white/5">
            <span>{post.author}</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </div>
        </header>

        {/* Body */}
        <div
          className="prose prose-invert prose-purple max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-5
            prose-h3:text-lg prose-h3:mt-7 prose-h3:mb-3
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-li:text-gray-300
            prose-strong:text-white
            prose-a:text-[#e879f9] prose-a:no-underline hover:prose-a:underline
            prose-table:text-gray-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-white/5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs bg-white/5 text-gray-400 border border-white/10"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="glass-card p-8 mt-10 text-center">
          <h3 className="text-xl font-bold mb-3">
            Want AI to Handle All of This?
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Clad automates wardrobe analysis, outfit generation, weekly planning,
            and smart shopping. Everything in this article — handled for you.
          </p>
          <a
            href="/upload"
            className="btn-primary text-lg px-8 py-3 inline-block"
          >
            Try Clad Free →
          </a>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="glass-card p-4 group hover:border-purple-500/30 transition-all"
                >
                  <span className="text-xs font-mono text-purple-400 uppercase">
                    {rel.category}
                  </span>
                  <h3 className="text-sm font-semibold mt-1 group-hover:text-purple-300 transition-colors line-clamp-2">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2">{rel.readTime}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
