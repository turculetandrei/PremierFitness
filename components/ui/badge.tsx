import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        activ: "border-success/30 bg-success/10 text-success",
        expirat: "border-danger/30 bg-danger/10 text-danger",
        expira: "border-primary/40 bg-primary/10 text-primary",
        neutru: "border-border bg-surface-elevated text-muted",
      },
    },
    defaultVariants: {
      variant: "neutru",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
