import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let news: { slug: string; updatedAt: Date }[] = [];
  let galleries: { id: number; updatedAt: Date }[] = [];

  if (process.env.DATABASE_URL) {
    [news, galleries] = await Promise.all([
      prisma.news.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.gallery.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, updatedAt: true },
      }),
    ]);
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/berita`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/galeri`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/regulasi`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/kontak`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/profil/sejarah`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/profil/visi-misi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/profil/tupoksi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/profil/struktur-organisasi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/profil/pejabat`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const newsPages: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${BASE_URL}/berita/${n.slug}`,
    lastModified: n.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const galleryPages: MetadataRoute.Sitemap = galleries.map((g) => ({
    url: `${BASE_URL}/galeri/${g.id}`,
    lastModified: g.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...newsPages, ...galleryPages];
}
