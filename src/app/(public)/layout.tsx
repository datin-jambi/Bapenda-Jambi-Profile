import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { pageRepository } from "@/repositories/content.repository";
import Link from "next/link";

const topLinks = [
  {
    href: "https://play.google.com/store/apps/details?id=app.signal.id&hl=id",
    label: "Aplikasi Signal",
  },
  {
    href: "https://jambiprov.go.id",
    label: "Pemprov Jambi",
  },
  {
    href: "https://poldajambi.com",
    label: "Polda Jambi",
  },
];

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pages = await pageRepository
    .findAll()
    .then((pages) =>
      pages
        .filter((page) => page.isPublished)
        .map(({ slug, title }) => ({ slug, title }))
    )
    .catch(() => []);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-primary-900 py-1.5 text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4">
          <span className="hidden sm:block">
            Selamat Datang di Website Resmi BAPENDA Provinsi Jambi
          </span>

          <div className="ml-auto flex items-center gap-2">
            {topLinks.map((link, index) => (
              <div key={link.href} className="flex items-center gap-2">
                <Link
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary transition-colors"
                >
                  {link.label}
                </Link>

                {index < topLinks.length - 1 && <span>|</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <PublicHeader pages={pages} />

      <main className="flex-1">{children}</main>

      <PublicFooter />
    </div>
  );
}