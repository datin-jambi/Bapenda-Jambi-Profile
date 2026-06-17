import type { Metadata } from "next";
import Link from "next/link";
import {
  Car,
  Search,
  FileText,
  Shield,
  Receipt,
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Layanan Bapenda Provinsi Jambi",
  description:
    "Informasi layanan perpajakan daerah, cek pajak kendaraan, opsen PKB, Jasa Raharja, dan layanan publik lainnya dari Bapenda Provinsi Jambi.",
};

const SERVICE_CARDS = [
  {
    icon: Car,
    title: "Informasi Pajak Kendaraan",
    desc: "Pelajari ketentuan, tarif, dan tata cara pembayaran Pajak Kendaraan Bermotor (PKB) di Provinsi Jambi.",
    cta: "Pelajari Selengkapnya",
    href: "#pkb",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    icon: Search,
    title: "Cek Pajak Kendaraan",
    desc: "Cek tagihan PKB, Opsen PKB, Jasa Raharja, dan PNBP kendaraan Anda secara online melalui integrasi API Samsat.",
    cta: "Cek Sekarang",
    href: "/cek-pajak",
    color: "bg-green-50",
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    icon: Receipt,
    title: "Informasi Opsen Pajak",
    desc: "Opsen merupakan pungutan tambahan pajak berdasarkan persentase tertentu yang dipungut oleh kabupaten/kota.",
    cta: null,
    href: "#opsen",
    color: "bg-orange-50",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
  },
  {
    icon: Shield,
    title: "Informasi Jasa Raharja",
    desc: "Dana Jasa Raharja memberikan santunan kepada korban kecelakaan lalu lintas jalan dan penumpang umum.",
    cta: null,
    href: "#jasa-raharja",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
  },
  {
    icon: FileText,
    title: "Informasi PNBP",
    desc: "Penerimaan Negara Bukan Pajak (PNBP) terkait kendaraan bermotor yang dikelola oleh Polri dan instansi terkait.",
    cta: null,
    href: "#pnbp",
    color: "bg-red-50",
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
  },
];

const STEPS = [
  { step: 1, title: "Masukkan Nomor Polisi", desc: "Ketikkan nomor polisi kendaraan Anda pada kolom pencarian yang tersedia." },
  { step: 2, title: "Verifikasi Data", desc: "Sistem memverifikasi data kendaraan melalui integrasi dengan database Samsat." },
  { step: 3, title: "Lihat Informasi Pajak", desc: "Informasi tagihan PKB, Opsen PKB, Jasa Raharja, dan PNBP ditampilkan secara lengkap." },
  { step: 4, title: "Lakukan Pembayaran", desc: "Bayar melalui E-Samsat, bank, atau langsung di kantor Samsat terdekat." },
];

const INFO_CARDS = [
  {
    icon: Clock,
    title: "Jam Pelayanan",
    color: "border-blue-200 bg-blue-50",
    iconColor: "text-blue-600",
    items: ["Senin – Jumat: 08.00 – 16.00 WIB", "Sabtu: 08.00 – 12.00 WIB", "Minggu & Hari Libur: Tutup"],
  },
  {
    icon: CheckCircle,
    title: "Persyaratan Administrasi",
    color: "border-green-200 bg-green-50",
    iconColor: "text-green-600",
    items: ["STNK asli dan fotokopi", "KTP pemilik kendaraan", "BPKB asli (untuk balik nama)", "Kendaraan wajib hadir (untuk perpanjangan)"],
  },
  {
    icon: CreditCard,
    title: "Kanal Pembayaran",
    color: "border-purple-200 bg-purple-50",
    iconColor: "text-purple-600",
    items: ["E-Samsat Jambi (online)", "Bank BJB, BRI, BNI, Mandiri", "Indomaret & Alfamart", "Kantor Samsat se-Provinsi Jambi"],
  },
  {
    icon: AlertCircle,
    title: "Perpanjangan STNK",
    color: "border-orange-200 bg-orange-50",
    iconColor: "text-orange-600",
    items: ["Perpanjangan tahunan wajib dilakukan sebelum jatuh tempo", "Denda 2% per bulan jika terlambat", "Perpanjangan 5 tahun disertai uji fisik kendaraan"],
  },
];

const FAQS = [
  {
    q: "Bagaimana cara mengecek pajak kendaraan?",
    a: "Masuk ke halaman Cek Pajak Kendaraan, masukkan nomor polisi kendaraan Anda, lalu klik Cek. Sistem akan menampilkan informasi tagihan secara lengkap.",
  },
  {
    q: "Kapan pajak kendaraan jatuh tempo?",
    a: "Jatuh tempo pajak kendaraan sesuai dengan tanggal yang tertera pada STNK Anda. Pembayaran sebaiknya dilakukan sebelum tanggal tersebut untuk menghindari denda.",
  },
  {
    q: "Apa itu Opsen PKB?",
    a: "Opsen PKB adalah pungutan tambahan PKB yang dipungut oleh pemerintah kabupaten/kota sebesar 66% dari PKB terutang, sesuai UU No. 1 Tahun 2022.",
  },
  {
    q: "Apa itu PNBP?",
    a: "PNBP (Penerimaan Negara Bukan Pajak) adalah biaya penerbitan STNK dan TNKB yang dikelola oleh Polri dan masuk ke kas negara.",
  },
  {
    q: "Apa itu SWDKLLJ / Jasa Raharja?",
    a: "SWDKLLJ (Sumbangan Wajib Dana Kecelakaan Lalu Lintas Jalan) adalah iuran wajib yang dibayar bersamaan dengan PKB, yang menjadi sumber dana santunan Jasa Raharja bagi korban kecelakaan.",
  },
  {
    q: "Apakah bisa bayar pajak kendaraan secara online?",
    a: "Ya, pembayaran dapat dilakukan melalui aplikasi E-Samsat Jambi, mobile banking, atau minimarket yang bekerja sama dengan Samsat.",
  },
];

export default function LayananPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4 leading-tight">
            Layanan Bapenda Provinsi Jambi
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-8 max-w-2xl mx-auto">
            Akses berbagai layanan perpajakan daerah dan informasi kendaraan secara mudah, cepat, dan transparan.
          </p>
          <Link
            href="/cek-pajak"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors shadow-lg"
          >
            <Search className="h-5 w-5" />
            Cek Pajak Kendaraan
          </Link>
        </div>
      </section>

      {/* Kategori Layanan */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-poppins text-gray-900">Kategori Layanan</h2>
            <p className="text-gray-500 mt-2">Temukan layanan yang Anda butuhkan</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_CARDS.map((s) => (
              <div
                key={s.title}
                className={`${s.color} rounded-2xl p-6 border border-white hover:shadow-md transition-shadow group flex flex-col`}
              >
                <div className={`w-12 h-12 ${s.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <s.icon className={`h-6 w-6 ${s.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 flex-1">{s.desc}</p>
                {s.cta && (
                  <Link
                    href={s.href}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {s.cta} <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alur Layanan */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-poppins text-gray-900">Alur Layanan</h2>
            <p className="text-gray-500 mt-2">Cara mudah menggunakan layanan cek pajak kendaraan</p>
          </div>
          <div className="space-y-0">
            {STEPS.map((s, i) => (
              <div key={s.step} className="flex gap-4 md:gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {s.step}
                  </div>
                  {i < STEPS.length - 1 && <div className="w-0.5 h-12 bg-primary/20 mt-1" />}
                </div>
                <div className="pb-10">
                  <h3 className="font-bold text-gray-800 text-base">{s.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Informasi Penting */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-poppins text-gray-900">Informasi Penting</h2>
            <p className="text-gray-500 mt-2">Yang perlu Anda ketahui sebelum menggunakan layanan</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INFO_CARDS.map((card) => (
              <div key={card.title} className={`border rounded-2xl p-6 ${card.color}`}>
                <div className="flex items-center gap-3 mb-4">
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  <h3 className="font-bold text-gray-800">{card.title}</h3>
                </div>
                <ul className="space-y-2">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-poppins text-gray-900">Pertanyaan Umum</h2>
            <p className="text-gray-500 mt-2">Jawaban atas pertanyaan yang sering diajukan</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-gray-800 hover:bg-gray-50 list-none">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-primary/80">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold font-poppins mb-3">Cek Pajak Kendaraan Anda Sekarang</h2>
          <p className="text-white/80 mb-8 text-base">
            Dapatkan informasi status pajak kendaraan secara cepat dan mudah melalui layanan online Bapenda Provinsi Jambi.
          </p>
          <Link
            href="/cek-pajak"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors shadow-lg"
          >
            <Search className="h-5 w-5" />
            Mulai Cek Pajak
          </Link>
        </div>
      </section>
    </main>
  );
}
