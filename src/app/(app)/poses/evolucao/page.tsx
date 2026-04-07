'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Trophy,
  Activity,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import EvolutionChart from '@/components/features/poses/EvolutionChart';
import PoseHeatmap from '@/components/features/poses/PoseHeatmap';
import SymmetryGauge from '@/components/features/poses/SymmetryGauge';
import SessionTimeline from '@/components/features/poses/SessionTimeline';
import { poseEvolutionApi } from '@/lib/api/pose-evolution';
import { CATEGORY_LABELS, VALID_CATEGORIES } from '@/lib/api/pose-analysis';
import type { CategoryType } from '@/lib/api/pose-analysis';
import type {
  SessionSummary,
  CategoryStats,
} from '@/lib/api/pose-evolution';

const ATLETA_ID = '9868cae8-9077-439f-b0c3-c1ce43198c00'; // TODO: auth

function EvolucaoContent() {
  const router = useRouter();

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [catStats, setCatStats] = useState<CategoryStats[]>([]);
  const [selectedCat, setSelectedCat] = useState<CategoryType | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cat = selectedCat === 'all' ? undefined : selectedCat;
      const data = await poseEvolutionApi.getHistory(ATLETA_ID, cat);
      setSessions(data);
      setCatStats(poseEvolutionApi.calcCategoryStats(data));
    } catch {
      setError(
        'Não foi possível carregar o histórico. Verifique se o servidor está rodando.',
      );
    } finally {
      setLoading(false);
    }
  }, [selectedCat]);

  useEffect(() => {
    load();
  }, [load]);

  // Dados para os gráficos
  const chartData = poseEvolutionApi.buildChartData(sessions);
  const heatmapData = poseEvolutionApi.buildPoseHeatmap(sessions);

  // Score médio geral (última sessão para sparkline)
  const symmetryHistory = sessions.map((s) => s.scoreGeral);
  const avgScore = sessions.length
    ? Math.round(
        sessions.reduce((a, s) => a + s.scoreGeral, 0) / sessions.length,
      )
    : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/poses')}
          className="p-2 rounded-lg text-nfv-ice-medium hover:text-nfv-ice hover:bg-[#e8f0fe] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-bold text-2xl text-nfv-ice">
            Evolução de Poses
          </h1>
          <p className="text-xs text-nfv-ice-muted mt-0.5">
            IFBB Pro League • Histórico completo
          </p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-lg text-nfv-ice-medium hover:text-nfv-cyan hover:bg-nfv-cyan/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.push('/poses/nova')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          Nova
        </button>
      </div>

      {/* Filtro de categoria */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setSelectedCat('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selectedCat === 'all'
              ? 'bg-nfv-cyan text-white shadow-nfv'
              : 'bg-[#f5f8fb] text-nfv-ice-medium border border-[#d0dbe6] hover:border-nfv-cyan/30'
          }`}
        >
          Todas
        </button>
        {VALID_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              selectedCat === cat
                ? 'bg-nfv-cyan text-white shadow-nfv'
                : 'bg-[#f5f8fb] text-nfv-ice-medium border border-[#d0dbe6] hover:border-nfv-cyan/30'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-nfv-cyan/30 border-t-nfv-cyan rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <GlassCard padding="md" className="text-center py-6">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={load}
            className="mt-3 px-4 py-2 rounded-xl bg-nfv-aurora text-white text-sm font-semibold"
          >
            Tentar novamente
          </button>
        </GlassCard>
      )}

      {/* Empty state */}
      {!loading && !error && sessions.length === 0 && (
        <GlassCard padding="lg" className="text-center py-12">
          <Trophy className="w-10 h-10 text-nfv-ice-muted mx-auto mb-3" />
          <p className="text-sm font-semibold text-nfv-ice">
            Nenhuma sessão ainda
          </p>
          <p className="text-xs text-nfv-ice-muted mt-1 mb-4">
            Crie sua primeira análise para começar a acompanhar a evolução
          </p>
          <button
            onClick={() => router.push('/poses/nova')}
            className="px-6 py-2.5 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv"
          >
            Primeira análise
          </button>
        </GlassCard>
      )}

      {/* Content */}
      {!loading && !error && sessions.length > 0 && (
        <>
          {/* Stats rápidas */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Sessões',
                value: sessions.length,
                icon: <Activity className="w-4 h-4 text-nfv-cyan" />,
              },
              {
                label: 'Score médio',
                value: avgScore,
                icon: <TrendingUp className="w-4 h-4 text-green-400" />,
              },
              {
                label: 'Categorias',
                value: new Set(sessions.map((s) => s.categoria)).size,
                icon: <Trophy className="w-4 h-4 text-amber-400" />,
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

          {/* Simetria gauge + chart lado a lado */}
          <div className="grid grid-cols-3 gap-4">
            <GlassCard
              padding="md"
              className="flex flex-col items-center justify-center col-span-1"
            >
              <SymmetryGauge
                score={avgScore}
                label="Score médio"
                showHistory={symmetryHistory}
              />
            </GlassCard>
            <div className="col-span-2">
              <EvolutionChart data={chartData.data} title="Progresso" />
            </div>
          </div>

          {/* Stats por categoria */}
          {catStats.length > 1 && (
            <GlassCard padding="lg" className="space-y-3">
              <h3 className="font-heading font-semibold text-base text-nfv-ice">
                Por Categoria
              </h3>
              <div className="space-y-2">
                {[...catStats]
                  .sort((a, b) => b.score_medio - a.score_medio)
                  .map((cat, i) => (
                    <motion.div
                      key={cat.categoria}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f8fb] border border-[#d0dbe6]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-nfv-aurora/10 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-nfv-aurora" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-nfv-ice">
                          {CATEGORY_LABELS[cat.categoria as CategoryType] ??
                            cat.categoria}
                        </p>
                        <p className="text-xs text-nfv-ice-muted">
                          {cat.total_sessoes} sessão(ões) • melhor:{' '}
                          {cat.melhor_score}/100
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-nfv-cyan">
                          {cat.score_medio}
                        </p>
                        <p className="text-[10px] text-nfv-ice-muted">média</p>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </GlassCard>
          )}

          {/* Heatmap de poses */}
          {heatmapData.length > 0 && <PoseHeatmap poses={heatmapData} />}

          {/* Timeline */}
          <SessionTimeline
            sessions={sessions}
            onSelectSession={(s) =>
              router.push(`/poses/resultado?categoria=${s.categoria}`)
            }
          />
        </>
      )}
    </div>
  );
}

export default function EvolucaoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-2 border-nfv-cyan/30 border-t-nfv-cyan rounded-full animate-spin" />
        </div>
      }
    >
      <EvolucaoContent />
    </Suspense>
  );
}
