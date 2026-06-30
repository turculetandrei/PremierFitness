"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { adaugaZile, formatDate } from "@/lib/utils";
import { TIPURI_ABONAMENT } from "@/types";
import type { Abonament, Membru, TipAbonament } from "@/types";

export function EditMemberDialog({
  membru,
  abonamentActiv,
}: {
  membru: Membru;
  abonamentActiv: Abonament | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [nume, setNume] = useState(membru.nume);
  const [telefon, setTelefon] = useState(membru.telefon ?? "");
  const [tip, setTip] = useState<TipAbonament>(abonamentActiv?.tip ?? "adulti");
  const [pret, setPret] = useState<string>(
    abonamentActiv ? String(abonamentActiv.pret) : ""
  );
  const [dataStart, setDataStart] = useState<string>(
    abonamentActiv?.data_start ?? ""
  );
  const [seSalveaza, setSeSalveaza] = useState(false);

  // Data sfârșit se recalculează automat la schimbarea datei de start
  const dataSfarsit = dataStart
    ? adaugaZile(dataStart, TIPURI_ABONAMENT[tip].durataZile)
    : "";

  function deschide() {
    setNume(membru.nume);
    setTelefon(membru.telefon ?? "");
    setTip(abonamentActiv?.tip ?? "adulti");
    setPret(abonamentActiv ? String(abonamentActiv.pret) : "");
    setDataStart(abonamentActiv?.data_start ?? "");
    setOpen(true);
  }

  function schimbaTip(nou: TipAbonament) {
    setTip(nou);
    setPret(String(TIPURI_ABONAMENT[nou].pret));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nume.trim()) return;
    setSeSalveaza(true);

    const supabase = createClient();

    // 1. Actualizează datele membrului
    const { error: eroareMembru } = await supabase
      .from("membri")
      .update({ nume: nume.trim(), telefon: telefon.trim() || null })
      .eq("id", membru.id);

    if (eroareMembru) {
      setSeSalveaza(false);
      toast({
        variant: "error",
        title: "Eroare la salvare",
        description: "Datele membrului nu au putut fi actualizate.",
      });
      return;
    }

    // 2. Dacă există un abonament activ, actualizează-l și pe acela
    if (abonamentActiv) {
      const { error: eroareAbonament } = await supabase
        .from("abonamente")
        .update({
          tip,
          pret: parseFloat(pret),
          data_start: dataStart,
          data_sfarsit: dataSfarsit,
        })
        .eq("id", abonamentActiv.id);

      if (eroareAbonament) {
        setSeSalveaza(false);
        toast({
          variant: "error",
          title: "Eroare la salvare",
          description:
            "Datele membrului au fost salvate, dar abonamentul nu a putut fi actualizat.",
        });
        return;
      }
    }

    setSeSalveaza(false);
    toast({
      title: "Date actualizate",
      description: "Modificările au fost salvate.",
    });
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button variant="outline" onClick={deschide}>
        <Pencil /> Editează
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Editează membru"
        description={
          abonamentActiv
            ? "Actualizează datele membrului și abonamentul activ."
            : "Actualizează datele membrului."
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-nume">Nume *</Label>
            <Input
              id="edit-nume"
              required
              autoFocus
              value={nume}
              onChange={(e) => setNume(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-telefon">Telefon</Label>
            <Input
              id="edit-telefon"
              type="tel"
              placeholder="Ex: 0722 123 456"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
            />
          </div>

          {abonamentActiv && (
            <>
              <div className="border-t border-border pt-4">
                <Label htmlFor="edit-tip">Tip abonament activ</Label>
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
                  {TIPURI_ABONAMENT[tip].durataZile === 0
                    ? "Aceeași zi"
                    : `${TIPURI_ABONAMENT[tip].durataZile} de zile de la data de start`}
                </p>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={seSalveaza || !nume.trim()}>
              {seSalveaza ? <Loader2 className="animate-spin" /> : <Save />}
              Salvează
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
