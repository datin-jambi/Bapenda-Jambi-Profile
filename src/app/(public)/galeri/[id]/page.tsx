import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Images } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({ where: { id: parseInt(id, 10) } });
  if (!gallery) return { title: "Tidak Ditemukan" };
  return { title: gallery.title, description: gallery.description || undefined };
}

export default async function GalleryDetailPage({ params }: Props) {
  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({
    where: { id: parseInt(id, 10), status: "PUBLISHED" },
    include: { items: { where: { deletedAt: null }, orderBy: { sortOrder: "asc" } }, author: { select: { name: true } } },
  });

  if (!gallery) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/galeri" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Galeri
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold font-poppins text-primary mb-2">{gallery.title}</h1>
      {gallery.description && <p className="text-gray-500 mb-6">{gallery.description}</p>}

      {gallery.items.length === 0 ? (
        <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-3">
          <Images className="h-12 w-12 text-gray-200" />
          <p>Belum ada item dalam galeri ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.items.map((item) => (
            <a key={item.id} href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 block">
              {item.mediaType === "IMAGE" ? (
                <Image src={item.fileUrl} alt={item.title || gallery.title} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                  <Images className="h-10 w-10 text-primary/40" />
                </div>
              )}
              {item.title && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                  <p className="text-white text-xs font-medium p-3 translate-y-4 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100">
                    {item.title}
                  </p>
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
