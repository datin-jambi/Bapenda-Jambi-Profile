"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqSchema, FaqInput } from "@/lib/validations";
import { useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type FaqCategory = { id: number; name: string; slug: string };

export default function EditFaqPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: faqData, isLoading } = useQuery({
    queryKey: ["cms-faq-detail", id],
    queryFn: () => api.get(`/cms/faqs/${id}`).then((r) => r.data.data),
  });

  const { data: categories } = useQuery<FaqCategory[]>({
    queryKey: ["faq-categories"],
    queryFn: () => api.get("/cms/faq-categories?limit=100").then((r) => r.data.data),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FaqInput>({
    resolver: zodResolver(faqSchema),
    defaultValues: { isPublished: false, sortOrder: 0 },
  });

  const questionValue = watch("question") ?? "";
  const isPublished = watch("isPublished") ?? false;
  const watchedCategoryId = watch("categoryId");

  useEffect(() => {
    if (faqData && categories) {
      reset({
        categoryId: faqData.categoryId,
        question: faqData.question,
        answer: faqData.answer,
        sortOrder: faqData.sortOrder,
        isPublished: faqData.isPublished,
      });
    }
  }, [faqData, categories, reset]);

  // Derive the current select value — prefer live form state, fall back to API data
  const currentCategoryId = watchedCategoryId ?? faqData?.categoryId;

  const updateMutation = useMutation({
    mutationFn: (data: FaqInput) => api.put(`/cms/faqs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cms-faqs"] });
      queryClient.invalidateQueries({ queryKey: ["cms-faq-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["cms-faq-categories-list"] });
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      toast.success("FAQ berhasil diperbarui");
      router.push(`/cms/faqs/${id}`);
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || "Gagal menyimpan FAQ"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/cms/faqs/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">Edit FAQ</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={faqData?.isPublished ? "success" : "outline"}>
              {faqData?.isPublished ? "Dipublikasi" : "Draft"}
            </Badge>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi FAQ</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Kategori *</Label>
              <Select
                key={`cat-${currentCategoryId ?? "none"}`}
                value={currentCategoryId ? String(currentCategoryId) : ""}
                onValueChange={(v) => setValue("categoryId", parseInt(v, 10), { shouldValidate: true })}
              >
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
                <Label>Pertanyaan *</Label>
                <span className="text-xs text-muted-foreground">{questionValue.length}/500</span>
              </div>
              <Textarea
                placeholder="Tulis pertanyaan yang sering diajukan..."
                rows={3}
                maxLength={500}
                {...register("question")}
              />
              {errors.question && <p className="text-xs text-destructive">{errors.question.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Jawaban *</Label>
              <Textarea
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
              <Label>Urutan Tampil</Label>
              <Input
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
            <Link href={`/cms/faqs/${id}`}>Batal</Link>
          </Button>
          <Button type="submit" loading={isSubmitting || updateMutation.isPending}>
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
