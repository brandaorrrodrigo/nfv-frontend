'use client';

import { use } from 'react';
import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ScoreCircle from '@/components/ui/ScoreCircle';
import AngleTable from '@/components/ui/AngleTable';
import DeviationCard from '@/components/ui/DeviationCard';
import LandmarkOverlay from '@/components/ui/LandmarkOverlay';
import GlassCard from '@/components/ui/GlassCard';
import AuroraBackground from '@/components/ui/AuroraBackground';
import { useSharedReport } from '@/lib/api/hooks';

export default function RelatorioCompartilhadoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { report, loading, error } = useSharedReport(token);
  const t = useTranslations('reports');
  const tCommon = useTranslations('common');
  const tResults = useTranslations('results');

  const regionLabels: Record<string, string> = {
    head: tResults('regions.head'),
    shoulders: tResults('regions.shoulders'),
    spine: tResults('regions.global'),
    pelvis: tResults('regions.hips'),
    kneeLeft: tResults('regions.knee_left'),
    kneeRight: tResults('regions.knee_right'),
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <AuroraBackground intensity="subtle" />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-2 border-nfv-cyan/30 border-t-nfv-cyan rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!report || error) {
    return (
      <div className="min-h-screen relative">
        <AuroraBackground intensity="subtle" />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-nfv-danger/10 flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-nfv-danger" />
          </div>
          <h1 className="font-heading font-bold text-xl text-nfv-ice mb-2">{t('unavailable')}</h1>
          <p className="text-sm text-nfv-ice-muted">{t('unavailableDesc')}</p>
        </div>
      </div>
    );
  }

  const { assessment } = report;

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity="subtle" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 space-y-6">
        <GlassCard padding="lg">
          <div className="flex items-center justify-between border-b border-[rgba(0,188,212,0.1)] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-nfv-aurora flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-heading font-bold text-base text-nfv-ice">{report.clinicName || 'NutriFitVision'}</p>
                <p className="text-xs text-nfv-ice-medium">{report.professionalName}</p>
              </div>
            </div>
            <div className="text-right text-xs text-nfv-ice-muted">
              <p>{new Date(report.generatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-nfv-ice-muted text-xs">{t('patient')}</span>
              <p className="font-medium text-nfv-ice">{report.patientName}</p>
            </div>
            <div>
              <span className="text-nfv-ice-muted text-xs">{t('assessmentType')}</span>
              <p className="font-medium text-nfv-ice">{assessment.type === 'POSTURAL' ? t('posturalAssessment') : t('biomechanicalAssessment')}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard padding="lg">
          <div className="flex flex-col items-center py-4">
            <ScoreCircle score={assessment.scores.overall} size="lg" showAnimation showClassification />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
            {(Object.entries(regionLabels) as [string, string][]).map(([key, label]) => (
              <div key={key} className="text-center">
                <ScoreCircle score={assessment.scores[key as keyof typeof assessment.scores] as number} size="sm" label={label} />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard padding="md">
          <h2 className="font-heading font-semibold text-sm text-nfv-ice mb-4">{t('posturalAnalysis')}</h2>
          <div className="flex justify-center">
            <LandmarkOverlay landmarks={assessment.landmarks} width={320} height={480} />
          </div>
        </GlassCard>

        {assessment.angles.length > 0 && <AngleTable angles={assessment.angles} />}

        {assessment.deviations.length > 0 && (
          <div>
            <h2 className="font-heading font-semibold text-sm text-nfv-ice mb-3">{t('foundDeviations')}</h2>
            <div className="space-y-3">
              {assessment.deviations.map((d) => <DeviationCard key={d.id} deviation={d} />)}
            </div>
          </div>
        )}

        {assessment.recommendations.length > 0 && (
          <GlassCard padding="lg">
            <h2 className="font-heading font-semibold text-sm text-nfv-ice mb-4">{t('recommendedExercises')}</h2>
            <div className="space-y-4">
              {assessment.recommendations.map((rec) => (
                <div key={rec.region}>
                  <h3 className="text-xs font-medium text-nfv-cyan mb-2">{rec.region}</h3>
                  {rec.exercises.map((ex, j) => (
                    <div key={j} className="text-sm pl-3 border-l border-[rgba(0,188,212,0.1)] mb-2">
                      <p className="font-medium text-nfv-ice">{ex.name}</p>
                      <p className="text-xs text-nfv-ice-muted">{ex.description}</p>
                      <p className="text-xs text-nfv-ice-medium">{ex.frequency}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        <div className="text-center py-6 space-y-2">
          <div className="flex items-center justify-center gap-2 text-nfv-ice-muted">
            <div className="w-6 h-6 rounded-lg bg-nfv-aurora flex items-center justify-center">
              <Eye className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-medium">NutriFitVision</span>
          </div>
          <p className="text-[10px] text-nfv-ice-muted/60">{tCommon('poweredBy')} — {t('autoGenerated')}</p>
        </div>
      </div>
    </div>
  );
}
