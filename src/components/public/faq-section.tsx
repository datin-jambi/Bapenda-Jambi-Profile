"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: { name: string };
}

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null);

  if (!faqs.length) return null;

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-poppins text-primary">Pertanyaan Umum</h2>
            <p className="text-gray-500 mt-1">Pertanyaan yang sering diajukan seputar layanan BAPENDA</p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href="/faq">Lihat Semua <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                aria-expanded={openId === faq.id}

              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-secondary" />
                  <span className="font-medium text-gray-800 text-sm">{faq.question}</span>
                </div>
                {openId === faq.id
                  ? <ChevronUp className="h-4 w-4 text-primary flex-shrink-0 ml-3" />
                  : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-3" />}
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Button variant="outline" asChild>
            <Link href="/faq">Lihat Semua FAQ <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
