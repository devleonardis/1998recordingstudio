import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost, type Section } from "../posts";
import { BlogCta } from "./blog-cta";

// ─── Static generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

// ─── Section renderer (server) ────────────────────────────────────────────────

function RenderSection({ section }: { section: Section }) {
  switch (section.type) {
    case "h2":
      return (
        <h2
          className="mt-8 text-2xl font-semibold text-white"
          style={{ fontFamily: "var(--font-space)" }}
        >
          {section.text}
        </h2>
      );
    case "h3":
      return <h3 className="mt-6 text-lg font-semibold text-white">{section.text}</h3>;
    case "p":
      return <p className="mt-4 text-base leading-7 text-[#B8ABA2]">{section.text}</p>;
    case "ul":
      return (
        <ul className="mt-4 space-y-2 pl-4">
          {section.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-[#B8ABA2]">
              <span className="text-[#CD7948]">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "highlight":
      return (
        <div className="mt-6 rounded-2xl border border-[#CD7948]/25 bg-[#CD7948]/[0.08] px-5 py-4 text-sm leading-7 text-[#E4E2DB]">
          {section.text}
        </div>
      );
    case "cta":
      return <BlogCta />;
    default:
      return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: "19.98 Recording Studio",
    },
    publisher: {
      "@type": "Organization",
      name: "19.98 Recording Studio",
      url: "https://www.1998recordingstudio.it",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.1998recordingstudio.it/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="pb-20 pt-5 md:pb-24 md:pt-10">
        {/* Breadcrumb */}
        <nav
          className="mb-8 flex items-center gap-2 text-sm text-[#B8ABA2]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <span className="text-[#CD7948]/60">/</span>
          <Link href="/blog" className="hover:text-white">
            Blog
          </Link>
          <span className="text-[#CD7948]/60">/</span>
          <span className="truncate text-[#E4E2DB]">{post.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-10 max-w-3xl">
          <h1
            className="mb-5 text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-space)" }}
          >
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[#B8ABA2]">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span className="text-[#CD7948]/60">·</span>
            <span>{post.readingTime} di lettura</span>
          </div>
        </header>

        {/* Article body */}
        <article className="max-w-3xl">
          {post.sections.map((section, i) => (
            <RenderSection key={i} section={section} />
          ))}
        </article>

        {/* Back link */}
        <div className="mt-14 max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[#B8ABA2] hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Torna al Blog
          </Link>
        </div>
      </main>
    </>
  );
}
