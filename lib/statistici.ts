import type { Abonament, TipAbonament } from "@/types";
import { TIPURI_ABONAMENT } from "@/types";

// Nume scurte de lună în limba română (index 0 = ianuarie)
const LUNI_SCURTE = [
  "Ian", "Feb", "Mar", "Apr", "Mai", "Iun",
  "Iul", "Aug", "Sep", "Oct", "Noi", "Dec",
];

// Intervalele disponibile pentru selector
export type Interval = "7z" | "30z" | "3l" | "6l" | "12l";

export const INTERVALE: { val: Interval; eticheta: string }[] = [
  { val: "7z", eticheta: "7 zile" },
  { val: "30z", eticheta: "30 zile" },
  { val: "3l", eticheta: "3 luni" },
  { val: "6l", eticheta: "6 luni" },
  { val: "12l", eticheta: "12 luni" },
];

// Eticheta descriptivă a intervalului (ex: "Ultimele 30 de zile")
export function etichetaInterval(interval: Interval): string {
  switch (interval) {
    case "7z":
      return "Ultimele 7 zile";
    case "30z":
      return "Ultimele 30 de zile";
    case "3l":
      return "Ultimele 3 luni";
    case "6l":
      return "Ultimele 6 luni";
    case "12l":
      return "Ultimele 12 luni";
  }
}

// Granularitatea (zi sau lună) pentru un interval dat
export function granularitate(interval: Interval): "zi" | "luna" {
  return interval === "7z" || interval === "30z" ? "zi" : "luna";
}

// Parsează o dată ISO "YYYY-MM-DD" ca dată locală (fără efecte de fus orar)
function parseDataLocala(iso: string): Date {
  const [an, luna, zi] = iso.split("-").map(Number);
  return new Date(an, (luna ?? 1) - 1, zi ?? 1);
}

function pretNumeric(pret: number | string): number {
  const n = typeof pret === "string" ? parseFloat(pret) : pret;
  return Number.isFinite(n) ? n : 0;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export interface PunctGrafic {
  // `luna` rămâne numele câmpului pentru compatibilitate cu graficele,
  // dar reprezintă eticheta de pe axa X (zi DD.MM sau lună Ian/Feb...)
  luna: string;
  valoare: number;
}

export interface BreakdownTip {
  tip: TipAbonament;
  eticheta: string;
  count: number;
  suma: number;
}

export interface Statistici {
  granularitate: "zi" | "luna";
  venituri: PunctGrafic[];
  abonamenteNoi: PunctGrafic[];
  membriActivi: PunctGrafic[];
  sumar: {
    venituri: number;
    abonamenteNoi: number;
    breakdown: BreakdownTip[];
    celMaiActivTip: BreakdownTip | null;
  };
}

interface Bucket {
  eticheta: string;
  start: Date; // inclusiv
  end: Date; // inclusiv
}

// Construiește lista de „găleți" (zile sau luni) pentru intervalul cerut
function construiesteBuckets(interval: Interval): Bucket[] {
  const acum = new Date();
  const buckets: Bucket[] = [];

  if (granularitate(interval) === "zi") {
    const nrZile = interval === "7z" ? 7 : 30;
    for (let i = nrZile - 1; i >= 0; i--) {
      const zi = new Date(
        acum.getFullYear(),
        acum.getMonth(),
        acum.getDate() - i
      );
      buckets.push({
        eticheta: `${pad2(zi.getDate())}.${pad2(zi.getMonth() + 1)}`,
        start: zi,
        end: zi,
      });
    }
  } else {
    const nrLuni = interval === "3l" ? 3 : interval === "6l" ? 6 : 12;
    for (let i = nrLuni - 1; i >= 0; i--) {
      const d = new Date(acum.getFullYear(), acum.getMonth() - i, 1);
      buckets.push({
        eticheta: LUNI_SCURTE[d.getMonth()],
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0),
      });
    }
  }

  return buckets;
}

// Calculează toate seriile + sumarul pentru intervalul selectat.
// Veniturile și abonamentele noi se grupează după luna/ziua din `data_start`.
// „Membri activi" numără membrii unici cu un abonament ce acoperă perioada.
export function calculeazaStatistici(
  abonamente: Abonament[],
  interval: Interval
): Statistici {
  const buckets = construiesteBuckets(interval);

  const venituri: PunctGrafic[] = [];
  const abonamenteNoi: PunctGrafic[] = [];
  const membriActivi: PunctGrafic[] = [];

  for (const b of buckets) {
    let sumaVenit = 0;
    let noi = 0;
    const activi = new Set<string>();

    for (const a of abonamente) {
      const start = parseDataLocala(a.data_start);
      const sfarsit = parseDataLocala(a.data_sfarsit);

      // data_start cade în această găleată
      if (start >= b.start && start <= b.end) {
        sumaVenit += pretNumeric(a.pret);
        noi += 1;
      }
      // abonamentul se suprapune cu perioada găleții
      if (start <= b.end && sfarsit >= b.start && a.membru_id) {
        activi.add(a.membru_id);
      }
    }

    venituri.push({ luna: b.eticheta, valoare: sumaVenit });
    abonamenteNoi.push({ luna: b.eticheta, valoare: noi });
    membriActivi.push({ luna: b.eticheta, valoare: activi.size });
  }

  // Sumar pe întreaga fereastră [primul bucket .. ultimul bucket]
  const fereastraStart = buckets[0].start;
  const fereastraEnd = buckets[buckets.length - 1].end;

  const breakdownMap = new Map<TipAbonament, BreakdownTip>();
  (Object.keys(TIPURI_ABONAMENT) as TipAbonament[]).forEach((tip) => {
    breakdownMap.set(tip, {
      tip,
      eticheta: TIPURI_ABONAMENT[tip].eticheta,
      count: 0,
      suma: 0,
    });
  });

  let venituriTotal = 0;
  let abonamenteNoiTotal = 0;

  for (const a of abonamente) {
    const start = parseDataLocala(a.data_start);
    if (start >= fereastraStart && start <= fereastraEnd) {
      venituriTotal += pretNumeric(a.pret);
      abonamenteNoiTotal += 1;
      const b = breakdownMap.get(a.tip);
      if (b) {
        b.count += 1;
        b.suma += pretNumeric(a.pret);
      }
    }
  }

  const breakdown = [...breakdownMap.values()];
  const celMaiActivTip =
    abonamenteNoiTotal > 0
      ? breakdown.reduce((max, b) => (b.count > max.count ? b : max))
      : null;

  return {
    granularitate: granularitate(interval),
    venituri,
    abonamenteNoi,
    membriActivi,
    sumar: {
      venituri: venituriTotal,
      abonamenteNoi: abonamenteNoiTotal,
      breakdown,
      celMaiActivTip,
    },
  };
}
