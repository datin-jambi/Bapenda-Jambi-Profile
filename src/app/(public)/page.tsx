"use client";

import { useEffect, useState } from "react";
import { HeroSection } from "@/components/public/hero-section";
import { QuickServicesSection } from "@/components/public/quick-services";
import { LatestNewsSection } from "@/components/public/latest-news";
import { StatisticsSection } from "@/components/public/statistics";
import { GallerySection } from "@/components/public/gallery-section";
import { FaqSection } from "@/components/public/faq-section";

interface Banner {
  id: number;
  title: string;
  description?: string | null;
  imageUrl: string;
  buttonText?: string | null;
  buttonUrl?: string | null;
}

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnailUrl?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  category: { name: string; slug: string };
  author: { name: string };
}

interface GalleryItem {
  id: number;
  title: string;
  coverImage?: string | null;
  _count: { items: number };
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
  viewCount: number;
  category: { name: string } | null;
}

async function fetchJson<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  useEffect(() => {
    const base = window.location.origin;
    Promise.all([
      fetchJson<Banner>(`${base}/api/public/banners`),
      fetchJson<NewsItem>(`${base}/api/public/news?limit=6`),
      fetchJson<GalleryItem>(`${base}/api/public/galleries?limit=6`),
      fetchJson<FaqItem>(`${base}/api/public/faqs`),
    ]).then(([b, n, g, f]) => {
      setBanners(b);
      setNews(n);
      setGalleries(g);
      setFaqs(f);
    });
  }, []);

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
