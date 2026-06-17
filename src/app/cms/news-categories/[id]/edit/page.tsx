"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsCategorySchema, NewsCategoryInput } from "@/lib/validations";
import { useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditNewsCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["cms-news-category-detail", id],
    queryFn: () => api.get(`/cms/news-categories/${id}`).then((r) => r.data.data),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<NewsCategoryInput>({
    resolver: zodResolver(newsCategorySchema),
    defaultValues: { isActive: true, sortOrder: 0 },
  });

  const isActive = watch("isActive");

  useEffect(() => {
    if (categoryData) {
      reset({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        sortOrder: categoryData.sortOrder,
        isActive: categoryData.isActive,
      });
    }
  }, [categoryData, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: NewsCategoryInput) => api.put(`/cms/news-categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-news-categories-list"] });
      queryClient.invalidateQueries({ queryKey: ["cms-news-category-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["news-categories"] });
      toast.success("Kategori berita berhasil diperbarui");
      router.push(`/cms/news-categories/${id}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || "Gagal menyimpan kategori"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/cms/news-categories/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Edit Kategori Berita</h1>
          <p className="text-sm text-muted-foreground">{categoryData?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi Kategori</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Kategori *</Label>
              <Input placeholder="Contoh: Pajak Daerah" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input placeholder="pajak-daerah" {...register("slug")} />
              <p className="text-xs text-muted-foreground">Harus unik dan lowercase. Kosongkan untuk menggunakan slug saat ini.</p>
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea placeholder="Deskripsi singkat kategori ini (opsional)" rows={3} {...register("description")} />
            </div>

            <div className="space-y-2">
              <Label>Urutan Tampil</Label>
              <Input type="number" min={0} className="w-32" {...register("sortOrder", { valueAsNumber: true })} />
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
            <Link href={`/cms/news-categories/${id}`}>Batal</Link>
          </Button>
          <Button type="submit" loading={isSubmitting || updateMutation.isPending}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
