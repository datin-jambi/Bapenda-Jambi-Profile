"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface PdfUploadProps {
  value: string;
  fileId?: string;
  fileName?: string;
  onChange: (url: string, fileId?: string, fileName?: string) => void;
  disabled?: boolean;
}

export function PdfUpload({ value, fileName, onChange, disabled = false }: PdfUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Hanya file PDF yang diizinkan");
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file maksimal 20MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label", file.name.replace(".pdf", ""));

      const res = await api.post("/upload/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const result = res.data.data;
      if (!result?.url) throw new Error("Response tidak mengandung URL file");

      onChange(result.url, result.fileId, result.fileName || file.name);
      toast.success("File PDF berhasil diupload");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        "Gagal mengupload file";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName || "File PDF"}</p>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Lihat file
            </a>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              onClick={() => onChange("", "", "")}
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
              <FileText className="h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium">Klik atau drag & drop file PDF</p>
              <p className="text-xs">PDF saja — Maks. 20MB</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = "";
        }}
      />

      {!value && !disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          Pilih File PDF
        </Button>
      )}
    </div>
  );
}
