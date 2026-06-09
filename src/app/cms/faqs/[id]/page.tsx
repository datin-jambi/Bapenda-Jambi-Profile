"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Pencil, Eye, Calendar, User } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store";

type FaqDetail = {
  id: number;
  question: string;
  answer: string;
  slug: string;
  isPublished: boolean;
  viewCount: number;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category: { id: number; name: string; slug: string };
  author: { id: number; name: string };
  updatedBy: { id: number; name: string } | null;
};

export default function FaqDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();

  const { data: faq, isLoading } = useQuery<FaqDetail>({
    queryKey: ["cms-faq-detail", id],
    queryFn: () => api.get(`/cms/faqs/${id}`).then((r) => r.data.data),
  });

  const canManage = user?.role === "Super_Admin" || user?.role === "Admin";

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (!faq) {
    return (
      <div className="max-w-3xl">
        <p className="text-muted-foreground">FAQ tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cms/faqs"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Detail FAQ</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={faq.isPublished ? "success" : "outline"}>
              {faq.isPublished ? "Dipublikasi" : "Draft"}
            </Badge>
            <Badge variant="outline">{faq.category?.name}</Badge>
          </div>
        </div>
        {canManage && (
          <Button asChild>
            <Link href={`/cms/faqs/${id}/edit`}><Pencil className="mr-2 h-4 w-4" />Edit</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Pertanyaan</CardTitle></CardHeader>
        <CardContent>
          <p className="text-base font-medium text-gray-800">{faq.question}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Jawaban</CardTitle></CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: faq.answer }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Kategori</span>
              <Badge variant="outline">{faq.category?.name}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={faq.isPublished ? "success" : "outline"}>
                {faq.isPublished ? "Dipublikasi" : "Draft"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Eye className="h-3 w-3" />Total View
              </span>
              <span className="font-medium">{faq.viewCount.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Urutan</span>
              <span className="font-medium">{faq.sortOrder}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Metadata</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />Dibuat Oleh
              </span>
              <span>{faq.author?.name}</span>
            </div>
            {faq.updatedBy && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />Diperbarui Oleh
                </span>
                <span>{faq.updatedBy.name}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />Dibuat
              </span>
              <span>{formatDate(faq.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />Diperbarui
              </span>
              <span>{formatDate(faq.updatedAt)}</span>
            </div>
            {faq.publishedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />Dipublikasi
                </span>
                <span>{formatDate(faq.publishedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
