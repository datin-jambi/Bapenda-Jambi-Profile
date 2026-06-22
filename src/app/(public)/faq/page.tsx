import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { faqRepository } from "@/repositories/content.repository";
import { FaqPageClient } from "./faq-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pusat Bantuan (FAQ) | BAPENDA Provinsi Jambi",
  description:
    "Temukan jawaban atas pertanyaan yang sering diajukan seputar layanan pajak daerah BAPENDA Provinsi Jambi: PKB, BBNKB, E-Samsat, dan informasi umum.",
  keywords: "faq, bantuan, pajak kendaraan, bbnkb, e-samsat, bapenda, jambi",
  openGraph: {
    title: "Pusat Bantuan (FAQ) | BAPENDA Provinsi Jambi",
    description:
      "Temukan jawaban atas pertanyaan yang sering diajukan seputar layanan pajak daerah BAPENDA Provinsi Jambi.",
    type: "website",
  },
};

export default async function FaqPage() {
  const [categories, faqs] = await Promise.all([
    prisma.faqCategory.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, description: true },
    }),
    faqRepository.findPublished({}),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq: { question: string; answer: string }) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          }),
        }}
      />
      <FaqPageClient initialFaqs={faqs} categories={categories} />
    </>
  );
}
