import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full min-w-0 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-foreground",
        "placeholder:text-muted focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Randare consecventă pe mobil pentru input-urile native date/number
        "[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-date-and-time-value]:text-left",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
