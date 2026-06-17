"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema, UpdateUserInput } from "@/lib/validations";
import { useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store";
import { Role } from "@prisma/client";

const ROLES: { value: Role; label: string }[] = [
  { value: "Super_Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
  { value: "Editor", label: "Editor" },
  { value: "Ketua_Uptd", label: "Ketua UPTD" },
  { value: "Admin_Uptd", label: "Admin UPTD" },
];

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const { user: me } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["cms-user", id],
    queryFn: () => api.get(`/cms/users/${id}`).then((r) => r.data.data),
  });

  const { data: uptds } = useQuery({
    queryKey: ["uptds"],
    queryFn: () => api.get("/cms/uptd").then((r) => r.data.data),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  const role = watch("role");

  useEffect(() => {
    if (userData) {
      reset({ name: userData.name, email: userData.email, phone: userData.phone, gender: userData.gender, role: userData.role, uptdId: userData.uptdId, isActive: userData.isActive });
    }
  }, [userData, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserInput) => api.put(`/cms/users/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-user", id] }); toast.success("Pengguna diperbarui"); },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (isActive: boolean) => api.put(`/cms/users/${id}`, { isActive }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-user", id] }); toast.success("Status diperbarui"); },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || "Gagal"),
  });

  if (isLoading) return (
    <div className="space-y-4 max-w-2xl">
      {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/cms/users"><ArrowLeft className="h-4 w-4" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Edit Pengguna</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={userData?.isActive ? "success" : "destructive"}>
              {userData?.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
            <Badge variant="outline">{userData?.role?.replace(/_/g, " ")}</Badge>
          </div>
        </div>
        {me?.role === "Super_Admin" && (
          <Button
            variant={userData?.isActive ? "destructive" : "default"}
            size="sm"
            onClick={() => toggleActiveMutation.mutate(!userData?.isActive)}
            disabled={toggleActiveMutation.isPending}
          >
            {userData?.isActive ? "Nonaktifkan" : "Aktifkan"}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Informasi Pengguna</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...register("email")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>No. Telepon</Label>
                <Input {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select defaultValue={userData?.gender} onValueChange={(v) => setValue("gender", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {me?.role === "Super_Admin" && (
              <>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select defaultValue={userData?.role} onValueChange={(v) => setValue("role", v as Role)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {(role === "Ketua_Uptd" || role === "Admin_Uptd") && (
                  <div className="space-y-2">
                    <Label>UPTD</Label>
                    <Select defaultValue={String(userData?.uptdId) || ""} onValueChange={(v) => setValue("uptdId", parseInt(v, 10))}>
                      <SelectTrigger><SelectValue placeholder="Pilih UPTD" /></SelectTrigger>
                      <SelectContent>
                        {uptds?.map((u: { id: number; name: string }) => <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-end">
              <Button type="submit" loading={isSubmitting}>Simpan Perubahan</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
