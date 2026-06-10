import { regulationRepository } from "@/repositories/content.repository";
import { formatDate } from "@/lib/utils";
import { FileText, Download, Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulasi",
  description: "Peraturan dan regulasi Badan Pendapatan Daerah Provinsi Jambi",
};

export default async function RegulasiPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string }> }) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1"));
  const limit = 10;
  const skip = (page - 1) * limit;
  const search = resolvedParams.search;

  const { data: regulations, total } = await regulationRepository.findAll({ skip, limit, search });
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-poppins text-primary">Regulasi</h1>
        <p className="text-gray-500 mt-2">Peraturan daerah dan regulasi terkait pendapatan daerah</p>
      </div>

      <form method="get" className="mb-6 flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Cari regulasi..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-800 transition-colors">Cari</button>
      </form>

      {regulations.length === 0 ? (
        <div className="text-center py-16 text-gray-400">Tidak ada regulasi ditemukan</div>
      ) : (
        <div className="space-y-3">
          {regulations.map((reg) => (
            <div key={reg.id} className="bg-white border rounded-xl p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{reg.title}</h3>
                {reg.description && <p className="text-sm text-gray-500 mt-1">{reg.description}</p>}
                {reg.publishedAt && (
                  <p className="text-xs text-gray-400 mt-2">Diterbitkan: {formatDate(reg.publishedAt)}</p>
                )}
              </div>
              <a
                href={reg.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1.5 text-sm text-primary hover:text-primary-800 font-medium transition-colors"
                aria-label={`Unduh ${reg.title}`}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Unduh</span>
              </a>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a key={p} href={`/regulasi?page=${p}${search ? `&search=${search}` : ""}`}
              className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-colors ${p === page ? "bg-primary text-white" : "border hover:bg-gray-50"}`}>
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
