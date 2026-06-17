"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebarStore, useAuthStore } from "@/store";
import {
  LayoutDashboard, Newspaper, Images, HelpCircle, FileText,
  Shield, Image, Settings, Users, Building2, ChevronLeft, ChevronRight,
  User, ScrollText, Tag,
} from "lucide-react";
import NextImage from "next/image";
import { Role } from "@prisma/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/cms/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cms/news", label: "Berita", icon: Newspaper, roles: ["Super_Admin", "Admin", "Editor", "Ketua_Uptd", "Admin_Uptd"] },
  { href: "/cms/news-categories", label: "Kategori Berita", icon: Tag, roles: ["Super_Admin", "Admin"] },
  { href: "/cms/galleries", label: "Galeri", icon: Images, roles: ["Super_Admin", "Admin", "Editor", "Ketua_Uptd", "Admin_Uptd"] },
  { href: "/cms/faqs", label: "FAQ", icon: HelpCircle, roles: ["Super_Admin", "Admin"] },
  { href: "/cms/faq-categories", label: "Kategori FAQ", icon: ScrollText, roles: ["Super_Admin", "Admin"] },
  { href: "/cms/pages", label: "Halaman", icon: FileText, roles: ["Super_Admin", "Admin"] },
  { href: "/cms/regulations", label: "Regulasi", icon: Shield, roles: ["Super_Admin", "Admin"] },
  { href: "/cms/banners", label: "Banner", icon: Image, roles: ["Super_Admin", "Admin"] },
  { href: "/cms/uptd", label: "UPTD", icon: Building2, roles: ["Super_Admin"] },
  { href: "/cms/users", label: "Pengguna", icon: Users, roles: ["Super_Admin", "Admin"] },
  { href: "/cms/settings", label: "Pengaturan", icon: Settings, roles: ["Super_Admin"] },
  { href: "/cms/profile", label: "Profil Saya", icon: User },
];

export function CmsSidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();
  const { user } = useAuthStore();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user?.role && item.roles.includes(user.role as Role))
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-primary text-white transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-primary-600">
        {isOpen && (
          <Link href="/cms/dashboard" className="flex items-center gap-2 min-w-0">
            <NextImage
              src="/icons/logo.png"
              alt="Logo BAPENDA"
              width={32}
              height={32}
              className="flex-shrink-0 rounded-md"
            />
            <span className="text-sm font-semibold leading-tight truncate">BAPENDA Jambi</span>
          </Link>
        )}
        {!isOpen && (
          <div className="mx-auto">
            <NextImage
              src="/icons/logo.png"
              alt="Logo BAPENDA"
              width={32}
              height={32}
              className="rounded-md"
            />
          </div>
        )}
        <button
          onClick={toggle}
          className={cn(
            "p-1 rounded-md hover:bg-primary-600 transition-colors flex-shrink-0",
            !isOpen && "hidden"
          )}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Toggle when collapsed */}
      {!isOpen && (
        <button
          onClick={toggle}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow"
          aria-label="Expand sidebar"
        >
          <ChevronRight className="h-3 w-3 text-primary" />
        </button>
      )}

      <ScrollArea className="flex-1 h-[calc(100vh-4rem)]">
        <nav className="p-3 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                  !isOpen && "justify-center px-2"
                )}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
