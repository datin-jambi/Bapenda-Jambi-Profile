"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColorPicker } from "./color-picker";
import { TableMenu } from "./table-menu";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Code2,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListTodo,
  Link,
  Table2,
  Minus,
  FileCode,
  Undo2,
  Redo2,
  Palette,
  Highlighter,
} from "lucide-react";

interface ToolbarProps {
  editor: Editor;
  onLinkClick: () => void;
  onSourceClick: () => void;
}

function Btn({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "h-7 w-7 shrink-0",
            active && "bg-muted text-foreground"
          )}
        >
          {children}
          <span className="sr-only">{title}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs py-1">
        {title}
      </TooltipContent>
    </Tooltip>
  );
}

function Sep() {
  return <Separator orientation="vertical" className="h-5 mx-0.5 shrink-0" />;
}

export function Toolbar({ editor, onLinkClick, onSourceClick }: ToolbarProps) {
  const textColor =
    (editor.getAttributes("textStyle").color as string) ?? "#000000";
  const highlightColor =
    (editor.getAttributes("highlight").color as string) ?? "#fef08a";

  const headingLevel = ([1, 2, 3, 4, 5, 6] as const).find((l) =>
    editor.isActive("heading", { level: l })
  );
  const headingValue = headingLevel ? String(headingLevel) : "0";

  function applyHeading(value: string) {
    if (value === "0") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(value, 10) as 1 | 2 | 3 | 4 | 5 | 6;
      editor.chain().focus().setHeading({ level }).run();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border-b border-border bg-muted/40 px-2 py-1.5 overflow-x-auto">
      {/* History */}
      <Btn
        title="Undo (Ctrl+Z)"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        title="Redo (Ctrl+Y)"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Heading */}
      <select
        value={headingValue}
        onChange={(e) => applyHeading(e.target.value)}
        className="h-7 rounded-md border border-border bg-background px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer shrink-0"
      >
        <option value="0">Paragraf</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="4">Heading 4</option>
        <option value="5">Heading 5</option>
        <option value="6">Heading 6</option>
      </select>

      <Sep />

      {/* Text formatting */}
      <Btn
        title="Bold (Ctrl+B)"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        title="Italic (Ctrl+I)"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        title="Underline (Ctrl+U)"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        title="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        title="Inline Code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        title="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        title="Code Block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Alignment */}
      <Btn
        title="Rata Kiri"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        title="Rata Tengah"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        title="Rata Kanan"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        title="Rata Penuh"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Lists */}
      <Btn
        title="Bullet List"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        title="Ordered List"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </Btn>
      <Btn
        title="Task List"
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <ListTodo className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Text Color */}
      <ColorPicker
        value={textColor}
        onChange={(color) => editor.chain().focus().setColor(color).run()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Warna Teks"
          className="h-7 w-7 shrink-0 relative"
        >
          <Palette className="h-3.5 w-3.5" />
          <span
            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-4 rounded-sm"
            style={{ backgroundColor: textColor }}
          />
        </Button>
      </ColorPicker>

      {/* Highlight Color */}
      <ColorPicker
        value={highlightColor}
        onChange={(color) =>
          editor.chain().focus().setHighlight({ color }).run()
        }
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Highlight"
          className={cn(
            "h-7 w-7 shrink-0 relative",
            editor.isActive("highlight") && "bg-muted"
          )}
        >
          <Highlighter className="h-3.5 w-3.5" />
          <span
            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-4 rounded-sm"
            style={{ backgroundColor: highlightColor }}
          />
        </Button>
      </ColorPicker>

      <Sep />

      {/* Link */}
      <Btn
        title="Insert / Edit Link"
        active={editor.isActive("link")}
        onClick={onLinkClick}
      >
        <Link className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Table: insert when not in table, operations when in table */}
      {!editor.isActive("table") && (
        <Btn
          title="Insert Table (3×3)"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <Table2 className="h-3.5 w-3.5" />
        </Btn>
      )}
      <TableMenu editor={editor} />

      <Sep />

      {/* Horizontal Rule */}
      <Btn
        title="Horizontal Rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Source Code */}
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={onSourceClick}
        className="h-7 gap-1 px-2 text-xs font-normal shrink-0"
      >
        <FileCode className="h-3.5 w-3.5" />
        Source
      </Button>
    </div>
  );
}
