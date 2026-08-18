import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import pkg from "../../../../package.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Versi Aplikasi | BAPENDA Provinsi Jambi",
  description: "Informasi versi aplikasi website BAPENDA Provinsi Jambi.",
  robots: { index: false, follow: false },
};

function getGitCommit(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_COMMIT_SHA;
  if (fromEnv) return fromEnv.slice(0, 7);

  try {
    const head = fs.readFileSync(path.join(process.cwd(), ".git", "HEAD"), "utf8").trim();
    const ref = head.startsWith("ref:") ? head.replace("ref:", "").trim() : null;

    if (ref) {
      return fs
        .readFileSync(path.join(process.cwd(), ".git", ref), "utf8")
        .trim()
        .slice(0, 7);
    }
    return head.slice(0, 7);
  } catch {
    return null;
  }
}

const APP_VERSION = pkg.version;

export default function StageVersionPage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "BAPENDA Provinsi Jambi";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "-";
  const nodeEnv = process.env.NODE_ENV || "development";
  const commit = getGitCommit() || "-";
  const accessedAt = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const rows: Array<{ label: string; value: string }> = [
    { label: "Nama Aplikasi", value: appName },
    { label: "Versi Aplikasi", value: APP_VERSION },
    { label: "Commit", value: commit },
    { label: "URL", value: appUrl },
    { label: "Waktu Akses", value: accessedAt },
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Versi Aplikasi</CardTitle>
            <Badge variant="outline">{nodeEnv}</Badge>
          </div>
          <CardDescription>
            Informasi versi aplikasi yang sedang berjalan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="divide-y divide-border rounded-lg border">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <dt className="text-sm text-muted-foreground">{row.label}</dt>
                <dd className="truncate text-sm font-medium">{row.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </main>
  );
}
