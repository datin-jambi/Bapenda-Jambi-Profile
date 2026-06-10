import type { Metadata } from "next";
import { CekPkbClient } from "./cek-pkb-client";

export const metadata: Metadata = {
  title: "Cek PKB Kendaraan | BAPENDA Provinsi Jambi",
  description:
    "Cek data kendaraan dan tagihan Pajak Kendaraan Bermotor (PKB), Jasa Raharja, dan PNBP secara online untuk kendaraan terdaftar di Provinsi Jambi.",
  keywords: "cek pkb, pajak kendaraan, samsat jambi, cek pajak motor, cek pajak mobil",
};

export default function CekPkbPage() {
  return <CekPkbClient />;
}
