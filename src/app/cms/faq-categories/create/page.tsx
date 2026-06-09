"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  description: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

type FormInput = z.infer<typeof schema>;

export default function CreateFaqCategoryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { isActive: true, sortOrder: 0 },
  });

  const isActive = watch("isActive");

  const mutation = useMutation({
    mutationFn: (data: FormInput) => api.post("/cms/faq-categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-faq-categories-list"] });
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      toast.success("Kategori FAQ berhasil dibuat");
      router.push("/cms/faq-categories");
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || "Gagal membuat kategori"),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cms/faq-categories"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Tambah Kategori FAQ</h1>
          <p className="text-sm text-muted-foreground">Buat kategori baru untuk mengelompokkan FAQ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi Kategori</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori *</Label>
              <Input id="name" placeholder="Contoh: Pajak Kendaraan Bermotor" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
                checked={isActive}
                onCheckedChange={(v) => setValue("isActive", v)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/cms/faq-categories">Batal</Link>
          </Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>Simpan Kategori</Button>
        </div>
      </form>
    </div>
  );
}
