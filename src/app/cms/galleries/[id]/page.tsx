"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gallerySchema, GalleryInput } from "@/lib/validations";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, Trash2, Send, CheckCircle, XCircle, Eye, Upload } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/cms/image-upload";
import { useAuthStore } from "@/store";
import { FallbackImage } from "@/components/ui/fallback-image";

export default function EditGalleryPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: gallery, isLoading } = useQuery({
    queryKey: ["cms-gallery-detail", id],
    queryFn: () => api.get(`/cms/galleries/${id}`).then((r) => r.data.data),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm<GalleryInput>({
    resolver: zodResolver(gallerySchema),
  });

  const coverImage = watch("coverImage");
  const [addingItem, setAddingItem] = useState(false);
  const [pendingUrls, setPendingUrls] = useState<string[]>([]);
  const [uploadingMultiple, setUploadingMultiple] = useState(false);
  const multiInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gallery) reset({ title: gallery.title, description: gallery.description, coverImage: gallery.coverImage });
  }, [gallery, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: GalleryInput) => api.put(`/cms/galleries/${id}`, data),
    onSuccess: () => { toast.success("Galeri diperbarui"); queryClient.invalidateQueries({ queryKey: ["cms-gallery-detail", id] }); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const actionMutation = useMutation({
    mutationFn: (action: string) => api.patch(`/cms/galleries/${id}`, { action }),
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ["cms-gallery-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["cms-galleries"] });
      const msgs: Record<string, string> = { submit: "Dikirim untuk review", approve: "Disetujui", reject: "Ditolak", publish: "Dipublikasi", unpublish: "Dibatalkan" };
      toast.success(msgs[action] || "Berhasil");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const addItemMutation = useMutation({
    mutationFn: (fileUrl: string) => api.post(`/cms/galleries/${id}/items`, { mediaType: "IMAGE", fileUrl }),
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal menambah foto"),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => api.delete(`/cms/galleries/${id}/items/${itemId}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-gallery-detail", id] }); toast.success("Item dihapus"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  async function handleMultipleUpload(files: FileList) {
    setUploadingMultiple(true);
    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name}: ukuran maks 5MB`); continue; }
      try {
        const authRes = await api.get("/upload/auth");
        const { token, expire, signature } = authRes.data.data;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
        formData.append("signature", signature);
        formData.append("expire", expire);
        formData.append("token", token);
        formData.append("fileName", file.name);
        formData.append("folder", "/gallery");
        const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload gagal");
        const result = await res.json();
        uploadedUrls.push(result.url);
      } catch {
        toast.error(`Gagal upload: ${file.name}`);
      }
    }
    setPendingUrls((prev) => [...prev, ...uploadedUrls]);
    setUploadingMultiple(false);
  }

  async function handleSaveAllItems() {
    if (!pendingUrls.length) return;
    await Promise.all(pendingUrls.map((url) => addItemMutation.mutateAsync(url)));
    queryClient.invalidateQueries({ queryKey: ["cms-gallery-detail", id] });
    setPendingUrls([]);
    setAddingItem(false);
    toast.success(`${pendingUrls.length} foto berhasil ditambahkan`);
  }

  if (isLoading) return <div className="space-y-4 max-w-4xl">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>;

  const isAdmin = user?.role === "Super_Admin" || user?.role === "Admin";
  const status = gallery?.status;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/cms/galleries"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Edit Galeri</h1>
          <Badge variant={status === "PUBLISHED" ? "success" : status === "REJECTED" ? "destructive" : "outline"} className="mt-1">{status}</Badge>
        </div>
        <div className="flex gap-2">
          {status === "DRAFT" && <Button variant="outline" size="sm" onClick={() => actionMutation.mutate("submit")} disabled={actionMutation.isPending}><Send className="mr-1 h-3 w-3" />Kirim Review</Button>}
          {isAdmin && status === "PENDING_REVIEW" && (
            <>
              <Button variant="outline" size="sm" className="text-green-600" onClick={() => actionMutation.mutate("approve")} disabled={actionMutation.isPending}><CheckCircle className="mr-1 h-3 w-3" />Setujui</Button>
              <Button variant="outline" size="sm" className="text-red-600" onClick={() => actionMutation.mutate("reject")} disabled={actionMutation.isPending}><XCircle className="mr-1 h-3 w-3" />Tolak</Button>
            </>
          )}
          {isAdmin && status === "APPROVED" && <Button size="sm" onClick={() => actionMutation.mutate("publish")} disabled={actionMutation.isPending}><Eye className="mr-1 h-3 w-3" />Publikasi</Button>}
          {isAdmin && status === "PUBLISHED" && <Button variant="outline" size="sm" onClick={() => actionMutation.mutate("unpublish")} disabled={actionMutation.isPending}>Batalkan Publikasi</Button>}
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi Galeri</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Judul *</Label>
              <Input {...register("title")} />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea rows={3} {...register("description")} />
            </div>
            <div className="space-y-2">
              <Label>Gambar Cover</Label>
              <ImageUpload
                value={coverImage || ""}
                onChange={async (url) => {
                  setValue("coverImage", url);
                  try {
                    await api.patch(`/cms/galleries/${id}`, { action: "set-cover", coverImage: url });
                    queryClient.invalidateQueries({ queryKey: ["cms-gallery-detail", id] });
                    toast.success("Cover berhasil disimpan");
                  } catch {
                    toast.error("Gagal menyimpan cover");
                  }
                }}
                folder="/gallery"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" loading={isSubmitting}>Simpan</Button>
        </div>
      </form>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Foto ({gallery?.items?.length || 0} item)</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setAddingItem(!addingItem)}>
              <Plus className="mr-1 h-3 w-3" />Tambah Foto
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {addingItem && (
            <div className="p-4 border rounded-lg space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <Label>Upload Multiple Foto</Label>
                <span className="text-xs text-muted-foreground">{pendingUrls.length} foto dipilih</span>
              </div>

              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-primary/50 cursor-pointer transition-colors"
                onClick={() => multiInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) handleMultipleUpload(e.dataTransfer.files); }}
              >
                {uploadingMultiple ? (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">Mengupload...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8 text-gray-300" />
                    <p className="text-sm font-medium">Klik atau drag & drop foto</p>
                    <p className="text-xs">Pilih beberapa foto sekaligus — JPG, PNG, WEBP — Maks. 5MB per file</p>
                  </div>
                )}
              </div>

              <input
                ref={multiInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files?.length) handleMultipleUpload(e.target.files); e.target.value = ""; }}
              />

              {pendingUrls.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {pendingUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded overflow-hidden bg-gray-100">
                      <FallbackImage src={url} alt={`preview-${i}`} fallback="galleryItem" fill className="object-cover" />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5"
                        onClick={() => setPendingUrls((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  loading={addItemMutation.isPending}
                  disabled={!pendingUrls.length}
                  onClick={handleSaveAllItems}
                >
                  {`Simpan ${pendingUrls.length} Foto`}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => { setAddingItem(false); setPendingUrls([]); }}>Batal</Button>
              </div>
            </div>
          )}

          {!gallery?.items?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada foto. Klik "Tambah Foto" untuk mulai.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {gallery.items.map((item: any) => (
                <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <FallbackImage src={item.fileUrl} alt={item.title || "Gallery item"} fallback="galleryItem" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => { if (confirm("Hapus foto ini?")) deleteItemMutation.mutate(item.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
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
