import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import type { StatusAbonament, StatusMembru } from "@/types";

// Combină clase Tailwind în mod inteligent
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Parsează o dată ISO (YYYY-MM-DD) sau un Date și o normalizează
function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

// Formatează o dată în format românesc: DD.MM.YYYY
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  try {
    return format(toDate(value), "dd.MM.yyyy");
  } catch {
    return "—";
  }
}

// Formatează un preț în lei: "150 lei"
export function formatLei(value: number | string): string {
  const numar = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(numar)) return "0 lei";
  // Afișează fără zecimale dacă e număr întreg
  const formatat = Number.isInteger(numar)
    ? numar.toLocaleString("ro-RO")
    : numar.toLocaleString("ro-RO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
  return `${formatat} lei`;
}

// Numărul de zile rămase până la o dată (poate fi negativ dacă a trecut)
export function zileRamase(dataSfarsit: string | Date): number {
  return differenceInCalendarDays(toDate(dataSfarsit), new Date());
}

// Calculează statusul unui abonament în funcție de data de sfârșit
export function statusAbonament(dataSfarsit: string | Date): StatusAbonament {
  const zile = zileRamase(dataSfarsit);
  if (zile < 0) return "expirat";
  if (zile <= 3) return "expira_curand";
  return "activ";
}

// Eticheta în limba română pentru statusul unui abonament
export function etichetaStatusAbonament(status: StatusAbonament): string {
  switch (status) {
    case "activ":
      return "Activ";
    case "expira_curand":
      return "Expiră curând";
    case "expirat":
      return "Expirat";
  }
}

// Eticheta în limba română pentru statusul unui membru
export function etichetaStatusMembru(status: StatusMembru): string {
  switch (status) {
    case "activ":
      return "Activ";
    case "expirat":
      return "Expirat";
    case "fara_abonament":
      return "Fără abonament";
  }
}

// Adaugă un număr de zile la o dată și returnează în format ISO (YYYY-MM-DD)
export function adaugaZile(data: string | Date, zile: number): string {
  const d = toDate(data);
  const rezultat = new Date(d);
  rezultat.setDate(rezultat.getDate() + zile);
  return format(rezultat, "yyyy-MM-dd");
}

// Data de azi în format ISO (YYYY-MM-DD)
export function aziISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}
