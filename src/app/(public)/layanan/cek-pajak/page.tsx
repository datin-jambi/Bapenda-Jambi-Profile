import type { Metadata } from "next";
import Link from "next/link";
import { Search, ArrowLeft, Phone, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Cek Pajak Kendaraan | BAPENDA Provinsi Jambi",
  description:
    "Layanan cek pajak kendaraan sedang tidak tersedia untuk sementara. Silakan kembali lagi nanti atau hubungi kami untuk informasi lebih lanjut.",
  robots: { index: false, follow: false },
};

export default function CekPajakUnavailablePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Search className="h-8 w-8 text-amber-600" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold font-poppins text-gray-900 mb-3">
            Fitur Cek Pajak Sedang Tidak Tersedia
          </h1>

          <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8">
            Layanan cek pajak kendaraan sedang dalam perbaikan dan belum dapat
            digunakan saat ini. Silakan kembali lagi nanti.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-8">
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
              <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Jam Pelayanan</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Senin – Jumat: 08.00 – 16.00 WIB
                  <br />
                  Sabtu: 08.00 – 12.00 WIB
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
              <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Kontak</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Hubungi kantor Samsat terdekat atau Bapenda Provinsi Jambi untuk bantuan.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/layanan"
              className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Layanan
            </Link>
            <Link
              href="/kontak"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-primary hover:text-primary text-gray-700 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
            >
              <Phone className="h-4 w-4" />
              Hubungi Kami
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
