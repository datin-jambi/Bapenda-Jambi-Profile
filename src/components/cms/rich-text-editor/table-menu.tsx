"use client";

import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table2, ChevronDown } from "lucide-react";

interface TableMenuProps {
  editor: Editor;
}

export function TableMenu({ editor }: TableMenuProps) {
  if (!editor.isActive("table")) return null;

  return (
    <>
      <Separator orientation="vertical" className="h-5 mx-0.5" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 gap-1 px-2 text-xs font-normal"
          >
            <Table2 className="h-3.5 w-3.5" />
            Tabel
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuLabel className="text-xs">Baris</DropdownMenuLabel>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => editor.chain().focus().addRowBefore().run()}
          >
            Tambah Baris di Atas
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            Tambah Baris di Bawah
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs text-destructive focus:text-destructive"
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            Hapus Baris
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs">Kolom</DropdownMenuLabel>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          >
            Tambah Kolom di Kiri
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            Tambah Kolom di Kanan
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs text-destructive focus:text-destructive"
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            Hapus Kolom
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs">Sel</DropdownMenuLabel>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => editor.chain().focus().mergeCells().run()}
          >
            Gabung Sel
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => editor.chain().focus().splitCell().run()}
          >
            Pisah Sel
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs">Header</DropdownMenuLabel>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          >
            Toggle Header Baris
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
          >
            Toggle Header Kolom
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs"
            onClick={() => editor.chain().focus().toggleHeaderCell().run()}
          >
            Toggle Header Sel
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-xs text-destructive focus:text-destructive"
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            Hapus Tabel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
