"use client";

import { useSidebarStore } from "@/store";
import { CmsSidebar } from "@/components/cms/sidebar";
import { CmsHeader } from "@/components/cms/header";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebarStore();
  const pathname = usePathname();

  const isAuthPage = pathname === "/cms/login";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CmsSidebar />
      <div className={cn("transition-all duration-300", isOpen ? "ml-64" : "ml-16")}>
        <CmsHeader />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
