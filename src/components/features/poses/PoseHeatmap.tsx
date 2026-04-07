'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

interface PoseData {
  poseId: string;
  nomePose: string;
  scores: number[];
  media: number;
  tendencia: 'melhora' | 'piora' | 'estavel';
}

interface PoseHeatmapProps {
  poses: PoseData[];
}

function getScoreColor(score: number): string {
  if (score >= 85) return '#00c853';
  if (score >= 70) return '#00bcd4';
  if (score >= 55) return '#ff9100';
  return '#ff1744';
}

function getScoreBg(score: number): string {
  if (score >= 85) return 'bg-green-50 border-green-200';
  if (score >= 70) return 'bg-cyan-50 border-cyan-200';
  if (score >= 55) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

const TREND_ICON = {
  melhora: <TrendingUp className="w-3 h-3 text-green-500" />,
  piora: <TrendingDown className="w-3 h-3 text-red-400" />,
  estavel: <Minus className="w-3 h-3 text-nfv-ice-muted" />,
};

export default function PoseHeatmap({ poses }: PoseHeatmapProps) {
  if (poses.length === 0) return null;

  const sorted = [...poses].sort((a, b) => a.media - b.media);

  return (
    <GlassCard padding="lg" className="space-y-4">
      <div>
        <h3 className="font-heading font-semibold text-base text-nfv-ice">
          Mapa de Poses
        </h3>
        <p className="text-xs text-nfv-ice-muted mt-0.5">
          Score médio por pose — do mais fraco ao mais forte
        </p>
      </div>

      <div className="space-y-2">
        {sorted.map((pose, i) => {
          const lastSix = pose.scores.slice(-6);
          return (
            <motion.div
              key={pose.poseId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl border ${getScoreBg(pose.media)}`}
            >
              {/* Score circle pequeno */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
                style={{ backgroundColor: getScoreColor(pose.media) }}
              >
                {pose.media}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-nfv-ice truncate">
                  {pose.nomePose}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  {TREND_ICON[pose.tendencia]}
                  <span className="text-[10px] text-nfv-ice-muted">
                    {pose.scores.length} sessão(ões)
                  </span>
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="flex items-end gap-0.5 h-6 flex-shrink-0">
                {lastSix.map((s, idx) => (
                  <div
                    key={idx}
                    className="w-2 rounded-sm"
                    style={{
                      height: `${Math.max(4, (s / 100) * 24)}px`,
                      backgroundColor: getScoreColor(s),
                      opacity: 0.6 + (idx / Math.max(1, lastSix.length)) * 0.4,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
