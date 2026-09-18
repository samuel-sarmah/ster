import { useId } from "react";
import { cn } from "@/lib/utils";

/*
 * Tiny hand-drawn area chart for the UI mocks. Pure SVG, no library — it only
 * ever shows a fixed demo series, so it needs to be crisp and theme-aware, not
 * interactive.
 */

function scale(values: number[], w: number, h: number, pad = 4) {
  const step = w / (values.length - 1);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return values.map((v, i) => [i * step, h - pad - ((v - min) / range) * (h - 2 * pad)] as const);
}

function linePath(pts: readonly (readonly [number, number])[]) {
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
}

export function AreaChart({
  values,
  stroke = "var(--accent)",
  className,
  width = 600,
  height = 130,
  dot = true,
}: {
  values: number[];
  stroke?: string;
  className?: string;
  width?: number;
  height?: number;
  dot?: boolean;
}) {
  const id = useId();
  const pts = scale(values, width, height);
  const line = linePath(pts);
  const area = `${line} L${width},${height} L0,${height} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("block h-auto w-full", className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={stroke} stopOpacity="0.32" />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      {dot && <circle cx={last[0]} cy={last[1]} r="4" fill={stroke} />}
    </svg>
  );
}
