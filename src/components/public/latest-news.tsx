import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { FallbackImage } from "@/components/ui/fallback-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  publishedAt?: Date | null;
  createdAt: Date;
  category: { name: string; slug: string };
  author: { name: string };
}

export function LatestNewsSection({ news }: { news: NewsItem[] }) {
  if (!news.length) return null;

  const [featured, ...rest] = news;

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-poppins text-primary">Berita Terbaru</h2>
            <p className="text-gray-500 mt-1">Informasi dan berita terkini dari BAPENDA</p>
          </div>
          <Button variant="warning" asChild className="hidden sm:flex text-gray-800">
            <Link href="/berita">Lihat Semua <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Featured */}
          <div className="lg:col-span-2">
            <Link href={`/berita/${featured.slug}`} className="group block">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
                <FallbackImage src={featured.thumbnailUrl} alt={featured.title} fallback="news" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <Badge variant="info" className="mb-2">{featured.category.name}</Badge>
                  <h3 className="text-white font-bold text-lg leading-snug group-hover:text-secondary transition-colors">
                    {featured.title}
                  </h3>
                  <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(featured.publishedAt || featured.createdAt)}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Side list */}
          <div className="space-y-4">
            {rest.slice(0, 4).map((item) => (
              <Link key={item.id} href={`/berita/${item.slug}`} className="group flex gap-3">
                <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <FallbackImage src={item.thumbnailUrl} alt={item.title} fallback="news" fill className="object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-secondary font-medium">{item.category.name}</p>
                  <h4 className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(item.publishedAt || item.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link href="/berita">Lihat Semua Berita <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
