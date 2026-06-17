"use client";

import { useState } from "react";
import Image from "next/image";
import { FallbackImage } from "@/components/ui/fallback-image";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

type GalleryItemType = {
  id: number;
  fileUrl: string;
  title: string | null;
  mediaType: string;
};

interface Props {
  items: GalleryItemType[];
  galleryTitle: string;
}

export function GalleryLightbox({ items, galleryTitle }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const imageItems = items.filter((i) => i.mediaType === "IMAGE");

  function open(index: number) {
    setActiveIndex(index);
  }

  function close() {
    setActiveIndex(null);
  }

  function prev() {
    setActiveIndex((i) => (i === null || i === 0 ? imageItems.length - 1 : i - 1));
  }

  function next() {
    setActiveIndex((i) => (i === null || i === imageItems.length - 1 ? 0 : i + 1));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-3">
        <Images className="h-12 w-12 text-gray-200" />
        <p>Belum ada item dalam galeri ini</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 block focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => item.mediaType === "IMAGE" && open(index)}
          >
            {item.mediaType === "IMAGE" ? (
              <>
                <FallbackImage
                  src={item.fileUrl}
                  alt={item.title || galleryTitle}
                  fallback="galleryItem"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                {item.title && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-xs font-medium line-clamp-2">{item.title}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                <Images className="h-10 w-10 text-primary/40" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={close}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label="Lightbox galeri"
        >
          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={close}
            aria-label="Tutup"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Prev */}
          {imageItems.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10 h-12 w-12"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full mx-16 aspect-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={imageItems[activeIndex].fileUrl}
                alt={imageItems[activeIndex].title || galleryTitle}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                unoptimized
              />
            </div>
            {imageItems[activeIndex].title && (
              <p className="text-center text-white/80 text-sm mt-3">
                {imageItems[activeIndex].title}
              </p>
            )}
            <p className="text-center text-white/50 text-xs mt-1">
              {activeIndex + 1} / {imageItems.length}
            </p>
          </div>

          {/* Next */}
          {imageItems.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-10 h-12 w-12"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Berikutnya"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </div>
      )}
    </>
  );
}
