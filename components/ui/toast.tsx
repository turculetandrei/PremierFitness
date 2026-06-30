"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (t: {
    title: string;
    description?: string;
    variant?: ToastVariant;
  }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast trebuie folosit în ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    ({ title, description, variant = "success" }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const Icon =
    toast.variant === "success"
      ? CheckCircle2
      : toast.variant === "error"
        ? XCircle
        : Info;

  const accent =
    toast.variant === "success"
      ? "text-success"
      : toast.variant === "error"
        ? "text-danger"
        : "text-primary";

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-surface-elevated p-4 shadow-lg",
        "animate-[pulse-soft_0.01s] data-[state=open]:animate-in"
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", accent)} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-sm text-muted">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-muted transition-colors hover:text-foreground"
        aria-label="Închide"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
