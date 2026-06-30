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
import { adaugaZile, aziISO, formatDate } from "@/lib/utils";
import { TIPURI_ABONAMENT } from "@/types";
import type { TipAbonament } from "@/types";

export function AddMemberDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [nume, setNume] = useState("");
  const [telefon, setTelefon] = useState("");
  const [tip, setTip] = useState<TipAbonament>("adulti");
  const [pret, setPret] = useState<string>(String(TIPURI_ABONAMENT.adulti.pret));
  const [dataStart, setDataStart] = useState<string>(aziISO());
  const [seSalveaza, setSeSalveaza] = useState(false);

  // Data sfârșit se calculează automat în funcție de durata tipului ales
  const dataSfarsit = adaugaZile(dataStart, TIPURI_ABONAMENT[tip].durataZile);

  function reset() {
    setNume("");
    setTelefon("");
    setTip("adulti");
    setPret(String(TIPURI_ABONAMENT.adulti.pret));
    setDataStart(aziISO());
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

    // 1. Creează membrul și recuperează id-ul generat
    const { data: membruNou, error: eroareMembru } = await supabase
      .from("membri")
      .insert({ nume: nume.trim(), telefon: telefon.trim() || null })
      .select("id")
      .single();

    if (eroareMembru || !membruNou) {
      setSeSalveaza(false);
      toast({
        variant: "error",
        title: "Eroare la salvare",
        description: "Membrul nu a putut fi adăugat. Încearcă din nou.",
      });
      return;
    }

    // 2. Creează primul abonament pentru membrul nou-creat
    const { error: eroareAbonament } = await supabase.from("abonamente").insert({
      membru_id: membruNou.id,
      tip,
      pret: parseFloat(pret),
      data_start: dataStart,
      data_sfarsit: dataSfarsit,
    });

    if (eroareAbonament) {
      // Anulează crearea membrului pentru a păstra integritatea fluxului
      await supabase.from("membri").delete().eq("id", membruNou.id);
      setSeSalveaza(false);
      toast({
        variant: "error",
        title: "Eroare la salvare",
        description: "Abonamentul nu a putut fi creat. Membrul nu a fost adăugat.",
      });
      return;
    }

    setSeSalveaza(false);
    toast({
      title: "Membru adăugat",
      description: `${nume.trim()} a fost adăugat cu abonament ${TIPURI_ABONAMENT[tip].eticheta}.`,
    });
    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Adaugă Membru
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Adaugă Membru"
        description="Completează datele membrului și ale primului abonament."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nume">Nume *</Label>
            <Input
              id="nume"
              required
              autoFocus
              placeholder="Ex: Andrei Popescu"
              value={nume}
              onChange={(e) => setNume(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="telefon">Telefon</Label>
            <Input
              id="telefon"
              type="tel"
              placeholder="Ex: 0722 123 456"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="add-tip">Tip abonament</Label>
            <Select
              id="add-tip"
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
              <Label htmlFor="add-data-start">Data start</Label>
              <Input
                id="add-data-start"
                type="date"
                value={dataStart}
                onChange={(e) => setDataStart(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="add-pret">Preț (lei)</Label>
              <Input
                id="add-pret"
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
              {TIPURI_ABONAMENT[tip].durataZile === 0
                ? "Aceeași zi"
                : `${TIPURI_ABONAMENT[tip].durataZile} de zile de la data de start`}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Anulează
            </Button>
            <Button type="submit" disabled={seSalveaza || !nume.trim()}>
              {seSalveaza ? <Loader2 className="animate-spin" /> : <Plus />}
              Salvează
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
