"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FallbackImage } from "@/components/ui/fallback-image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Images, Search, X } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";

type GalleryItem = {
  id: number;
  title: string;
  description: string | null;
  coverImage: string | null;
  createdAt: string;
  _count: { items: number };
};

type GalleryResponse = {
  data: GalleryItem[];
  meta: { page: number; limit: number; totalItems: number; totalPages: number };
};

const LIMIT = 12;

export default function GaleriClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));

  const debouncedSearch = useDebounce(searchInput, 2000);
  const isSearching = searchInput !== debouncedSearch;

  const pushParams = useCallback(
    (overrides: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(overrides).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  useEffect(() => {
    pushParams({ search: debouncedSearch, page: "1" });
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isLoading } = useQuery<GalleryResponse>({
    queryKey: ["public-galleries", page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(LIMIT));
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/galleries?${params.toString()}`);
      if (!res.ok) throw new Error("Gagal memuat galeri");
      return res.json();
    },
  });

  const galleries = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 1;

  function handlePageChange(p: number) {
    setPage(p);
    pushParams({ page: String(p), search: debouncedSearch });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-poppins text-primary">Galeri</h1>
        <p className="text-gray-500 mt-2">Dokumentasi kegiatan BAPENDA Provinsi Jambi</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari galeri..."
          className="pl-9 pr-9"
        />
        {isSearching ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
            Mencari...
          </span>
        ) : searchInput ? (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setSearchInput("")}
          >
            <X className="h-3 w-3" />
          </Button>
        ) : null}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center gap-3">
          <Images className="h-14 w-14 text-gray-200" />
          <p>
            {debouncedSearch
              ? `Tidak ada galeri untuk "${debouncedSearch}"`
              : "Belum ada galeri"}
          </p>
          {debouncedSearch && (
            <Button variant="outline" size="sm" onClick={() => setSearchInput("")}>
              Hapus Pencarian
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((g) => (
              <Link key={g.id} href={`/galeri/${g.id}`} className="group block">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                  <FallbackImage
                    src={g.coverImage}
                    alt={g.title}
                    fallback="gallery"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Images className="h-3 w-3" />
                    {g._count.items}
                  </div>
                </div>
                <div className="mt-3">
                  <h2 className="font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                    {g.title}
                  </h2>
                  {g.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{g.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Sebelumnya
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
                    ) : (
                      <Button
                        key={p}
                        size="sm"
                        variant={p === page ? "default" : "outline"}
                        className="w-8 h-8 p-0"
                        onClick={() => handlePageChange(p as number)}
                      >
                        {p}
                      </Button>
                    )
                  )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Berikutnya
              </Button>
            </div>
          )}

          {meta && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Menampilkan {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, meta.totalItems)} dari {meta.totalItems} galeri
            </p>
          )}
        </>
      )}
    </div>
  );
}
