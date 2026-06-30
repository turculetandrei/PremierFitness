"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Download, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AbonamentBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  etichetaStatusAbonament,
  formatDate,
  formatLei,
} from "@/lib/utils";
import { descarcaCSV } from "@/lib/csv";
import { TIPURI_ABONAMENT } from "@/types";
import type { StatusAbonament, TipAbonament } from "@/types";

export interface AbonamentRand {
  id: string;
  membruId: string;
  membruNume: string;
  tip: TipAbonament;
  pret: number;
  dataStart: string;
  dataSfarsit: string;
  status: StatusAbonament;
}

type FiltruStatus = "toate" | "activ" | "expirat";
type FiltruTip = "toate" | TipAbonament;

export function AbonamenteClient({ randuri }: { randuri: AbonamentRand[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<FiltruStatus>("toate");
  const [tip, setTip] = useState<FiltruTip>("toate");
  const [deLa, setDeLa] = useState("");
  const [panaLa, setPanaLa] = useState("");
  const [deSters, setDeSters] = useState<AbonamentRand | null>(null);

  const areFiltre =
    status !== "toate" || tip !== "toate" || deLa !== "" || panaLa !== "";

  const filtrate = useMemo(() => {
    return randuri.filter((r) => {
      if (tip !== "toate" && r.tip !== tip) return false;
      if (status === "activ" && r.status === "expirat") return false;
      if (status === "expirat" && r.status !== "expirat") return false;
      // Filtrare după data_start în intervalul De la – Până la
      if (deLa && r.dataStart < deLa) return false;
      if (panaLa && r.dataStart > panaLa) return false;
      return true;
    });
  }, [randuri, status, tip, deLa, panaLa]);

  function reseteazaFiltre() {
    setStatus("toate");
    setTip("toate");
    setDeLa("");
    setPanaLa("");
  }

  function exportaCSV() {
    const antet = [
      "Membru",
      "Tip",
      "Preț",
      "Data start",
      "Data sfârșit",
      "Status",
    ];
    const randuriCsv = filtrate.map((r) => [
      r.membruNume,
      TIPURI_ABONAMENT[r.tip].eticheta,
      r.pret,
      formatDate(r.dataStart),
      formatDate(r.dataSfarsit),
      etichetaStatusAbonament(r.status),
    ]);
    descarcaCSV("abonamente.csv", antet, randuriCsv);
    toast({
      title: "Export realizat",
      description: `${filtrate.length} abonamente exportate.`,
    });
  }

  async function stergeAbonament() {
    if (!deSters) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("abonamente")
      .delete()
      .eq("id", deSters.id);

    if (error) {
      toast({
        variant: "error",
        title: "Eroare la ștergere",
        description: "Abonamentul nu a putut fi șters.",
      });
      return;
    }

    toast({
      title: "Abonament șters",
      description: `Abonamentul lui ${deSters.membruNume} a fost șters.`,
    });
    setDeSters(null);
    router.refresh();
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
        <div className="grid grid-cols-2 gap-3 sm:contents">
          <div className="w-full sm:w-44">
            <Label htmlFor="filtru-status">Status</Label>
            <Select
              id="filtru-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as FiltruStatus)}
            >
              <option value="toate">Toate</option>
              <option value="activ">Activ</option>
              <option value="expirat">Expirat</option>
            </Select>
          </div>
          <div className="w-full sm:w-44">
            <Label htmlFor="filtru-tip">Tip</Label>
            <Select
              id="filtru-tip"
              value={tip}
              onChange={(e) => setTip(e.target.value as FiltruTip)}
            >
              <option value="toate">Toate</option>
              {Object.values(TIPURI_ABONAMENT).map((t) => (
                <option key={t.tip} value={t.tip}>
                  {t.eticheta}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full sm:w-44">
            <Label htmlFor="filtru-de-la">De la</Label>
            <Input
              id="filtru-de-la"
              type="date"
              value={deLa}
              onChange={(e) => setDeLa(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-44">
            <Label htmlFor="filtru-pana-la">Până la</Label>
            <Input
              id="filtru-pana-la"
              type="date"
              value={panaLa}
              onChange={(e) => setPanaLa(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 sm:ml-auto sm:items-end">
          {areFiltre && (
            <Button
              variant="ghost"
              onClick={reseteazaFiltre}
              className="flex-1 sm:flex-none"
            >
              <X /> Resetează filtre
            </Button>
          )}
          <Button
            variant="outline"
            onClick={exportaCSV}
            disabled={filtrate.length === 0}
            className="flex-1 sm:flex-none"
          >
            <Download /> Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface">
        {filtrate.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-muted">
              <CreditCard className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted">
              {randuri.length === 0
                ? "Niciun abonament înregistrat."
                : "Niciun abonament pentru aceste filtre."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membru</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Preț</TableHead>
                <TableHead>Data start</TableHead>
                <TableHead>Data sfârșit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrate.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer hover:bg-surface-elevated"
                  onClick={() => router.push(`/membri/${r.membruId}`)}
                >
                  <TableCell className="font-semibold">{r.membruNume}</TableCell>
                  <TableCell>{TIPURI_ABONAMENT[r.tip].eticheta}</TableCell>
                  <TableCell>{formatLei(r.pret)}</TableCell>
                  <TableCell className="text-muted">
                    {formatDate(r.dataStart)}
                  </TableCell>
                  <TableCell className="text-muted">
                    {formatDate(r.dataSfarsit)}
                  </TableCell>
                  <TableCell>
                    <AbonamentBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Șterge abonamentul lui ${r.membruNume}`}
                      className="text-muted hover:text-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeSters(r);
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ConfirmDialog
        open={!!deSters}
        onOpenChange={(o) => !o && setDeSters(null)}
        title="Șterge abonament"
        description={
          deSters
            ? `Sigur vrei să ștergi abonamentul ${TIPURI_ABONAMENT[deSters.tip].eticheta} al lui ${deSters.membruNume}? Această acțiune nu poate fi anulată.`
            : ""
        }
        confirmLabel="Șterge"
        onConfirm={stergeAbonament}
      />
    </>
  );
}
