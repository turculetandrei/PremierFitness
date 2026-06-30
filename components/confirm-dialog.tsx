"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmă",
  cancelLabel = "Anulează",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
}) {
  const [seProcesează, setSeProcesează] = useState(false);

  async function handleConfirm() {
    setSeProcesează(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setSeProcesează(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={seProcesează}
        >
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={seProcesează}>
          {seProcesează && <Loader2 className="animate-spin" />}
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
