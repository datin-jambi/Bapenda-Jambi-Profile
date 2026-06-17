"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsCategorySchema, NewsCategoryInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import { useEffect } from "react";

export default function CreateNewsCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<NewsCategoryInput>({
    resolver: zodResolver(newsCategorySchema),
    defaultValues: { isActive: true, sortOrder: 0 },
  });

  const isActive = watch("isActive");
  const nameValue = watch("name");

  useEffect(() => {
    if (nameValue) {
      setValue("slug", slugify(nameValue));
    }
  }, [nameValue, setValue]);

  const mutation = useMutation({
    mutationFn: (data: NewsCategoryInput) => api.post("/cms/news-categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-news-categories-list"] });
      queryClient.invalidateQueries({ queryKey: ["news-categories"] });
      toast.success("Kategori berita berhasil dibuat");
      router.push("/cms/news-categories");
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || "Gagal membuat kategori"),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cms/news-categories"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Tambah Kategori Berita</h1>
          <p className="text-sm text-muted-foreground">Buat kategori baru untuk mengelompokkan berita</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi Kategori</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori *</Label>
              <Input id="name" placeholder="Contoh: Pajak Daerah" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" placeholder="pajak-daerah" {...register("slug")} />
              <p className="text-xs text-muted-foreground">Otomatis diisi dari nama. Harus unik dan lowercase.</p>
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" placeholder="Deskripsi singkat kategori ini (opsional)" rows={3} {...register("description")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">Urutan Tampil</Label>
              <Input id="sortOrder" type="number" min={0} className="w-32" {...register("sortOrder", { valueAsNumber: true })} />
              <p className="text-xs text-muted-foreground">Angka kecil tampil lebih awal</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium text-sm">Status Aktif</p>
                <p className="text-xs text-muted-foreground">
                  {isActive ? "Kategori aktif dan dapat digunakan" : "Kategori nonaktif, tidak tampil di publik"}
                </p>
              </div>
              <Switch
                checked={isActive ?? true}
                onCheckedChange={(v) => setValue("isActive", v)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/cms/news-categories">Batal</Link>
          </Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>Simpan Kategori</Button>
        </div>
      </form>
    </div>
  );
}
