"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Eye, Pencil, Trash2, CheckCircle, XCircle, Send } from "lucide-react";
import { formatDate, truncate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/store";
import { ContentStatus } from "@prisma/client";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" | "outline" | "secondary" }> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PENDING_REVIEW: { label: "Menunggu Review", variant: "warning" },
  APPROVED: { label: "Disetujui", variant: "info" },
  REJECTED: { label: "Ditolak", variant: "destructive" },
  PUBLISHED: { label: "Dipublikasi", variant: "success" },
};

export default function CmsNewsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["cms-news", page, search],
    queryFn: () =>
      api.get(`/cms/news?page=${page}&limit=10${search ? `&search=${search}` : ""}`).then((r) => r.data),
  });

  const mutate = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.patch(`/cms/news/${id}`, { action }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["cms-news"] });
      const labels: Record<string, string> = { submit: "Dikirim untuk review", approve: "Disetujui", reject: "Ditolak", publish: "Dipublikasi", unpublish: "Dibatalkan publikasi" };
      toast.success(labels[vars.action] || "Berhasil");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/news/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-news"] }); toast.success("Berita dihapus"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal menghapus"),
  });

  const canApprove = user?.role === "Super_Admin" || user?.role === "Admin";
  const canPublish = user?.role === "Super_Admin" || user?.role === "Admin";
  const canDelete = user?.role === "Super_Admin";

  const news = data?.data ?? [];
  const pagination = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manajemen Berita</h1>
          <p className="text-sm text-muted-foreground">Kelola semua artikel berita</p>
        </div>
        <Button asChild>
          <Link href="/cms/news/create"><Plus className="mr-2 h-4 w-4" />Buat Berita</Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berita..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            {pagination && (
              <span className="text-sm text-muted-foreground">
                Total: {pagination.totalItems} berita
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : news.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <p>Belum ada berita</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Penulis</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {news.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-xs">
                      <span title={item.title}>{truncate(item.title, 60)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category?.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_MAP[item.status]?.variant ?? "outline"}>
                        {STATUS_MAP[item.status]?.label ?? item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.author?.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.status === "DRAFT" && (
                          <Button size="sm" variant="outline" onClick={() => mutate.mutate({ id: item.id, action: "submit" })} title="Kirim Review">
                            <Send className="h-3 w-3" />
                          </Button>
                        )}
                        {canApprove && item.status === "PENDING_REVIEW" && (
                          <>
                            <Button size="sm" variant="outline" className="text-green-600" onClick={() => mutate.mutate({ id: item.id, action: "approve" })} title="Setujui">
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => mutate.mutate({ id: item.id, action: "reject" })} title="Tolak">
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {canPublish && item.status === "APPROVED" && (
                          <Button size="sm" variant="default" onClick={() => mutate.mutate({ id: item.id, action: "publish" })} title="Publikasi">
                            <Eye className="h-3 w-3 mr-1" />Publikasi
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" asChild title="Edit">
                          <Link href={`/cms/news/${item.id}`}><Pencil className="h-3 w-3" /></Link>
                        </Button>
                        {canDelete && (
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => { if (confirm("Hapus berita ini?")) deleteMutation.mutate(item.id); }} title="Hapus">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
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
          <p className="text-sm text-muted-foreground">
            Halaman {pagination.page} dari {pagination.totalPages} ({pagination.totalItems} berita)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Selanjutnya</Button>
          </div>
        </div>
      )}
    </div>
  );
}
