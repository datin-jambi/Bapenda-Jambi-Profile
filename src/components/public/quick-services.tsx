import Link from "next/link";
import { Search, Car, FileText, CreditCard, BookOpen, HelpCircle } from "lucide-react";

const SERVICES = [
  { icon: Search, label: "Cek Pajak", desc: "Cek Tagihan PKB Online", href: "/layanan/cek-pajak", color: "bg-green-50 text-green-600" },
  { icon: Car, label: "Info Kendaraan", desc: "Pajak & Klasifikasi", href: "/layanan/inpo-kendaraan", color: "bg-blue-50 text-blue-600" },
  { icon: FileText, label: "Info NJKB", desc: "Nilai Jual Kendaraan", href: "/layanan#njkb", color: "bg-purple-50 text-purple-600" },
  { icon: CreditCard, label: "E-Samsat", desc: "Bayar Pajak Online", href: "https://esamsat.jambiprov.go.id", color: "bg-secondary/10 text-secondary", external: true },
  { icon: BookOpen, label: "Regulasi", desc: "Peraturan & Kebijakan", href: "/regulasi", color: "bg-primary/10 text-primary" },
  { icon: HelpCircle, label: "FAQ", desc: "Pertanyaan Umum", href: "/faq", color: "bg-orange-50 text-orange-600" },
];

export function QuickServicesSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-poppins text-primary">Layanan Cepat</h2>
          <p className="text-gray-500 mt-2">Akses layanan BAPENDA dengan mudah dan cepat</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SERVICES.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group bg-white rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-transparent hover:border-primary/10"
            >
              <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <s.icon className="h-6 w-6" />
              </div>
              <p className="font-semibold text-sm text-gray-800">{s.label}</p>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
