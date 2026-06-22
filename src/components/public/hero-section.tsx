"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FallbackImage } from "@/components/ui/fallback-image";

interface Banner {
  id: number;
  title: string;
  description?: string | null;
  imageUrl: string;
  buttonText?: string | null;
  buttonUrl?: string | null;
}

export function HeroSection({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length]);
  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (!banners.length) {
    return (
      <div className="relative h-[500px] bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">BAPENDA Provinsi Jambi</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">Melayani dengan Profesional, Transparan, dan Akuntabel</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative h-[500px] md:h-[580px] overflow-hidden">
      {banners.map((banner, i) => {
        // Only render current, previous, and next slides — avoid fetching all at once
        const prevIdx = (current - 1 + banners.length) % banners.length;
        const nextIdx = (current + 1) % banners.length;
        const shouldRender = i === current || i === prevIdx || i === nextIdx || i === 0;
        return (
        <div
          key={banner.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <div className="absolute inset-0 bg-primary/60 z-10" />
          {shouldRender && (
          <FallbackImage
            src={banner.imageUrl}
            alt={banner.title}
            fallback="banner"
            fill
            className="object-cover"
            priority={i === 0}
          />
          )}
          <div className="relative z-20 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl">
                <h1 className="text-3xl md:text-5xl font-bold font-poppins text-white mb-4 leading-tight">
                  {banner.title}
                </h1>
                {banner.description && (
                  <p className="text-lg text-white/90 mb-8 leading-relaxed">{banner.description}</p>
                )}
                {banner.buttonText && banner.buttonUrl && (
                  <Button variant="warning" className="text-gray-800" size="lg" asChild>
                    <Link href={banner.buttonUrl}>{banner.buttonText}</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors" aria-label="Previous slide">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors" aria-label="Next slide">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={cn("w-2 h-2 rounded-full transition-all", i === current ? "bg-secondary w-6" : "bg-white/50")} aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
