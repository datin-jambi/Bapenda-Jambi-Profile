"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Code, AlignLeft } from "lucide-react";

interface RichTextEditorProps {
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
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const editorDivRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quillRef = useRef<any>(null);
  const isMountedRef = useRef(false);
  const skipNextSyncRef = useRef(false);

  // Bootstrap Quill once on mount
  useEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;

    let destroyed = false;

    async function boot() {
      if (!editorDivRef.current) return;

      const { default: Quill } = await import("quill");
      // import CSS only in browser
      await import("quill/dist/quill.snow.css" as never);

      if (destroyed || !editorDivRef.current) return;

      const quill = new Quill(editorDivRef.current, {
        theme: "snow",
        placeholder,
        readOnly: disabled,
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, 4, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }],
            ["link", "blockquote", "code-block"],
            ["clean"],
          ],
        },
        formats: [
          "header",
          "bold", "italic", "underline", "strike",
          "list", "bullet", "indent",
          "align",
          "link", "blockquote", "code-block",
        ],
      });

      // Set initial HTML value
      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
      }

      quill.on("text-change", () => {
        if (destroyed) return;
        skipNextSyncRef.current = true;
        const html = quill.root.innerHTML;
        onChange(html === "<p><br></p>" ? "" : html);
      });

      quillRef.current = quill;
    }

    boot();

    return () => {
      destroyed = true;
      quillRef.current = null;
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync value into Quill when changed externally (e.g. reset() from react-hook-form)
  useEffect(() => {
    if (!quillRef.current) return;
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    const current = quillRef.current.root.innerHTML;
    const empty = current === "<p><br></p>" ? "" : current;
    if (empty !== value) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value ?? "");
    }
  }, [value]);

  // Sync disabled state
  useEffect(() => {
    if (!quillRef.current) return;
    quillRef.current.enable(!disabled);
  }, [disabled]);

  // When switching from HTML mode back to visual, push textarea value into Quill
  function handleModeSwitch(next: "visual" | "html") {
    if (next === "visual" && quillRef.current) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value ?? "");
    }
    setMode(next);
  }

  return (
    <div className="rich-text-editor space-y-1">
      {/* Mode toggle */}
      {!disabled && (
        <div className="flex justify-end">
          <div className="inline-flex rounded-md border border-input overflow-hidden text-xs">
            <Button
              type="button"
              size="sm"
              variant={mode === "visual" ? "default" : "ghost"}
              className="h-7 rounded-none px-3 text-xs gap-1"
              onClick={() => handleModeSwitch("visual")}
            >
              <AlignLeft className="h-3 w-3" />
              Visual
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "html" ? "default" : "ghost"}
              className="h-7 rounded-none px-3 text-xs gap-1 border-l border-input"
              onClick={() => handleModeSwitch("html")}
            >
              <Code className="h-3 w-3" />
              HTML
            </Button>
          </div>
        </div>
      )}

      {/* Visual editor — always in DOM so Quill stays mounted */}
      <div
        style={{ "--editor-min-height": `${minHeight}px` } as React.CSSProperties}
        className={mode === "visual" ? "block" : "hidden"}
      >
        <div ref={editorDivRef} />
      </div>

      {/* HTML textarea — shown in html mode */}
      {mode === "html" && (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="<p>Tulis HTML di sini...</p>"
          className="font-mono text-xs"
          style={{ minHeight }}
          disabled={disabled}
        />
      )}
    </div>
  );
}
