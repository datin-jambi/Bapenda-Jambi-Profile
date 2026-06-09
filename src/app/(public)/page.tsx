import { prisma } from "@/lib/prisma";
import { settingRepository } from "@/repositories/content.repository";
import { HeroSection } from "@/components/public/hero-section";
import { QuickServicesSection } from "@/components/public/quick-services";
import { LatestNewsSection } from "@/components/public/latest-news";
import { StatisticsSection } from "@/components/public/statistics";
import { GallerySection } from "@/components/public/gallery-section";
import { FaqSection } from "@/components/public/faq-section";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await settingRepository.findAll();
  return {
    title: settings.site_name || "BAPENDA Provinsi Jambi",
    description: settings.site_description || "Website Resmi Badan Pendapatan Daerah Provinsi Jambi",
    keywords: settings.site_keywords,
    openGraph: {
      title: settings.site_name,
      description: settings.site_description,
      type: "website",
    },
  };
}

export default async function HomePage() {
  const [banners, news, galleries, faqs] = await Promise.all([
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.news.findMany({
      where: { status: "PUBLISHED" },
      take: 6,
      orderBy: { publishedAt: "desc" },
      include: { category: { select: { name: true, slug: true } }, author: { select: { name: true } } },
    }),
    prisma.gallery.findMany({
      where: { status: "PUBLISHED" },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    }),
    prisma.faq.findMany({
      where: { isPublished: true },
      take: 5,
      orderBy: [{ viewCount: "desc" }, { sortOrder: "asc" }],
      include: { category: { select: { name: true } } },
    }),
  ]);

  return (
    <>
      <HeroSection banners={banners} />
      <QuickServicesSection />
      <LatestNewsSection news={news} />
      <StatisticsSection />
      <GallerySection galleries={galleries} />
      <FaqSection faqs={faqs} />
    </>
  );
}
