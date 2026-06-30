import { createServerSupabase } from "@/lib/supabase-server";
import { PageHeader } from "@/components/page-header";
import { AddMemberDialog } from "@/components/membri/add-member-dialog";
import {
  MembriClient,
  type MembruRand,
} from "@/components/membri/membri-client";
import { abonamentCurent, ultimulAbonament, statusMembru } from "@/lib/abonamente";
import type { Abonament, Membru } from "@/types";

export const dynamic = "force-dynamic";

type MembruCuAbonamente = Membru & { abonamente: Abonament[] };

export default async function MembriPage() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("membri")
    .select("*, abonamente(*)")
    .order("nume", { ascending: true });

  const membri = (data ?? []) as MembruCuAbonamente[];

  const randuri: MembruRand[] = membri.map((m) => {
    const status = statusMembru(m.abonamente);
    const curent = abonamentCurent(m.abonamente);
    const ultim = ultimulAbonament(m.abonamente);
    return {
      id: m.id,
      nume: m.nume,
      telefon: m.telefon,
      status,
      dataExpirare: (curent ?? ultim)?.data_sfarsit ?? null,
      abonamentActiv: curent
        ? {
            tip: curent.tip,
            pret: parseFloat(String(curent.pret)),
            dataStart: curent.data_start,
            dataSfarsit: curent.data_sfarsit,
          }
        : null,
    };
  });

  return (
    <div>
      <PageHeader
        titlu="Membri"
        subtitlu={`${randuri.length} ${randuri.length === 1 ? "membru" : "membri"} în bază`}
      >
        <AddMemberDialog />
      </PageHeader>

      <MembriClient membri={randuri} />
    </div>
  );
}
