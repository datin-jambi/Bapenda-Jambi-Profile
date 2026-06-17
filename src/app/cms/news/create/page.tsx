"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsSchema, NewsInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/cms/image-upload";
import { RichTextEditor } from "@/components/cms/rich-text-editor";
import Image from "next/image";

export default function CreateNewsPage() {
  const router = useRouter();

  const { data: categories } = useQuery({
    queryKey: ["news-categories"],
    queryFn: () => api.get("/cms/news-categories").then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewsInput>({
    resolver: zodResolver(newsSchema),
    defaultValues: { status: "DRAFT", content: "" },
  });

  const thumbnailUrl = watch("thumbnailUrl");
  const titleValue = watch("title");
  const contentValue = watch("content") ?? "";

  const mutation = useMutation({
    mutationFn: (data: NewsInput) => api.post("/cms/news", data),
    onSuccess: () => {
      toast.success("Berita berhasil dibuat");
      router.push("/cms/news");
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || "Gagal membuat berita"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cms/news"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Buat Berita Baru</h1>
          <p className="text-sm text-muted-foreground">Isi form dan lihat preview secara langsung</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* ── LEFT: Editor ─────────────────────────────────── */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Informasi Utama</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Berita *</Label>
                  <Input id="title" placeholder="Masukkan judul berita" {...register("title")} />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Kategori *</Label>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={(v) => field.onChange(parseInt(v, 10))}>
                        <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                        <SelectContent>
                          {categories?.map((cat: { id: number; name: string }) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Ringkasan</Label>
                  <Textarea id="excerpt" placeholder="Ringkasan singkat berita (opsional)" rows={3} {...register("excerpt")} />
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
                        placeholder="Tulis konten berita di sini..."
                        minHeight={320}
                      />
                    )}
                  />
                  {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Gambar Thumbnail</CardTitle></CardHeader>
              <CardContent>
                <ImageUpload
                  value={thumbnailUrl || ""}
                  onChange={(url) => setValue("thumbnailUrl", url)}
                  folder="/news"
                  module="news"
                  label={titleValue || "berita"}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input id="seoTitle" placeholder="Judul SEO (kosongkan untuk menggunakan judul berita)" {...register("seoTitle")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea id="seoDescription" placeholder="Deskripsi SEO (maks. 160 karakter)" rows={2} {...register("seoDescription")} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href="/cms/news">Batal</Link>
              </Button>
              <Button type="submit" loading={isSubmitting || mutation.isPending}>Simpan sebagai Draft</Button>
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
                {thumbnailUrl && (
                  <Image
                    src={thumbnailUrl}
                    alt={titleValue || "thumbnail"}
                    width={800}
                    height={192}
                    className="w-full h-48 object-cover rounded-md mb-4"
                    unoptimized
                  />
                )}
                {contentValue ? (
                  <div
                    className="prose-content overflow-auto max-h-[60vh]"
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
