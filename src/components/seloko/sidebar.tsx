"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebarStore, useAuthStore } from "@/store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import NextImage from "next/image";
import { visibleNavItems, isNavActive } from "@/components/seloko/nav-items";
import { useMounted } from "@/hooks/use-mounted";

export function SelokoSidebar() {
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarStore();
  const { user } = useAuthStore();
  // Sidebar & auth dipersist di localStorage — tahan sampai mounted agar
  // render pertama klien sama dengan HTML server.
  const mounted = useMounted();
  const expanded = mounted ? isOpen : true;

  const visibleItems = visibleNavItems(mounted ? user?.role : undefined);

  return (
    <aside
      className={cn(
        // Desktop-only: di mobile navigasi ditangani bottom bar + drawer.
        "hidden md:block fixed left-0 top-0 z-40 h-screen bg-primary text-white transition-all duration-300",
        expanded ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-primary-600">
        {expanded && (
          <Link href="/seloko/dashboard" className="flex items-center gap-2 min-w-0">
            <NextImage
              src="/icons/logo.png"
              alt="Logo BAPENDA"
              width={32}
              height={32}
              className="flex-shrink-0 rounded-md"
            />
            <span className="text-sm font-semibold leading-tight truncate">Seloko</span>
          </Link>
        )}
        {!expanded && (
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
            !expanded && "hidden"
          )}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Toggle when collapsed */}
      {!expanded && (
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
            const isActive = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white",
                  !expanded && "justify-center px-2"
                )}
                title={!expanded ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {expanded && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
