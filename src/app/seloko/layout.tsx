import type { Metadata } from "next";
import { SelokoShell } from "@/components/seloko/seloko-shell";

// Area /seloko punya identitas sendiri: judul jendela & task switcher harus
// "SELOKO", bukan judul situs publik yang diwarisi dari root layout.
export const metadata: Metadata = {
  title: {
    default: "SELOKO",
    template: "%s | SELOKO",
  },
};

export default function SelokoLayout({ children }: { children: React.ReactNode }) {
  return <SelokoShell>{children}</SelokoShell>;
}
