import Link from "next/link";
import {
  Users,
  CalendarX2,
  Wallet,
  UserCheck,
  AlertTriangle,
  Clock,
  Plus,
} from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AbonamentBadge } from "@/components/status-badge";
import {
  formatDate,
  formatLei,
  zileRamase,
  statusAbonament,
} from "@/lib/utils";
import { abonamentCurent } from "@/lib/abonamente";
import { TIPURI_ABONAMENT } from "@/types";
import type { Abonament, AbonamentCuMembru, Membru } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();

  const [{ data: membriData }, { data: abonamenteData }] = await Promise.all([
    supabase.from("membri").select("id, nume, telefon, created_at"),
    supabase
      .from("abonamente")
      .select("*, membri(id, nume, telefon)")
      .order("created_at", { ascending: false }),
  ]);

  const membri = (membriData ?? []) as Membru[];
  const abonamente = (abonamenteData ?? []) as AbonamentCuMembru[];

  // Grupează abonamentele pe membru
  const peMembru = new Map<string, Abonament[]>();
  for (const a of abonamente) {
    const lista = peMembru.get(a.membru_id) ?? [];
    lista.push(a);
    peMembru.set(a.membru_id, lista);
  }

  // 1. Membri activi azi
  const membriActivi = [...peMembru.values()].filter((list) =>
    abonamentCurent(list)
  ).length;

  // 2. Abonamente expirate în ultimele 30 de zile
  const expirateRecent = abonamente.filter((a) => {
    const zile = zileRamase(a.data_sfarsit);
    return zile < 0 && zile >= -30;
  }).length;

  // 3. Încasări luna curentă (sumă preț pentru abonamente începute luna aceasta)
  const acum = new Date();
  const incasari = abonamente
    .filter((a) => {
      const d = new Date(a.data_start);
      return (
        d.getFullYear() === acum.getFullYear() &&
        d.getMonth() === acum.getMonth()
      );
    })
    .reduce((sum, a) => sum + parseFloat(String(a.pret)), 0);

  // 4. Total membri
  const totalMembri = membri.length;

  // Expiră în 3 zile — abonamentul curent al membrului expiră în 0..3 zile
  const expiraCurand = [...peMembru.entries()]
    .map(([, list]) => abonamentCurent(list))
    .filter((a): a is AbonamentCuMembru => {
      if (!a) return false;
      const zile = zileRamase(a.data_sfarsit);
      return zile >= 0 && zile <= 3;
    })
    .sort((a, b) => zileRamase(a.data_sfarsit) - zileRamase(b.data_sfarsit));

  // Activitate recentă — ultimele 5 abonamente adăugate
  const recente = abonamente.slice(0, 5);

  return (
    <div>
      <PageHeader
        titlu="Dashboard"
        subtitlu="Privire de ansamblu asupra sălii Premier Fitness"
      />

      {/* Carduri statistici */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          titlu="Membri activi azi"
          valoare={membriActivi}
          icon={UserCheck}
        />
        <StatCard
          titlu="Abonamente expirate"
          valoare={expirateRecent}
          icon={CalendarX2}
          hint="ultimele 30 de zile"
        />
        <StatCard
          titlu="Încasări luna curentă"
          valoare={formatLei(incasari)}
          icon={Wallet}
        />
        <StatCard
          titlu="Total membri în bază"
          valoare={totalMembri}
          icon={Users}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Expiră în 3 zile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Expiră în 3 zile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiraCurand.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">
                Niciun abonament nu expiră în următoarele 3 zile.
              </p>
            ) : (
              expiraCurand.map((a) => {
                const zile = zileRamase(a.data_sfarsit);
                return (
                  <Link
                    key={a.id}
                    href={`/membri/${a.membru_id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {a.membri?.nume ?? "Membru șters"}
                      </p>
                      <p className="text-xs text-muted">
                        {TIPURI_ABONAMENT[a.tip].eticheta} · expiră{" "}
                        {formatDate(a.data_sfarsit)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
                      {zile === 0
                        ? "azi"
                        : zile === 1
                          ? "1 zi"
                          : `${zile} zile`}
                    </span>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Activitate recentă */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Activitate recentă
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recente.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm text-muted">
                  Niciun abonament adăugat încă.
                </p>
                <Link
                  href="/membri"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" /> Adaugă primul membru
                </Link>
              </div>
            ) : (
              recente.map((a) => (
                <Link
                  key={a.id}
                  href={`/membri/${a.membru_id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:border-primary/40 hover:bg-surface-elevated"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {a.membri?.nume ?? "Membru șters"}
                    </p>
                    <p className="text-xs text-muted">
                      {TIPURI_ABONAMENT[a.tip].eticheta} ·{" "}
                      {formatLei(a.pret)} · {formatDate(a.data_start)}
                    </p>
                  </div>
                  <AbonamentBadge status={statusAbonament(a.data_sfarsit)} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
