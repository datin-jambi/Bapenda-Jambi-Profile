"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Pencil, HelpCircle } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store";

type FaqCategoryDetail = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { faqs: number };
  faqs: {
    id: number;
    question: string;
    isPublished: boolean;
    viewCount: number;
    sortOrder: number;
    createdAt: string;
  }[];
};

export default function FaqCategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const canManage = user?.role === "Super_Admin" || user?.role === "Admin";

  const { data: category, isLoading } = useQuery<FaqCategoryDetail>({
    queryKey: ["cms-faq-category-detail", id],
    queryFn: () => api.get(`/cms/faq-categories/${id}`).then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (!category) {
    return <div className="max-w-3xl"><p className="text-muted-foreground">Kategori tidak ditemukan.</p></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cms/faq-categories"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Detail Kategori FAQ</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={category.isActive ? "success" : "outline"}>
              {category.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
        </div>
        {canManage && (
          <Button asChild>
            <Link href={`/cms/faq-categories/${id}/edit`}><Pencil className="mr-2 h-4 w-4" />Edit</Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi Kategori</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Nama</p>
              <p className="font-medium">{category.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Slug</p>
              <p className="font-mono text-xs bg-gray-50 px-2 py-1 rounded">{category.slug}</p>
            </div>
            {category.description && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Deskripsi</p>
                <p>{category.description}</p>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Urutan</span>
              <span className="font-medium">{category.sortOrder}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total FAQ</span>
              <Badge variant="secondary">{category._count.faqs} FAQ</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Metadata</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dibuat</span>
              <span>{formatDate(category.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Diperbarui</span>
              <span>{formatDate(category.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ list in this category */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Daftar FAQ dalam Kategori Ini</CardTitle>
            {canManage && (
              <Button size="sm" asChild variant="outline">
                <Link href={`/cms/faqs/create`}><HelpCircle className="mr-2 h-3 w-3" />Tambah FAQ</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {category.faqs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Belum ada FAQ dalam kategori ini</p>
          ) : (
            <div className="space-y-2">
              {category.faqs.map((faq) => (
                <div key={faq.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant={faq.isPublished ? "success" : "outline"} className="flex-shrink-0 text-xs">
                      {faq.isPublished ? "Publish" : "Draft"}
                    </Badge>
                    <p className="text-sm text-gray-800 truncate">{faq.question}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-xs text-muted-foreground">{faq.viewCount}x</span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/cms/faqs/${faq.id}`}><Pencil className="h-3 w-3" /></Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
