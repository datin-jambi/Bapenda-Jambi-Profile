"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pageSchema, PageInput } from "@/lib/validations";
import { Textarea } from "@/components/ui/textarea";

export default function CmsPagesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: pages, isLoading } = useQuery({
    queryKey: ["cms-pages"],
    queryFn: () => api.get("/cms/pages").then((r) => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PageInput>({
    resolver: zodResolver(pageSchema),
  });

  const saveMutation = useMutation({
    mutationFn: (data: PageInput) => api.put(`/cms/pages/${editId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-pages"] });
      toast.success("Halaman berhasil diperbarui");
      setOpen(false); reset(); setEditId(null);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || "Gagal menyimpan"),
  });

  function openEdit(p: { id: string; title: string; slug: string; content: string; seoTitle?: string; seoDescription?: string; isPublished: boolean }) {
    reset({ title: p.title, slug: p.slug, content: p.content, seoTitle: p.seoTitle, seoDescription: p.seoDescription, isPublished: p.isPublished });
    setEditId(p.id);
    setOpen(true);
  }

  const PAGE_LABELS: Record<string, string> = {
    sejarah: "Sejarah",
    "visi-misi": "Visi & Misi",
    tupoksi: "Tupoksi",
    "struktur-organisasi": "Struktur Organisasi",
    pejabat: "Pejabat",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Manajemen Halaman</h1>
        <p className="text-sm text-muted-foreground">Edit konten halaman statis website</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : !pages?.length ? (
            <div className="p-12 text-center text-muted-foreground">Belum ada halaman</div>
          ) : (
            <div className="divide-y">
              {pages.map((p: { id: string; title: string; slug: string; isPublished: boolean }) => (
                <div key={p.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-800">{PAGE_LABELS[p.slug] || p.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">/{p.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={p.isPublished ? "success" : "outline"}>
                      {p.isPublished ? "Dipublikasi" : "Draft"}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                      <Pencil className="h-3 w-3 mr-1" />Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Halaman</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Konten (HTML)</Label>
              <Textarea {...register("content")} rows={14} className="font-mono text-xs" />
              {errors.content && <p className="text-xs text-destructive">{errors.content.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SEO Title</Label>
                <Input {...register("seoTitle")} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...register("isPublished", { setValueAs: (v) => v === "true" || v === true })}>
                  <option value="true">Dipublikasi</option>
                  <option value="false">Draft</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>SEO Description</Label>
              <Textarea {...register("seoDescription")} rows={2} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" loading={isSubmitting}>Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
