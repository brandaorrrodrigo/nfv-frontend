'use client';

import { motion } from 'framer-motion';
import { Medal } from 'lucide-react';

interface ChampionComparisonProps {
  comparacoes: { atleta: string; similaridade: number }[];
}

const MEDAL_COLORS = ['text-amber-400', 'text-slate-400', 'text-amber-600'];

export default function ChampionComparison({
  comparacoes,
}: ChampionComparisonProps) {
  if (!comparacoes || comparacoes.length === 0) return null;

  const sorted = [...comparacoes].sort(
    (a, b) => b.similaridade - a.similaridade,
  );

  return (
    <div className="space-y-3">
      {sorted.map((comp, i) => (
        <div key={comp.atleta} className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Medal
                className={`w-3.5 h-3.5 ${MEDAL_COLORS[i] ?? 'text-nfv-ice-muted'}`}
              />
              <span className="text-xs font-medium text-nfv-ice">
                {comp.atleta}
              </span>
            </div>
            <span className="text-xs font-bold text-nfv-cyan">
              {comp.similaridade}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#e8f0fe] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-nfv-cyan to-nfv-aurora"
              initial={{ width: 0 }}
              animate={{ width: `${comp.similaridade}%` }}
              transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
