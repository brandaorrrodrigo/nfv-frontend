'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Trophy, ChevronRight, Activity, Calendar } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import ScoreCircle from '@/components/ui/ScoreCircle';
import { poseAnalysisApi, CATEGORY_LABELS } from '@/lib/api/pose-analysis';
import type { CategoryType } from '@/lib/api/pose-analysis';

interface SessionItem {
  id: string;
  scoreGeral: number;
  categoria: string;
  dataAnalise: string;
  totalPoses: number;
}

export default function PosesPage() {
  const router = useRouter();
  const atletaId = '9868cae8-9077-439f-b0c3-c1ce43198c00';
  const [history, setHistory] = useState<SessionItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    poseAnalysisApi
      .getHistory(atletaId)
      .then((data: SessionItem[]) => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [atletaId]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-nfv-ice">
            Análise de Pose
          </h1>
          <p className="text-xs text-nfv-ice-muted mt-1">
            IFBB Pro League • 9 categorias • 62 poses
          </p>
        </div>
        <button
          onClick={() => router.push('/poses/nova')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          Nova
        </button>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Categorias',
            value: '9',
            icon: <Trophy className="w-4 h-4 text-amber-400" />,
          },
          {
            label: 'Poses totais',
            value: '62',
            icon: <Activity className="w-4 h-4 text-nfv-cyan" />,
          },
          {
            label: 'Sessões',
            value: history.length.toString(),
            icon: <Calendar className="w-4 h-4 text-purple-400" />,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <GlassCard padding="sm" className="text-center">
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <p className="text-xl font-bold text-nfv-ice">{stat.value}</p>
              <p className="text-[10px] text-nfv-ice-muted">{stat.label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* CTA principal — leva ao wizard onde o CategorySelector aparece */}
      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => router.push('/poses/nova')}
        className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-nfv-aurora text-white font-semibold shadow-nfv hover:shadow-nfv-glow transition-all"
      >
        <Plus className="w-5 h-5" />
        <span className="text-base">Nova análise IFBB</span>
        <ChevronRight className="w-5 h-5" />
      </motion.button>

      {/* Histórico */}
      {!loadingHistory && history.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-nfv-ice-medium mb-3">
            Últimas sessões
          </h2>
          <div className="space-y-2">
            {history.slice(0, 5).map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard padding="sm">
                  <div className="flex items-center gap-3">
                    <ScoreCircle score={session.scoreGeral} size="sm" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-nfv-ice">
                        {CATEGORY_LABELS[session.categoria as CategoryType] ??
                          session.categoria}
                      </p>
                      <p className="text-xs text-nfv-ice-muted">
                        {new Date(session.dataAnalise).toLocaleDateString(
                          'pt-BR',
                        )}{' '}
                        • {session.totalPoses} poses
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-nfv-ice-muted" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loadingHistory && history.length === 0 && (
        <GlassCard padding="lg" className="text-center py-10">
          <Trophy className="w-10 h-10 text-nfv-ice-muted mx-auto mb-3" />
          <p className="text-sm font-semibold text-nfv-ice">
            Nenhuma análise ainda
          </p>
          <p className="text-xs text-nfv-ice-muted mt-1 mb-4">
            Crie sua primeira análise de pose IFBB Pro League
          </p>
          <button
            onClick={() => router.push('/poses/nova')}
            className="px-6 py-2.5 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all"
          >
            Começar agora
          </button>
        </GlassCard>
      )}
    </div>
  );
}
