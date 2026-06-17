import { settingRepository } from "@/repositories/content.repository";
import { MapPin, Phone, Mail, Clock, Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi BAPENDA Provinsi Jambi",
};

export default async function KontakPage() {
  const settings = await settingRepository.findAll().catch(() => ({} as Record<string, string>));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold font-poppins text-primary">Kontak Kami</h1>
        <p className="text-gray-500 mt-2">Hubungi BAPENDA Provinsi Jambi untuk informasi lebih lanjut</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Informasi Kantor */}
        <div className="space-y-6 min-w-0">
          <h2 className="text-xl font-semibold text-primary">Informasi Kantor</h2>
          <div className="space-y-3">
            {[
              { icon: Building2, label: "Nama Instansi", value: "Badan Pendapatan Daerah Provinsi Jambi" },
              { icon: MapPin, label: "Alamat", value: settings.contact_address || "Jl. Ahmad Yani No. 1, Kota Jambi 36122" },
              { icon: Phone, label: "Telepon", value: settings.contact_phone || "(0741) 60436" },
              { icon: Mail, label: "Email", value: settings.contact_email || "info@bapenda.jambiprov.go.id" },
              { icon: Clock, label: "Jam Operasional", value: settings.office_hours || "Senin – Jumat: 08.00 – 16.00 WIB" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl min-w-0">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                  <p className="text-gray-800 text-sm mt-0.5 break-words">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lokasi */}
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-primary mb-6">Lokasi</h2>
          <div className="w-full rounded-xl overflow-hidden bg-gray-100 border aspect-[4/3] lg:aspect-auto lg:h-[420px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.3693882843843!2d103.60954!3d-1.61089!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwMzYnMzkuMiJTIDEwM8KwMzYnMzQuMyJF!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi BAPENDA Provinsi Jambi"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Peta lokasi BAPENDA Provinsi Jambi</p>
        </div>
      </div>
    </div>
  );
}
