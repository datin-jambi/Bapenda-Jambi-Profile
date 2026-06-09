import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200 select-none",
  {
    variants: {
      variant: {
        // Core variants
        default:
          "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700",
        primary:
          "bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800",
        secondary:
          "bg-secondary-50 text-secondary-700 border border-secondary-200 hover:bg-secondary-100 dark:bg-secondary-900/30 dark:text-secondary-300 dark:border-secondary-800",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
        danger:
          "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
        destructive:
          "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
        info:
          "bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800",

        // Outline variants
        outline:
          "bg-transparent text-foreground border border-border hover:bg-muted dark:hover:bg-muted/50",
        "outline-primary":
          "bg-transparent text-primary-700 border border-primary-300 hover:bg-primary-50 dark:text-primary-400 dark:border-primary-700",
        "outline-success":
          "bg-transparent text-emerald-700 border border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700",
        "outline-danger":
          "bg-transparent text-red-700 border border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700",

        // Ghost variants — minimal, for public-facing UI
        ghost:
          "bg-transparent text-muted-foreground hover:bg-muted border border-transparent",
        "ghost-primary":
          "bg-transparent text-primary-600 hover:bg-primary-50 border border-transparent dark:text-primary-400 dark:hover:bg-primary-900/20",

        // Solid variants — for emphasized badges
        solid:
          "bg-slate-700 text-white border border-transparent hover:bg-slate-800",
        "solid-primary":
          "bg-primary text-white border border-transparent hover:bg-primary-800",
        "solid-success":
          "bg-emerald-600 text-white border border-transparent hover:bg-emerald-700",
        "solid-danger":
          "bg-red-600 text-white border border-transparent hover:bg-red-700",
      },
      size: {
        sm: "px-2 py-px text-[10px] gap-1",
        md: "px-2.5 py-0.5 text-xs gap-1.5",
        lg: "px-3 py-1 text-sm gap-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

// Status preset map — CMS convenience
export type StatusBadgeStatus =
  | "active"
  | "inactive"
  | "published"
  | "draft"
  | "pending"
  | "deleted"
  | "PUBLISHED"
  | "DRAFT"
  | "PENDING"
  | "REJECTED"
  | "ARCHIVED"

const STATUS_VARIANT_MAP: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
  active: "success",
  inactive: "danger",
  published: "success",
  PUBLISHED: "success",
  draft: "default",
  DRAFT: "default",
  pending: "warning",
  PENDING: "warning",
  deleted: "danger",
  REJECTED: "danger",
  ARCHIVED: "ghost",
}

const STATUS_LABEL_MAP: Record<string, string> = {
  active: "Aktif",
  inactive: "Nonaktif",
  published: "Published",
  PUBLISHED: "Published",
  draft: "Draft",
  DRAFT: "Draft",
  pending: "Pending",
  PENDING: "Pending",
  deleted: "Deleted",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="shrink-0 [&>svg]:size-3">{icon}</span>}
      {children}
    </span>
  )
}

// StatusBadge — maps status string to the right variant + label automatically
interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status: string
  showLabel?: boolean
}

function StatusBadge({ status, showLabel = true, children, className, size, ...props }: StatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[status] ?? "default"
  const label = STATUS_LABEL_MAP[status] ?? status

  return (
    <Badge variant={variant} size={size} className={className} {...props}>
      {showLabel ? (children ?? label) : children}
    </Badge>
  )
}

export { Badge, StatusBadge, badgeVariants }
