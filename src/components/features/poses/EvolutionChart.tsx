'use client';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

interface DataPoint {
  data: string;
  score: number;
  ganho: number;
  label: string;
}

interface EvolutionChartProps {
  data: DataPoint[];
  title?: string;
}

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[rgba(0,188,212,0.2)] rounded-xl p-3 shadow-nfv">
      <p className="text-xs font-semibold text-nfv-ice mb-1">{label}</p>
      <p className="text-sm font-bold text-nfv-cyan">
        Score: {payload[0]?.value}/100
      </p>
      {(payload[1]?.value ?? 0) > 0 && (
        <p className="text-xs text-green-500">
          +{payload[1]?.value} pts ganho estimado
        </p>
      )}
    </div>
  );
};

export default function EvolutionChart({
  data,
  title = 'Evolução de Score',
}: EvolutionChartProps) {
  if (data.length === 0) return null;

  const first = data[0]?.score ?? 0;
  const last = data[data.length - 1]?.score ?? 0;
  const delta = last - first;
  const max = Math.max(...data.map((d) => d.score));
  const average = Math.round(
    data.reduce((a, d) => a + d.score, 0) / data.length,
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard padding="lg" className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-semibold text-base text-nfv-ice">
              {title}
            </h3>
            <p className="text-xs text-nfv-ice-muted mt-0.5">
              {data.length} sessão(ões) registrada(s)
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {delta > 2 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : delta < -2 ? (
              <TrendingDown className="w-4 h-4 text-red-400" />
            ) : (
              <Minus className="w-4 h-4 text-nfv-ice-muted" />
            )}
            <span
              className={`text-sm font-bold ${delta > 2 ? 'text-green-500' : delta < -2 ? 'text-red-400' : 'text-nfv-ice-muted'}`}
            >
              {delta > 0 ? '+' : ''}
              {delta} pts
            </span>
          </div>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Inicial', value: first },
            { label: 'Média', value: average },
            { label: 'Melhor', value: max },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#f5f8fb] rounded-xl p-3 text-center"
            >
              <p className="text-lg font-bold text-nfv-ice">{stat.value}</p>
              <p className="text-[10px] text-nfv-ice-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00bcd4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,188,212,0.08)"
              />
              <XAxis
                dataKey="data"
                tick={{ fontSize: 10, fill: '#6e8ca0' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#6e8ca0' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={75}
                stroke="#2962ff"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#00bcd4"
                strokeWidth={2.5}
                fill="url(#scoreGradient)"
                dot={{ fill: '#00bcd4', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#2962ff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-nfv-ice-muted text-center">
          Linha azul tracejada = meta 75/100
        </p>
      </GlassCard>
    </motion.div>
  );
}
