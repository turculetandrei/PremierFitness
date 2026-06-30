"use client";

import { useMemo, useState } from "react";
import { Wallet, FilePlus2, Trophy, Dumbbell } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { StatisticiCharts } from "@/components/statistici/statistici-charts";
import { cn, formatLei } from "@/lib/utils";
import {
  calculeazaStatistici,
  etichetaInterval,
  INTERVALE,
  type Interval,
} from "@/lib/statistici";
import type { Abonament } from "@/types";

export function StatisticiClient({ abonamente }: { abonamente: Abonament[] }) {
  const [interval, setInterval] = useState<Interval>("6l");

  const stats = useMemo(
    () => calculeazaStatistici(abonamente, interval),
    [abonamente, interval]
  );
  const eticheta = etichetaInterval(interval);
  const { sumar } = stats;

  return (
    <>
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
