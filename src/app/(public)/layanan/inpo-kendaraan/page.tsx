import type { Metadata } from "next";
import Link from "next/link";
import { Car, Search, FileText, Shield, ArrowRight, CheckCircle } from "lucide-react";
import { InpoKendaraanClient } from "./inpo-kendaraan-client";

export const metadata: Metadata = {
  title: "Info Kendaraan | BAPENDA Provinsi Jambi",
  description:
    "Informasi lengkap seputar kendaraan bermotor, klasifikasi pajak, tarif PKB, Opsen, Jasa Raharja, dan PNBP di Provinsi Jambi.",
  keywords: "info kendaraan, pajak kendaraan, pkb, opsen, jasa raharja, pnbp, samsat jambi",
};

const INFO_SECTIONS = [
  {
    icon: Car,
    title: "Klasifikasi Kendaraan",
    items: [
      "Kendaraan penumpang (sedan, jeep, minibus)",
      "Kendaraan bus (angkutan umum penumpang)",
      "Kendaraan barang (pick up, truk, dump truck)",
      "Kendaraan sepeda motor (skuter, sport, bebek)",
      "Kendaraan khusus (ambulans, pemadam kebakaran)",
    ],
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: FileText,
    title: "Dasar Pengenaan PKB",
    items: [
      "NJKB (Nilai Jual Kendaraan Bermotor) sebagai dasar perhitungan",
      "Tarif PKB progresif untuk kepemilikan kendaraan ke-2 dan seterusnya",
      "Besar PKB = tarif × NJKB (ditetapkan dalam Perda)",
      "Pembayaran dilakukan setiap tahun sesuai masa berlaku STNK",
      "Denda 2% per bulan untuk keterlambatan pembayaran",
    ],
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Shield,
    title: "SWDKLLJ / Jasa Raharja",
    items: [
      "Iuran wajib yang dibayar bersamaan dengan PKB setiap tahun",
      "Memberikan santunan bagi korban kecelakaan lalu lintas",
      "Besaran iuran berbeda untuk kendaraan pribadi dan umum",
      "Dikelola oleh PT Jasa Raharja (Persero)",
      "Sanksi administrasi jika tidak membayar tepat waktu",
    ],
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const FAQS = [
  {
    q: "Apa itu NJKB?",
    a: "NJKB (Nilai Jual Kendaraan Bermotor) adalah harga pasar kendaraan yang digunakan sebagai dasar perhitungan PKB. Nilai ini ditetapkan oleh Kepolisian dan digunakan sebagai acuan dalam menentukan besaran pajak yang harus dibayar.",
  },
  {
    q: "Bagaimana tarif PKB di Provinsi Jambi?",
    a: "Tarif PKB di Provinsi Jambi diatur dalam Peraturan Daerah. Untuk kepemilikan pertama dikenakan tarif sesuai ketentuan, sedangkan kepemilikan kedua dan seterusnya dikenakan tarif progresif yang lebih tinggi.",
  },
  {
    q: "Apa perbedaan PKB, Opsen, dan SWDKLLJ?",
    a: "PKB adalah Pajak Kendaraan Bermotor yang masuk ke kas provinsi. Opsen PKB adalah pungutan tambahan untuk kabupaten/kota sebesar 66% dari PKB. SWDKLLJ adalah iuran Jasa Raharja yang memberikan santunan kecelakaan lalu lintas.",
  },
  {
    q: "Kapan waktu pembayaran pajak kendaraan?",
    a: "Pembayaran pajak kendaraan dilakukan setiap tahun, sesuai dengan tanggal yang tertera pada STNK. Pembayaran dapat dilakukan mulai 30 hari sebelum tanggal jatuh tempo.",
  },
];

export default function InfoKendaraanPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4 leading-tight">
            Info Kendaraan
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-8 max-w-2xl mx-auto">
            Cari informasi detail kendaraan, pelajari klasifikasi, tarif pajak,
            dan ketentuan terkait Pajak Kendaraan Bermotor di Provinsi Jambi.
          </p>
          <Link
            href="/layanan/cek-pajak"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-colors shadow-lg"
          >
            <Search className="h-5 w-5" />
            Cek Pajak Kendaraan
          </Link>
        </div>
      </section>

      {/* Cari Kendaraan */}
      <InpoKendaraanClient />

      {/* Informasi */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-poppins text-gray-900">
              Informasi Kendaraan Bermotor
            </h2>
            <p className="text-gray-500 mt-2">
              Panduan lengkap seputar pajak kendaraan di Provinsi Jambi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INFO_SECTIONS.map((section) => (
              <div
                key={section.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 ${section.bg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Layanan Terkait */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-poppins text-gray-900 mb-4">
            Layanan Terkait
          </h2>
          <p className="text-gray-500 mb-10">
            Gunakan layanan online kami untuk memeriksa pajak kendaraan Anda
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link
              href="/layanan/cek-pajak"
              className="group bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-8 border border-green-200 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Search className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Cek Pajak Kendaraan
              </h3>
              <p className="text-sm text-gray-600">
                Cek tagihan PKB, Opsen, Jasa Raharja, dan PNBP secara online
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:gap-2 transition-all">
                Cek Sekarang <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <Link
              href="/layanan"
              className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-8 border border-blue-200 hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Semua Layanan
              </h3>
              <p className="text-sm text-gray-600">
                Jelajahi berbagai layanan perpajakan daerah lainnya
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                Lihat Layanan <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-poppins text-gray-900">
              Pertanyaan Umum
            </h2>
            <p className="text-gray-500 mt-2">
              Jawaban seputar pajak kendaraan bermotor
            </p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-medium text-gray-800 hover:bg-gray-50 list-none">
                  {faq.q}
                  <svg
                    className="h-4 w-4 text-gray-400 flex-shrink-0 ml-4 transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
