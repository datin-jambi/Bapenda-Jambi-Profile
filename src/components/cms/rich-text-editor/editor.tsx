"use client";

import type { Editor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";

interface EditorAreaProps {
  editor: Editor;
  minHeight: number;
}

export function EditorArea({ editor, minHeight }: EditorAreaProps) {
  return (
    <div className="tiptap-editor" style={{ minHeight }}>
      <EditorContent editor={editor} />
    </div>
  );
}
