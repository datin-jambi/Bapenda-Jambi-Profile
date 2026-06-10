"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { FileText, Download, Eye, Search } from "lucide-react";
import { PdfPreviewDialog } from "@/components/cms/pdf-preview-dialog";

type Regulation = {
  id: number;
  title: string;
  description: string | null;
  fileUrl: string;
  publishedAt: Date | string | null;
};

interface RegulasiClientProps {
  regulations: Regulation[];
  total: number;
  page: number;
  totalPages: number;
  search?: string;
}

export function RegulasiClient({ regulations, total, page, totalPages, search }: RegulasiClientProps) {
  const [previewItem, setPreviewItem] = useState<Regulation | null>(null);

  return (
    <>
      {/* Search */}
      <form method="get" className="mb-8 flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Cari regulasi..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
        >
          Cari
        </button>
        {search && (
          <a
            href="/regulasi"
            className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </a>
        )}
      </form>

      {/* Results info */}
      {search && (
        <p className="text-sm text-gray-500 mb-4">
          {total} hasil untuk &quot;{search}&quot;
        </p>
      )}

      {/* Grid */}
      {regulations.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada regulasi ditemukan</p>
          {search && (
            <a href="/regulasi" className="text-primary text-sm hover:underline mt-2 inline-block">
              Lihat semua regulasi
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {regulations.map((reg) => (
            <div
              key={reg.id}
              className="bg-white border rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              {/* Icon + title */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 leading-snug line-clamp-2">
                    {reg.title}
                  </h3>
                  {reg.publishedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(reg.publishedAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              {reg.description && (
                <p className="text-sm text-gray-500 line-clamp-2 -mt-1">
                  {reg.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-auto pt-2 border-t">
                <button
                  onClick={() => setPreviewItem(reg)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:bg-primary/5 py-2 rounded-lg transition-colors border border-primary/20"
                >
                  <Eye className="h-4 w-4" />
                  Lihat PDF
                </button>
                <a
                  href={reg.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 py-2 px-3 rounded-lg transition-colors border"
                  aria-label={`Unduh ${reg.title}`}
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {page > 1 && (
            <a
              href={`/regulasi?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sebelumnya
            </a>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/regulasi?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-colors ${
                p === page ? "bg-primary text-white" : "border hover:bg-gray-50"
              }`}
            >
              {p}
            </a>
          ))}
          {page < totalPages && (
            <a
              href={`/regulasi?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Berikutnya
            </a>
          )}
        </div>
      )}

      {/* PDF Preview Modal */}
      <PdfPreviewDialog
        open={!!previewItem}
        onOpenChange={(v) => { if (!v) setPreviewItem(null); }}
        url={previewItem?.fileUrl ?? null}
        title={previewItem?.title}
      />
    </>
  );
}
