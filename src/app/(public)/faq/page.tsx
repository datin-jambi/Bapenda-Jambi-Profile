import type { Metadata } from "next";
import { headers } from "next/headers";
import { FaqPageClient } from "./faq-client";

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

async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  return `${proto}://${host}`;
}

export default async function FaqPage() {
  const base = await getBaseUrl();

  const [categoriesRes, faqsRes] = await Promise.all([
    fetch(`${base}/api/public/faq-categories`, { cache: "no-store" }),
    fetch(`${base}/api/public/faqs`, { cache: "no-store" }),
  ]);

  const [categoriesJson, faqsJson] = await Promise.all([
    categoriesRes.json(),
    faqsRes.json(),
  ]);

  const categories = categoriesJson.data ?? [];
  const faqs = faqsJson.data ?? [];

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
