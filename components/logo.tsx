import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

// Logo placeholder pentru Premier Fitness Gym
export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "md" | "lg";
}) {
  const iconBox = size === "lg" ? "h-12 w-12" : "h-9 w-9";
  const icon = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const title = size === "lg" ? "text-2xl" : "text-base";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_20px_-4px_rgba(232,119,34,0.7)]",
          iconBox
        )}
      >
        <Dumbbell className={icon} />
      </div>
      <div className="leading-tight">
        <p className={cn("font-extrabold uppercase tracking-tight", title)}>
          Premier
        </p>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
          Fitness
        </p>
      </div>
    </div>
  );
}
