"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsSchema, NewsInput } from "@/lib/validations";
import { useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Send, CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/cms/image-upload";
import { useAuthStore } from "@/store";
import { ContentStatus } from "@prisma/client";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Menunggu Review",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  PUBLISHED: "Dipublikasi",
};

export default function EditNewsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["cms-news-detail", id],
    queryFn: () => api.get(`/cms/news/${id}`).then((r) => r.data.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["news-categories"],
    queryFn: () => api.get("/cms/news-categories").then((r) => r.data.data),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<NewsInput>({
    resolver: zodResolver(newsSchema),
  });

  const thumbnailUrl = watch("thumbnailUrl");
  const titleValue = watch("title");

  useEffect(() => {
    if (newsData) {
      reset({
        title: newsData.title,
        categoryId: newsData.categoryId,
        excerpt: newsData.excerpt,
        content: newsData.content,
        thumbnailUrl: newsData.thumbnailUrl,
        seoTitle: newsData.seoTitle,
        seoDescription: newsData.seoDescription,
      });
    }
  }, [newsData, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: NewsInput) => api.put(`/cms/news/${id}`, data),
    onSuccess: () => {
      toast.success("Berita berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["cms-news-detail", id] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || "Gagal menyimpan"),
  });

  const actionMutation = useMutation({
    mutationFn: (action: string) => api.patch(`/cms/news/${id}`, { action }),
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ["cms-news-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["cms-news"] });
      const msgs: Record<string, string> = {
        submit: "Dikirim untuk review", approve: "Disetujui", reject: "Ditolak",
        publish: "Dipublikasi", unpublish: "Dibatalkan",
      };
      toast.success(msgs[action] || "Berhasil");
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || "Gagal"),
  });

  if (isLoading) return (
    <div className="space-y-4 max-w-4xl">
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  );

  const status: ContentStatus = newsData?.status;
  const isAdmin = user?.role === "Super_Admin" || user?.role === "Admin";
  const canEdit = status === "DRAFT" || status === "REJECTED";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cms/news"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Edit Berita</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={status === "PUBLISHED" ? "success" : status === "REJECTED" ? "destructive" : "outline"}>
              {STATUS_LABELS[status] || status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {status === "DRAFT" && (
            <Button variant="secondary" size="sm" loading={actionMutation.isPending}
              onClick={() => actionMutation.mutate("submit")}>
              <Send className="mr-1 h-3 w-3" />Kirim Review
            </Button>
          )}
          {isAdmin && status === "PENDING_REVIEW" && (
            <>
              <Button variant="success" size="sm" loading={actionMutation.isPending}
                onClick={() => actionMutation.mutate("approve")}>
                <CheckCircle className="mr-1 h-3 w-3" />Setujui
              </Button>
              <Button variant="destructive" size="sm" loading={actionMutation.isPending}
                onClick={() => actionMutation.mutate("reject")}>
                <XCircle className="mr-1 h-3 w-3" />Tolak
              </Button>
            </>
          )}
          {isAdmin && status === "APPROVED" && (
            <Button size="sm" loading={actionMutation.isPending}
              onClick={() => actionMutation.mutate("publish")}>
              <Eye className="mr-1 h-3 w-3" />Publikasi
            </Button>
          )}
          {isAdmin && status === "PUBLISHED" && (
            <Button variant="warning" size="sm" loading={actionMutation.isPending}
              onClick={() => actionMutation.mutate("unpublish")}>
              Batalkan Publikasi
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi Utama</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Judul Berita *</Label>
              <Input {...register("title")} disabled={!canEdit} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select
                key={newsData?.categoryId}
                value={String(watch("categoryId") || "")}
                onValueChange={(v) => setValue("categoryId", parseInt(v, 10), { shouldDirty: true })}
                disabled={!canEdit}
              >
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat: { id: number; name: string }) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Ringkasan</Label>
              <Textarea rows={3} {...register("excerpt")} disabled={!canEdit} />
            </div>
            <div className="space-y-2">
              <Label>Konten *</Label>
              <Textarea rows={14} {...register("content")} disabled={!canEdit} />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Gambar Thumbnail</CardTitle></CardHeader>
          <CardContent>
            <ImageUpload
              value={thumbnailUrl || ""}
              onChange={(url) => setValue("thumbnailUrl", url, { shouldDirty: true })}
              folder="/news"
              module="news"
              label={titleValue || newsData?.title || "berita"}
              disabled={!canEdit}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>SEO Title</Label>
              <Input {...register("seoTitle")} disabled={!canEdit} />
            </div>
            <div className="space-y-2">
              <Label>SEO Description</Label>
              <Textarea rows={2} {...register("seoDescription")} disabled={!canEdit} />
            </div>
          </CardContent>
        </Card>

        {canEdit && (
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href="/cms/news">Batal</Link>
            </Button>
            <Button type="submit" loading={isSubmitting}>Simpan Perubahan</Button>
          </div>
        )}
      </form>
    </div>
  );
}
