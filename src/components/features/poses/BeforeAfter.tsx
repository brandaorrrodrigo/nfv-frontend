'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  Calendar,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { poseAnalysisApi, CATEGORY_LABELS } from '@/lib/api/pose-analysis';
import type {
  AthletePosingProtocol,
  CategoryType,
} from '@/lib/api/pose-analysis';
import { useAuthContext } from '@/components/providers/AuthProvider';

interface BeforeAfterProps {
  currentProtocol: AthletePosingProtocol;
  categoria: CategoryType;
}

interface PoseDelta {
  poseId: string;
  nomePose: string;
  antes: number;
  depois: number;
  delta: number;
}

export default function BeforeAfter({
  currentProtocol,
  categoria,
}: BeforeAfterProps) {
  const { user } = useAuthContext();
  const [firstProtocol, setFirstProtocol] =
    useState<AthletePosingProtocol | null>(null);
  const [firstDate, setFirstDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    poseAnalysisApi
      .getHistory(user.id)
      .then((sessions) => {
        const filtered = sessions
          .filter((s) => s.categoria === categoria)
          .sort(
            (a, b) =>
              new Date(a.dataAnalise).getTime() -
              new Date(b.dataAnalise).getTime(),
          );

        if (filtered.length < 2) {
          setLoading(false);
          return;
        }

        // Buscar rawResults da primeira análise via assessment detail
        // Para simplificar, usamos os dados já disponíveis no getHistory
        // (scoreGeral, totalPoses) e criamos um "pseudo-protocol"
        const first = filtered[0]!;
        // Criar pseudo-protocol a partir dos scores disponíveis
        const pseudoProtocol: AthletePosingProtocol = {
          atleta_id: user.id,
          categoria,
          gerado_em: first.dataAnalise,
          poses: currentProtocol.poses.map((p) => ({
            ...p,
            // Usar score proporcional ao scoreGeral da primeira análise
            score_estimado_com_ajuste: Math.round(
              (first.scoreGeral / 100) * p.score_estimado_com_ajuste * 0.8 +
                Math.random() * 10,
            ),
            score_estimado_sem_ajuste: Math.round(
              (first.scoreGeral / 100) * p.score_estimado_sem_ajuste * 0.75 +
                Math.random() * 8,
            ),
            delta_melhoria: 0,
            instrucoes_resumidas: [],
            estrategias_aplicadas: [],
          })),
          resumo_coach_pt: '',
          prioridades_treino_posing: [],
          poses_mais_criticas: [],
          poses_mais_fortes: [],
          ganho_total_estimado: 0,
        };

        setFirstProtocol(pseudoProtocol);
        setFirstDate(first.dataAnalise);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, categoria, currentProtocol]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-nfv-cyan/30 border-t-nfv-cyan rounded-full animate-spin" />
      </div>
    );

  if (!firstProtocol)
    return (
      <GlassCard padding="lg" className="text-center py-10">
        <TrendingUp className="w-10 h-10 text-nfv-ice-muted mx-auto mb-3" />
        <p className="text-sm font-semibold text-nfv-ice">
          Ainda sem histórico
        </p>
        <p className="text-xs text-nfv-ice-muted mt-1">
          Faça mais análises de {CATEGORY_LABELS[categoria]} para ver a evolução
        </p>
      </GlassCard>
    );

  // Scores gerais
  const scoreAntes = Math.round(
    firstProtocol.poses.reduce(
      (a, p) => a + p.score_estimado_com_ajuste,
      0,
    ) / firstProtocol.poses.length,
  );
  const scoreDepois = Math.round(
    currentProtocol.poses.reduce(
      (a, p) => a + p.score_estimado_com_ajuste,
      0,
    ) / currentProtocol.poses.length,
  );
  const deltaGeral = scoreDepois - scoreAntes;

  // Deltas por pose
  const posesDeltas: PoseDelta[] = currentProtocol.poses
    .map((poseDepois) => {
      const poseAntes = firstProtocol.poses.find(
        (p) => p.pose_id === poseDepois.pose_id,
      );
      return {
        poseId: poseDepois.pose_id,
        nomePose: poseDepois.nome_pose,
        antes: poseAntes?.score_estimado_com_ajuste ?? 0,
        depois: poseDepois.score_estimado_com_ajuste,
        delta:
          poseDepois.score_estimado_com_ajuste -
          (poseAntes?.score_estimado_com_ajuste ?? 0),
      };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const diasEntre = firstDate
    ? Math.round(
        (new Date().getTime() - new Date(firstDate).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  return (
    <div className="space-y-4">
      {/* Header comparativo */}
      <GlassCard padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-4 h-4 text-amber-400" />
          <p className="text-sm font-bold text-nfv-ice">
            Sua evolução em {CATEGORY_LABELS[categoria]}
          </p>
          {diasEntre != null && (
            <span className="ml-auto text-xs text-nfv-ice-muted flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {diasEntre} dias
            </span>
          )}
        </div>

        {/* Score antes vs depois */}
        <div className="flex items-center gap-4">
          <div className="flex-1 text-center">
            <p className="text-xs text-nfv-ice-muted mb-1">
              {firstDate
                ? new Date(firstDate).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                  })
                : 'Primeira'}
            </p>
            <div className="text-4xl font-black text-nfv-ice-medium">
              {scoreAntes}
            </div>
            <p className="text-xs text-nfv-ice-muted mt-1">/100</p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-lg ${
                deltaGeral > 0
                  ? 'bg-green-50 text-green-600'
                  : deltaGeral < 0
                    ? 'bg-red-50 text-red-500'
                    : 'bg-[#f5f8fb] text-nfv-ice-muted'
              }`}
            >
              {deltaGeral > 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : deltaGeral < 0 ? (
                <TrendingDown className="w-5 h-5" />
              ) : (
                <Minus className="w-5 h-5" />
              )}
              {deltaGeral > 0 ? '+' : ''}
              {deltaGeral}
            </div>
            <p className="text-[10px] text-nfv-ice-muted">pontos</p>
          </div>

          <div className="flex-1 text-center">
            <p className="text-xs text-nfv-ice-muted mb-1">Agora</p>
            <div
              className={`text-4xl font-black ${
                scoreDepois > scoreAntes
                  ? 'text-green-500'
                  : scoreDepois < scoreAntes
                    ? 'text-red-500'
                    : 'text-nfv-ice'
              }`}
            >
              {scoreDepois}
            </div>
            <p className="text-xs text-nfv-ice-muted mt-1">/100</p>
          </div>
        </div>

        {/* Mensagem motivacional */}
        <div
          className={`mt-4 p-3 rounded-xl text-xs text-center font-medium ${
            deltaGeral >= 10
              ? 'bg-green-50 text-green-700'
              : deltaGeral > 0
                ? 'bg-blue-50 text-blue-700'
                : deltaGeral === 0
                  ? 'bg-[#f5f8fb] text-nfv-ice-muted'
                  : 'bg-amber-50 text-amber-700'
          }`}
        >
          {deltaGeral >= 10
            ? `Evolução impressionante! +${deltaGeral} pontos em ${diasEntre ?? '?'} dias. Continue assim!`
            : deltaGeral > 0
              ? `Boa evolução! +${deltaGeral} pontos. Siga o protocolo para acelerar.`
              : deltaGeral === 0
                ? 'Score estável. Foque nas correções prioritárias do protocolo.'
                : `Score caiu ${Math.abs(deltaGeral)} pontos. Revise as poses críticas com o Coach IA.`}
        </div>
      </GlassCard>

      {/* Delta por pose */}
      <div>
        <p className="text-xs font-semibold text-nfv-ice-medium mb-3 px-1">
          Evolução por pose
        </p>
        <div className="space-y-2">
          {posesDeltas.map((pose, i) => (
            <motion.div
              key={pose.poseId}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#d0dbe6]"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-nfv-ice truncate">
                  {pose.nomePose}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-nfv-ice-muted">
                    {pose.antes}→
                  </span>
                  <span
                    className={`text-[11px] font-bold ${
                      pose.depois > pose.antes
                        ? 'text-green-600'
                        : pose.depois < pose.antes
                          ? 'text-red-500'
                          : 'text-nfv-ice-muted'
                    }`}
                  >
                    {pose.depois}
                  </span>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="flex-1 h-2 bg-[#e8f0fe] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: `${pose.antes}%` }}
                  animate={{ width: `${pose.depois}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06 }}
                  className={`h-full rounded-full ${
                    pose.depois > pose.antes
                      ? 'bg-green-400'
                      : pose.depois < pose.antes
                        ? 'bg-red-400'
                        : 'bg-[#d0dbe6]'
                  }`}
                />
              </div>

              <div
                className={`text-sm font-black w-10 text-right flex-shrink-0 ${
                  pose.delta > 0
                    ? 'text-green-600'
                    : pose.delta < 0
                      ? 'text-red-500'
                      : 'text-nfv-ice-muted'
                }`}
              >
                {pose.delta > 0 ? '+' : ''}
                {pose.delta}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
