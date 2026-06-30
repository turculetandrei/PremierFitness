import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-surface-elevated",
        "animate-[pulse-soft_1.6s_ease-in-out_infinite]",
        className
      )}
      {...props}
    />
  );
}
