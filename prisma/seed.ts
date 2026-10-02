import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

// Urutan penting: parent sebelum child (FK).
const TABLES = [
  ["uptds", "uptd"],
  ["users", "user"],
  ["news_categories", "newsCategory"],
  ["news", "news"],
  ["faq_categories", "faqCategory"],
  ["faqs", "faq"],
  ["galleries", "gallery"],
  ["gallery_items", "galleryItem"],
  ["pages", "page"],
  ["banners", "banner"],
  ["regulations", "regulation"],
  ["settings", "setting"],
  ["audit_logs", "auditLog"],
] as const;

// Kolom Json di schema; di dump nilainya string JSON, harus di-parse dulu.
const JSON_COLUMNS: Record<string, string[]> = { audit_logs: ["oldData", "newData"] };

type Row = Record<string, unknown>;

function loadRows(file: string): Row[] {
  const path = join(__dirname, "data", `${file}.json`);
  // Dump ditulis dengan BOM — JSON.parse menolaknya, jadi dipangkas manual.
  const rows = JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, "")) as Row[];

  return rows.map((row) => {
    const out: Row = {};
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === "string" && key.endsWith("At")) out[key] = new Date(value.replace(" ", "T"));
      else if (typeof value === "string" && JSON_COLUMNS[file]?.includes(key)) out[key] = JSON.parse(value);
      else out[key] = value;
    }
    return out;
  });
}

/**
 * id di dump bersifat eksplisit, jadi sequence Postgres tidak ikut naik dan
 * INSERT berikutnya akan bentrok. Dorong sequence ke max(id).
 */
async function resyncSequence(table: string) {
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`
  );
}

async function main() {
  const loaded = TABLES.map(([file, model]) => ({ file, model, rows: loadRows(file) }));

  await prisma.$transaction(async (tx) => {
    // vehicle_tax_check_logs berisi data operasional (bukan bagian dump) dan
    // menunjuk users, sehingga menghalangi delete. FK dimatikan sementara agar
    // baris itu tetap utuh; validitasnya dicek lagi setelah transaksi.
    await tx.$executeRawUnsafe("SET session_replication_role = replica");

    for (const { model } of [...loaded].reverse()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx as any)[model].deleteMany();
    }

    for (const { model, file, rows } of loaded) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx as any)[model].createMany({ data: rows });
      console.log(`  ${file}: ${rows.length} baris`);
    }

    await tx.$executeRawUnsafe("SET session_replication_role = origin");
    // Default interactive transaction Prisma cuma 5 detik — seed penuh lebih lama (P2028).
  }, { maxWait: 30_000, timeout: 120_000 });

  for (const { file } of loaded) await resyncSequence(file);

  const orphan = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
    `SELECT COUNT(*) AS n FROM vehicle_tax_check_logs l
     LEFT JOIN users u ON u.id = l."userId" WHERE u.id IS NULL`
  );
  if (Number(orphan[0].n) > 0) {
    throw new Error(`${orphan[0].n} baris vehicle_tax_check_logs kehilangan user — seed dibatalkan`);
  }
}

main()
  .then(() => console.log("Seeding selesai."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
