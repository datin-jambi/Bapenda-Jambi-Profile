import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { GalleryLightbox } from "./gallery-lightbox";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({ where: { id: parseInt(id, 10) } });
  if (!gallery) return { title: "Tidak Ditemukan" };
  return {
    title: gallery.title,
    description: gallery.description || `Galeri foto kegiatan BAPENDA Provinsi Jambi — ${gallery.title}`,
    openGraph: {
      title: gallery.title,
      description: gallery.description || undefined,
      images: gallery.coverImage ? [gallery.coverImage] : [],
    },
  };
}

export default async function GalleryDetailPage({ params }: Props) {
  const { id } = await params;
  const gallery = await prisma.gallery.findUnique({
    where: { id: parseInt(id, 10), status: "PUBLISHED" },
    include: {
      items: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
      },
    },
  }).catch(() => null);

  if (!gallery) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/galeri"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Galeri
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold font-poppins text-primary mb-2">
        {gallery.title}
      </h1>
      {gallery.description && (
        <p className="text-gray-500 mb-2">{gallery.description}</p>
      )}
      <p className="text-sm text-muted-foreground mb-8">
        {gallery.items.length} foto
      </p>

      <GalleryLightbox items={gallery.items} galleryTitle={gallery.title} />
    </div>
  );
}
