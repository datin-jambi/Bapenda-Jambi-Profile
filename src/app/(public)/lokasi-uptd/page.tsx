"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Phone, Mail, ExternalLink, X } from "lucide-react";
import type { UptdMarker } from "@/components/public/uptd-map";
import { useDebounce } from "@/hooks/use-debounce";

const UptdMap = dynamic(
  () => import("@/components/public/uptd-map").then((m) => m.UptdMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse rounded-lg" /> }
);

const CITIES = [
  "Kota Jambi",
  "Kabupaten Muaro Jambi",
  "Kabupaten Batanghari",
  "Kabupaten Bungo",
  "Kabupaten Tebo",
  "Kabupaten Sarolangun",
  "Kabupaten Merangin",
  "Kabupaten Kerinci",
  "Kota Sungai Penuh",
  "Kabupaten Tanjung Jabung Barat",
  "Kabupaten Tanjung Jabung Timur",
];

export default function LokasiUptdPage() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useQuery<{ data: UptdMarker[] }>({
    queryKey: ["public-uptd", debouncedSearch, cityFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (cityFilter !== "all") params.set("city", cityFilter);
      return axios.get(`/api/uptd?${params.toString()}`).then((r) => r.data);
    },
  });

  const markers = useMemo(() => data?.data ?? [], [data]);
  const selected = useMemo(() => markers.find((m) => m.id === selectedId) ?? null, [markers, selectedId]);

  function handleSelect(id: number) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Lokasi UPTD Samsat</h1>
        <p className="text-gray-500 mt-1">
          Temukan kantor UPTD Samsat terdekat di seluruh Provinsi Jambi
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative w-full md:flex-1 md:min-w-[200px] md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama UPTD..."
            className="pl-9 pr-9"
          />

          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Semua Kota/Kabupaten" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kota/Kabupaten</SelectItem>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Badge
          variant="outline"
          className="w-full md:w-auto justify-center text-sm px-3 py-1.5"
        >
          {isLoading ? "Memuat..." : `${markers.length} UPTD ditemukan`}
        </Badge>
      </div>

      {/* Map + List layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 h-[500px] lg:h-[600px] rounded-xl overflow-hidden border shadow-sm">
          <UptdMap markers={markers} selectedId={selectedId} onSelect={handleSelect} />
        </div>

        {/* List */}
        <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
            ))
          ) : markers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground gap-2">
              <MapPin className="h-8 w-8 opacity-30" />
              <p className="text-sm">Tidak ada UPTD yang ditemukan</p>
            </div>
          ) : (
            markers.map((m) => (
              <button
                key={m.id}
                onClick={() => handleSelect(m.id)}
                className={`text-left rounded-xl border p-4 transition-all hover:shadow-md hover:border-primary/50 ${selectedId === m.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "bg-white"
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{m.name}</p>
                    {m.city && (
                      <p className="text-xs text-muted-foreground mt-0.5">{m.city}</p>
                    )}
                  </div>
                  <MapPin className={`h-4 w-4 shrink-0 mt-0.5 ${selectedId === m.id ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                {m.address && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{m.address}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-2">
                  {m.phone && (
                    <a
                      href={`tel:${m.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
                    >
                      <Phone className="h-3 w-3" />{m.phone}
                    </a>
                  )}
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
                    >
                      <Mail className="h-3 w-3" />{m.email}
                    </a>
                  )}
                </div>
                {m.googleMapsUrl && (
                  <a
                    href={m.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />Buka Google Maps
                  </a>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Selected detail card */}
      {selected && (
        <div className="border rounded-xl p-5 bg-primary/5 border-primary/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-primary">{selected.name}</h2>
              <p className="text-sm text-muted-foreground font-mono">{selected.code}</p>
            </div>
            <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm">
            {selected.address && (
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-gray-700">{selected.address}</span>
              </div>
            )}
            {selected.phone && (
              <div className="flex gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <a href={`tel:${selected.phone}`} className="text-gray-700 hover:text-primary">{selected.phone}</a>
              </div>
            )}
            {selected.email && (
              <div className="flex gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <a href={`mailto:${selected.email}`} className="text-gray-700 hover:text-primary">{selected.email}</a>
              </div>
            )}
          </div>
          {selected.googleMapsUrl && (
            <a
              href={selected.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />Buka di Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
}
