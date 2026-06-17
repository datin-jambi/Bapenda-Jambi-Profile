"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type PageLink = { slug: string; title: string };

interface PublicHeaderProps {
  pages?: PageLink[];
}

export function PublicHeader({ pages = [] }: PublicHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const profilChildren = pages.length > 0
    ? pages.map((p) => ({ href: `/profil/${p.slug}`, label: p.title }))
    : [
        { href: "/profil/sejarah", label: "Sejarah" },
        { href: "/profil/visi-misi", label: "Visi & Misi" },
        { href: "/profil/tupoksi", label: "Tupoksi" },
        { href: "/profil/struktur-organisasi", label: "Struktur Organisasi" },
        { href: "/profil/pejabat", label: "Pejabat" },
      ];

  const NAV_LINKS = [
    { href: "/", label: "Beranda" },
    { label: "Profil", children: profilChildren },
    {
      label: "Layanan",
      children: [
        { href: "/layanan", label: "Informasi Layanan" },
        { href: "/cek-pajak", label: "Cek Pajak Kendaraan" },
      ],
    },
    { href: "/lokasi-uptd", label: "Lokasi UPTD" },
    { href: "/regulasi", label: "Regulasi" },
    {
      label: "Publikasi",
      children: [
        { href: "/berita", label: "Berita" },
        { href: "/galeri", label: "Galeri" },
      ],
    },
    { href: "/faq", label: "FAQ" },
    { href: "/kontak", label: "Kontak" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image
              src="/icons/logo.png"
              alt="Logo BAPENDA Provinsi Jambi"
              width={40}
              height={40}
              className="rounded-lg"
              priority
            />
            <div className="hidden sm:block">
              <p className="text-primary font-bold text-sm leading-tight">BAPENDA</p>
              <p className="text-gray-500 text-xs leading-tight">Provinsi Jambi</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((item) =>
              item.children ? (
                <div key={item.label} className="relative group">
                  <button
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors rounded-md hover:bg-gray-50"
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  >
                    {item.label}
                    <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block px-4 py-2.5 text-sm hover:bg-primary/5 hover:text-primary transition-colors first:rounded-t-lg last:rounded-b-lg",
                          pathname === child.href ? "text-primary font-medium bg-primary/5" : "text-gray-700"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-gray-700 hover:text-primary hover:bg-gray-50"
                  )}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* CMS Link */}
          <div className="hidden lg:flex items-center gap-2">
            <Button size="sm" asChild>
              <Link href="/cms/login">Login CMS</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((item) =>
            item.children ? (
              <div key={item.label}>
                <button
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700"
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === item.label && "rotate-180")} />
                </button>
                {openDropdown === item.label && (
                  <div className="pl-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-primary"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                className={cn(
                  "block px-3 py-2 text-sm font-medium rounded-md",
                  pathname === item.href ? "text-primary bg-primary/10" : "text-gray-700 hover:text-primary"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            )
          )}
          <div className="pt-2 border-t">
            <Button size="sm" className="w-full" asChild>
              <Link href="/cms/login">Login CMS</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
