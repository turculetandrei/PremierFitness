"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { adaugaZile, aziISO, formatDate, formatLei } from "@/lib/utils";
import { DURATA_ABONAMENT_ZILE, TIPURI_ABONAMENT } from "@/types";
import type { TipAbonament } from "@/types";

export function NewAbonamentDialog({ membruId }: { membruId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [tip, setTip] = useState<TipAbonament>("standard");
  const [pret, setPret] = useState<string>(String(TIPURI_ABONAMENT.standard.pret));
  const [dataStart, setDataStart] = useState<string>(aziISO());
  const [seSalveaza, setSeSalveaza] = useState(false);

  const dataSfarsit = adaugaZile(dataStart, DURATA_ABONAMENT_ZILE);

  function reset() {
    setTip("standard");
    setPret(String(TIPURI_ABONAMENT.standard.pret));
    setDataStart(aziISO());
  }

  function schimbaTip(nou: TipAbonament) {
    setTip(nou);
    setPret(String(TIPURI_ABONAMENT[nou].pret));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSeSalveaza(true);

    const supabase = createClient();
    const { error } = await supabase.from("abonamente").insert({
      membru_id: membruId,
      tip,
      pret: parseFloat(pret),
      data_start: dataStart,
      data_sfarsit: dataSfarsit,
    });

    setSeSalveaza(false);

    if (error) {
      toast({
        variant: "error",
        title: "Eroare la salvare",
        description: "Abonamentul nu a putut fi adăugat.",
      });
      return;
    }

    toast({
      title: "Abonament adăugat",
      description: `${TIPURI_ABONAMENT[tip].eticheta} · ${formatLei(pret)}`,
    });
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Abonament Nou
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Abonament Nou"
        description="Alege tipul și data de început."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tip">Tip abonament</Label>
            <Select
              id="tip"
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
              <Label htmlFor="data_start">Data start</Label>
              <Input
                id="data_start"
                type="date"
                value={dataStart}
                onChange={(e) => setDataStart(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="pret">Preț (lei)</Label>
              <Input
                id="pret"
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
              {formatDate(dataSfarsit)}
            </p>
            <p className="text-xs text-muted">
              {DURATA_ABONAMENT_ZILE} de zile de la data de start
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={seSalveaza}>
              {seSalveaza ? <Loader2 className="animate-spin" /> : <Plus />}
              Salvează
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
