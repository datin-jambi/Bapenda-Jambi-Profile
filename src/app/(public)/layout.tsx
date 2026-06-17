import { PublicHeader } from "@/components/public/header";
import { PublicFooter } from "@/components/public/footer";
import { pageRepository } from "@/repositories/content.repository";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const pages = await pageRepository.findAll()
    .then((all) => all.filter((p) => p.isPublished).map((p) => ({ slug: p.slug, title: p.title })))
    .catch(() => []);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-primary-900 text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <span className="hidden sm:block">Selamat Datang di Website Resmi BAPENDA Provinsi Jambi</span>
          <div className="flex items-center gap-4 ml-auto">
            <a href="https://esamsat.jambiprov.go.id" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">E-Samsat</a>
            <a href="https://jambiprov.go.id" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">Pemprov Jambi</a>
            <a href="https://polda-jambi.go.id" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">Polda Jambi</a>
          </div>
        </div>
      </div>
      <PublicHeader pages={pages} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
