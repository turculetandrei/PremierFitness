"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { adaugaZile, formatDate, formatLei } from "@/lib/utils";
import { DURATA_ABONAMENT_ZILE, TIPURI_ABONAMENT } from "@/types";
import type { Abonament, TipAbonament } from "@/types";

// Notă: componenta se remontează (prin `key`) pentru fiecare abonament,
// deci starea inițială poate fi derivată direct din props.
export function EditAbonamentDialog({
  abonament,
  open,
  onOpenChange,
}: {
  abonament: Abonament;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [tip, setTip] = useState<TipAbonament>(abonament.tip);
  const [pret, setPret] = useState<string>(String(abonament.pret));
  const [dataStart, setDataStart] = useState<string>(abonament.data_start);
  const [seSalveaza, setSeSalveaza] = useState(false);

  // Data sfârșit se recalculează automat la schimbarea datei de start
  const dataSfarsit = dataStart
    ? adaugaZile(dataStart, DURATA_ABONAMENT_ZILE)
    : "";

  function schimbaTip(nou: TipAbonament) {
    setTip(nou);
    setPret(String(TIPURI_ABONAMENT[nou].pret));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSeSalveaza(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("abonamente")
      .update({
        tip,
        pret: parseFloat(pret),
        data_start: dataStart,
        data_sfarsit: dataSfarsit,
      })
      .eq("id", abonament.id);

    setSeSalveaza(false);

    if (error) {
      toast({
        variant: "error",
        title: "Eroare la salvare",
        description: "Abonamentul nu a putut fi actualizat.",
      });
      return;
    }

    toast({
      title: "Abonament actualizat",
      description: `${TIPURI_ABONAMENT[tip].eticheta} · ${formatLei(pret)}`,
    });
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editează abonament"
      description="Modifică tipul, prețul sau data de început."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="edit-tip">Tip abonament</Label>
          <Select
            id="edit-tip"
            value={tip}
            onChange={(e) => schimbaTip(e.target.value as TipAbonament)}
          >
            {Object.values(TIPURI_ABONAMENT).map((t) => (
              <option key={t.tip} value={t.tip}>
                {t.eticheta} - {t.pret} lei
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-data-start">Data start</Label>
            <Input
              id="edit-data-start"
              type="date"
              value={dataStart}
              onChange={(e) => setDataStart(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-pret">Preț (lei)</Label>
            <Input
              id="edit-pret"
              type="number"
              min="0"
              step="1"
              value={pret}
              onChange={(e) => setPret(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-elevated px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            Data sfârșit (calculată automat)
          </p>
          <p className="mt-1 text-lg font-bold text-primary">
            {dataSfarsit ? formatDate(dataSfarsit) : "—"}
          </p>
          <p className="text-xs text-muted">
            {DURATA_ABONAMENT_ZILE} de zile de la data de start
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Anulează
          </Button>
          <Button type="submit" disabled={seSalveaza}>
            {seSalveaza ? <Loader2 className="animate-spin" /> : <Save />}
            Salvează
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
