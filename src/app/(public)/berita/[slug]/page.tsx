import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FallbackImage } from "@/components/ui/fallback-image";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await prisma.news.findUnique({ where: { slug } });
  if (!news) return { title: "Tidak Ditemukan" };
  return {
    title: news.seoTitle || news.title,
    description: news.seoDescription || news.excerpt || undefined,
    openGraph: { title: news.seoTitle || news.title, description: news.seoDescription || news.excerpt || undefined, images: news.thumbnailUrl ? [news.thumbnailUrl] : [] },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const news = await prisma.news.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      author: { select: { name: true, avatarUrl: true } },
    },
  }).catch(() => null);

  if (!news) notFound();

  const related = await prisma.news.findMany({
    where: { status: "PUBLISHED", categoryId: news.categoryId, NOT: { id: news.id } },
    take: 3,
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, slug: true, thumbnailUrl: true, publishedAt: true, createdAt: true },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <article className="lg:col-span-2">
          <Link href="/berita" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Berita
          </Link>

          <Badge className="bg-secondary text-white mb-3">{news.category.name}</Badge>
          <h1 className="text-2xl md:text-3xl font-bold font-poppins text-gray-900 mb-4 leading-tight">{news.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(news.publishedAt || news.createdAt)}</span>
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{news.author.name}</span>
          </div>

          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-8">
            <FallbackImage src={news.thumbnailUrl} alt={news.title} fallback="news" fill className="object-cover" priority />
          </div>

          <div className="prose-content" dangerouslySetInnerHTML={{ __html: news.content }} />
        </article>

        <aside className="space-y-6">
          {related.length > 0 && (
            <div>
              <h3 className="font-bold text-primary mb-4">Berita Terkait</h3>
              <div className="space-y-4">
                {related.map((r) => (
                  <Link key={r.id} href={`/berita/${r.slug}`} className="flex gap-3 group">
                    <div className="relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <FallbackImage src={r.thumbnailUrl} alt={r.title} fallback="news" fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors line-clamp-2">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(r.publishedAt || r.createdAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
