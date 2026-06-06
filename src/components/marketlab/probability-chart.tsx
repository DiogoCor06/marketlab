"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { filterChartPointsByRange } from "@/lib/markets/chart";
import type { ChartRange, ChartSeries } from "@/lib/markets/types";
import { cn } from "@/lib/utils";

const RANGES: ChartRange[] = ["7d", "30d", "all"];

type ProbabilityChartProps = {
  series: ChartSeries;
};

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 28, left: 40 };

function formatAxisDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

export function ProbabilityChart({ series }: ProbabilityChartProps) {
  const [range, setRange] = useState<ChartRange>("all");

  const visibleSeries = useMemo(
    () => ({
      ...series,
      points: filterChartPointsByRange(series.points, range, new Date()),
    }),
    [series, range],
  );

  const geometry = useMemo(() => {
    const points = visibleSeries.points;
    if (points.length === 0) {
      return null;
    }

    const minX = Math.min(...points.map((point) => point.timestamp));
    const maxX = Math.max(...points.map((point) => point.timestamp));
    const plotWidth = WIDTH - PADDING.left - PADDING.right;
    const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const xSpan = Math.max(maxX - minX, 1);

    const mapped = points.map((point) => {
      const x = PADDING.left + ((point.timestamp - minX) / xSpan) * plotWidth;
      const y = PADDING.top + ((100 - point.yesChance) / 100) * plotHeight;
      return { ...point, x, y };
    });

    const linePath = mapped
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    const areaPath = `${linePath} L ${mapped[mapped.length - 1].x} ${
      PADDING.top + plotHeight
    } L ${mapped[0].x} ${PADDING.top + plotHeight} Z`;

    return {
      mapped,
      linePath,
      areaPath,
      minX,
      maxX,
      plotHeight,
    };
  }, [visibleSeries.points]);

  if (!geometry) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Probability</h2>
          <p className="text-xs text-muted-foreground">{series.label}</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {RANGES.map((option) => (
            <Button
              key={option}
              type="button"
              size="xs"
              variant={range === option ? "secondary" : "ghost"}
              onClick={() => setRange(option)}
            >
              {option === "all" ? "All" : option}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card p-3">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full min-w-[320px] text-muted-foreground"
          role="img"
          aria-label="Yes probability chart"
        >
          <title>Yes probability over time</title>

          {[0, 25, 50, 75, 100].map((value) => {
            const y = PADDING.top + ((100 - value) / 100) * geometry.plotHeight;
            return (
              <g key={value}>
                <line
                  x1={PADDING.left}
                  x2={WIDTH - PADDING.right}
                  y1={y}
                  y2={y}
                  className="stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[10px]"
                >
                  {value}%
                </text>
              </g>
            );
          })}

          <path d={geometry.areaPath} className="fill-chart-1/20" />
          <path
            d={geometry.linePath}
            fill="none"
            className={cn(
              "stroke-chart-1",
              series.mode === "flat" && "stroke-dasharray-[6 4]",
            )}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {geometry.mapped.map((point) => (
            <circle
              key={point.timestamp}
              cx={point.x}
              cy={point.y}
              r={series.mode === "flat" ? 0 : 3}
              className="fill-chart-1"
            />
          ))}

          <text
            x={PADDING.left}
            y={HEIGHT - 8}
            className="fill-muted-foreground text-[10px]"
          >
            {formatAxisDate(geometry.minX)}
          </text>
          <text
            x={WIDTH - PADDING.right}
            y={HEIGHT - 8}
            textAnchor="end"
            className="fill-muted-foreground text-[10px]"
          >
            {formatAxisDate(geometry.maxX)}
          </text>
        </svg>
      </div>

      <p className="text-xs text-muted-foreground">
        {series.mode === "flat"
          ? "Flat line reflects the current Yes chance from market open to now."
          : "Line shows reconstructed Yes probability from ledger activity."}
      </p>
    </div>
  );
}
