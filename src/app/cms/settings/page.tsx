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
import { Save, Globe, Phone, Share2, Settings2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type SettingsForm = {
  site_name: string;
  site_description: string;
  site_keywords: string;
  meta_author: string;
  logo_url: string;
  contact_address: string;
  contact_phone: string;
  contact_email: string;
  contact_fax: string;
  office_hours: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_youtube: string;
  social_tiktok: string;
  google_analytics_id: string;
  footer_text: string;
};

const SECTIONS = [
  {
    title: "Informasi Umum",
    icon: Globe,
    fields: [
      { key: "site_name" as const, label: "Nama Website", placeholder: "BAPENDA Provinsi Jambi" },
      { key: "site_description" as const, label: "Deskripsi Website", placeholder: "Website resmi...", type: "textarea" as const },
      { key: "site_keywords" as const, label: "Keywords SEO", placeholder: "bapenda, pajak, jambi..." },
      { key: "meta_author" as const, label: "Meta Author", placeholder: "BAPENDA Provinsi Jambi" },
      { key: "logo_url" as const, label: "URL Logo", placeholder: "https://..." },
    ],
  },
  {
    title: "Informasi Kontak",
    icon: Phone,
    fields: [
      { key: "contact_address" as const, label: "Alamat", placeholder: "Jl. Ahmad Yani No. 1...", type: "textarea" as const },
      { key: "contact_phone" as const, label: "Telepon", placeholder: "(0741) 60436" },
      { key: "contact_email" as const, label: "Email", placeholder: "info@bapenda.jambiprov.go.id" },
      { key: "contact_fax" as const, label: "Fax", placeholder: "(0741) 60436" },
      { key: "office_hours" as const, label: "Jam Operasional", placeholder: "Senin - Jumat: 08.00 - 16.00 WIB" },
    ],
  },
  {
    title: "Media Sosial",
    icon: Share2,
    fields: [
      { key: "social_facebook" as const, label: "Facebook URL", placeholder: "https://facebook.com/..." },
      { key: "social_twitter" as const, label: "Twitter/X URL", placeholder: "https://twitter.com/..." },
      { key: "social_instagram" as const, label: "Instagram URL", placeholder: "https://instagram.com/..." },
      { key: "social_youtube" as const, label: "YouTube URL", placeholder: "https://youtube.com/..." },
      { key: "social_tiktok" as const, label: "TikTok URL", placeholder: "https://tiktok.com/..." },
    ],
  },
  {
    title: "Lainnya",
    icon: Settings2,
    fields: [
      { key: "google_analytics_id" as const, label: "Google Analytics ID", placeholder: "G-XXXXXXXXXX" },
      { key: "footer_text" as const, label: "Teks Footer", placeholder: "© 2024 BAPENDA Provinsi Jambi..." },
    ],
  },
];

export default function CmsSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["cms-settings"],
    queryFn: () => api.get("/cms/settings").then((r) => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { isDirty, isSubmitting } } = useForm<SettingsForm>();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (data: SettingsForm) => api.put("/cms/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-settings"] });
      toast.success("Pengaturan berhasil disimpan");
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || "Gagal menyimpan pengaturan"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-primary">Pengaturan Website</h1>
        <p className="text-sm text-muted-foreground">Kelola informasi umum, kontak, dan media sosial website</p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
        {SECTIONS.map(({ title, icon: Icon, fields }) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map(({ key, label, placeholder, type = "input" }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  {type === "textarea" ? (
                    <Textarea
                      id={key}
                      {...register(key as keyof SettingsForm)}
                      placeholder={placeholder}
                      rows={2}
                    />
                  ) : (
                    <Input
                      id={key}
                      {...register(key as keyof SettingsForm)}
                      placeholder={placeholder}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end gap-3">
          {isDirty && (
            <Button type="button" variant="outline" onClick={() => reset(settings)}>
              Reset
            </Button>
          )}
          <Button
            type="submit"
            loading={isSubmitting || mutation.isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}
