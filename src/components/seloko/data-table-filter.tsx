"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, SlidersHorizontal } from "lucide-react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface SelectFilter {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  allLabel?: string;
}

interface DataTableFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  selects?: SelectFilter[];
  isSearching?: boolean;
  onReset?: () => void;
  children?: React.ReactNode;
}

export function DataTableFilter({
  value,
  onChange,
  placeholder = "Cari...",
  selects,
  isSearching = false,
  onReset,
  children,
}: DataTableFilterProps) {
  const hasActiveFilter =
    value.trim() !== "" ||
    selects?.some((s) => s.value !== "all") === true;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search input */}
      <div className="relative w-full sm:flex-1 sm:w-auto sm:min-w-[200px] sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {isSearching ? (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
            Mencari...
          </span>
        ) : value ? (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => onChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        ) : null}
      </div>

      {/* Filter selects — always visible */}
      {selects?.map((sel, i) => (
        <Select key={i} value={sel.value} onValueChange={sel.onChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={sel.placeholder ?? "Filter..."} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{sel.allLabel ?? "Semua"}</SelectItem>
            {sel.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Reset filter button — visible when any filter is active */}
      {onReset && hasActiveFilter && (
        <Button variant="outline" size="sm" onClick={onReset}>
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Reset Filter
        </Button>
      )}

      {children}
    </div>
  );
}
