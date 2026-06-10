"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const { setUser } = useAuthStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    try {
      const res = await api.post("/auth/login", data);
      setUser(res.data.data.user);
      toast.success("Login berhasil");
      router.push("/cms/dashboard");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Login gagal");
    }
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="space-y-2 text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-2">
          <span className="text-white font-bold text-xl">BP</span>
        </div>
        <CardTitle className="text-2xl font-bold text-primary">BAPENDA Jambi</CardTitle>
        <CardDescription>Masuk ke sistem manajemen konten</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@bapenda.jambiprov.go.id"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" loading={isSubmitting}>Masuk</Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Sistem Manajemen Konten BAPENDA Provinsi Jambi
        </p>
      </CardContent>
    </Card>
  );
}
