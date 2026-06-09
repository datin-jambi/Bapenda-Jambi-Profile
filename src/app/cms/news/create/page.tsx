"use client";

import { useForm } from "react-hook-form";
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
import { Loader2, ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/cms/image-upload";

export default function CreateNewsPage() {
  const router = useRouter();

  const { data: categories } = useQuery({
    queryKey: ["news-categories"],
    queryFn: () => api.get("/cms/news-categories").then((r) => r.data.data),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<NewsInput>({
    resolver: zodResolver(newsSchema),
    defaultValues: { status: "DRAFT" },
  });

  const thumbnailUrl = watch("thumbnailUrl");

  const mutation = useMutation({
    mutationFn: (data: NewsInput) => api.post("/cms/news", data),
    onSuccess: () => {
      toast.success("Berita berhasil dibuat");
      router.push("/cms/news");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal membuat berita"),
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cms/news"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Buat Berita Baru</h1>
          <p className="text-sm text-muted-foreground">Isi form di bawah untuk membuat artikel berita</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
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
              <Select onValueChange={(v) => setValue("categoryId", parseInt(v, 10))}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Ringkasan</Label>
              <Textarea id="excerpt" placeholder="Ringkasan singkat berita (opsional)" rows={3} {...register("excerpt")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Konten *</Label>
              <Textarea id="content" placeholder="Tulis konten berita di sini..." rows={12} {...register("content")} />
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
              folder="/bapenda/news"
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
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : "Simpan sebagai Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}
