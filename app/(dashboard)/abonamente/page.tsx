import { createServerSupabase } from "@/lib/supabase-server";
import { PageHeader } from "@/components/page-header";
import {
  AbonamenteClient,
  type AbonamentRand,
} from "@/components/abonamente/abonamente-client";
import { statusAbonament } from "@/lib/utils";
import type { AbonamentCuMembru } from "@/types";

export const dynamic = "force-dynamic";

export default async function AbonamentePage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("abonamente")
    .select("*, membri(id, nume, telefon)")
    .order("data_sfarsit", { ascending: false });

  const abonamente = (data ?? []) as AbonamentCuMembru[];

  const randuri: AbonamentRand[] = abonamente.map((a) => ({
    id: a.id,
    membruId: a.membru_id,
    membruNume: a.membri?.nume ?? "Membru șters",
    tip: a.tip,
    pret: parseFloat(String(a.pret)),
    dataStart: a.data_start,
    dataSfarsit: a.data_sfarsit,
    status: statusAbonament(a.data_sfarsit),
  }));

  return (
    <div>
      <PageHeader
        titlu="Abonamente"
        subtitlu={`${randuri.length} ${randuri.length === 1 ? "abonament" : "abonamente"} în total`}
      />
      <AbonamenteClient randuri={randuri} />
    </div>
  );
}
