import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { FallbackImage } from "@/components/ui/fallback-image";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Berita",
  description: "Berita dan informasi terbaru dari BAPENDA Provinsi Jambi",
};

export default async function BeritaPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string }> }) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1"));
  const limit = 9;
  const skip = (page - 1) * limit;

  const where = {
    status: "PUBLISHED" as const,
    deletedAt: null,
    ...(resolvedParams.category && { category: { slug: resolvedParams.category } }),
  };

  const [news, total, categories] = await Promise.all([
    prisma.news.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: { category: { select: { name: true, slug: true } }, author: { select: { name: true } } },
    }),
    prisma.news.count({ where }),
    prisma.newsCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-poppins text-primary">Berita</h1>
        <p className="text-gray-500 mt-2">Informasi dan berita terbaru dari BAPENDA Provinsi Jambi</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/berita">
          <Badge variant={!resolvedParams.category ? "default" : "outline"} className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
            Semua
          </Badge>
        </Link>
        {categories.map((cat) => (
          <Link key={cat.id} href={`/berita?category=${cat.slug}`}>
            <Badge variant={resolvedParams.category === cat.slug ? "default" : "outline"} className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
              {cat.name}
            </Badge>
          </Link>
        ))}
      </div>

      {news.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Belum ada berita</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Link key={item.id} href={`/berita/${item.slug}`} className="group bg-white rounded-xl border hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative aspect-[16/9] bg-gray-100">
                <FallbackImage src={item.thumbnailUrl} alt={item.title} fallback="news" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-4">
                <Badge variant="outline" className="text-xs mb-2">{item.category.name}</Badge>
                <h2 className="font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug">{item.title}</h2>
                {item.excerpt && <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.excerpt}</p>}
                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />{formatDate(item.publishedAt || item.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {page > 1 && (
            <Link href={`/berita?page=${page - 1}${resolvedParams.category ? `&category=${resolvedParams.category}` : ""}`}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors">Sebelumnya</Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/berita?page=${p}${resolvedParams.category ? `&category=${resolvedParams.category}` : ""}`}
              className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-colors ${p === page ? "bg-primary text-white" : "border hover:bg-gray-50"}`}>
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={`/berita?page=${page + 1}${resolvedParams.category ? `&category=${resolvedParams.category}` : ""}`}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors">Selanjutnya</Link>
          )}
        </div>
      )}
    </div>
  );
}
