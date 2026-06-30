"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Search, Trash2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MembruBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { etichetaStatusMembru, formatDate } from "@/lib/utils";
import { descarcaCSV } from "@/lib/csv";
import { TIPURI_ABONAMENT } from "@/types";
import type { StatusMembru, TipAbonament } from "@/types";

export interface MembruRand {
  id: string;
  nume: string;
  telefon: string | null;
  status: StatusMembru;
  dataExpirare: string | null;
  abonamentActiv: {
    tip: TipAbonament;
    pret: number;
    dataStart: string;
    dataSfarsit: string;
  } | null;
}

export function MembriClient({ membri }: { membri: MembruRand[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [cautare, setCautare] = useState("");
  const [deSters, setDeSters] = useState<MembruRand | null>(null);

  const filtrati = useMemo(() => {
    const q = cautare.trim().toLowerCase();
    if (!q) return membri;
    return membri.filter(
      (m) =>
        m.nume.toLowerCase().includes(q) ||
        (m.telefon ?? "").toLowerCase().includes(q)
    );
  }, [cautare, membri]);

  async function stergeMembru() {
    if (!deSters) return;
    const supabase = createClient();
    const { error } = await supabase.from("membri").delete().eq("id", deSters.id);

    if (error) {
      toast({
        variant: "error",
        title: "Eroare la ștergere",
        description: "Membrul nu a putut fi șters.",
      });
      return;
    }

    toast({
      title: "Membru șters",
      description: `${deSters.nume} a fost șters din bază.`,
    });
    setDeSters(null);
    router.refresh();
  }

  function exportaCSV() {
    const antet = [
      "Nume",
      "Telefon",
      "Tip abonament activ",
      "Data start",
      "Data sfârșit",
      "Preț",
      "Status",
    ];
    const randuriCsv = filtrati.map((m) => [
      m.nume,
      m.telefon ?? "",
      m.abonamentActiv ? TIPURI_ABONAMENT[m.abonamentActiv.tip].eticheta : "",
      m.abonamentActiv ? formatDate(m.abonamentActiv.dataStart) : "",
      m.abonamentActiv ? formatDate(m.abonamentActiv.dataSfarsit) : "",
      m.abonamentActiv ? m.abonamentActiv.pret : "",
      etichetaStatusMembru(m.status),
    ]);
    descarcaCSV("membri.csv", antet, randuriCsv);
    toast({
      title: "Export realizat",
      description: `${filtrati.length} membri exportați.`,
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-md sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="pl-9"
            placeholder="Caută după nume sau telefon..."
            value={cautare}
            onChange={(e) => setCautare(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={exportaCSV}
          disabled={filtrati.length === 0}
          className="w-full sm:w-auto"
        >
          <Download /> Export CSV
        </Button>
      </div>

      <div className="rounded-card border border-border bg-surface">
        {filtrati.length === 0 ? (
          <EmptyState hasMembers={membri.length > 0} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Status abonament</TableHead>
                <TableHead>Data expirare</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrati.map((m) => (
                <TableRow
                  key={m.id}
                  className="cursor-pointer hover:bg-surface-elevated"
                  onClick={() => router.push(`/membri/${m.id}`)}
                >
                  <TableCell className="font-semibold">{m.nume}</TableCell>
                  <TableCell className="text-muted">
                    {m.telefon || "—"}
                  </TableCell>
                  <TableCell>
                    <MembruBadge status={m.status} />
                  </TableCell>
                  <TableCell className="text-muted">
                    {formatDate(m.dataExpirare)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Șterge ${m.nume}`}
                      className="text-muted hover:text-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeSters(m);
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
        title="Șterge membru"
        description={
          deSters
            ? `Sigur vrei să ștergi "${deSters.nume}"? Toate abonamentele acestuia vor fi șterse definitiv.`
            : ""
        }
        confirmLabel="Șterge"
        onConfirm={stergeMembru}
      />
    </>
  );
}

function EmptyState({ hasMembers }: { hasMembers: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-muted">
        <Users className="h-6 w-6" />
      </div>
      <p className="text-sm text-muted">
        {hasMembers
          ? "Niciun membru găsit pentru această căutare."
          : "Niciun membru găsit. Adaugă primul membru."}
      </p>
    </div>
  );
}
