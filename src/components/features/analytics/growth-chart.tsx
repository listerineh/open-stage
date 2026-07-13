'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SocialPlatform, SocialStatsSnapshot } from '@/types/database';
import { PLATFORM_CONFIGS } from '@/lib/social/types';

interface GrowthChartProps {
  snapshots: SocialStatsSnapshot[];
  connectedPlatforms: SocialPlatform[];
}

const PLATFORM_CHART_COLORS: Record<SocialPlatform, string> = {
  spotify: '#34d399',
  youtube: '#f87171',
  instagram: '#f472b6',
  tiktok: '#22d3ee',
};

interface ChartDataPoint {
  date: string;
  spotify?: number;
  youtube?: number;
  instagram?: number;
  tiktok?: number;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es', { month: 'short', day: 'numeric' });
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

export function GrowthChart({ snapshots, connectedPlatforms }: GrowthChartProps) {
  if (snapshots.length === 0 || connectedPlatforms.length === 0) return null;

  const dateMap = new Map<string, ChartDataPoint>();

  for (const snap of snapshots) {
    const existing = dateMap.get(snap.snapshot_date) ?? { date: snap.snapshot_date };
    existing[snap.platform as SocialPlatform] = snap.followers;
    dateMap.set(snap.snapshot_date, existing);
  }

  const data = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  if (data.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-800 text-center">
        <div>
          <p className="text-sm text-zinc-500">No hay suficientes datos para mostrar tendencias</p>
          <p className="mt-1 text-xs text-zinc-600">
            Sincroniza durante varios días para ver el crecimiento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h3 className="mb-4 text-sm font-medium text-white">Crecimiento de seguidores (30 días)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={{ stroke: '#3f3f46' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fff',
            }}
            labelFormatter={(label: unknown) =>
              typeof label === 'string' ? formatDateLabel(label) : String(label)
            }
            formatter={(value: unknown, name: unknown) => [
              typeof value === 'number' ? value.toLocaleString() : String(value),
              PLATFORM_CONFIGS[name as SocialPlatform]?.name ?? String(name),
            ]}
          />
          <Legend
            formatter={(value: string) => PLATFORM_CONFIGS[value as SocialPlatform]?.name ?? value}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }}
          />
          {connectedPlatforms.map(platform => (
            <Line
              key={platform}
              type="monotone"
              dataKey={platform}
              stroke={PLATFORM_CHART_COLORS[platform]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
