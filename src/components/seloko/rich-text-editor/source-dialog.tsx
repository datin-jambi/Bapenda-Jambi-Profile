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
import { Textarea } from "@/components/ui/textarea";

interface SourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  html: string;
  onApply: (html: string) => void;
}

export function SourceDialog({
  open,
  onOpenChange,
  html,
  onApply,
}: SourceDialogProps) {
  const [value, setValue] = useState(html);

  useEffect(() => {
    if (open) setValue(html);
  }, [open, html]);

  function handleApply() {
    onApply(value);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Source Code HTML</DialogTitle>
          <DialogDescription>
            Edit HTML secara langsung. Klik Apply untuk menerapkan perubahan ke editor.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="font-mono text-xs min-h-[400px] resize-y flex-1"
          spellCheck={false}
          placeholder="<p>Tulis HTML di sini...</p>"
        />

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button type="button" size="sm" onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
