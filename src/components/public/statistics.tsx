import Link from "next/link";
import { ArrowRight, CreditCard, MapPin, Phone, FileText } from "lucide-react";

const CTA_ITEMS = [
  {
    icon: CreditCard,
    title: "Bayar Pajak Online",
    desc: "Bayar PKB dan BBNKB tanpa antri melalui E-Samsat Jambi.",
    href: "https://esamsat.jambiprov.go.id",
    external: true,
    color: "bg-secondary",
  },
  {
    icon: MapPin,
    title: "Temukan Lokasi UPTD",
    desc: "Cari kantor UPTD BAPENDA terdekat di seluruh Provinsi Jambi.",
    href: "/lokasi-uptd",
    external: false,
    color: "bg-primary-700",
  },
  {
    icon: FileText,
    title: "Regulasi & Peraturan",
    desc: "Akses peraturan daerah dan kebijakan pendapatan daerah.",
    href: "/regulasi",
    external: false,
    color: "bg-primary-800",
  },
  {
    icon: Phone,
    title: "Hubungi Kami",
    desc: "Ada pertanyaan? Lihat FAQ atau hubungi layanan kami langsung.",
    href: "/faq",
    external: false,
    color: "bg-primary-900",
  },
];

export function StatisticsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary-800 to-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold font-poppins text-white">
            Apa yang Bisa Kami Bantu?
          </h2>
          <p className="text-white/70 mt-2">
            Akses layanan dan informasi BAPENDA Provinsi Jambi dengan mudah
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CTA_ITEMS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex flex-col gap-4 p-6 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all"
            >
              <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white font-poppins">{item.title}</h3>
                <p className="text-white/70 text-sm mt-1 leading-relaxed">{item.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-white/60 group-hover:text-white text-sm transition-colors">
                <span>Selengkapnya</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
