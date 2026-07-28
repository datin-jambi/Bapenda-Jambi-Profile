"use client";

import { useState, useRef } from "react";
import { Search, AlertCircle, Car, Bike, Truck, Fuel, Palette, Calendar, Hash, Shield } from "lucide-react";

const HOST = process.env.NEXT_PUBLIC_PKB_API_HOST;
const TOKEN = process.env.NEXT_PUBLIC_PKB_API_TOKEN;

// ─── Types ────────────────────────────────────────────────────────────────────

interface KendaraanData {
  no_polisi: string;
  nm_merek_kb: string;
  nm_model_kb: string;
  nm_jenis_kb: string;
  th_rakitan: string;
  warna_kb: string;
  jumlah_cc: number;
  tg_akhir_pkb: string;
  tg_akhir_stnk: string;
  bbm?: { nama: string };
  njkb?: { nilai_jual: string };
  lokasi_transaksi_terakhir?: { nama: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(str?: string | null) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function formatRupiah(val: number | string) {
  const n = typeof val === "string" ? Number(String(val).replace(/[^0-9]/g, "")) : val;
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function normalizeNopol(raw: string): string {
  const val = raw.trim().toUpperCase().replace(/\s+/g, " ");
  if (/^[A-Z]{1,2}[\s\d]/.test(val)) return val;
  return "BH " + val;
}

async function apiFetch<T>(path: string, nopol: string): Promise<T | null> {
  try {
    const res = await fetch(`${HOST}${path}?nopol=${encodeURIComponent(nopol)}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    });
    const json = await res.json();
    return json.status && json.data ? json.data : null;
  } catch {
    return null;
  }
}

// ─── Ikon jenis kendaraan ─────────────────────────────────────────────────────

function JenisKendaraanIcon({ jenis }: { jenis: string }) {
  const lower = jenis?.toLowerCase() ?? "";
  if (lower.includes("motor") || lower.includes("sepeda")) return <Bike className="h-5 w-5" />;
  if (lower.includes("bus") || lower.includes("angkutan")) return <Truck className="h-5 w-5" />;
  if (lower.includes("barang") || lower.includes("truk") || lower.includes("pick")) return <Truck className="h-5 w-5" />;
  return <Car className="h-5 w-5" />;
}

// ─── Field info ───────────────────────────────────────────────────────────────

function InfoField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{value || "-"}</p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function InpoKendaraanClient() {
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<KendaraanData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.toUpperCase().replace(/\s/g, "");
    const m = raw.match(/^([A-Z]{1,2})?(\d{1,4})?([A-Z]{1,3})?/);
    if (!m) { setInputVal(raw); return; }
    const parts = [m[1], m[2], m[3]].filter(Boolean);
    setInputVal(parts.join(" "));
    setError("");
  }

  async function handleSearch() {
    const normalized = normalizeNopol(inputVal);
    if (normalized.replace(/\s/g, "").length < 3) {
      setError("Masukkan nomor polisi yang valid");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    const kendaraan = await apiFetch<KendaraanData>("/kendaraan/detail", normalized);
    if (!kendaraan) {
      setError("Data kendaraan tidak ditemukan");
      setLoading(false);
      return;
    }

    setData(kendaraan);
    setLoading(false);
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-white to-primary/5">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold font-poppins text-gray-900">
            Cari Info Kendaraan
          </h2>
          <p className="text-gray-500 mt-2 max-w-lg mx-auto">
            Masukkan nomor polisi untuk melihat informasi detail kendaraan terdaftar di Provinsi Jambi
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Contoh: BH 1234 AB"
                maxLength={12}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-sans"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-3.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              {loading
                ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                : <Search className="h-4 w-4" />}
              {loading ? "Mencari..." : "Cari"}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Jika tidak diisi prefix plat, otomatis menggunakan <span className="font-semibold">BH</span> (Jambi)
          </p>

          {error && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        {/* Result */}
        {data && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header nopol */}
            <div className="bg-gradient-to-r from-primary to-primary/90 px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 mb-1">Nomor Polisi</p>
                  <p className="text-3xl font-bold text-white tracking-widest">{data.no_polisi}</p>
                </div>
                <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center">
                  <JenisKendaraanIcon jenis={data.nm_jenis_kb} />
                </div>
              </div>
            </div>

            {/* Detail grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoField icon={Car} label="Merek" value={data.nm_merek_kb} />
                <InfoField icon={Hash} label="Model" value={data.nm_model_kb} />
                <InfoField icon={JenisKendaraanIcon} label="Jenis" value={data.nm_jenis_kb} />
                <InfoField icon={Calendar} label="Tahun Rakitan" value={data.th_rakitan} />
                <InfoField icon={Palette} label="Warna" value={data.warna_kb} />
                <InfoField icon={Fuel} label="BBM" value={data.bbm?.nama ?? "-"} />
                <InfoField icon={Hash} label="CC Mesin" value={data.jumlah_cc ? `${data.jumlah_cc} CC` : "-"} />
                <InfoField icon={Shield} label="NJKB" value={data.njkb?.nilai_jual ? formatRupiah(data.njkb.nilai_jual) : "-"} />
              </div>

              {/* Masa berlaku */}
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Masa Berlaku</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl">
                    <span className="text-sm text-gray-500">PKB s/d</span>
                    <span className="text-sm font-semibold text-gray-800">{formatDate(data.tg_akhir_pkb)}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl">
                    <span className="text-sm text-gray-500">STNK s/d</span>
                    <span className="text-sm font-semibold text-gray-800">{formatDate(data.tg_akhir_stnk)}</span>
                  </div>
                </div>
                {data.lokasi_transaksi_terakhir?.nama && (
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    Lokasi transaksi terakhir: <span className="font-medium text-gray-600">{data.lokasi_transaksi_terakhir.nama}</span>
                  </p>
                )}
              </div>

              {/* CTA */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-3">
                  Ingin cek tagihan pajak kendaraan ini?
                </p>
                <a
                  href={`/layanan/cek-pajak?nopol=${encodeURIComponent(data.no_polisi)}`}
                  className="inline-flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  <Search className="h-4 w-4" />
                  Cek Tagihan Pajak
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
