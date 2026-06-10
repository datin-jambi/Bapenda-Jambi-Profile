import { regulationRepository } from "@/repositories/content.repository";
import { RegulasiClient } from "./regulasi-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulasi",
  description: "Peraturan dan regulasi Badan Pendapatan Daerah Provinsi Jambi",
};

export default async function RegulasiPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page || "1"));
  const limit = 12;
  const skip = (page - 1) * limit;
  const search = resolvedParams.search;

  const { data: regulations, total } = await regulationRepository.findPublished({ skip, limit, search });
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-poppins text-primary">Regulasi</h1>
        <p className="text-gray-500 mt-2">
          Peraturan daerah dan regulasi terkait pendapatan daerah
        </p>
      </div>

      <RegulasiClient
        regulations={regulations}
        total={total}
        page={page}
        totalPages={totalPages}
        search={search}
      />
    </div>
  );
}
