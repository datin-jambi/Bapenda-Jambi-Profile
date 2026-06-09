"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations";
import { Role } from "@prisma/client";
import { useAuthStore } from "@/store";
import { z } from "zod";

const ROLES: { value: Role; label: string }[] = [
  { value: "Super_Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
  { value: "Editor", label: "Editor" },
  { value: "Ketua_Uptd", label: "Ketua UPTD" },
  { value: "Admin_Uptd", label: "Admin UPTD" },
];

const resetPwSchema = z.object({ newPassword: z.string().min(8, "Min. 8 karakter") });

export default function CmsUsersPage() {
  const { user: me } = useAuthStore();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetTargetId, setResetTargetId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["cms-users", page, search, roleFilter],
    queryFn: () =>
      api.get(`/cms/users?page=${page}&limit=10${search ? `&search=${search}` : ""}${roleFilter ? `&role=${roleFilter}` : ""}`).then((r) => r.data),
  });

  const { data: uptds } = useQuery({
    queryKey: ["uptds"],
    queryFn: () => api.get("/cms/uptd").then((r) => r.data.data),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "Editor" },
  });

  const { register: regReset, handleSubmit: handleReset, reset: resetPw, formState: { isSubmitting: isResetting } } = useForm<{ newPassword: string }>({
    resolver: zodResolver(resetPwSchema),
  });

  const role = watch("role");

  const createMutation = useMutation({
    mutationFn: (data: RegisterInput) => api.post("/cms/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-users"] });
      toast.success("Pengguna berhasil dibuat");
      setOpen(false); reset();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal membuat pengguna"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/cms/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-users"] }); toast.success("Pengguna dihapus"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
      api.post(`/cms/users/${id}/reset-password`, { newPassword }),
    onSuccess: () => {
      toast.success("Password berhasil direset");
      setResetOpen(false); resetPw();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal reset password"),
  });

  const users = data?.data ?? [];
  const pagination = data?.meta;
  const isSuperAdmin = me?.role === "Super_Admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Manajemen Pengguna</h1>
          <p className="text-sm text-muted-foreground">Kelola akun pengguna CMS</p>
        </div>
        {isSuperAdmin && (
          <Button onClick={() => { reset({ role: "Editor" }); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />Tambah Pengguna
          </Button>
        )}
      </div>

      <Card>
        <div className="p-4 border-b flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v === "ALL" ? "" : v); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Semua Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Role</SelectItem>
              {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {pagination && <span className="text-sm text-muted-foreground">Total: {pagination.totalItems} pengguna</span>}
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : !users.length ? (
            <div className="p-12 text-center text-muted-foreground">Belum ada pengguna</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>UPTD</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{u.role.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.uptd?.name || "-"}</TableCell>
                    <TableCell><Badge variant={u.isActive ? "success" : "destructive"}>{u.isActive ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" asChild title="Edit">
                          <a href={`/cms/users/${u.id}`}><Pencil className="h-3 w-3" /></a>
                        </Button>
                        {isSuperAdmin && (
                          <>
                            <Button size="sm" variant="ghost" title="Reset Password" onClick={() => { setResetTargetId(u.id); setResetOpen(true); }}>
                              <KeyRound className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600" title="Hapus" onClick={() => { if (confirm(`Hapus pengguna ${u.name}?`)) deleteMutation.mutate(u.id); }}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
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
          <p className="text-sm text-muted-foreground">Halaman {pagination.page} dari {pagination.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Selanjutnya</Button>
          </div>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tambah Pengguna Baru</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Lengkap *</Label>
              <Input placeholder="Nama lengkap" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" placeholder="email@bapenda.go.id" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input type="password" placeholder="Min. 8 karakter" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select defaultValue="Editor" onValueChange={(v) => setValue("role", v as Role)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {(role === "Ketua_Uptd" || role === "Admin_Uptd") && (
              <div className="space-y-2">
                <Label>UPTD</Label>
                <Select onValueChange={(v) => setValue("uptdId", parseInt(v, 10))}>
                  <SelectTrigger><SelectValue placeholder="Pilih UPTD" /></SelectTrigger>
                  <SelectContent>
                    {uptds?.map((u: any) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>No. Telepon</Label>
                <Input placeholder="08xxxxxxxxxx" {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select onValueChange={(v) => setValue("gender", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan..." : "Buat Pengguna"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
          <form onSubmit={handleReset((d) => { if (resetTargetId) resetPasswordMutation.mutate({ id: resetTargetId, newPassword: d.newPassword }); })} className="space-y-4">
            <div className="space-y-2">
              <Label>Password Baru *</Label>
              <Input type="password" placeholder="Min. 8 karakter" {...regReset("newPassword")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setResetOpen(false); resetPw(); }}>Batal</Button>
              <Button type="submit" disabled={isResetting}>{isResetting ? "Menyimpan..." : "Reset Password"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
