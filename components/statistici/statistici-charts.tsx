"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLei } from "@/lib/utils";
import type { PunctGrafic } from "@/lib/statistici";

const ORANGE = "#E87722";
const GRAY = "#9CA3AF";
const GRID = "#2A2A2A";
const AXIS = "#888888";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string | number;
}

// Tooltip stilizat pe tema dark, cu formator configurabil
function tooltipFactory(formator: (v: number) => string) {
  return function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;
    const valoare = Number(payload[0].value ?? 0);
    return (
      <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 shadow-lg">
        <p className="mb-0.5 text-xs font-bold uppercase tracking-wider text-muted">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground">
          {formator(valoare)}
        </p>
      </div>
    );
  };
}

const TooltipLei = tooltipFactory((v) => formatLei(v));
const TooltipAbon = tooltipFactory(
  (v) => `${v} ${v === 1 ? "abonament" : "abonamente"}`
);
const TooltipMembri = tooltipFactory(
  (v) => `${v} ${v === 1 ? "membru" : "membri"}`
);

const axisProps = {
  stroke: AXIS,
  tick: { fill: AXIS, fontSize: 12 },
  tickLine: false,
  axisLine: { stroke: GRID },
};

function ChartCard({
  titlu,
  subtitlu,
  children,
  className,
}: {
  titlu: string;
  subtitlu?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{titlu}</CardTitle>
        {subtitlu && <p className="mt-1 text-sm text-muted">{subtitlu}</p>}
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">{children}</div>
      </CardContent>
    </Card>
  );
}

export function StatisticiCharts({
  venituri,
  abonamenteNoi,
  membriActivi,
  eticheta,
}: {
  venituri: PunctGrafic[];
  abonamenteNoi: PunctGrafic[];
  membriActivi: PunctGrafic[];
  eticheta: string;
}) {
  // Pe intervale lungi (ex. 30 de zile) afișăm doar o parte din etichete pe axa X
  const tickInterval =
    venituri.length > 12 ? Math.ceil(venituri.length / 8) - 1 : 0;
  const xAxis = { dataKey: "luna", interval: tickInterval, ...axisProps };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Venituri — bare portocalii cu glow */}
      <ChartCard titlu="Venituri lunare" subtitlu={`${eticheta} (lei)`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={venituri}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
          >
            <defs>
              <filter id="glow-orange" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis {...xAxis} />
            <YAxis {...axisProps} width={48} />
            <Tooltip
              content={<TooltipLei />}
              cursor={{ fill: "rgba(232,119,34,0.08)" }}
            />
            <Bar
              dataKey="valoare"
              fill={ORANGE}
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
              filter="url(#glow-orange)"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Abonamente noi — bare gri/albe */}
      <ChartCard titlu="Abonamente noi" subtitlu={eticheta}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={abonamenteNoi}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis {...xAxis} />
            <YAxis {...axisProps} width={48} allowDecimals={false} />
            <Tooltip
              content={<TooltipAbon />}
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
            />
            <Bar
              dataKey="valoare"
              fill={GRAY}
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Membri activi — linie portocalie cu puncte (lățime totală) */}
      <ChartCard
        titlu="Membri activi"
        subtitlu={eticheta}
        className="lg:col-span-2"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={membriActivi}
            margin={{ top: 8, right: 12, left: -8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis {...xAxis} />
            <YAxis {...axisProps} width={48} allowDecimals={false} />
            <Tooltip
              content={<TooltipMembri />}
              cursor={{ stroke: ORANGE, strokeOpacity: 0.3 }}
            />
            <Line
              type="monotone"
              dataKey="valoare"
              stroke={ORANGE}
              strokeWidth={3}
              dot={{ fill: ORANGE, r: 5, strokeWidth: 0 }}
              activeDot={{ r: 7, fill: ORANGE }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
