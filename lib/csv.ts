// Descărcare CSV fără bibliotecă externă (vanilla Blob).

type Celula = string | number | null | undefined;

// Escapează o valoare pentru CSV (ghilimele, virgule, newline)
function escapeazaCelula(value: Celula): string {
  const s = value == null ? "" : String(value);
  if (/["\n,]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// Construiește conținutul CSV și declanșează descărcarea în browser.
export function descarcaCSV(
  numeFisier: string,
  antet: string[],
  randuri: Celula[][]
): void {
  const linii = [
    antet.map(escapeazaCelula).join(","),
    ...randuri.map((rand) => rand.map(escapeazaCelula).join(",")),
  ];
  // BOM UTF-8 (﻿) pentru ca Excel să afișeze corect diacriticele
  const continut = "﻿" + linii.join("\r\n");
  const blob = new Blob([continut], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = numeFisier;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
