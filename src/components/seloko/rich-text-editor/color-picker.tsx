"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#000000", "#1f2937", "#374151", "#6b7280", "#9ca3af", "#ffffff",
  "#ef4444", "#f97316", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6",
  "#ec4899", "#14b8a6", "#dc2626", "#ea580c", "#d97706", "#16a34a",
  "#2563eb", "#7c3aed", "#be185d", "#0f766e", "#b91c1c", "#c2410c",
  "#b45309", "#15803d", "#1d4ed8", "#6d28d9", "#9d174d", "#0e7490",
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  children: React.ReactNode;
}

export function ColorPicker({ value, onChange, children }: ColorPickerProps) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            "z-50 w-52 rounded-lg border border-border bg-background p-2.5 shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
          sideOffset={6}
          align="start"
        >
          <div className="grid grid-cols-6 gap-1 mb-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => onChange(color)}
                className={cn(
                  "h-6 w-6 rounded border border-border/60 transition-transform hover:scale-110 focus:outline-none",
                  value === color && "ring-2 ring-ring ring-offset-1"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 border-t border-border pt-2">
            <div
              className="h-6 w-6 shrink-0 rounded border border-border"
              style={{ backgroundColor: value || "#000000" }}
            />
            <input
              type="text"
              defaultValue={value}
              onBlur={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onChange((e.target as HTMLInputElement).value);
              }}
              placeholder="#000000"
              className="h-6 w-full rounded border border-border bg-transparent px-1.5 font-mono text-xs outline-none focus:ring-1 focus:ring-ring"
              maxLength={9}
            />
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
