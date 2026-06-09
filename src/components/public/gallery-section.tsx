import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FallbackImage } from "@/components/ui/fallback-image";
import { ArrowRight, Images } from "lucide-react";

interface GalleryItem {
  id: number;
  title: string;
  coverImage?: string | null;
  _count: { items: number };
}

export function GallerySection({ galleries }: { galleries: GalleryItem[] }) {
  if (!galleries.length) return null;

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-poppins text-primary">Galeri</h2>
            <p className="text-gray-500 mt-1">Dokumentasi kegiatan BAPENDA Provinsi Jambi</p>
          </div>
          <Button variant="warning" asChild className="hidden sm:flex text-gray-800">
            <Link href="/galeri">Lihat Semua <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((g) => (
            <Link key={g.id} href={`/galeri/${g.id}`} className="group block">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200">
                <FallbackImage src={g.coverImage} alt={g.title} fallback="gallery" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-medium text-sm">{g.title}</p>
                  <p className="text-white/70 text-xs">{g._count.items} foto</p>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors text-sm">{g.title}</h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Images className="h-3 w-3" />{g._count.items} item
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Button variant="warning" className="text-gray-800" asChild>
            <Link href="/galeri">Lihat Semua Galeri <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
