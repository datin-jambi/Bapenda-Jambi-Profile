"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Images, HelpCircle, TrendingUp, Clock } from "lucide-react";
import { useAuthStore } from "@/store";
import { formatDate } from "@/lib/utils";

function StatCard({ title, value, icon: Icon, sub, color }: {
  title: string; value: number; icon: React.ElementType; sub?: string; color: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-md ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: newsData } = useQuery({
    queryKey: ["cms-news-stats"],
    queryFn: () => api.get("/cms/news?limit=100").then((r) => r.data.data),
  });

  const { data: galleries } = useQuery({
    queryKey: ["cms-gallery-stats"],
    queryFn: () => api.get("/cms/galleries?limit=100").then((r) => r.data.data),
  });

  const { data: faqs } = useQuery({
    queryKey: ["cms-faq-stats"],
    queryFn: () => api.get("/cms/faqs?limit=100").then((r) => r.data.data),
  });

  const newsTotal = newsData?.pagination?.total ?? 0;
  const galleryTotal = galleries?.pagination?.total ?? 0;
  const faqTotal = faqs?.pagination?.total ?? 0;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Selamat Pagi" : currentHour < 17 ? "Selamat Siang" : "Selamat Malam";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {greeting}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {formatDate(new Date())} — Selamat datang di CMS BAPENDA Provinsi Jambi
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Berita" value={newsTotal} icon={Newspaper} color="bg-blue-500" sub="Semua status" />
        <StatCard title="Total Galeri" value={galleryTotal} icon={Images} color="bg-purple-500" sub="Semua status" />
        <StatCard title="Total FAQ" value={faqTotal} icon={HelpCircle} color="bg-green-500" sub="Semua pertanyaan" />
        <StatCard title="Hari Ini" value={new Date().getDate()} icon={Clock} color="bg-secondary" sub={formatDate(new Date())} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" />
              Informasi Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Nama</span>
              <span className="font-medium">{user?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium capitalize">{user?.role?.replace(/_/g, " ")}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Panduan Cepat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Gunakan menu <strong>Berita</strong> untuk membuat dan mengelola artikel</p>
            <p>• Upload foto dan video melalui menu <strong>Galeri</strong></p>
            <p>• Kelola pertanyaan umum di menu <strong>FAQ</strong></p>
            <p>• Atur konten statis di menu <strong>Halaman</strong></p>
            <p>• Semua konten baru melewati <strong>alur persetujuan</strong> sebelum dipublikasi</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
