"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqSchema, FaqInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type FaqCategory = { id: number; name: string; slug: string };

export default function CreateFaqPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery<FaqCategory[]>({
    queryKey: ["faq-categories"],
    queryFn: () => api.get("/cms/faq-categories?limit=100").then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FaqInput>({
    resolver: zodResolver(faqSchema),
    defaultValues: { isPublished: false, sortOrder: 0 },
  });

  const questionValue = watch("question") ?? "";
  const isPublished = watch("isPublished") ?? false;

  const mutation = useMutation({
    mutationFn: (data: FaqInput) => api.post("/cms/faqs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["cms-faq-categories-list"] });
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      toast.success("FAQ berhasil dibuat");
      router.push("/cms/faqs");
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || "Gagal membuat FAQ"),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cms/faqs"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Tambah FAQ Baru</h1>
          <p className="text-sm text-muted-foreground">Isi form di bawah untuk menambah FAQ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi FAQ</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Kategori <span className="text-red-500">*</span></Label>
              <Select onValueChange={(v) => setValue("categoryId", parseInt(v, 10), { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="question">Pertanyaan <span className="text-red-500">*</span></Label>
                <span className="text-xs text-muted-foreground">{questionValue.length}/500</span>
              </div>
              <Textarea
                id="question"
                placeholder="Tulis pertanyaan yang sering diajukan..."
                rows={3}
                maxLength={500}
                {...register("question")}
              />
              {errors.question && <p className="text-xs text-destructive">{errors.question.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Jawaban <span className="text-red-500">*</span></Label>
              <Textarea
                id="answer"
                placeholder="Tulis jawaban yang jelas dan lengkap..."
                rows={8}
                {...register("answer")}
              />
              {errors.answer && <p className="text-xs text-destructive">{errors.answer.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pengaturan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Urutan Tampil</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                className="w-32"
                {...register("sortOrder", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">Angka kecil tampil lebih awal</p>
              {errors.sortOrder && <p className="text-xs text-destructive">{errors.sortOrder.message}</p>}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium text-sm">Status Publikasi</p>
                <p className="text-xs text-muted-foreground">
                  {isPublished ? "FAQ akan tampil di website publik" : "FAQ tersimpan sebagai draft"}
                </p>
              </div>
              <Switch
                checked={isPublished}
                onCheckedChange={(v) => setValue("isPublished", v, { shouldValidate: true })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/cms/faqs">Batal</Link>
          </Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>
            {isPublished ? "Simpan & Publikasi" : "Simpan sebagai Draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}
