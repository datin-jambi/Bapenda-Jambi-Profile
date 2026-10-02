"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor } from "@tiptap/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { buildExtensions } from "./extensions";
import { Toolbar } from "./toolbar";
import { EditorArea } from "./editor";
import { LinkDialog } from "./link-dialog";
import { SourceDialog } from "./source-dialog";

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis konten di sini...",
  disabled = false,
  minHeight = 300,
}: RichTextEditorProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  // Set true after user edits so the value sync effect skips the echo-back
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: buildExtensions(placeholder),
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate({ editor: e }) {
      isInternalUpdate.current = true;
      const html = e.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sync value from parent into editor (e.g. react-hook-form reset)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const current = editor.getHTML();
    const normalized = current === "<p></p>" ? "" : current;
    if (normalized !== (value ?? "")) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // Sync disabled state
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  // Use const so TypeScript narrows Editor | null → Editor inside closures
  const e = editor;

  const linkUrl = (e.getAttributes("link").href as string) ?? "";
  const hasLink = e.isActive("link");

  function handleLinkApply(url: string, openInNewTab: boolean) {
    e.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: openInNewTab ? "_blank" : null })
      .run();
  }

  function handleLinkRemove() {
    e.chain().focus().extendMarkRange("link").unsetLink().run();
  }

  function handleSourceApply(html: string) {
    e.commands.setContent(html);
  }

  return (
    <TooltipProvider delayDuration={400}>
      <div
        className={cn(
          "rounded-md border border-input bg-background shadow-sm",
          disabled && "pointer-events-none opacity-60"
        )}
      >
        {!disabled && (
          <Toolbar
            editor={e}
            onLinkClick={() => setLinkOpen(true)}
            onSourceClick={() => setSourceOpen(true)}
          />
        )}

        <EditorArea editor={e} minHeight={minHeight} />

        <LinkDialog
          open={linkOpen}
          onOpenChange={setLinkOpen}
          initialUrl={linkUrl}
          hasLink={hasLink}
          onApply={handleLinkApply}
          onRemove={handleLinkRemove}
        />

        <SourceDialog
          open={sourceOpen}
          onOpenChange={setSourceOpen}
          html={e.getHTML()}
          onApply={handleSourceApply}
        />
      </div>
    </TooltipProvider>
  );
}
