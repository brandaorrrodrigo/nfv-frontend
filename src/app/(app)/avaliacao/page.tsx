'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import WizardStepper from '@/components/ui/WizardStepper';
import UploadZone from '@/components/ui/UploadZone';
import { usePatients } from '@/lib/api/hooks';
import { api } from '@/lib/api/client';
import type { NFVAssessmentType, NFVAssessmentView } from '@/lib/api/types';

function AvaliacaoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('assessment');
  const tCommon = useTranslations('common');
  const tClients = useTranslations('clients');
  const { patients, searchPatients: doSearch } = usePatients();

  const steps = [t('selectPatient'), t('uploadMedia'), t('processing')];
  const processingMessages = [
    t('processingSteps.detecting'),
    t('processingSteps.calculating'),
    t('processingSteps.analyzing'),
    t('processingSteps.generating'),
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState(searchParams.get('cliente') || '');
  const [assessmentType, setAssessmentType] = useState<NFVAssessmentType>('POSTURAL');
  const [assessmentView, setAssessmentView] = useState<NFVAssessmentView>('ANTERIOR');
  const [files, setFiles] = useState<File[]>([]);
  const [search, setSearch] = useState('');
  const [processingMsg, setProcessingMsg] = useState(0);

  // Auto-advance if patient pre-selected
  useEffect(() => {
    if (searchParams.get('cliente')) {
      setCurrentStep(1);
    }
  }, [searchParams]);

  // Processing messages animation
  useEffect(() => {
    if (currentStep === 2) {
      const interval = setInterval(() => {
        setProcessingMsg((prev) => {
          if (prev >= processingMessages.length - 1) {
            clearInterval(interval);
            // Simulate completion
            setTimeout(() => {
              router.push('/avaliacao/assess-001');
            }, 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [currentStep, router]);

  const handleSearch = (term: string) => {
    setSearch(term);
    doSearch(term);
  };

  const handleSubmit = async () => {
    setCurrentStep(2);
    try {
      // Upload media first, then create assessment
      let mediaUrl = '';
      if (files[0]) {
        const uploadResult = await api.uploadMedia(files[0]);
        mediaUrl = uploadResult.url;
      }
      const result = await api.createAssessment({
        patientId: selectedPatientId,
        type: assessmentType,
        mediaUrl,
        mediaType: 'PHOTO',
        viewType: assessmentView,
      });
      router.push(`/avaliacao/${result.id}`);
    } catch {
      // Processing animation handles redirect via mock timeout
    }
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => currentStep > 0 && currentStep < 2 ? setCurrentStep(currentStep - 1) : router.back()} className="p-2 rounded-lg text-nfv-ice-medium hover:text-nfv-ice hover:bg-[#e8f0fe] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-heading font-bold text-2xl text-nfv-ice">{t('title')}</h1>
      </div>

      <WizardStepper steps={steps} currentStep={currentStep} />

      <div className="pt-8">
        <AnimatePresence mode="wait">
          {/* STEP 1: Select Patient */}
          {currentStep === 0 && (
            <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <GlassCard padding="lg" className="space-y-4">
                <h2 className="font-heading font-semibold text-lg text-nfv-ice">{t('step1Title')}</h2>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nfv-ice-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={t('searchPatient')}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-[#d0dbe6] text-nfv-ice placeholder:text-nfv-ice-muted focus:outline-none focus:border-nfv-cyan/40 text-sm"
                  />
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        selectedPatientId === patient.id
                          ? 'bg-nfv-cyan/10 border border-nfv-cyan/20'
                          : 'bg-[#f5f8fb] border border-transparent hover:bg-[#e8f0fe]'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-nfv-aurora/20 flex items-center justify-center text-nfv-cyan text-xs font-bold flex-shrink-0">
                        {patient.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-nfv-ice truncate">{patient.name}</p>
                        <p className="text-xs text-nfv-ice-muted">{patient.totalAssessments} {tClients('assessments')}</p>
                      </div>
                      {selectedPatientId === patient.id && <div className="w-2 h-2 rounded-full bg-nfv-cyan" />}
                    </button>
                  ))}
                </div>

                {/* Assessment Type */}
                <div className="pt-4 border-t border-[rgba(0,188,212,0.1)] space-y-3">
                  <h3 className="text-sm font-medium text-nfv-ice-light">{t('assessmentType')}</h3>
                  <div className="flex gap-3">
                    {(['POSTURAL', 'BIOMECHANICAL'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setAssessmentType(type)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          assessmentType === type
                            ? 'bg-nfv-cyan/15 text-nfv-cyan border border-nfv-cyan/20'
                            : 'bg-[#f5f8fb] text-nfv-ice-medium border border-[rgba(0,188,212,0.1)] hover:bg-[#e8f0fe]'
                        }`}
                      >
                        {t(`types.${type}`)}
                      </button>
                    ))}
                  </div>

                  <h3 className="text-sm font-medium text-nfv-ice-light pt-2">{t('view')}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {(['ANTERIOR', 'POSTERIOR', 'LATERAL_LEFT', 'LATERAL_RIGHT'] as const).map((view) => (
                      <button
                        key={view}
                        onClick={() => setAssessmentView(view)}
                        className={`py-2 rounded-lg text-xs font-medium transition-all ${
                          assessmentView === view
                            ? 'bg-nfv-cyan/15 text-nfv-cyan border border-nfv-cyan/20'
                            : 'bg-[#f5f8fb] text-nfv-ice-medium border border-[rgba(0,188,212,0.1)] hover:bg-[#e8f0fe]'
                        }`}
                      >
                        {t(`views.${view}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep(1)}
                  disabled={!selectedPatientId}
                  className="w-full py-3 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {tCommon('next')} <ChevronRight className="w-4 h-4" />
                </button>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 2: Upload */}
          {currentStep === 1 && (
            <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <GlassCard padding="lg" className="space-y-4">
                <h2 className="font-heading font-semibold text-lg text-nfv-ice">{t('step2Title')}</h2>

                {selectedPatient && (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#f5f8fb]">
                    <div className="w-8 h-8 rounded-full bg-nfv-aurora/20 flex items-center justify-center text-nfv-cyan text-xs font-bold">
                      {selectedPatient.name.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-nfv-ice">{selectedPatient.name}</p>
                      <p className="text-xs text-nfv-ice-muted">{t(`types.${assessmentType}`)} — {t(`views.${assessmentView}`)}</p>
                    </div>
                  </div>
                )}

                <UploadZone
                  onFilesSelected={setFiles}
                  maxFiles={3}
                  label={t('uploadZone.title')}
                />

                <button
                  onClick={handleSubmit}
                  disabled={files.length === 0}
                  className="w-full py-3 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {t('processAssessment')} <ChevronRight className="w-4 h-4" />
                </button>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 3: Processing */}
          {currentStep === 2 && (
            <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
              <GlassCard padding="lg" className="text-center py-12">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-nfv-aurora/15 flex items-center justify-center animate-nfv-glow-pulse">
                      <Loader2 className="w-10 h-10 text-nfv-cyan animate-spin" />
                    </div>
                  </div>

                  <div>
                    <h2 className="font-heading font-bold text-xl text-nfv-ice mb-2">{t('processingAssessment')}</h2>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={processingMsg}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-nfv-cyan"
                      >
                        {processingMessages[processingMsg]}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  {/* Progress bar */}
                  <div className="w-64 h-1.5 rounded-full bg-[#e8f0fe] overflow-hidden">
                    <motion.div
                      className="h-full bg-nfv-aurora rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${((processingMsg + 1) / processingMessages.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AvaliacaoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-nfv-cyan/30 border-t-nfv-cyan rounded-full animate-spin" />
      </div>
    }>
      <AvaliacaoContent />
    </Suspense>
  );
}
