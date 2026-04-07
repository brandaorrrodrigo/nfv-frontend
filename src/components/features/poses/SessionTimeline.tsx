'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Trophy, Calendar } from 'lucide-react';
import ScoreCircle from '@/components/ui/ScoreCircle';
import { CATEGORY_LABELS } from '@/lib/api/pose-analysis';
import type { CategoryType } from '@/lib/api/pose-analysis';
import type { SessionSummary } from '@/lib/api/pose-evolution';

interface SessionTimelineProps {
  sessions: SessionSummary[];
  onSelectSession?: (session: SessionSummary) => void;
}

export default function SessionTimeline({
  sessions,
  onSelectSession,
}: SessionTimelineProps) {
  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.dataAnalise).getTime() - new Date(a.dataAnalise).getTime(),
  );

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-semibold text-base text-nfv-ice">
        Histórico de Sessões
      </h3>

      <div className="relative">
        {/* Linha vertical da timeline */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-[rgba(0,188,212,0.15)]" />

        <div className="space-y-3">
          {sorted.map((session, i) => {
            const dotColor =
              session.scoreGeral >= 75
                ? '#00c853'
                : session.scoreGeral >= 55
                  ? '#00bcd4'
                  : '#ff9100';
            const ganho = session.protocol?.ganhoTotalEstimado ?? 0;

            return (
              <motion.button
                key={session.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => onSelectSession?.(session)}
                className="w-full flex items-center gap-3 pl-10 pr-3 py-3 rounded-2xl bg-white border border-[#d0dbe6] hover:border-nfv-cyan/30 hover:bg-[#f5f8fb] transition-all text-left relative"
              >
                {/* Dot na timeline */}
                <div
                  className="absolute left-3.5 w-3 h-3 rounded-full border-2 border-white"
                  style={{
                    backgroundColor: dotColor,
                    boxShadow: `0 0 0 2px ${dotColor}30`,
                  }}
                />

                <ScoreCircle score={session.scoreGeral} size="sm" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-3 h-3 text-nfv-cyan flex-shrink-0" />
                    <p className="text-sm font-semibold text-nfv-ice truncate">
                      {CATEGORY_LABELS[session.categoria as CategoryType] ??
                        session.categoria}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-nfv-ice-muted" />
                    <p className="text-xs text-nfv-ice-muted">
                      {new Date(session.dataAnalise).toLocaleDateString(
                        'pt-BR',
                        {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        },
                      )}
                    </p>
                    <span className="text-xs text-nfv-ice-muted">•</span>
                    <p className="text-xs text-nfv-ice-muted">
                      {session.totalPoses} poses
                    </p>
                  </div>
                  {ganho > 0 && (
                    <p className="text-[10px] text-nfv-cyan mt-0.5">
                      +{ganho} pts ganho estimado
                    </p>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-nfv-ice-muted flex-shrink-0" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
