'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap, Target, AlertCircle } from 'lucide-react';
import ScoreCircle from '@/components/ui/ScoreCircle';
import type { PersonalizedPose } from '@/lib/api/pose-analysis';

interface PoseScoreCardProps {
  pose: PersonalizedPose;
  index: number;
  isCritical?: boolean;
  isStrong?: boolean;
}

export default function PoseScoreCard({
  pose,
  index,
  isCritical,
  isStrong,
}: PoseScoreCardProps) {
  const [expanded, setExpanded] = useState(false);
  const delta = pose.delta_melhoria;
  const hasStrategies = pose.estrategias_aplicadas.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`
        rounded-2xl border overflow-hidden
        ${isCritical ? 'border-red-300/30 bg-red-50/30' : isStrong ? 'border-green-300/30 bg-green-50/30' : 'border-[#d0dbe6] bg-white'}
      `}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        {/* Score circles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <ScoreCircle
            score={pose.score_estimado_sem_ajuste}
            size="sm"
            label="Atual"
          />
          <div className="flex flex-col items-center">
            <div className="text-xs text-nfv-cyan font-bold">+{delta}</div>
            <div className="w-8 h-px bg-nfv-cyan/40" />
          </div>
          <ScoreCircle
            score={pose.score_estimado_com_ajuste}
            size="sm"
            label="Ajustado"
          />
        </div>

        {/* Pose info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-nfv-ice truncate">
              {pose.nome_pose}
            </p>
            {isCritical && (
              <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
            )}
            {isStrong && (
              <Zap className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
            )}
          </div>
          {hasStrategies && (
            <p className="text-xs text-nfv-cyan mt-0.5">
              {pose.estrategias_aplicadas.length} estratégia(s) de mascaramento
            </p>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-nfv-ice-muted flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-[#d0dbe6]">
              {/* Instruções resumidas */}
              {pose.instrucoes_resumidas.length > 0 && (
                <div className="pt-3">
                  <p className="text-xs font-semibold text-nfv-ice-medium mb-2 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-nfv-cyan" />
                    Ajustes para sua pose
                  </p>
                  <div className="space-y-1.5">
                    {pose.instrucoes_resumidas.map((inst, i) => (
                      <p
                        key={i}
                        className="text-xs text-nfv-ice-medium bg-[#f5f8fb] rounded-lg px-3 py-2"
                      >
                        {inst}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Estratégias de mascaramento */}
              {pose.estrategias_aplicadas.map((est, i) => (
                <div
                  key={i}
                  className="bg-nfv-cyan/5 rounded-xl p-3 border border-nfv-cyan/10"
                >
                  <p className="text-xs font-medium text-nfv-cyan mb-1">
                    Mascaramento: {est.assimetria_alvo.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-nfv-ice-medium">
                    {est.instrucao_completa_pt}
                  </p>
                  <p className="text-xs text-nfv-cyan mt-1 font-medium">
                    +{est.score_delta_estimado} pts estimados
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
