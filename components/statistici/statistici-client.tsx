"use client";

import { useMemo, useState } from "react";
import { Wallet, FilePlus2, Trophy, Dumbbell, Download } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatisticiCharts } from "@/components/statistici/statistici-charts";
import { cn, formatLei } from "@/lib/utils";
import { descarcaCSV } from "@/lib/csv";
import {
  calculeazaStatistici,
  etichetaInterval,
  INTERVALE,
  type Interval,
} from "@/lib/statistici";
import { TIPURI_ABONAMENT } from "@/types";
import type { Abonament, TipAbonament } from "@/types";

export function StatisticiClient({ abonamente }: { abonamente: Abonament[] }) {
  const [interval, setInterval] = useState<Interval>("6l");

  const stats = useMemo(
    () => calculeazaStatistici(abonamente, interval),
    [abonamente, interval]
  );
  const eticheta = etichetaInterval(interval);
  const { sumar } = stats;

  // Export CSV — serii pe perioada selectată + sumar și defalcare pe tip (luna curentă)
  function exportaStatistici() {
    const acum = new Date();
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const dataAfisare = `${pad2(acum.getDate())}.${pad2(acum.getMonth() + 1)}.${acum.getFullYear()}`;
    const dataFisier = `${pad2(acum.getDate())}-${pad2(acum.getMonth() + 1)}-${acum.getFullYear()}`;

    // Defalcare pe tip pentru luna curentă (după data_start)
    const peTip = new Map<TipAbonament, { count: number; suma: number }>();
    (Object.keys(TIPURI_ABONAMENT) as TipAbonament[]).forEach((t) =>
      peTip.set(t, { count: 0, suma: 0 })
    );
    for (const a of abonamente) {
      const [an, luna] = a.data_start.split("-").map(Number);
      if (an === acum.getFullYear() && luna - 1 === acum.getMonth()) {
        const intrare = peTip.get(a.tip);
        if (intrare) {
          intrare.count += 1;
          intrare.suma += parseFloat(String(a.pret)) || 0;
        }
      }
    }

    // Linia de titlu trece prin parametrul „antet"; restul prin rânduri.
    const antet = ["Statistici Premier Fitness"];
    const randuri: (string | number)[][] = [
      ["Interval", etichetaInterval(interval)],
      ["Generat la", dataAfisare],
      [],
      ["Lună", "Venituri (lei)", "Abonamente Noi", "Membri Activi"],
      ...stats.venituri.map((punct, i) => [
        punct.luna,
        punct.valoare,
        stats.abonamenteNoi[i]?.valoare ?? 0,
        stats.membriActivi[i]?.valoare ?? 0,
      ]),
      [],
      ["Total venituri (lei)", sumar.venituri],
      ["Total abonamente noi", sumar.abonamenteNoi],
      [],
      ["Defalcare pe tip — luna curentă"],
      ["Tip", "Număr", "Venituri (lei)"],
      ...(Object.keys(TIPURI_ABONAMENT) as TipAbonament[]).map((t) => {
        const intrare = peTip.get(t)!;
        return [TIPURI_ABONAMENT[t].eticheta, intrare.count, intrare.suma];
      }),
    ];

    descarcaCSV(`statistici_premier_fitness_${dataFisier}.csv`, antet, randuri);
  }

  return (
    <>
      {/* Acțiuni */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          onClick={exportaStatistici}
          className="w-full sm:w-auto"
        >
          <Download /> Export CSV
        </Button>
      </div>

      {/* Carduri — perioada selectată */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          titlu="Venituri"
          valoare={formatLei(sumar.venituri)}
          icon={Wallet}
          hint={eticheta}
        />
        <StatCard
          titlu="Abonamente noi"
          valoare={sumar.abonamenteNoi}
          icon={FilePlus2}
          hint={eticheta}
        />
        <StatCard
          titlu="Cel mai activ tip"
          valoare={sumar.celMaiActivTip?.eticheta ?? "—"}
          icon={Trophy}
          hint={
            sumar.celMaiActivTip
              ? `${sumar.celMaiActivTip.count} ${
                  sumar.celMaiActivTip.count === 1 ? "abonament" : "abonamente"
                } · ${eticheta.toLowerCase()}`
              : "Niciun abonament în perioadă"
          }
        />
      </div>

      {/* Breakdown per tip — perioada selectată */}
      <h2 className="mb-3 mt-8 text-xs font-bold uppercase tracking-wider text-muted">
        Pe tip de abonament · {eticheta}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {sumar.breakdown.map((b) => (
          <Card key={b.tip} glow className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Dumbbell className="h-5 w-5" />
                </span>
                <p className="font-bold">{b.eticheta}</p>
              </div>
              <span className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-xs font-bold text-muted">
                {b.count} abon.
              </span>
            </div>
            <p className="mt-4 text-2xl font-extrabold text-primary">
              {formatLei(b.suma)}
            </p>
          </Card>
        ))}
      </div>

      {/* Grafice + selector de interval */}
      <div className="mb-3 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
          Evoluție lunară
        </h2>
        <div
          role="group"
          aria-label="Interval de timp"
          className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-surface p-1"
        >
          {INTERVALE.map((opt) => {
            const activ = interval === opt.val;
            return (
              <button
                key={opt.val}
                type="button"
                aria-pressed={activ}
                onClick={() => setInterval(opt.val)}
                className={cn(
                  "rounded-md px-3 py-2 text-xs font-bold uppercase tracking-wide transition-all",
                  activ
                    ? "border border-primary/60 bg-primary/10 text-primary"
                    : "border border-transparent text-muted hover:bg-surface-elevated hover:text-foreground"
                )}
              >
                {opt.eticheta}
              </button>
            );
          })}
        </div>
      </div>

      <StatisticiCharts
        venituri={stats.venituri}
        abonamenteNoi={stats.abonamenteNoi}
        membriActivi={stats.membriActivi}
        eticheta={eticheta}
      />
    </>
  );
}
