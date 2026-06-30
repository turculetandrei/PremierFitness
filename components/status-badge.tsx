import { Badge } from "@/components/ui/badge";
import {
  etichetaStatusAbonament,
  etichetaStatusMembru,
} from "@/lib/utils";
import type { StatusAbonament, StatusMembru } from "@/types";

export function AbonamentBadge({ status }: { status: StatusAbonament }) {
  const variant =
    status === "activ" ? "activ" : status === "expira_curand" ? "expira" : "expirat";
  return <Badge variant={variant}>{etichetaStatusAbonament(status)}</Badge>;
}

export function MembruBadge({ status }: { status: StatusMembru }) {
  const variant =
    status === "activ" ? "activ" : status === "expirat" ? "expirat" : "neutru";
  return <Badge variant={variant}>{etichetaStatusMembru(status)}</Badge>;
}
