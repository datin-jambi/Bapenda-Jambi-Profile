"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gallerySchema, GalleryInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/cms/image-upload";

export default function CreateGalleryPage() {
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<GalleryInput>({
    resolver: zodResolver(gallerySchema),
  });

  const coverImage = watch("coverImage");

  const mutation = useMutation({
    mutationFn: (data: GalleryInput) => api.post("/cms/galleries", data),
    onSuccess: (res) => {
      toast.success("Galeri berhasil dibuat");
      router.push(`/cms/galleries/${res.data.data.id}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || "Gagal membuat galeri"),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cms/galleries"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Buat Galeri Baru</h1>
          <p className="text-sm text-muted-foreground">Isi informasi dasar, lalu tambahkan foto setelah dibuat</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi Galeri</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Judul *</Label>
              <Input placeholder="Judul galeri" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea placeholder="Deskripsi galeri" rows={3} {...register("description")} />
            </div>
            <div className="space-y-2">
              <Label>Gambar Cover</Label>
              <ImageUpload value={coverImage || ""} onChange={(url) => setValue("coverImage", url)} folder="/gallery" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild><Link href="/cms/galleries">Batal</Link></Button>
          <Button type="submit" loading={isSubmitting}>Buat Galeri</Button>
        </div>
      </form>
    </div>
  );
}
