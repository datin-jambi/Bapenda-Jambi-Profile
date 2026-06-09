"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, TrendingUp, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type FaqCategory = { id: number; name: string; slug: string; description?: string | null };

type FaqItem = {
  id: number;
  question: string;
  answer: string;
  viewCount: number;
  sortOrder: number;
  category: FaqCategory;
};

function FaqAccordionItem({ faq, onOpen }: { faq: FaqItem; onOpen: (id: number) => void }) {
  const [open, setOpen] = useState(false);

  function toggle() {
    if (!open) onOpen(faq.id);
    setOpen((v) => !v);
  }

  return (
    <div className={cn(
      "bg-white rounded-xl border transition-all duration-200",
      open ? "border-primary/30 shadow-md shadow-primary/5" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
    )}>
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className={cn(
          "font-medium text-sm pr-4 leading-relaxed transition-colors",
          open ? "text-primary" : "text-gray-800"
        )}>
          {faq.question}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 flex-shrink-0 transition-transform duration-200",
          open ? "rotate-180 text-primary" : "text-gray-400"
        )} />
      </button>
      <div className={cn(
        "overflow-hidden transition-all duration-200",
        open ? "max-h-[500px]" : "max-h-0"
      )}>
        <div className="px-5 pb-5 border-t border-gray-100 pt-3">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqPageClient({
  initialFaqs,
  categories,
}: {
  initialFaqs: FaqItem[];
  categories: FaqCategory[];
}) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!search.trim()) {
      const filtered = activeCat
        ? initialFaqs.filter((f) => f.category.id === activeCat)
        : initialFaqs;
      setFaqs(filtered);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const params = new URLSearchParams();
      params.set("search", search.trim());
      if (activeCat) params.set("categoryId", String(activeCat));
      const res = await fetch(`/api/public/faqs?${params.toString()}`);
      const json = await res.json();
      setFaqs(json.data ?? []);
      setIsSearching(false);
    }, 500);
  }, [search, activeCat, initialFaqs]);

  function handleCategoryClick(catId: number | null) {
    setActiveCat(catId);
    if (!search.trim()) {
      setFaqs(catId === null ? initialFaqs : initialFaqs.filter((f) => f.category.id === catId));
    }
  }

  function clearSearch() {
    setSearch("");
  }

  async function handleView(id: number) {
    await fetch(`/api/public/faqs/${id}/view`, { method: "POST" }).catch(() => {});
  }

  const mostViewed = [...initialFaqs]
    .sort((a, b) => b.viewCount - a.viewCount)
    .filter((f) => f.viewCount > 0)
    .slice(0, 5);

  const grouped = categories
    .map((cat) => ({ ...cat, items: faqs.filter((f) => f.category.id === cat.id) }))
    .filter((cat) => cat.items.length > 0);

  const hasResults = faqs.length > 0;
  const isFiltered = !!search || activeCat !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero header */}
      <div className="bg-primary text-white py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Pusat Bantuan</p>
          <h1 className="text-3xl md:text-4xl font-bold font-poppins">
            Ada yang bisa kami bantu?
          </h1>
          <p className="text-white/80 text-sm">
            Temukan jawaban atas pertanyaan seputar layanan pajak daerah BAPENDA Provinsi Jambi
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari pertanyaan atau kata kunci..."
              className="pl-12 pr-12 h-12 text-base rounded-xl bg-white text-gray-800 shadow-lg border-0 focus-visible:ring-2 focus-visible:ring-white/50"
            />
            {search && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isSearching && (
              <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
                Mencari...
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Category Filter */}
        {!search && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryClick(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                activeCat === null
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
              )}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                  activeCat === cat.id
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Results count when searching */}
        {isFiltered && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {hasResults
                ? `${faqs.length} FAQ ditemukan${search ? ` untuk "${search}"` : ""}`
                : `Tidak ada FAQ ditemukan${search ? ` untuk "${search}"` : ""}`}
            </p>
            {isFiltered && (
              <button
                onClick={() => { clearSearch(); handleCategoryClick(null); }}
                className="text-xs text-primary hover:underline"
              >
                Reset filter
              </button>
            )}
          </div>
        )}

        {/* Empty state */}
        {!hasResults && (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Tidak ada FAQ yang ditemukan</p>
            <p className="text-sm mt-1">Coba kata kunci yang berbeda atau pilih kategori lain</p>
          </div>
        )}

        {/* FAQ list — search mode: flat list */}
        {hasResults && search && (
          <div className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.id}>
                <FaqAccordionItem faq={faq} onOpen={handleView} />
                <div className="mt-1 ml-1">
                  <Badge variant="outline" className="text-xs">{faq.category.name}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAQ list — browse mode: grouped by category */}
        {hasResults && !search && (
          <div className="space-y-10">
            {grouped.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-base font-bold text-primary">{cat.name}</h2>
                  <div className="flex-1 h-px bg-primary/10" />
                  <span className="text-xs text-muted-foreground">{cat.items.length} pertanyaan</span>
                </div>
                <div className="space-y-3">
                  {cat.items.map((faq) => (
                    <FaqAccordionItem key={faq.id} faq={faq} onOpen={handleView} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Most Viewed — only show when not searching */}
        {!search && mostViewed.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <h2 className="text-base font-bold text-gray-800">FAQ Paling Banyak Dilihat</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {mostViewed.map((faq, idx) => (
                <div key={faq.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-relaxed">{faq.question}</p>
                    <Badge variant="outline" className="mt-1 text-xs">{faq.category.name}</Badge>
                  </div>
                  <span className="flex-shrink-0 text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                    {faq.viewCount.toLocaleString("id-ID")}x dilihat
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
