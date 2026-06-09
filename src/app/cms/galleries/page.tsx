"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useAuthStore } from "@/store";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PENDING_REVIEW: { label: "Menunggu Review", variant: "warning" },
  APPROVED: { label: "Disetujui", variant: "default" },
  REJECTED: { label: "Ditolak", variant: "destructive" },
  PUBLISHED: { label: "Dipublikasi", variant: "success" },
};

export default function CmsGalleriesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cms-galleries"],
    queryFn: () => api.get("/cms/galleries?limit=20").then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      api.patch(`/cms/galleries/${id}`, { action }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-galleries"] }); toast.success("Status diperbarui"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/cms/galleries/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-galleries"] }); toast.success("Galeri dihapus"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const canApprove = user?.role === "Super_Admin" || user?.role === "Admin";
  const canDelete = user?.role === "Super_Admin";
  const galleries = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manajemen Galeri</h1>
          <p className="text-sm text-muted-foreground">Kelola foto dan video galeri</p>
        </div>
        <Button asChild>
          <Link href="/cms/galleries/create"><Plus className="mr-2 h-4 w-4" />Buat Galeri</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : galleries.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">Belum ada galeri</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Penulis</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {galleries.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_MAP[item.status]?.variant ?? "outline"}>
                        {STATUS_MAP[item.status]?.label ?? item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item._count?.items ?? 0} item</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.author?.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canApprove && item.status === "PENDING_REVIEW" && (
                          <>
                            <Button size="sm" variant="outline" className="text-green-600" onClick={() => approveMutation.mutate({ id: item.id, action: "approve" })}><CheckCircle className="h-3 w-3" /></Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => approveMutation.mutate({ id: item.id, action: "reject" })}><XCircle className="h-3 w-3" /></Button>
                          </>
                        )}
                        {canApprove && item.status === "APPROVED" && (
                          <Button size="sm" variant="default" onClick={() => approveMutation.mutate({ id: item.id, action: "publish" })}>Publikasi</Button>
                        )}
                        <Button size="sm" variant="ghost" asChild><Link href={`/cms/galleries/${item.id}`}><Pencil className="h-3 w-3" /></Link></Button>
                        {canDelete && (
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => { if (confirm("Hapus galeri ini?")) deleteMutation.mutate(item.id); }}><Trash2 className="h-3 w-3" /></Button>
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
    </div>
  );
}
