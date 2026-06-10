"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuthStore } from "@/store";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema, changePasswordSchema, UpdateUserInput, ChangePasswordInput } from "@/lib/validations";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CmsProfilePage() {
  const { user: storeUser, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: me, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/auth/me").then((r) => r.data.data),
  });

  const profileForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    if (me) {
      profileForm.reset({ name: me.name, email: me.email, phone: me.phone, gender: me.gender });
    }
  }, [me, profileForm]);

  const profileMutation = useMutation({
    mutationFn: (data: UpdateUserInput) => api.put(`/cms/users/${me?.id}`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      if (storeUser) setUser({ ...storeUser, name: res.data.data.name });
      toast.success("Profil berhasil diperbarui");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || "Gagal"),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: ChangePasswordInput) =>
      api.put(`/cms/users/${me?.id}/password`, data),
    onSuccess: () => { passwordForm.reset(); toast.success("Password berhasil diubah"); },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || "Gagal mengubah password"),
  });

  if (isLoading) return (
    <div className="space-y-4 max-w-2xl">
      {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-primary">Profil Saya</h1>
        <p className="text-sm text-muted-foreground">Kelola informasi profil Anda</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={me?.avatarUrl || ""} />
              <AvatarFallback className="bg-primary text-white text-lg">
                {me?.name ? getInitials(me.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{me?.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{me?.role?.replace(/_/g, " ")}</p>
              {me?.uptd && <p className="text-xs text-muted-foreground">{me.uptd.name}</p>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input {...profileForm.register("name")} />
                {profileForm.formState.errors.name && <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" {...profileForm.register("email")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>No. Telepon</Label>
                <Input {...profileForm.register("phone")} placeholder="08xxxxxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Controller
                  control={profileForm.control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={profileMutation.isPending}>Simpan Perubahan</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Ubah Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-4">
            <div className="space-y-2">
              <Label>Password Saat Ini</Label>
              <div className="relative">
                <Input type={showCurrent ? "text" : "password"} {...passwordForm.register("currentPassword")} className="pr-10" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password Baru</Label>
              <div className="relative">
                <Input type={showNew ? "text" : "password"} {...passwordForm.register("newPassword")} className="pr-10" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input type={showConfirm ? "text" : "password"} {...passwordForm.register("confirmPassword")} className="pr-10" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>}
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? "Mengubah..." : "Ubah Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
