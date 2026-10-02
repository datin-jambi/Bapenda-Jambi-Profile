"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialUrl: string;
  hasLink: boolean;
  onApply: (url: string, openInNewTab: boolean) => void;
  onRemove: () => void;
}

export function LinkDialog({
  open,
  onOpenChange,
  initialUrl,
  hasLink,
  onApply,
  onRemove,
}: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [openInNewTab, setOpenInNewTab] = useState(true);

  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setOpenInNewTab(true);
    }
  }, [open, initialUrl]);

  function handleApply() {
    const trimmed = url.trim();
    if (!trimmed) return;
    onApply(trimmed, openInNewTab);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{hasLink ? "Edit Link" : "Insert Link"}</DialogTitle>
          <DialogDescription>
            Masukkan URL tujuan link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://contoh.com"
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              autoFocus
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="rounded border-border"
            />
            Buka di tab baru
          </label>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {hasLink && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                onRemove();
                onOpenChange(false);
              }}
            >
              Hapus Link
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              disabled={!url.trim()}
            >
              {hasLink ? "Simpan" : "Masukkan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
