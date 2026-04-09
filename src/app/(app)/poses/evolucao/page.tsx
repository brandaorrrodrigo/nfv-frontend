'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Trophy, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import GlassCard from '@/components/ui/GlassCard';
import { poseAnalysisApi, CATEGORY_LABELS } from '@/lib/api/pose-analysis';
import { useAuthContext } from '@/components/providers/AuthProvider';
import type { CategoryType } from '@/lib/api/pose-analysis';

interface SessionItem {
  id: string;
  scoreGeral: number;
  categoria: string;
  dataAnalise: string;
  totalPoses: number;
  ganho?: number;
  source?: string;
}

export default function EvolucaoPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState<CategoryType | 'all'>('all');

  useEffect(() => {
    if (!user) return;
    poseAnalysisApi
      .getHistory(user.id)
      .then((data) => setSessions(data as SessionItem[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // Filtrar e preparar dados
  const filtered = sessions
    .filter((s) => categoria === 'all' || s.categoria === categoria)
    .sort(
      (a, b) =>
        new Date(a.dataAnalise).getTime() - new Date(b.dataAnalise).getTime(),
    );

  const chartData = filtered.map((s, i) => ({
    name: new Date(s.dataAnalise).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    score: s.scoreGeral,
    ganho: s.ganho ?? 0,
    sessao: i + 1,
  }));

  const melhorScore = Math.max(...filtered.map((s) => s.scoreGeral), 0);
  const ultimoScore = filtered[filtered.length - 1]?.scoreGeral ?? 0;
  const primeiroScore = filtered[0]?.scoreGeral ?? 0;
  const evolucao = ultimoScore - primeiroScore;

  const categoriasUnicas = [
    ...new Set(sessions.map((s) => s.categoria)),
  ] as CategoryType[];

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-nfv-cyan/30 border-t-nfv-cyan rounded-full animate-spin" />
      </div>
    );

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
        <div>
          <h1 className="font-heading font-bold text-2xl text-nfv-ice">
            Evolução
          </h1>
          <p className="text-xs text-nfv-ice-muted">
            {sessions.length} análise(s) realizada(s)
          </p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <GlassCard padding="lg" className="text-center py-10">
          <TrendingUp className="w-10 h-10 text-nfv-ice-muted mx-auto mb-3" />
          <p className="text-sm font-semibold text-nfv-ice">
            Nenhuma análise ainda
          </p>
          <p className="text-xs text-nfv-ice-muted mt-1 mb-4">
            Faça sua primeira análise para ver a evolução
          </p>
          <button
            onClick={() => router.push('/poses/nova')}
            className="px-6 py-2.5 rounded-xl bg-nfv-aurora text-white text-sm font-semibold"
          >
            Começar agora
          </button>
        </GlassCard>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: 'Melhor score',
                value: `${melhorScore}/100`,
                icon: <Trophy className="w-4 h-4 text-amber-400" />,
              },
              {
                label: 'Último score',
                value: `${ultimoScore}/100`,
                icon: <TrendingUp className="w-4 h-4 text-nfv-cyan" />,
              },
              {
                label: 'Evolução total',
                value: `${evolucao >= 0 ? '+' : ''}${evolucao} pts`,
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
                  <p className="text-sm font-bold text-nfv-ice">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-nfv-ice-muted">
                    {stat.label}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Filtro por categoria */}
          {categoriasUnicas.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setCategoria('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all ${
                  categoria === 'all'
                    ? 'bg-nfv-aurora text-white'
                    : 'bg-[#f5f8fb] text-nfv-ice-muted border border-[#d0dbe6]'
                }`}
              >
                Todas
              </button>
              {categoriasUnicas.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-all ${
                    categoria === cat
                      ? 'bg-nfv-aurora text-white'
                      : 'bg-[#f5f8fb] text-nfv-ice-muted border border-[#d0dbe6]'
                  }`}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                </button>
              ))}
            </div>
          )}

          {/* Gráfico */}
          {chartData.length > 1 && (
            <GlassCard padding="md">
              <p className="text-xs font-semibold text-nfv-ice-medium mb-4">
                Score ao longo do tempo
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,188,212,0.1)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid rgba(0,188,212,0.2)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    itemStyle={{ color: '#00bcd4' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#00bcd4"
                    strokeWidth={2}
                    dot={{ fill: '#00bcd4', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          )}

          {/* Lista de sessões */}
          <div>
            <p className="text-xs font-semibold text-nfv-ice-medium mb-3">
              Histórico
            </p>
            <div className="space-y-2">
              {[...filtered].reverse().map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <GlassCard
                    padding="sm"
                    className="cursor-pointer hover:border-nfv-cyan/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          session.scoreGeral >= 70
                            ? 'bg-green-50 text-green-600'
                            : session.scoreGeral >= 50
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-red-50 text-red-500'
                        }`}
                      >
                        {session.scoreGeral}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-nfv-ice">
                          {CATEGORY_LABELS[
                            session.categoria as CategoryType
                          ] ?? session.categoria}
                        </p>
                        <p className="text-xs text-nfv-ice-muted">
                          {new Date(session.dataAnalise).toLocaleDateString(
                            'pt-BR',
                            {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            },
                          )}
                        </p>
                      </div>
                      {(session.ganho ?? 0) > 0 && (
                        <span className="text-xs font-bold text-nfv-cyan">
                          +{session.ganho} pts
                        </span>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
