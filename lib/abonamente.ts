import type { Abonament, StatusMembru } from "@/types";
import { zileRamase } from "@/lib/utils";

// Dintr-o listă de abonamente, returnează abonamentul curent activ (dacă există).
// Activ = data_sfarsit >= azi. Dacă sunt mai multe, îl alege pe cel cu sfârșitul cel mai îndepărtat.
export function abonamentCurent(
  abonamente: Abonament[] | null | undefined
): Abonament | null {
  if (!abonamente || abonamente.length === 0) return null;
  const active = abonamente
    .filter((a) => zileRamase(a.data_sfarsit) >= 0)
    .sort(
      (a, b) =>
        new Date(b.data_sfarsit).getTime() - new Date(a.data_sfarsit).getTime()
    );
  return active[0] ?? null;
}

// Cel mai recent abonament (după data de sfârșit), indiferent de status.
export function ultimulAbonament(
  abonamente: Abonament[] | null | undefined
): Abonament | null {
  if (!abonamente || abonamente.length === 0) return null;
  return [...abonamente].sort(
    (a, b) =>
      new Date(b.data_sfarsit).getTime() - new Date(a.data_sfarsit).getTime()
  )[0];
}

// Statusul unui membru pe baza abonamentelor sale.
export function statusMembru(
  abonamente: Abonament[] | null | undefined
): StatusMembru {
  if (!abonamente || abonamente.length === 0) return "fara_abonament";
  return abonamentCurent(abonamente) ? "activ" : "expirat";
}
