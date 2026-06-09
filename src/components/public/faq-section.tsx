"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: { name: string };
}

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null);

  const preview = faqs.slice(0, 5);

  if (!preview.length) return null;

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-secondary uppercase tracking-wider mb-1">FAQ</p>
            <h2 className="text-2xl md:text-3xl font-bold font-poppins text-primary">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Temukan jawaban cepat seputar layanan BAPENDA Provinsi Jambi
            </p>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
            <Link href="/faq">
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {preview.map((faq, idx) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={cn(
                  "bg-white rounded-xl border transition-all duration-200",
                  isOpen
                    ? "border-primary/30 shadow-md shadow-primary/5"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors",
                      isOpen ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                    )}>
                      {idx + 1}
                    </span>
                    <span className={cn(
                      "font-medium text-sm leading-relaxed",
                      isOpen ? "text-primary" : "text-gray-800"
                    )}>
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 flex-shrink-0 ml-3 transition-transform duration-200",
                    isOpen ? "rotate-180 text-primary" : "text-gray-400"
                  )} />
                </button>

                <div className={cn(
                  "overflow-hidden transition-all duration-200",
                  isOpen ? "max-h-96" : "max-h-0"
                )}>
                  <div className="px-5 pb-5 border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                      {faq.answer}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {faq.category?.name}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 text-center">
          <Button variant="outline" asChild className="sm:hidden border-primary text-primary">
            <Link href="/faq">
              Lihat Semua FAQ <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="hidden sm:block text-sm text-muted-foreground mt-4">
            Tidak menemukan jawaban?{" "}
            <Link href="/kontak" className="text-primary font-medium hover:underline">
              Hubungi kami
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
