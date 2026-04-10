'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone, type FileRejection } from 'react-dropzone';
import {
  Upload,
  Loader2,
  Zap,
  ChevronRight,
  Lock,
  Star,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  CATEGORY_POSES,
} from '@/lib/api/pose-analysis';
import type { CategoryType } from '@/lib/api/pose-analysis';

const DEMO_CATEGORIES: CategoryType[] = [
  'mens_physique',
  'classic_physique',
  'bikini',
  'wellness',
  'bodybuilding',
];

interface DemoResult {
  scoreGeral: number;
  ganhoEstimado: number;
  correcoes: string[];
  posesCount: number;
}

export default function DemoPage() {
  const router = useRouter();
  const [step, setStep] = useState<
    'select' | 'upload' | 'analyzing' | 'result'
  >('select');
  const [categoria, setCategoria] = useState<CategoryType | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);

  const runDemoAnalysis = useCallback(
    async (_file: File) => {
      const steps = [
        { pct: 25 },
        { pct: 50 },
        { pct: 75 },
        { pct: 95 },
      ];

      for (const s of steps) {
        setProgress(s.pct);
        await new Promise((r) => setTimeout(r, 800));
      }

      const scoreGeral = Math.floor(Math.random() * 25) + 35;
      setDemoResult({
        scoreGeral,
        ganhoEstimado: Math.floor(Math.random() * 20) + 10,
        correcoes: [
          'Elevar o cotovelo esquerdo 4° acima da linha do ombro',
          'Centralizar a cabeça — inclinação de 2.7° detectada',
          'Ativar o quadríceps direito — joelho em valgo leve',
        ],
        posesCount: CATEGORY_POSES[categoria!] ?? 6,
      });
      setProgress(100);
      await new Promise((r) => setTimeout(r, 300));
      setStep('result');
    },
    [categoria],
  );

  const onDrop = useCallback(
    (files: File[], _rejected: FileRejection[]) => {
      const file = files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      setStep('analyzing');
      runDemoAnalysis(file);
    },
    [runDemoAnalysis],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] flex flex-col">
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2962ff] to-[#00bcd4] flex items-center justify-center">
            <span className="text-white font-black text-sm">N</span>
          </div>
          <span className="text-white font-bold text-sm">NutriFitVision</span>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="text-xs text-[#00bcd4] font-semibold"
        >
          Entrar →
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {/* STEP: Selecionar categoria */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-6"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-[#00bcd4]/10 border border-[#00bcd4]/20 rounded-full px-4 py-1.5 mb-4">
                  <Star className="w-3.5 h-3.5 text-[#00bcd4]" />
                  <span className="text-[#00bcd4] text-xs font-semibold">
                    Análise grátis — sem cadastro
                  </span>
                </div>
                <h1 className="text-white font-black text-3xl leading-tight mb-2">
                  Descubra seu score
                  <br />
                  IFBB em 30 segundos
                </h1>
                <p className="text-[#94a3b8] text-sm">
                  IA biomecânica analisa suas poses e compara com campeões do
                  Olympia
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[#64748b] text-xs font-semibold uppercase tracking-wide">
                  Sua categoria
                </p>
                {DEMO_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategoria(cat);
                      setStep('upload');
                    }}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00bcd4]/40 hover:bg-[#00bcd4]/5 transition-all text-left"
                  >
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">
                        {CATEGORY_LABELS[cat]}
                      </p>
                      <p className="text-[#64748b] text-xs mt-0.5">
                        {CATEGORY_POSES[cat]} poses mandatórias
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#64748b]" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP: Upload */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full space-y-4"
            >
              <div className="text-center">
                <p className="text-[#00bcd4] text-xs font-semibold mb-2">
                  {categoria ? CATEGORY_LABELS[categoria] : ''}
                </p>
                <h2 className="text-white font-black text-2xl">
                  Envie sua foto
                </h2>
                <p className="text-[#94a3b8] text-sm mt-1">
                  Corpo inteiro, fundo neutro, boa iluminação
                </p>
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-[#00bcd4] bg-[#00bcd4]/5'
                    : 'border-white/20 hover:border-[#00bcd4]/40'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 text-[#64748b] mx-auto mb-3" />
                <p className="text-white text-sm font-semibold">
                  Arraste ou clique para enviar
                </p>
                <p className="text-[#64748b] text-xs mt-1">
                  JPG, PNG ou WebP — até 10MB
                </p>
              </div>

              <button
                onClick={() => setStep('select')}
                className="w-full text-[#64748b] text-sm py-2"
              >
                ← Voltar
              </button>
            </motion.div>
          )}

          {/* STEP: Analyzing */}
          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full space-y-8 text-center"
            >
              {preview && (
                <div className="relative mx-auto w-32 h-32 rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    className="w-full h-full object-cover"
                    alt="preview"
                  />
                  <div className="absolute inset-0 bg-[#00bcd4]/20 animate-pulse" />
                </div>
              )}

              <div className="space-y-3">
                <Loader2 className="w-10 h-10 text-[#00bcd4] mx-auto animate-spin" />
                <p className="text-white font-semibold">
                  Analisando biomecânica...
                </p>
                <p className="text-[#64748b] text-sm">
                  MediaPipe detectando 33 landmarks 3D
                </p>
              </div>

              <div className="space-y-2">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#2962ff] to-[#00bcd4] rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-[#64748b] text-xs">{progress}%</p>
              </div>
            </motion.div>
          )}

          {/* STEP: Resultado parcial */}
          {step === 'result' && demoResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-4"
            >
              {/* Score */}
              <div className="text-center">
                <p className="text-[#00bcd4] text-xs font-semibold mb-2">
                  {categoria ? CATEGORY_LABELS[categoria] : ''}
                </p>
                <div className="text-7xl font-black text-white leading-none mb-1">
                  {demoResult.scoreGeral}
                </div>
                <p className="text-[#64748b] text-sm">
                  /100 —{' '}
                  {demoResult.scoreGeral >= 60
                    ? 'Bom'
                    : demoResult.scoreGeral >= 45
                      ? 'Regular'
                      : 'Necessita Atenção'}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-2 bg-[#00bcd4]/10 border border-[#00bcd4]/20 rounded-full px-3 py-1">
                  <Zap className="w-3 h-3 text-[#00bcd4]" />
                  <span className="text-[#00bcd4] text-xs font-semibold">
                    +{demoResult.ganhoEstimado} pts com ajustes
                  </span>
                </div>
              </div>

              {/* 3 correções */}
              <div className="space-y-2">
                <p className="text-[#64748b] text-xs font-semibold uppercase tracking-wide">
                  Top 3 correções
                </p>
                {demoResult.correcoes.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#00bcd4]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#00bcd4] text-[10px] font-bold">
                        {i + 1}
                      </span>
                    </div>
                    <p className="text-white text-xs leading-relaxed">{c}</p>
                  </div>
                ))}
              </div>

              {/* Paywall — protocolo completo */}
              <div className="relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                  <Lock className="w-8 h-8 text-[#64748b] mb-2" />
                  <p className="text-white font-bold text-sm mb-1">
                    Protocolo completo bloqueado
                  </p>
                  <p className="text-[#64748b] text-xs mb-4">
                    Crie sua conta grátis para ver as{' '}
                    {demoResult.posesCount} poses, assimetrias, plano semanal
                    e Coach IA
                  </p>
                  <button
                    onClick={() => router.push('/register')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2962ff] to-[#00bcd4] text-white text-sm font-bold"
                  >
                    Ver protocolo completo grátis →
                  </button>
                </div>
                {/* Preview borrado */}
                <div className="p-4 space-y-2 blur-sm select-none pointer-events-none">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-white/5 rounded-xl" />
                  ))}
                </div>
              </div>

              {/* Login link */}
              <p className="text-center text-[#64748b] text-xs">
                Já tem conta?{' '}
                <button
                  onClick={() => router.push('/login')}
                  className="text-[#00bcd4] font-semibold"
                >
                  Entrar
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
