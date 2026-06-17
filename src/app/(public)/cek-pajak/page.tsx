import type { Metadata } from "next";
import { CekPkbClient } from "../cek-pkb/cek-pkb-client";

export const metadata: Metadata = {
  title: "Cek Pajak Kendaraan | BAPENDA Provinsi Jambi",
  description:
    "Cek data kendaraan dan tagihan Pajak Kendaraan Bermotor (PKB), Opsen PKB, Jasa Raharja, dan PNBP secara online untuk kendaraan terdaftar di Provinsi Jambi.",
  keywords: "cek pajak kendaraan, cek pkb, opsen pkb, jasa raharja, pnbp, samsat jambi",
};

export default function CekPajakPage() {
  return <CekPkbClient />;
}
