'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Loader2, Trophy, Zap } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import WizardStepper from '@/components/ui/WizardStepper';
import CategorySelector from '@/components/features/poses/CategorySelector';
import {
  poseAnalysisApi,
  MOCK_SYMMETRIC_LANDMARKS,
  CATEGORY_LABELS,
} from '@/lib/api/pose-analysis';
import type { CategoryType } from '@/lib/api/pose-analysis';

const STEPS = ['Categoria', 'Atleta', 'Análise'];

const PROCESSING_MESSAGES = [
  'Detectando landmarks corporais...',
  'Calculando ângulos articulares...',
  'Comparando com templates IFBB...',
  'Detectando assimetrias...',
  'Aplicando estratégias de mascaramento...',
  'Gerando protocolo personalizado...',
];

function NovaPoseContent() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [categoria, setCategoria] = useState<CategoryType | null>(null);
  const [atletaId] = useState('9868cae8-9077-439f-b0c3-c1ce43198c00'); // TODO: auth
  const [, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const handleGenerateProtocol = async () => {
    if (!categoria) return;
    setStep(2);
    setLoading(true);
    setError(null);

    // Animate processing messages
    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx++;
      setProcessingStep(msgIdx);
      if (msgIdx >= PROCESSING_MESSAGES.length - 1) clearInterval(interval);
    }, 900);

    try {
      const protocol = await poseAnalysisApi.generateProtocol(
        atletaId,
        categoria,
        MOCK_SYMMETRIC_LANDMARKS,
        true,
      );

      clearInterval(interval);
      setProcessingStep(PROCESSING_MESSAGES.length - 1);

      // Guardar resultado no sessionStorage para a página de resultado
      sessionStorage.setItem('pose_protocol', JSON.stringify(protocol));

      await new Promise((r) => setTimeout(r, 600));
      router.push(`/poses/resultado?categoria=${categoria}`);
    } catch {
      clearInterval(interval);
      setError(
        'Erro ao gerar protocolo. Verifique se o servidor está rodando na porta 3100.',
      );
      setLoading(false);
      setStep(1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            step > 0 && step < 2 ? setStep(step - 1) : router.back()
          }
          className="p-2 rounded-lg text-nfv-ice-medium hover:text-nfv-ice hover:bg-[#e8f0fe] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-heading font-bold text-2xl text-nfv-ice">
            Nova Análise de Pose
          </h1>
          <p className="text-xs text-nfv-ice-muted">
            IFBB Pro League • 7 categorias
          </p>
        </div>
      </div>

      <WizardStepper steps={STEPS} currentStep={step} />

      <div className="pt-4">
        <AnimatePresence mode="wait">
          {/* STEP 0: Categoria */}
          {step === 0 && (
            <motion.div
              key="step0"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
            >
              <GlassCard padding="lg" className="space-y-4">
                <div>
                  <h2 className="font-heading font-semibold text-lg text-nfv-ice">
                    Selecione a categoria
                  </h2>
                  <p className="text-xs text-nfv-ice-muted mt-1">
                    Categoria de competição IFBB Pro League
                  </p>
                </div>

                <CategorySelector selected={categoria} onSelect={setCategoria} />

                <button
                  onClick={() => setStep(1)}
                  disabled={!categoria}
                  className="w-full py-3 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 1: Confirmar e gerar */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
            >
              <GlassCard padding="lg" className="space-y-5">
                <div>
                  <h2 className="font-heading font-semibold text-lg text-nfv-ice">
                    Confirmar análise
                  </h2>
                  <p className="text-xs text-nfv-ice-muted mt-1">
                    O sistema vai gerar seu protocolo personalizado
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-[#f5f8fb] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-nfv-ice-muted">Categoria</span>
                    <span className="text-sm font-semibold text-nfv-ice">
                      {categoria ? CATEGORY_LABELS[categoria] : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-nfv-ice-muted">
                      O que será gerado
                    </span>
                    <span className="text-xs text-nfv-cyan font-medium">
                      Protocolo completo
                    </span>
                  </div>
                </div>

                {/* What to expect */}
                <div className="space-y-2">
                  {[
                    'Detecção de assimetrias estruturais e musculares',
                    'Estratégias personalizadas de mascaramento por pose',
                    'Comparação com campeões IFBB Pro League',
                    'Protocolo de treino de posing priorizado',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Zap className="w-3.5 h-3.5 text-nfv-cyan flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-nfv-ice-medium">{item}</p>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleGenerateProtocol}
                  className="w-full py-3 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  Gerar Protocolo IFBB
                </button>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 2: Processing */}
          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
            >
              <GlassCard padding="lg" className="text-center py-12">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-nfv-aurora/15 flex items-center justify-center animate-pulse">
                    <Loader2 className="w-10 h-10 text-nfv-cyan animate-spin" />
                  </div>

                  <div>
                    <h2 className="font-heading font-bold text-xl text-nfv-ice mb-2">
                      Gerando Protocolo IFBB
                    </h2>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={processingStep}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="text-sm text-nfv-cyan"
                      >
                        {PROCESSING_MESSAGES[processingStep]}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  <div className="w-64 h-1.5 rounded-full bg-[#e8f0fe] overflow-hidden">
                    <motion.div
                      className="h-full bg-nfv-aurora rounded-full"
                      initial={{ width: '0%' }}
                      animate={{
                        width: `${((processingStep + 1) / PROCESSING_MESSAGES.length) * 100}%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <p className="text-xs text-nfv-ice-muted">
                    Analisando{' '}
                    {categoria ? CATEGORY_LABELS[categoria] : 'categoria'} —
                    IFBB Pro League
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function NovaPosePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-2 border-nfv-cyan/30 border-t-nfv-cyan rounded-full animate-spin" />
        </div>
      }
    >
      <NovaPoseContent />
    </Suspense>
  );
}
