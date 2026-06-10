"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { regulationSchema, RegulationInput } from "@/lib/validations";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { ImageUpload } from "@/components/cms/image-upload";

export default function CmsRegulationsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["cms-regulations", page],
    queryFn: () => api.get(`/cms/regulations?page=${page}&limit=10`).then((r) => r.data.data),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<RegulationInput>({
    resolver: zodResolver(regulationSchema),
  });

  const fileUrl = watch("fileUrl");

  const saveMutation = useMutation({
    mutationFn: (data: RegulationInput) =>
      editId ? api.put(`/cms/regulations/${editId}`, data) : api.post("/cms/regulations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-regulations"] });
      toast.success(editId ? "Regulasi diperbarui" : "Regulasi dibuat");
      setOpen(false); reset(); setEditId(null);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/regulations/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-regulations"] }); toast.success("Regulasi dihapus"); },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || "Gagal"),
  });

  function openCreate() { reset({ fileUrl: "" }); setEditId(null); setOpen(true); }
  function openEdit(r: { id: string; title: string; description?: string; fileUrl: string; publishedAt?: string }) {
    reset({ title: r.title, description: r.description, fileUrl: r.fileUrl, publishedAt: r.publishedAt?.split("T")[0] });
    setEditId(r.id); setOpen(true);
  }

  const regulations = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manajemen Regulasi</h1>
          <p className="text-sm text-muted-foreground">Kelola peraturan dan regulasi</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Tambah Regulasi</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !regulations.length ? (
            <div className="p-12 text-center text-muted-foreground">Belum ada regulasi</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Tanggal Terbit</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regulations.map((r: { id: string; title: string; fileUrl: string; publishedAt?: string }) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.publishedAt ? formatDate(r.publishedAt) : "-"}</TableCell>
                    <TableCell>
                      <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                        <FileText className="h-3 w-3" />Lihat File
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => { if (confirm("Hapus regulasi?")) deleteMutation.mutate(r.id); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Halaman {pagination.page} dari {pagination.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Selanjutnya</Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editId ? "Edit Regulasi" : "Tambah Regulasi Baru"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>Judul *</Label>
              <Input placeholder="Judul regulasi" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea placeholder="Deskripsi regulasi" rows={3} {...register("description")} />
            </div>
            <div className="space-y-2">
              <Label>File Dokumen *</Label>
              <ImageUpload value={fileUrl || ""} onChange={(url) => setValue("fileUrl", url)} folder="/regulations" accept=".pdf,.doc,.docx" />
              {errors.fileUrl && <p className="text-xs text-destructive">{errors.fileUrl.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tanggal Terbit</Label>
              <Input type="date" {...register("publishedAt")} />
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
