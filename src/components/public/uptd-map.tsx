"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type UptdMarker = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  district: string | null;
  province: string | null;
  latitude: number;
  longitude: number;
  googleMapsUrl: string | null;
};

interface UptdMapProps {
  markers: UptdMarker[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const JAMBI_CENTER: [number, number] = [-1.6101, 103.6131];

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function UptdMap({ markers, selectedId, onSelect }: UptdMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const leafletMarkersRef = useRef<Map<number, L.Marker>>(new Map());

  // Initialize map once
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, { center: JAMBI_CENTER, zoom: 8, scrollWheelZoom: true });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersMap = leafletMarkersRef.current;
    return () => {
      map.remove();
      mapRef.current = null;
      markersMap.clear();
    };
  }, []);

  // Sync markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const existing = leafletMarkersRef.current;
    const incomingIds = new Set(markers.map((m) => m.id));

    // Remove markers no longer in list
    existing.forEach((lm, id) => {
      if (!incomingIds.has(id)) {
        lm.remove();
        existing.delete(id);
      }
    });

    // Add new markers
    markers.forEach((m) => {
      if (existing.has(m.id)) return;
      const lm = L.marker([m.latitude, m.longitude], { icon: markerIcon })
        .addTo(map)
        .on("click", () => onSelect(m.id));

      const parts: string[] = [];
      if (m.name) parts.push(`<p class="font-semibold">${m.name}</p>`);
      if (m.address) parts.push(`<p class="text-gray-600 text-xs">${m.address}</p>`);
      if (m.phone) parts.push(`<p class="text-gray-600 text-xs">Telp: ${m.phone}</p>`);
      if (m.googleMapsUrl)
        parts.push(`<a href="${m.googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 underline">Google Maps</a>`);

      lm.bindPopup(`<div class="space-y-1 text-sm">${parts.join("")}</div>`, { maxWidth: 280 });
      existing.set(m.id, lm);
    });
  }, [markers, onSelect]);

  // Fly to selected marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (selectedId === null) {
      map.flyTo(JAMBI_CENTER, 8, { duration: 1.2 });
      return;
    }
    const m = markers.find((x) => x.id === selectedId);
    if (m) map.flyTo([m.latitude, m.longitude], 15, { duration: 1.2 });
  }, [selectedId, markers]);

  return <div ref={containerRef} className="w-full h-full rounded-lg z-0" />;
}
