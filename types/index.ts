// Tipuri TypeScript pentru Premier Fitness Gym

export type TipAbonament = "standard" | "cardio" | "student";

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

// Detalii despre fiecare tip de abonament (preț implicit + etichetă)
export interface DetaliiTip {
  tip: TipAbonament;
  eticheta: string;
  pret: number;
}

export const TIPURI_ABONAMENT: Record<TipAbonament, DetaliiTip> = {
  standard: { tip: "standard", eticheta: "Standard", pret: 150 },
  cardio: { tip: "cardio", eticheta: "Cardio inclus", pret: 170 },
  student: { tip: "student", eticheta: "Student", pret: 120 },
};

// Durata implicită a unui abonament, în zile
export const DURATA_ABONAMENT_ZILE = 30;
