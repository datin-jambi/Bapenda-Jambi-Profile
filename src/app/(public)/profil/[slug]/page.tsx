import { pageRepository } from "@/repositories/content.repository";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const SLUG_MAP: Record<string, string> = {
  sejarah: "sejarah",
  "visi-misi": "visi-misi",
  tupoksi: "tupoksi",
  "struktur-organisasi": "struktur-organisasi",
  pejabat: "pejabat",
};

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await pageRepository.findBySlug(slug);
  if (!page) return { title: "Tidak Ditemukan" };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || undefined,
  };
}

export default async function ProfilPage({ params }: Props) {
  const { slug: slugParam } = await params;
  const slug = SLUG_MAP[slugParam];
  if (!slug) notFound();

  const page = await pageRepository.findBySlug(slug);
  if (!page || !page.isPublished) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-primary rounded-xl overflow-hidden sticky top-24">
            <div className="bg-primary-800 px-4 py-3">
              <h3 className="text-white font-semibold text-sm">Menu Profil</h3>
            </div>
            <nav className="p-2 space-y-1">
              {Object.entries(SLUG_MAP).map(([key, _val]) => (
                <a
                  key={key}
                  href={`/profil/${key}`}
                  className={`block px-4 py-2.5 text-sm rounded-lg transition-colors ${slugParam === key ? "bg-white text-primary font-medium" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                >
                  {key === "sejarah" ? "Sejarah" :
                   key === "visi-misi" ? "Visi & Misi" :
                   key === "tupoksi" ? "Tupoksi" :
                   key === "struktur-organisasi" ? "Struktur Organisasi" :
                   "Pejabat"}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="lg:col-span-3">
          <div className="bg-white rounded-xl border p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold font-poppins text-primary mb-6 pb-4 border-b">{page.title}</h1>
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: page.content }} />
          </div>
        </main>
      </div>
    </div>
  );
}
