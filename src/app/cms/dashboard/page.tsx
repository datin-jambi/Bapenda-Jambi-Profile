"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Newspaper, Images, HelpCircle, Clock, Users, TrendingUp, Eye } from "lucide-react";
import { useAuthStore } from "@/store";
import { formatDate } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  PENDING_REVIEW: "#f59e0b",
  APPROVED: "#3b82f6",
  REJECTED: "#ef4444",
  PUBLISHED: "#22c55e",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Menunggu Review",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  PUBLISHED: "Dipublikasi",
};

const ROLE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

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

function formatMonthKey(key: string) {
  const [, m] = key.split("-");
  return MONTH_NAMES[parseInt(m, 10) - 1];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdminOrSuper = user?.role === "Super_Admin" || user?.role === "Admin";

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get("/cms/dashboard/stats").then((r) => r.data.data),
  });

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Selamat Pagi" : currentHour < 17 ? "Selamat Siang" : "Selamat Malam";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{greeting}, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground text-sm mt-1">{formatDate(new Date())} — Memuat data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="h-24 animate-pulse bg-muted rounded mt-4" /></Card>
          ))}
        </div>
      </div>
    );
  }

  const newsByStatusData = (stats?.newsByStatus ?? []).map((s: { status: string; count: number }) => ({
    name: STATUS_LABEL[s.status] ?? s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] ?? "#94a3b8",
  }));

  const galleryByStatusData = (stats?.galleryByStatus ?? []).map((s: { status: string; count: number }) => ({
    name: STATUS_LABEL[s.status] ?? s.status,
    value: s.count,
    color: STATUS_COLORS[s.status] ?? "#94a3b8",
  }));

  const newsPerMonthData = (stats?.newsPerMonth ?? []).map((m: { month: string; count: number }) => ({
    month: formatMonthKey(m.month),
    Berita: m.count,
  }));

  const usersByRoleData = (stats?.usersByRole ?? []).map((r: { role: string; count: number }) => ({
    name: r.role.replace(/_/g, " "),
    value: r.count,
  }));

  const newsByCategoryData = (stats?.newsByCategory ?? []).map((c: { category: string; count: number }) => ({
    name: c.category,
    Berita: c.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {greeting}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {formatDate(new Date())} — Selamat datang di CMS BAPENDA Provinsi Jambi
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Berita" value={stats?.counts?.news ?? 0} icon={Newspaper} color="bg-blue-500" sub="Semua status" />
        <StatCard title="Total Galeri" value={stats?.counts?.gallery ?? 0} icon={Images} color="bg-purple-500" sub="Semua status" />
        <StatCard title="Total FAQ" value={stats?.counts?.faq ?? 0} icon={HelpCircle} color="bg-green-500" sub="Semua pertanyaan" />
        <StatCard
          title={isAdminOrSuper ? "Menunggu Review" : "Dipublikasi"}
          value={isAdminOrSuper ? (stats?.pendingNews ?? 0) : (stats?.publishedNews ?? 0)}
          icon={isAdminOrSuper ? Clock : TrendingUp}
          color={isAdminOrSuper ? "bg-amber-500" : "bg-secondary"}
          sub={isAdminOrSuper ? "Perlu persetujuan" : "Berita live"}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* News per month line chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Berita 6 Bulan Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={newsPerMonthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="Berita" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* News by status pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-primary" />
              Status Berita
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newsByStatusData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">Belum ada data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={newsByStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {newsByStatusData.map((entry: { name: string; value: number; color: string }, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Gallery by status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Images className="h-4 w-4 text-primary" />
              Status Galeri
            </CardTitle>
          </CardHeader>
          <CardContent>
            {galleryByStatusData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-16">Belum ada data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={galleryByStatusData} layout="vertical">
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" name="Jumlah" radius={[0, 4, 4, 0]}>
                    {galleryByStatusData.map((entry: { name: string; value: number; color: string }, i: number) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top viewed FAQs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              FAQ Paling Banyak Dilihat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(stats?.topFaqs ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada data</p>
            ) : (
              (stats?.topFaqs ?? []).map((faq: { id: number; question: string; viewCount: number }, i: number) => (
                <div key={faq.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{faq.question}</p>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (faq.viewCount / ((stats?.topFaqs[0]?.viewCount ?? 1) || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{faq.viewCount}x</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin / Super Admin only charts */}
      {isAdminOrSuper && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Users by role */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Pengguna per Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersByRoleData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">Belum ada data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={usersByRoleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}>
                      {usersByRoleData.map((_: unknown, i: number) => (
                        <Cell key={i} fill={ROLE_COLORS[i % ROLE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* News by category bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" />
                Berita per Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              {newsByCategoryData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-16">Belum ada data</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={newsByCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="Berita" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin/Super: recent activity */}
      {isAdminOrSuper && stats?.recentActivity?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentActivity.map((log: { id: number; action: string; entityType: string; createdAt: string; user: { name: string } }) => (
              <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{log.user.name}</span>
                  <span className="text-muted-foreground">{log.action}</span>
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{log.entityType}</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDate(new Date(log.createdAt))}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Info Akun untuk semua role */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
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
    </div>
  );
}
