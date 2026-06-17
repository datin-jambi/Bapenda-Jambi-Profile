"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageSchema, PageInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/axios";
import { toast } from "sonner";
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "@/components/cms/rich-text-editor";

export default function EditPagePage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: pageData, isLoading } = useQuery({
    queryKey: ["cms-page-detail", id],
    queryFn: () => api.get(`/cms/pages/${id}`).then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PageInput>({
    resolver: zodResolver(pageSchema),
    defaultValues: { isPublished: false, content: "" },
  });

  useEffect(() => {
    if (pageData) {
      reset({
        title: pageData.title,
        slug: pageData.slug,
        content: pageData.content,
        seoTitle: pageData.seoTitle,
        seoDescription: pageData.seoDescription,
        isPublished: pageData.isPublished,
      });
    }
  }, [pageData, reset]);

  const contentValue = watch("content") ?? "";
  const titleValue = watch("title");
  const isPublished = watch("isPublished");

  const updateMutation = useMutation({
    mutationFn: (data: PageInput) => api.put(`/cms/pages/${id}`, data),
    onSuccess: () => {
      toast.success("Halaman berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: ["cms-page-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["cms-pages"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || "Gagal menyimpan"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cms/pages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Edit Halaman</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={isPublished ? "success" : "outline"}>
              {isPublished ? "Dipublikasi" : "Draft"}
            </Badge>
            <span className="text-xs text-muted-foreground">/{pageData?.slug}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* ── LEFT: Editor ─────────────────────────────────── */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informasi Halaman</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Judul *</Label>
                  <Input placeholder="Judul halaman" {...register("title")} />
                  {errors.title && (
                    <p className="text-xs text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input placeholder="slug-halaman" {...register("slug")} />
                </div>

                <div className="space-y-2">
                  <Label>Konten *</Label>
                  <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        placeholder="Tulis konten halaman di sini..."
                        minHeight={320}
                      />
                    )}
                  />
                  {errors.content && (
                    <p className="text-xs text-destructive">{errors.content.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input
                    placeholder="Kosongkan untuk menggunakan judul"
                    {...register("seoTitle")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SEO Description</Label>
                  <Textarea
                    placeholder="Deskripsi singkat untuk mesin pencari"
                    rows={2}
                    {...register("seoDescription")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Status Publikasi</p>
                    <p className="text-xs text-muted-foreground">
                      Aktifkan untuk mempublikasi halaman
                    </p>
                  </div>
                  <Controller
                    name="isPublished"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/cms/pages">Batal</Link>
              </Button>
              <Button
                type="submit"
                loading={isSubmitting || updateMutation.isPending}
                disabled={!isDirty}
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>

          {/* ── RIGHT: Preview ───────────────────────────────── */}
          <div className="xl:sticky xl:top-6">
            <Card className="h-full">
              <CardHeader className="border-b pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Preview</CardTitle>
                  {titleValue && (
                    <span className="ml-auto text-xs text-muted-foreground truncate max-w-[200px]">
                      {titleValue}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {contentValue ? (
                  <div
                    className="prose-content overflow-auto max-h-[70vh]"
                    dangerouslySetInnerHTML={{ __html: contentValue }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                    <Eye className="h-10 w-10 text-gray-200" />
                    <p className="text-sm">Preview akan muncul saat konten diisi</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
