// Tipuri TypeScript pentru Premier Fitness Gym

export type TipAbonament =
  | "sedinta"
  | "elevi"
  | "elevi_cardio"
  | "adulti"
  | "adulti_cardio";

export interface Membru {
  id: string;
  nume: string;
  telefon: string | null;
  created_at: string;
}

export interface Abonament {
  id: string;
  membru_id: string;
  tip: TipAbonament;
  pret: number;
  data_start: string; // ISO date (YYYY-MM-DD)
  data_sfarsit: string; // ISO date (YYYY-MM-DD)
  created_at: string;
}

// Abonament cu datele membrului atașate (folosit în liste/join-uri)
export interface AbonamentCuMembru extends Abonament {
  membri: Pick<Membru, "id" | "nume" | "telefon"> | null;
}

// Membru împreună cu abonamentele sale
export interface MembruCuAbonamente extends Membru {
  abonamente: Abonament[];
}

// Statusul calculat al unui abonament în raport cu ziua curentă
export type StatusAbonament = "activ" | "expira_curand" | "expirat";

// Statusul unui membru (în funcție de abonamentul curent)
export type StatusMembru = "activ" | "expirat" | "fara_abonament";

// Detalii despre fiecare tip de abonament (preț + etichetă + durată)
export interface DetaliiTip {
  tip: TipAbonament;
  eticheta: string;
  pret: number;
  durataZile: number; // durata în zile; 0 = aceeași zi (data_sfarsit = data_start)
}

export const TIPURI_ABONAMENT: Record<TipAbonament, DetaliiTip> = {
  sedinta: { tip: "sedinta", eticheta: "Ședință Unică", pret: 30, durataZile: 0 },
  elevi: { tip: "elevi", eticheta: "Fitness Elevi", pret: 130, durataZile: 30 },
  elevi_cardio: {
    tip: "elevi_cardio",
    eticheta: "Fitness + Cardio Elevi",
    pret: 150,
    durataZile: 30,
  },
  adulti: { tip: "adulti", eticheta: "Fitness Adulți", pret: 150, durataZile: 30 },
  adulti_cardio: {
    tip: "adulti_cardio",
    eticheta: "Fitness + Cardio Adulți",
    pret: 170,
    durataZile: 30,
  },
};

// Durata implicită a unui abonament, în zile (fallback pentru tipurile lunare)
export const DURATA_ABONAMENT_ZILE = 30;
