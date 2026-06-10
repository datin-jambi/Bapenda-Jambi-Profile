"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface PdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string | null;
  title?: string;
}

export function PdfPreviewDialog({ open, onOpenChange, url, title }: PdfPreviewDialogProps) {
  const [loaded, setLoaded] = useState(false);

  function handleOpenChange(v: boolean) {
    if (!v) setLoaded(false);
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-3 flex-shrink-0 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
            <DialogTitle className="truncate">{title || "Preview PDF"}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 p-4 relative">
          {!loaded && (
            <div className="absolute inset-4 flex flex-col items-center justify-center gap-3 rounded-lg border bg-gray-50 z-10">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Memuat dokumen...</p>
            </div>
          )}
          {url && (
            <iframe
              key={url}
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
              className="w-full h-full rounded-lg border bg-gray-50"
              title="Preview PDF"
              onLoad={() => setLoaded(true)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
