"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AbonamentBadge } from "@/components/status-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EditAbonamentDialog } from "@/components/membru/edit-abonament-dialog";
import { formatDate, formatLei, statusAbonament, zileRamase } from "@/lib/utils";
import { TIPURI_ABONAMENT } from "@/types";
import type { Abonament } from "@/types";

export function AbonamentIstoric({ abonamente }: { abonamente: Abonament[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deEditat, setDeEditat] = useState<Abonament | null>(null);
  const [deSters, setDeSters] = useState<Abonament | null>(null);

  // Numărul de abonamente active (data sfârșit >= azi)
  const nrActive = abonamente.filter(
    (a) => zileRamase(a.data_sfarsit) >= 0
  ).length;

  function cereStergere(a: Abonament) {
    const esteActiv = zileRamase(a.data_sfarsit) >= 0;
    // Nu permite ștergerea singurului abonament activ
    if (esteActiv && nrActive <= 1) {
      toast({
        variant: "error",
        title: "Nu se poate șterge",
        description: "Acesta este singurul abonament activ al membrului.",
      });
      return;
    }
    setDeSters(a);
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
      description: `${TIPURI_ABONAMENT[deSters.tip].eticheta} a fost șters.`,
    });
    setDeSters(null);
    router.refresh();
  }

  if (abonamente.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Niciun abonament înregistrat.
      </p>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tip</TableHead>
            <TableHead>Preț</TableHead>
            <TableHead>Data start</TableHead>
            <TableHead>Data sfârșit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Acțiuni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {abonamente.map((a) => (
            <TableRow key={a.id}>
              <TableCell className="font-semibold">
                {TIPURI_ABONAMENT[a.tip].eticheta}
              </TableCell>
              <TableCell>{formatLei(a.pret)}</TableCell>
              <TableCell className="text-muted">
                {formatDate(a.data_start)}
              </TableCell>
              <TableCell className="text-muted">
                {formatDate(a.data_sfarsit)}
              </TableCell>
              <TableCell>
                <AbonamentBadge status={statusAbonament(a.data_sfarsit)} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Editează abonament"
                    className="text-muted hover:text-primary"
                    onClick={() => setDeEditat(a)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Șterge abonament"
                    className="text-muted hover:text-danger"
                    onClick={() => cereStergere(a)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {deEditat && (
        <EditAbonamentDialog
          key={deEditat.id}
          abonament={deEditat}
          open
          onOpenChange={(o) => !o && setDeEditat(null)}
        />
      )}

      <ConfirmDialog
        open={!!deSters}
        onOpenChange={(o) => !o && setDeSters(null)}
        title="Șterge abonament"
        description={
          deSters
            ? `Sigur vrei să ștergi abonamentul ${TIPURI_ABONAMENT[deSters.tip].eticheta} din ${formatDate(deSters.data_start)}? Această acțiune nu poate fi anulată.`
            : ""
        }
        confirmLabel="Șterge"
        onConfirm={stergeAbonament}
      />
    </>
  );
}
