'use client';

import { useState } from 'react';
import { Trophy, User, ArrowLeftRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import LandmarkOverlay from './LandmarkOverlay';
import type { LandmarkPoint } from '@/lib/landmark-renderer';

interface ChampionSideBySideProps {
  atletaImageUrl: string | null;
  atletaLandmarks: Record<string, LandmarkPoint>;
  atletaConfidence?: number;
  championName: string;
  championAngles: Record<string, number>;
  categoria: string;
}

const ANGLE_LABELS: Record<string, string> = {
  cotovelo_esq: 'Cotovelo Esq',
  cotovelo_dir: 'Cotovelo Dir',
  abducao_ombro_esq: 'Abdução Ombro Esq',
  abducao_ombro_dir: 'Abdução Ombro Dir',
  joelho_esq: 'Joelho Esq',
  joelho_dir: 'Joelho Dir',
  alinhamento_tronco: 'Tronco',
  nivelamento_ombros: 'Nivel. Ombros',
  nivelamento_quadril: 'Nivel. Quadril',
};

const ANGLE_DEFINITIONS: Record<string, [string, string, string]> = {
  cotovelo_esq: ['left_wrist', 'left_elbow', 'left_shoulder'],
  cotovelo_dir: ['right_wrist', 'right_elbow', 'right_shoulder'],
  abducao_ombro_esq: ['left_elbow', 'left_shoulder', 'left_hip'],
  abducao_ombro_dir: ['right_elbow', 'right_shoulder', 'right_hip'],
  joelho_esq: ['left_hip', 'left_knee', 'left_ankle'],
  joelho_dir: ['right_hip', 'right_knee', 'right_ankle'],
  alinhamento_tronco: ['left_shoulder', 'left_hip', 'left_knee'],
  nivelamento_ombros: ['left_shoulder', 'right_shoulder', 'right_hip'],
  nivelamento_quadril: ['left_hip', 'right_hip', 'right_knee'],
};

function calcAngleFromLandmarks(
  landmarks: Record<string, LandmarkPoint>,
  a: string,
  b: string,
  c: string,
): number | null {
  const lmA = landmarks[a];
  const lmB = landmarks[b];
  const lmC = landmarks[c];
  if (!lmA || !lmB || !lmC) return null;

  const ba = { x: lmA.x - lmB.x, y: lmA.y - lmB.y };
  const bc = { x: lmC.x - lmB.x, y: lmC.y - lmB.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const mag =
    Math.sqrt(ba.x ** 2 + ba.y ** 2) * Math.sqrt(bc.x ** 2 + bc.y ** 2);
  if (mag === 0) return null;
  return Math.round(
    (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI,
  );
}

export default function ChampionSideBySide({
  atletaImageUrl,
  atletaLandmarks,
  atletaConfidence,
  championName,
  championAngles,
  categoria,
}: ChampionSideBySideProps) {
  const [view, setView] = useState<'overlay' | 'comparison'>('overlay');

  const hasChampionData = championAngles && Object.keys(championAngles).length > 0;

  // Calcular ângulos do atleta
  const atletaAngles: Record<string, number> = {};
  for (const [key, [a, b, c]] of Object.entries(ANGLE_DEFINITIONS)) {
    const angle = calcAngleFromLandmarks(atletaLandmarks, a, b, c);
    if (angle !== null) atletaAngles[key] = angle;
  }

  // Calcular deltas
  const deltas = Object.entries(championAngles)
    .filter(([key]) => atletaAngles[key] !== undefined)
    .map(([key, champVal]) => ({
      key,
      label: ANGLE_LABELS[key] || key,
      atleta: atletaAngles[key]!,
      campeao: Math.round(champVal),
      delta: atletaAngles[key]! - Math.round(champVal),
    }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return (
    <div className="space-y-4">
      {/* Toggle view */}
      <div className="flex gap-2 bg-[#f5f8fb] p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setView('overlay')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            view === 'overlay'
              ? 'bg-white text-nfv-cyan shadow-sm'
              : 'text-nfv-ice-muted'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Seu overlay
        </button>
        <button
          type="button"
          onClick={() => setView('comparison')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            view === 'comparison'
              ? 'bg-white text-nfv-cyan shadow-sm'
              : 'text-nfv-ice-muted'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          vs Campeão
        </button>
      </div>

      {/* Overlay view */}
      {view === 'overlay' && (
        <LandmarkOverlay
          imageDataUrl={atletaImageUrl}
          landmarks={atletaLandmarks}
          championAngles={championAngles}
          label="Seus landmarks"
          confidence={atletaConfidence}
        />
      )}

      {/* Comparison view */}
      {view === 'comparison' && !hasChampionData && (
        <GlassCard padding="lg" className="text-center py-8">
          <p className="text-sm text-nfv-ice-muted">
            Carregando referência do campeão...
          </p>
          <p className="text-xs text-nfv-ice-muted mt-1">
            Os ângulos de referência serão comparados com os seus quando disponíveis.
          </p>
        </GlassCard>
      )}

      {view === 'comparison' && hasChampionData && (
        <div className="space-y-3">
          {/* Header do campeão */}
          <GlassCard padding="sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-nfv-ice">{championName}</p>
                <p className="text-xs text-nfv-ice-muted">
                  Referência IFBB Pro League — {categoria}
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Tabela de ângulos */}
          {deltas.length === 0 ? (
            <GlassCard padding="md" className="text-center">
              <p className="text-xs text-nfv-ice-muted">
                Sem ângulos comparáveis com este campeão.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {deltas.map((d, i) => {
                const isOff = Math.abs(d.delta) > 10;
                const isGood = Math.abs(d.delta) <= 5;
                const deltaColor = isGood
                  ? 'text-green-600'
                  : isOff
                    ? 'text-red-500'
                    : 'text-amber-500';

                return (
                  <div
                    key={d.key}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      isOff
                        ? 'bg-red-50 border-red-200'
                        : isGood
                          ? 'bg-green-50 border-green-200'
                          : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-nfv-ice-muted">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-nfv-ice">
                        {d.label}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-nfv-ice-muted">
                          Você: <strong>{d.atleta}°</strong>
                        </span>
                        <span className="text-[10px] text-nfv-ice-muted">
                          |
                        </span>
                        <span className="text-[10px] text-nfv-ice-muted">
                          {championName}: <strong>{d.campeao}°</strong>
                        </span>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold ${deltaColor} flex-shrink-0`}
                    >
                      {d.delta > 0 ? '+' : ''}
                      {d.delta}°
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Resumo */}
          {deltas.length > 0 && (
            <GlassCard padding="sm" className="text-center">
              <p className="text-xs text-nfv-ice-muted">
                {deltas.filter((d) => Math.abs(d.delta) <= 5).length} de{' '}
                {deltas.length} ângulos dentro de ±5° do campeão
              </p>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}
