import { Car, FileText, Info, CreditCard } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Layanan",
  description: "Layanan BAPENDA Provinsi Jambi — PKB, NJKB, PAD, E-Samsat, dan lainnya",
};

const SERVICES = [
  {
    id: "pkb",
    icon: Car,
    title: "Pajak Kendaraan Bermotor (PKB)",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    items: [
      "PKB merupakan pajak tahunan atas kepemilikan kendaraan bermotor",
      "Tarif PKB ditetapkan berdasarkan Perda Provinsi Jambi",
      "Pembayaran dapat dilakukan di Samsat atau melalui E-Samsat",
      "Batas waktu pembayaran: sebelum tanggal jatuh tempo STNK",
    ],
  },
  {
    id: "njkb",
    icon: FileText,
    title: "Nilai Jual Kendaraan Bermotor (NJKB)",
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    items: [
      "NJKB merupakan nilai dasar perhitungan PKB dan BBNKB",
      "Ditetapkan oleh Menteri Dalam Negeri",
      "Berlaku nasional dan diperbarui setiap tahun",
      "Dapat dicek melalui website resmi atau kantor Samsat",
    ],
  },
  {
    id: "pad",
    icon: TrendingUpIcon,
    title: "Pendapatan Asli Daerah (PAD)",
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
    items: [
      "PAD terdiri dari pajak daerah, retribusi, dan pendapatan lainnya",
      "PKB dan BBNKB merupakan kontributor terbesar PAD Jambi",
      "Realisasi PAD dipublikasikan secara berkala",
      "Masyarakat dapat berperan melalui kepatuhan pajak",
    ],
  },
];

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export default function LayananPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-poppins text-primary">Layanan BAPENDA</h1>
        <p className="text-gray-500 mt-2">Informasi layanan dan produk pajak daerah Provinsi Jambi</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { href: "https://esamsat.jambiprov.go.id", label: "E-Samsat Online", icon: CreditCard, desc: "Bayar PKB online" },
          { href: "#pkb", label: "Info PKB", icon: Car, desc: "Pajak kendaraan" },
          { href: "#njkb", label: "Info NJKB", icon: FileText, desc: "Nilai jual kendaraan" },
          { href: "#pad", label: "Info PAD", icon: Info, desc: "Pendapatan daerah" },
        ].map((s) => (
          <a key={s.label} href={s.href} className="bg-white border rounded-xl p-4 text-center hover:shadow-md transition-shadow hover:border-primary/30 group">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
              <s.icon className="h-5 w-5 text-primary group-hover:text-white" />
            </div>
            <p className="font-semibold text-sm text-gray-800">{s.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
          </a>
        ))}
      </div>

      {/* Service details */}
      <div className="space-y-8">
        {SERVICES.map((s) => (
          <div key={s.id} id={s.id} className={`border rounded-2xl p-6 md:p-8 ${s.color}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <s.icon className={`h-6 w-6 ${s.iconColor}`} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{s.title}</h2>
            </div>
            <ul className="space-y-2">
              {s.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* E-Samsat promo */}
      <div className="mt-10 bg-gradient-to-r from-primary to-primary-700 rounded-2xl p-8 text-white text-center">
        <CreditCard className="h-10 w-10 mx-auto mb-3 text-secondary" />
        <h3 className="text-2xl font-bold mb-2">Bayar PKB Online dengan E-Samsat</h3>
        <p className="text-white/80 mb-6 max-w-xl mx-auto">Tidak perlu antri di kantor Samsat. Bayar pajak kendaraan bermotor kapan saja dan di mana saja.</p>
        <a href="https://esamsat.jambiprov.go.id" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
          <CreditCard className="h-4 w-4" /> Akses E-Samsat
        </a>
      </div>
    </div>
  );
}
