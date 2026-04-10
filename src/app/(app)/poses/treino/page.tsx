'use client';

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Square,
  ChevronRight,
  Check,
  Timer,
  Trophy,
  Mic,
} from 'lucide-react';
import {
  CATEGORY_POSE_LIST,
  CATEGORY_LABELS,
  PLANE_LABELS,
} from '@/lib/api/pose-analysis';
import type { CategoryType } from '@/lib/api/pose-analysis';

type TrainingState = 'idle' | 'prep' | 'holding' | 'transition' | 'complete';

interface PoseResult {
  poseId: string;
  nomePose: string;
  tempoReal: number;
  completed: boolean;
}

const HOLD_TIME = 5;
const PREP_TIME = 3;
const REST_TIME = 2;

function TreinoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoria = (searchParams.get('categoria') ??
    'mens_physique') as CategoryType;
  const poses = useMemo(
    () => CATEGORY_POSE_LIST[categoria] ?? [],
    [categoria],
  );

  const [state, setState] = useState<TrainingState>('idle');
  const [poseIdx, setPoseIdx] = useState(0);
  const [timer, setTimer] = useState(PREP_TIME);
  const [results, setResults] = useState<PoseResult[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  const poseIdxRef = useRef(poseIdx);

  // Sync refs
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    poseIdxRef.current = poseIdx;
  }, [poseIdx]);

  const currentPose = poses[poseIdx];
  const isLast = poseIdx === poses.length - 1;
  const progress = (poseIdx / Math.max(1, poses.length)) * 100;

  // TTS
  const speak = useCallback(
    (text: string, rate = 0.95) => {
      if (!voiceOn || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-BR';
      u.rate = rate;
      const ptV = window.speechSynthesis
        .getVoices()
        .find((v) => v.lang.startsWith('pt'));
      if (ptV) u.voice = ptV;
      window.speechSynthesis.speak(u);
    },
    [voiceOn],
  );

  // Total timer
  useEffect(() => {
    if (state === 'idle' || state === 'complete') return;
    totalRef.current = setInterval(() => setTotalTime((t) => t + 1), 1000);
    return () => {
      if (totalRef.current) clearInterval(totalRef.current);
    };
  }, [state]);

  // Transição de estado quando timer chega a 0
  const handleTimerEnd = useCallback(() => {
    const s = stateRef.current;
    const idx = poseIdxRef.current;
    const pose = poses[idx];
    const last = idx === poses.length - 1;

    if (s === 'prep') {
      setState('holding');
      setTimer(HOLD_TIME);
      if (pose) speak(`${pose.nome_pt}. Segure!`, 1.1);
    } else if (s === 'holding') {
      setResults((prev) => [
        ...prev,
        {
          poseId: pose?.id ?? '',
          nomePose: pose?.nome_pt ?? '',
          tempoReal: HOLD_TIME,
          completed: true,
        },
      ]);

      if (last) {
        speak('Sequência completa! Excelente trabalho!', 0.95);
        setState('complete');
      } else {
        setState('transition');
        setTimer(REST_TIME);
        speak('Ótimo! Próxima pose.', 1.0);
      }
    } else if (s === 'transition') {
      const nextIdx = idx + 1;
      const nextPose = poses[nextIdx];
      setPoseIdx(nextIdx);
      setState('prep');
      setTimer(PREP_TIME);
      if (nextPose) {
        speak(
          `${nextPose.nome_pt}. ${PLANE_LABELS[nextPose.plano]}. Prepara!`,
          0.95,
        );
      }
    }
  }, [poses, speak]);

  // Main timer
  useEffect(() => {
    if (state === 'idle' || state === 'complete') return;

    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Schedule state transition for next tick to avoid stale closure
          setTimeout(() => handleTimerEnd(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, poseIdx, handleTimerEnd]);

  const startTraining = () => {
    setState('prep');
    setTimer(PREP_TIME);
    setPoseIdx(0);
    setResults([]);
    setTotalTime(0);
    if (poses[0]) {
      speak(
        `Iniciando treino de ${CATEGORY_LABELS[categoria]}. Primeira pose: ${poses[0].nome_pt}. Preparar!`,
        0.9,
      );
    }
  };

  const stopTraining = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (totalRef.current) clearInterval(totalRef.current);
    setState('idle');
    setPoseIdx(0);
    setResults([]);
    setTotalTime(0);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const stateColors: Record<TrainingState, string> = {
    idle: 'from-[#0f172a] to-[#1e293b]',
    prep: 'from-[#1e3a5f] to-[#0f172a]',
    holding: 'from-[#0d3320] to-[#0f172a]',
    transition: 'from-[#2d1f00] to-[#0f172a]',
    complete: 'from-[#0d3320] to-[#0f172a]',
  };

  const stateLabel: Record<TrainingState, string> = {
    idle: '',
    prep: 'PREPARE-SE',
    holding: 'SEGURE A POSE!',
    transition: 'DESCANSE',
    complete: 'SESSÃO COMPLETA!',
  };

  const stateColor: Record<TrainingState, string> = {
    idle: '#00bcd4',
    prep: '#2962ff',
    holding: '#00c853',
    transition: '#ff9100',
    complete: '#00c853',
  };

  const maxTimer =
    state === 'prep' ? PREP_TIME : state === 'holding' ? HOLD_TIME : REST_TIME;
  const circumference = 2 * Math.PI * 45;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${stateColors[state]} flex flex-col transition-all duration-500`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button
          onClick={() => {
            stopTraining();
            router.back();
          }}
          className="p-2 bg-white/10 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-center">
          <p className="text-white/60 text-xs">{CATEGORY_LABELS[categoria]}</p>
          <p className="text-white font-bold text-sm">Treino Guiado</p>
        </div>
        <div className="flex items-center gap-2">
          {state !== 'idle' && state !== 'complete' && (
            <div className="text-white/60 text-xs font-mono">
              {formatTime(totalTime)}
            </div>
          )}
          <button
            onClick={() => setVoiceOn((v) => !v)}
            className={`p-2 rounded-xl ${voiceOn ? 'bg-[#00bcd4]/20' : 'bg-white/10'}`}
          >
            <Mic
              className={`w-4 h-4 ${voiceOn ? 'text-[#00bcd4]' : 'text-white/40'}`}
            />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* IDLE */}
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full space-y-6 text-center"
            >
              <div>
                <div className="w-20 h-20 rounded-full bg-[#00bcd4]/20 flex items-center justify-center mx-auto mb-4">
                  <Timer className="w-10 h-10 text-[#00bcd4]" />
                </div>
                <h1 className="text-white font-black text-2xl mb-2">
                  Treino Guiado
                </h1>
                <p className="text-white/60 text-sm">
                  {poses.length} poses • {HOLD_TIME}s cada • sequência oficial
                  IFBB
                </p>
              </div>

              <div className="space-y-2 text-left">
                {poses.slice(0, 5).map((pose, i) => (
                  <div
                    key={pose.id}
                    className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5"
                  >
                    <span className="text-white/40 text-xs w-4">{i + 1}</span>
                    <span className="text-white text-sm flex-1">
                      {pose.nome_pt}
                    </span>
                    <span className="text-white/40 text-xs">
                      {PLANE_LABELS[pose.plano]?.split(' ')[0]}
                    </span>
                  </div>
                ))}
                {poses.length > 5 && (
                  <p className="text-white/40 text-xs text-center">
                    + {poses.length - 5} poses
                  </p>
                )}
              </div>

              <button
                onClick={startTraining}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2962ff] to-[#00bcd4] text-white font-black text-lg flex items-center justify-center gap-3 shadow-2xl"
              >
                <Play className="w-6 h-6" />
                Iniciar treino
              </button>
            </motion.div>
          )}

          {/* ACTIVE */}
          {(state === 'prep' ||
            state === 'holding' ||
            state === 'transition') &&
            currentPose && (
              <motion.div
                key={`${state}-${poseIdx}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full space-y-6 text-center"
              >
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>
                      Pose {poseIdx + 1}/{poses.length}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: stateColor[state] }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Estado */}
                <motion.p
                  animate={{ color: stateColor[state] }}
                  className="text-sm font-black tracking-widest uppercase"
                >
                  {stateLabel[state]}
                </motion.p>

                {/* Timer circular */}
                <div className="relative w-40 h-40 mx-auto">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="6"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={stateColor[state]}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      animate={{
                        strokeDashoffset:
                          circumference * (1 - timer / maxTimer),
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-black text-5xl">
                      {timer}
                    </span>
                  </div>
                </div>

                {/* Pose info */}
                <div className="space-y-2">
                  <p className="text-white font-black text-xl">
                    {currentPose.nome_pt}
                  </p>
                  <p className="text-white/50 text-xs">
                    {PLANE_LABELS[currentPose.plano]}
                  </p>

                  {state === 'prep' && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-white/60 text-sm leading-relaxed max-w-xs mx-auto"
                    >
                      {currentPose.instrucao}
                    </motion.p>
                  )}

                  {state === 'holding' && currentPose.dica && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-[#00c853]/10 border border-[#00c853]/20 rounded-xl p-3"
                    >
                      <p className="text-[#00c853] text-xs">
                        {currentPose.dica}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Próxima preview */}
                {state === 'transition' && poses[poseIdx + 1] && (
                  <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                    <p className="text-white/40 text-xs">Próxima:</p>
                    <p className="text-white text-sm font-semibold flex-1">
                      {poses[poseIdx + 1]!.nome_pt}
                    </p>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </div>
                )}

                <button
                  onClick={stopTraining}
                  className="flex items-center gap-2 text-white/40 text-xs mx-auto"
                >
                  <Square className="w-3 h-3" />
                  Encerrar treino
                </button>
              </motion.div>
            )}

          {/* COMPLETE */}
          {state === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full space-y-6 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Trophy className="w-20 h-20 text-amber-400 mx-auto" />
              </motion.div>

              <div>
                <p className="text-[#00c853] text-sm font-semibold">
                  Treino concluído!
                </p>
                <p className="text-white font-black text-3xl mt-1">
                  {results.length}/{poses.length}
                </p>
                <p className="text-white/60 text-sm">poses completadas</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-white font-bold text-lg">
                    {formatTime(totalTime)}
                  </p>
                  <p className="text-white/40 text-xs">tempo total</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-white font-bold text-lg">
                    {results.filter((r) => r.completed).length}
                  </p>
                  <p className="text-white/40 text-xs">poses completas</p>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                {results.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2"
                  >
                    <Check className="w-4 h-4 text-[#00c853] flex-shrink-0" />
                    <span className="text-white text-xs flex-1">
                      {r.nomePose}
                    </span>
                    <span className="text-white/40 text-xs">
                      {r.tempoReal}s
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={startTraining}
                  className="py-3 rounded-xl bg-white/10 text-white text-sm font-semibold"
                >
                  Repetir
                </button>
                <button
                  onClick={() => router.push('/poses/nova')}
                  className="py-3 rounded-xl bg-gradient-to-r from-[#2962ff] to-[#00bcd4] text-white text-sm font-semibold"
                >
                  Analisar agora
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function TreinoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#00bcd4]/30 border-t-[#00bcd4] rounded-full animate-spin" />
        </div>
      }
    >
      <TreinoContent />
    </Suspense>
  );
}
