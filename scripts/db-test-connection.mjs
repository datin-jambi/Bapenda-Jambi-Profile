// Tes koneksi DB dari file env. Tidak mencetak password — hanya host:port/db.
// Pakai: npm run db:test:connection [-- .env.staging]   (default .env)
import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { PrismaClient } from "@prisma/client";

// Dibaca langsung dari file, bukan process.env: @prisma/client sudah memuat
// .env saat di-import, jadi process.env bisa berisi nilai dari file lain.
const file = process.argv[2] ?? ".env";
let env;
try {
  env = parseEnv(readFileSync(file, "utf8"));
} catch {
  console.error(`File env "${file}" tidak ditemukan`);
  process.exit(1);
}
console.log(`Env: ${file}`);

function urlInfo(v) {
  try {
    const u = new URL(v);
    return `${u.hostname}:${u.port || "5432"}${u.pathname}`;
  } catch {
    return "(format URL tidak valid)";
  }
}

let failed = 0;
for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
  const url = env[key];
  if (!url) {
    const required = key === "DATABASE_URL";
    console.log(`${required ? "[GAGAL]" : "[INFO] "} ${key.padEnd(13)} kosong${required ? "" : ", lewati"}`);
    if (required) failed++;
    continue;
  }
  const prisma = new PrismaClient({ datasourceUrl: url });
  const t = Date.now();
  try {
    const [r] = await prisma.$queryRawUnsafe("SELECT current_database() AS db, version() AS v");
    console.log(`[OK]    ${key.padEnd(13)} ${urlInfo(url)} (${Date.now() - t} ms) — ${String(r.v).split(" ").slice(0, 2).join(" ").replace(/,$/, "")}`);
  } catch (e) {
    failed++;
    console.log(`[GAGAL] ${key.padEnd(13)} ${urlInfo(url)} — ${String(e.message).trim().split("\n").pop()}`);
  } finally {
    await prisma.$disconnect();
  }
}

process.exit(failed ? 1 : 0);
