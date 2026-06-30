import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, CalendarClock, CreditCard } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AbonamentBadge } from "@/components/status-badge";
import { EditMemberDialog } from "@/components/membru/edit-member-dialog";
import { NewAbonamentDialog } from "@/components/membru/new-abonament-dialog";
import { AbonamentIstoric } from "@/components/membru/abonament-istoric";
import { formatDate, formatLei, zileRamase, statusAbonament } from "@/lib/utils";
import { abonamentCurent } from "@/lib/abonamente";
import { TIPURI_ABONAMENT } from "@/types";
import type { Abonament, Membru } from "@/types";

export const dynamic = "force-dynamic";

type MembruCuAbonamente = Membru & { abonamente: Abonament[] };

function textZileRamase(zile: number): string {
  if (zile === 0) return "Expiră azi";
  if (zile === 1) return "1 zi rămasă";
  return `${zile} zile rămase`;
}

export default async function MembruDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data } = await supabase
    .from("membri")
    .select("*, abonamente(*)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const membru = data as MembruCuAbonamente;
  const abonamente = [...(membru.abonamente ?? [])].sort(
    (a, b) =>
      new Date(b.data_start).getTime() - new Date(a.data_start).getTime()
  );
  const curent = abonamentCurent(abonamente);

  return (
    <div>
      <Link
        href="/membri"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Înapoi la membri
      </Link>

      {/* Header membru */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-extrabold uppercase tracking-tight sm:text-3xl">
            {membru.nume}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <Phone className="h-4 w-4 shrink-0" />
            {membru.telefon || "Fără telefon"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
          <EditMemberDialog membru={membru} abonamentActiv={curent} />
          <NewAbonamentDialog membruId={membru.id} />
        </div>
      </div>

      {/* Abonament curent */}
      {curent ? (
        <Card glow className="mb-8 border-primary/40">
          <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <CalendarClock className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  Abonament curent
                </p>
                <p className="text-xl font-bold">
                  {TIPURI_ABONAMENT[curent.tip].eticheta}
                </p>
                <p className="text-sm text-muted">
                  {formatLei(curent.pret)} · {formatDate(curent.data_start)} –{" "}
                  {formatDate(curent.data_sfarsit)}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-extrabold text-primary">
                {textZileRamase(zileRamase(curent.data_sfarsit))}
              </p>
              <div className="mt-1">
                <AbonamentBadge status={statusAbonament(curent.data_sfarsit)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-muted">
              <CreditCard className="h-6 w-6" />
            </div>
            <p className="font-semibold">Niciun abonament activ</p>
            <p className="text-sm text-muted">
              Apasă „Abonament Nou” pentru a adăuga unul.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Istoric abonamente */}
      <Card>
        <CardHeader>
          <CardTitle>Istoric abonamente</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <AbonamentIstoric abonamente={abonamente} />
        </CardContent>
      </Card>
    </div>
  );
}
