'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Trophy,
  Zap,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import WizardStepper from '@/components/ui/WizardStepper';
import CategorySelector from '@/components/features/poses/CategorySelector';
import PhotoUpload from '@/components/features/poses/PhotoUpload';
import {
  poseAnalysisApi,
  MOCK_SYMMETRIC_LANDMARKS,
  CATEGORY_LABELS,
} from '@/lib/api/pose-analysis';
import type { CategoryType } from '@/lib/api/pose-analysis';

const STEPS = ['Categoria', 'Foto', 'Análise'];

const PROCESSING_MESSAGES = [
  'Enviando foto para o servidor...',
  'Detectando landmarks corporais (MediaPipe)...',
  'Calculando ângulos articulares...',
  'Comparando com templates IFBB...',
  'Detectando assimetrias estruturais...',
  'Aplicando estratégias de mascaramento...',
  'Gerando protocolo personalizado...',
];

const ATLETA_ID = '9868cae8-9077-439f-b0c3-c1ce43198c00'; // TODO: auth
const PATIENT_ID = '9868cae8-9077-439f-b0c3-c1ce43198c00'; // TODO: linkar com paciente real

function NovaPoseContent() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [categoria, setCategoria] = useState<CategoryType | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [useRealPhoto, setUseRealPhoto] = useState(true);
  const [, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const handleAnalyze = async () => {
    if (!categoria) return;
    if (useRealPhoto && !photoFile) {
      setError('Selecione uma foto antes de continuar.');
      return;
    }

    setStep(2);
    setLoading(true);
    setError(null);
    setProcessingStep(0);

    // Animação das mensagens de processamento (1.2s cada)
    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx++;
      setProcessingStep(msgIdx);
      if (msgIdx >= PROCESSING_MESSAGES.length - 1) clearInterval(interval);
    }, 1200);

    try {
      let cached: {
        protocol: unknown;
        source: 'real_mediapipe' | 'mock';
        avg_confidence?: number;
      };

      if (useRealPhoto && photoFile) {
        // Pipeline real: foto → MediaPipe → nfc-core protocolo
        const result = await poseAnalysisApi.uploadAndAnalyze(
          photoFile,
          categoria,
          ATLETA_ID,
          PATIENT_ID,
        );

        if (!result.protocol) {
          throw new Error(
            'Pipeline retornou sem protocolo. Verifique se o nfc-core está rodando na porta 3100.',
          );
        }

        cached = {
          protocol: result.protocol,
          source: 'real_mediapipe',
          avg_confidence: result.avg_confidence,
        };
      } else {
        // Modo demo: usa landmarks mock simétricos
        const protocol = await poseAnalysisApi.generateProtocol(
          ATLETA_ID,
          categoria,
          MOCK_SYMMETRIC_LANDMARKS,
          true,
        );
        cached = { protocol, source: 'mock' };
      }

      clearInterval(interval);
      setProcessingStep(PROCESSING_MESSAGES.length - 1);

      sessionStorage.setItem('pose_protocol', JSON.stringify(cached));

      await new Promise((r) => setTimeout(r, 600));
      router.push(`/poses/resultado?categoria=${categoria}`);
    } catch (err) {
      clearInterval(interval);
      const msg =
        err instanceof Error
          ? err.message
          : 'Erro desconhecido ao gerar protocolo.';
      setError(msg);
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
            IFBB Pro League • 9 categorias
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

          {/* STEP 1: Foto */}
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
                    Envie a foto do atleta
                  </h2>
                  <p className="text-xs text-nfv-ice-muted mt-1">
                    {categoria
                      ? `Categoria: ${CATEGORY_LABELS[categoria]}`
                      : ''}
                  </p>
                </div>

                {/* Toggle real / mock */}
                <div className="bg-[#f5f8fb] rounded-xl p-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setUseRealPhoto(true)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      useRealPhoto
                        ? 'bg-white text-nfv-cyan shadow-sm'
                        : 'text-nfv-ice-muted hover:text-nfv-ice'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Foto real
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseRealPhoto(false)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      !useRealPhoto
                        ? 'bg-white text-nfv-cyan shadow-sm'
                        : 'text-nfv-ice-muted hover:text-nfv-ice'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Demo (mock)
                  </button>
                </div>

                {useRealPhoto ? (
                  <PhotoUpload
                    onPhotoSelected={setPhotoFile}
                    selectedFile={photoFile}
                  />
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-700 mb-1">
                      Modo demonstração
                    </p>
                    <p className="text-xs text-amber-600 leading-relaxed">
                      Usa landmarks simétricos perfeitos. Útil para testar a UI
                      sem subir foto. Não reflete um atleta real.
                    </p>
                  </div>
                )}

                {/* What to expect */}
                <div className="space-y-2 pt-2 border-t border-[#d0dbe6]">
                  {[
                    'MediaPipe extrai 33 landmarks 3D do corpo',
                    'Detecção de assimetrias estruturais e proporcionais',
                    'Estratégias personalizadas de mascaramento por pose',
                    'Comparação com campeões IFBB Pro League',
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
                  onClick={handleAnalyze}
                  disabled={useRealPhoto && !photoFile}
                  className="w-full py-3 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    {categoria ? CATEGORY_LABELS[categoria] : ''} • IFBB Pro League
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
