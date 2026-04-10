'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Zap,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import ScoreCircle from '@/components/ui/ScoreCircle';
import PoseScoreCard from '@/components/features/poses/PoseScoreCard';
import AsymmetryAlert from '@/components/features/poses/AsymmetryAlert';
import ChampionSideBySide from '@/components/features/poses/ChampionSideBySide';
import CoachChat from '@/components/features/poses/CoachChat';
import ShareCard from '@/components/features/poses/ShareCard';
import WeeklyPlan from '@/components/features/poses/WeeklyPlan';
import PoseReport from '@/components/features/poses/PoseReport';
import BeforeAfter from '@/components/features/poses/BeforeAfter';
import { useAuthContext } from '@/components/providers/AuthProvider';
import {
  poseAnalysisApi,
  MOCK_SYMMETRIC_LANDMARKS,
  CATEGORY_LABELS,
} from '@/lib/api/pose-analysis';
import type {
  AthletePosingProtocol,
  AsymmetryProfile,
  CategoryType,
} from '@/lib/api/pose-analysis';
import type { LandmarkPoint } from '@/lib/landmark-renderer';

function ResultadoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoria = searchParams.get('categoria') as CategoryType;
  const { user } = useAuthContext();
  const atletaId = user?.id ?? 'unknown';

  const [protocol, setProtocol] = useState<AthletePosingProtocol | null>(null);
  const [asymmetries, setAsymmetries] = useState<AsymmetryProfile | null>(null);
  const [source, setSource] = useState<
    'real_mediapipe' | 'real_mediapipe_pose_by_pose' | 'real_video' | 'mock' | null
  >(null);
  const [avgConfidence, setAvgConfidence] = useState<number | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<Record<
    string,
    LandmarkPoint
  > | null>(null);
  const [championAngles, setChampionAngles] = useState<Record<
    string,
    number
  > | null>(null);
  const [championName, setChampionName] = useState<string>('IFBB Pro League');
  const [activeTab, setActiveTab] = useState<
    | 'overlay'
    | 'evolution'
    | 'protocol'
    | 'asymmetries'
    | 'priorities'
    | 'plan'
    | 'report'
    | 'share'
  >('overlay');
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  // Resetar título da aba (pode ter sido alterado pela notificação)
  useEffect(() => {
    document.title = 'NutriFitVision';
  }, []);

  useEffect(() => {
    // Tentar carregar do sessionStorage primeiro (vem da página nova)
    const cached = sessionStorage.getItem('pose_protocol');
    if (cached) {
      const parsed = JSON.parse(cached);
      // Compatibilidade: novo formato { protocol, source, avg_confidence,
      // landmarks, image_data_url } ou formato antigo (AthletePosingProtocol)
      if (parsed && typeof parsed === 'object' && 'source' in parsed) {
        setProtocol(parsed.protocol);
        setSource(parsed.source);
        if (typeof parsed.avg_confidence === 'number') {
          setAvgConfidence(parsed.avg_confidence);
        }
        if (parsed.landmarks) setLandmarks(parsed.landmarks);
      } else {
        setProtocol(parsed);
      }

      // Foto salva separada para evitar quota do sessionStorage
      const savedImage = sessionStorage.getItem('pose_image');
      if (savedImage) setImageDataUrl(savedImage);
    }

    // Carregar assimetrias em paralelo
    if (categoria) {
      poseAnalysisApi
        .detectAsymmetries(atletaId, categoria, MOCK_SYMMETRIC_LANDMARKS)
        .then(setAsymmetries)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [categoria]);

  // Buscar referência do campeão quando temos landmarks reais
  useEffect(() => {
    if (!categoria || !landmarks) return;
    poseAnalysisApi
      .compareWithChampions(atletaId, categoria, landmarks)
      .then((result) => {
        if (result?.melhor_match) {
          setChampionName(result.melhor_match.atleta);
          setChampionAngles(result.melhor_match.angulos_campeao);
        }
      })
      .catch(console.error);
  }, [categoria, landmarks]);

  if (loading || !protocol) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-nfv-cyan/30 border-t-nfv-cyan rounded-full animate-spin" />
      </div>
    );
  }

  const scoreGeral = Math.round(
    protocol.poses.reduce((a, p) => a + p.score_estimado_com_ajuste, 0) /
      protocol.poses.length,
  );

  const posesCriticas = new Set(protocol.poses_mais_criticas);
  const posesFortes = new Set(protocol.poses_mais_fortes);

  const TABS = [
    { id: 'overlay', label: 'Overlay', count: landmarks ? 1 : 0 },
    { id: 'evolution', label: 'Evolução', count: 0 },
    { id: 'protocol', label: 'Protocolo', count: protocol.poses.length },
    {
      id: 'asymmetries',
      label: 'Assimetrias',
      count: asymmetries?.total_assimetrias ?? 0,
    },
    {
      id: 'priorities',
      label: 'Prioridades',
      count: protocol.prioridades_treino_posing.length,
    },
    { id: 'plan', label: 'Plano', count: 7 },
    { id: 'report', label: 'Relatório', count: 0 },
    { id: 'share', label: 'Compartilhar', count: 0 },
  ] as const;

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
            Protocolo IFBB
          </h1>
          <p className="text-xs text-nfv-ice-muted">
            {CATEGORY_LABELS[categoria]} • Pro League
          </p>
        </div>
        <button
          onClick={() => router.push(`/poses/nova`)}
          className="p-2 rounded-lg text-nfv-ice-medium hover:text-nfv-cyan hover:bg-nfv-cyan/10 transition-colors"
          title="Nova análise"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Source badge — origem do protocolo (foto real vs demo) */}
      {source && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border ${
            source === 'real_mediapipe'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}
        >
          {source === 'real_mediapipe' || source === 'real_mediapipe_pose_by_pose' ? (
            <>
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">
                {source === 'real_mediapipe_pose_by_pose'
                  ? 'Análise pose a pose (MediaPipe)'
                  : 'Análise via foto real (MediaPipe)'}
                {avgConfidence !== null && (
                  <span className="ml-1 text-green-600">
                    — confiança {Math.round(avgConfidence * 100)}%
                  </span>
                )}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span>Modo demonstração — landmarks simétricos mock</span>
            </>
          )}
        </motion.div>
      )}

      {/* Score Overview */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard padding="lg">
          <div className="flex items-center gap-6">
            <ScoreCircle
              score={scoreGeral}
              size="lg"
              label="Score Geral"
              showClassification
            />

            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-nfv-ice-muted">
                  Ganho estimado com ajustes
                </p>
                <p className="text-2xl font-bold text-nfv-cyan">
                  +{protocol.ganho_total_estimado} pts
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-50 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-red-500">
                    {posesCriticas.size}
                  </p>
                  <p className="text-[10px] text-red-400">Poses críticas</p>
                </div>
                <div className="bg-green-50 rounded-xl p-2 text-center">
                  <p className="text-lg font-bold text-green-500">
                    {posesFortes.size}
                  </p>
                  <p className="text-[10px] text-green-400">Poses fortes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo coach */}
          <div className="mt-4 pt-4 border-t border-[rgba(0,188,212,0.1)]">
            <p className="text-xs text-nfv-ice-medium leading-relaxed">
              {protocol.resumo_coach_pt}
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f5f8fb] rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white text-nfv-cyan shadow-sm'
                : 'text-nfv-ice-muted hover:text-nfv-ice'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${
                  activeTab === tab.id
                    ? 'bg-nfv-cyan/10 text-nfv-cyan'
                    : 'bg-[#e8f0fe] text-nfv-ice-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overlay' && (
        <div className="space-y-4">
          {landmarks ? (
            <ChampionSideBySide
              atletaImageUrl={imageDataUrl}
              atletaLandmarks={landmarks}
              atletaConfidence={avgConfidence ?? undefined}
              championName={championName}
              championAngles={championAngles ?? {}}
              categoria={CATEGORY_LABELS[categoria] ?? categoria}
            />
          ) : (
            <GlassCard padding="lg" className="text-center py-10">
              <p className="text-sm text-nfv-ice-muted">
                Overlay disponível apenas para análises com foto ou vídeo real
              </p>
              <button
                onClick={() => router.push('/poses/nova')}
                className="mt-4 px-6 py-2.5 rounded-xl bg-nfv-aurora text-white text-sm font-semibold"
              >
                Fazer análise com foto
              </button>
            </GlassCard>
          )}
        </div>
      )}

      {activeTab === 'evolution' && (
        <BeforeAfter
          currentProtocol={protocol}
          categoria={categoria}
        />
      )}

      {activeTab === 'protocol' && (
        <div className="space-y-3">
          {protocol.poses.map((pose, i) => (
            <PoseScoreCard
              key={pose.pose_id}
              pose={pose}
              index={i}
              isCritical={posesCriticas.has(pose.pose_id)}
              isStrong={posesFortes.has(pose.pose_id)}
            />
          ))}
        </div>
      )}

      {activeTab === 'asymmetries' && (
        <div className="space-y-3">
          {/* Simetria geral */}
          {asymmetries && (
            <GlassCard padding="md">
              <div className="flex items-center gap-4">
                <ScoreCircle
                  score={asymmetries.score_simetria_geral}
                  size="md"
                  label="Simetria"
                />
                <div>
                  <p className="text-sm font-semibold text-nfv-ice">
                    {asymmetries.resumo}
                  </p>
                  <p className="text-xs text-nfv-cyan mt-1">
                    {asymmetries.mascaraveis} de{' '}
                    {asymmetries.total_assimetrias} mascaráveis
                  </p>
                </div>
              </div>
            </GlassCard>
          )}

          {asymmetries?.assimetrias.length === 0 && (
            <GlassCard padding="md" className="text-center py-8">
              <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-nfv-ice">
                Simetria excelente!
              </p>
              <p className="text-xs text-nfv-ice-muted mt-1">
                Nenhuma assimetria significativa detectada
              </p>
            </GlassCard>
          )}

          {asymmetries?.assimetrias.map((a, i) => (
            <AsymmetryAlert key={i} asymmetry={a} index={i} />
          ))}

          {/* Pontos fortes */}
          {asymmetries && asymmetries.pontos_fortes.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-nfv-ice-medium px-1">
                Pontos fortes detectados
              </p>
              {asymmetries.pontos_fortes.map((pf, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-green-50 border border-green-200"
                >
                  <Zap className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-green-700">
                      {pf.descricao}
                    </p>
                    <p className="text-[10px] text-green-500 mt-0.5 capitalize">
                      Região: {pf.regiao}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'priorities' && (
        <div className="space-y-3">
          {protocol.prioridades_treino_posing.map((prioridade, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-[#d0dbe6]"
            >
              <div className="w-6 h-6 rounded-full bg-nfv-aurora/15 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-nfv-cyan">
                  {i + 1}
                </span>
              </div>
              <p className="text-sm text-nfv-ice-medium leading-relaxed">
                {prioridade}
              </p>
            </motion.div>
          ))}

          {/* CTA */}
          <GlassCard padding="md" className="text-center">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-nfv-ice mb-1">
              Pronto para o palco
            </p>
            <p className="text-xs text-nfv-ice-muted mb-4">
              Execute este protocolo por 4 semanas e refaça a análise para medir
              a evolução
            </p>
            <button
              onClick={() => router.push('/poses/nova')}
              className="w-full py-2.5 rounded-xl bg-nfv-aurora text-white text-sm font-semibold flex items-center justify-center gap-2"
            >
              Nova análise <ChevronRight className="w-4 h-4" />
            </button>
          </GlassCard>
        </div>
      )}

      {activeTab === 'plan' && (
        <WeeklyPlan protocol={protocol} categoria={categoria} />
      )}

      {activeTab === 'report' && (
        <PoseReport
          protocol={protocol}
          asymmetries={asymmetries}
          categoria={categoria}
          confidence={avgConfidence}
          userName={user?.name}
        />
      )}

      {activeTab === 'share' && (
        <ShareCard
          protocol={protocol}
          categoria={categoria}
          confidence={avgConfidence}
          userName={user?.name}
        />
      )}

      {/* Botão flutuante Coach IA */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
        onClick={() => setChatOpen(true)}
        className="fixed bottom-24 right-4 lg:bottom-8 lg:right-8 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl bg-nfv-aurora text-white shadow-nfv hover:shadow-nfv-glow transition-all"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-semibold">Coach IA</span>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </motion.button>

      {/* Coach Chat lateral */}
      <CoachChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        protocol={protocol}
        asymmetries={asymmetries}
        categoria={categoria}
        confidence={avgConfidence}
      />
    </div>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-2 border-nfv-cyan/30 border-t-nfv-cyan rounded-full animate-spin" />
        </div>
      }
    >
      <ResultadoContent />
    </Suspense>
  );
}
