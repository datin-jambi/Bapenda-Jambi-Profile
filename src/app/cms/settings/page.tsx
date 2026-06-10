"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Save } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function CmsSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["cms-settings"],
    queryFn: () => api.get("/cms/settings").then((r) => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Record<string, string>>();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.put("/cms/settings", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms-settings"] }); toast.success("Pengaturan berhasil disimpan"); },
    onError: (err: { response?: { data?: { message?: string } } }) => toast.error(err.response?.data?.message || "Gagal menyimpan"),
  });

  if (isLoading) return (
    <div className="space-y-4 max-w-3xl">
      {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-primary">Pengaturan Website</h1>
        <p className="text-sm text-muted-foreground">Kelola pengaturan umum website</p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi Umum</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "site_name", label: "Nama Website" },
              { key: "site_description", label: "Deskripsi Website" },
              { key: "site_keywords", label: "Keywords SEO" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input {...register(key)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Informasi Kontak</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "contact_address", label: "Alamat", type: "textarea" },
              { key: "contact_phone", label: "Telepon" },
              { key: "contact_email", label: "Email" },
              { key: "contact_fax", label: "Fax" },
              { key: "office_hours", label: "Jam Operasional" },
            ].map(({ key, label, type }) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                {type === "textarea"
                  ? <Textarea {...register(key)} rows={2} />
                  : <Input {...register(key)} />}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Media Sosial</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "social_facebook", label: "Facebook URL" },
              { key: "social_twitter", label: "Twitter/X URL" },
              { key: "social_instagram", label: "Instagram URL" },
              { key: "social_youtube", label: "YouTube URL" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input {...register(key)} placeholder="https://..." />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Lainnya</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Google Analytics ID</Label>
              <Input {...register("google_analytics_id")} placeholder="G-XXXXXXXXXX" />
            </div>
            <div className="space-y-2">
              <Label>Teks Footer</Label>
              <Input {...register("footer_text")} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} leftIcon={<Save className="h-4 w-4" />}>Simpan Pengaturan</Button>
        </div>
      </form>
    </div>
  );
}
