"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import NextImage from "next/image";
import api from "@/lib/axios";

interface ImageUploadProps {
  value: string;
  onChange: (url: string, fileId?: string) => void;
  folder?: string;
  accept?: string;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, folder = "/bapenda/uploads", accept = "image/*", disabled = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = res.data.data;
      if (!result?.url) throw new Error("Response tidak mengandung URL gambar");

      onChange(result.url, result.fileId);
      toast.success("Gambar berhasil diupload");
    } catch (err: any) {
      console.error("[ImageUpload] error:", err);
      const msg = err.response?.data?.message || err.message || "Gagal mengupload gambar";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative w-full max-w-sm">
          <div className="relative aspect-video rounded-lg overflow-hidden border bg-gray-50">
            <NextImage src={value} alt="Preview" fill className="object-cover" unoptimized />
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={() => onChange("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            disabled
              ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
              : "border-gray-200 hover:border-primary/50 cursor-pointer"
          }`}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => { if (!disabled) e.preventDefault(); }}
          onDrop={(e) => {
            e.preventDefault();
            if (disabled) return;
            const file = e.dataTransfer.files[0];
            if (file) handleUpload(file);
          }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm">Mengupload...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium">Klik atau drag & drop gambar</p>
              <p className="text-xs">JPG, PNG, WEBP — Maks. 5MB</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      {!value && !disabled && (
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          Pilih Gambar
        </Button>
      )}
    </div>
  );
}
