import type { Metadata } from "next";
import { Suspense } from "react";
import GaleriClient from "./galeri-client";

export const metadata: Metadata = {
  title: "Galeri",
  description: "Galeri foto dan video kegiatan BAPENDA Provinsi Jambi",
};

export default function GaleriPage() {
  return (
    <Suspense>
      <GaleriClient />
    </Suspense>
  );
}
