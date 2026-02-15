'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer, Share2, Link2, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';
import ScoreCircle from '@/components/ui/ScoreCircle';
import AngleTable from '@/components/ui/AngleTable';
import DeviationCard from '@/components/ui/DeviationCard';
import LandmarkOverlay from '@/components/ui/LandmarkOverlay';
import { useReport } from '@/lib/api/hooks';
import { api } from '@/lib/api/client';

export default function RelatorioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { report, loading } = useReport(id);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
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

  const handleShare = async () => {
    if (!report) return;
    const result = await api.shareReport(report.assessmentId);
    setShareLink(result.shareUrl);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="h-96 bg-[#f5f8fb] rounded-2xl animate-pulse" />;
  if (!report) return <div className="text-center py-16"><p className="text-nfv-ice-medium">{t('notFound')}</p></div>;

  const { assessment } = report;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/avaliacao/${assessment.id}`} className="p-2 rounded-lg text-nfv-ice-medium hover:text-nfv-ice hover:bg-[#e8f0fe] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-heading font-bold text-xl text-nfv-ice">{t('fullReport')}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[rgba(0,188,212,0.12)] text-nfv-ice-light text-xs font-medium hover:bg-[#e8f0fe] transition-colors">
            <Printer className="w-3.5 h-3.5" /> {t('print')}
          </button>
          <button onClick={handleShare} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-nfv-aurora text-white text-xs font-semibold shadow-nfv hover:shadow-nfv-glow transition-all">
            <Share2 className="w-3.5 h-3.5" /> {t('share')}
          </button>
        </div>
      </div>

      {shareLink && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-cyan-50 border border-[rgba(0,188,212,0.15)] print:hidden">
          <Link2 className="w-4 h-4 text-nfv-cyan flex-shrink-0" />
          <input type="text" value={shareLink} readOnly className="flex-1 bg-transparent text-sm text-nfv-ice outline-none" />
          <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-nfv-cyan/15 text-nfv-cyan text-xs font-medium hover:bg-nfv-cyan/25 transition-colors">
            {copied ? <><Check className="w-3 h-3" /> {t('linkCopied')}</> : t('copyLink')}
          </button>
        </div>
      )}

      <GlassCard padding="lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[rgba(0,188,212,0.1)]">
          <div>
            <p className="font-heading font-bold text-lg text-nfv-ice">{report.clinicName || 'NutriFitVision'}</p>
            <p className="text-sm text-nfv-ice-medium">{report.professionalName}</p>
          </div>
          <div className="text-right text-xs text-nfv-ice-muted">
            <p>{t('generatedAt')}</p>
            <p className="font-medium text-nfv-ice-light">{new Date(report.generatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-nfv-ice-muted mb-1">{t('patient')}</p>
            <p className="font-medium text-nfv-ice">{report.patientName}</p>
          </div>
          <div>
            <p className="text-xs text-nfv-ice-muted mb-1">{t('assessmentType')}</p>
            <p className="font-medium text-nfv-ice">{assessment.type === 'POSTURAL' ? t('posturalAssessment') : t('biomechanicalAssessment')} — {assessment.view.replace('_', ' ')}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard padding="lg">
        <h2 className="font-heading font-semibold text-base text-nfv-ice mb-6">{t('overallScore')}</h2>
        <div className="flex flex-col items-center mb-6">
          <ScoreCircle score={assessment.scores.overall} size="lg" showAnimation showClassification />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {(Object.entries(regionLabels) as [string, string][]).map(([key, label]) => {
            const score = assessment.scores[key as keyof typeof assessment.scores] as number;
            return <div key={key} className="text-center"><ScoreCircle score={score} size="sm" label={label} /></div>;
          })}
        </div>
      </GlassCard>

      <GlassCard padding="md">
        <h2 className="font-heading font-semibold text-base text-nfv-ice mb-4">{t('landmarkAnalysis')}</h2>
        <div className="flex justify-center">
          <LandmarkOverlay landmarks={assessment.landmarks} />
        </div>
      </GlassCard>

      {assessment.angles.length > 0 && <AngleTable angles={assessment.angles} title={t('measuredAngles')} />}

      {assessment.deviations.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-base text-nfv-ice mb-4">{t('identifiedDeviations')}</h2>
          <div className="space-y-3">{assessment.deviations.map((d) => <DeviationCard key={d.id} deviation={d} />)}</div>
        </div>
      )}

      {assessment.recommendations.length > 0 && (
        <GlassCard padding="lg">
          <h2 className="font-heading font-semibold text-base text-nfv-ice mb-4">{t('exercisePlan')}</h2>
          <div className="space-y-5">
            {assessment.recommendations.map((rec) => (
              <div key={rec.region}>
                <h3 className="font-medium text-sm text-nfv-cyan mb-2">{rec.region}</h3>
                <div className="space-y-2 pl-3 border-l border-nfv-cyan/20">
                  {rec.exercises.map((ex, j) => (
                    <div key={j} className="text-sm">
                      <p className="font-medium text-nfv-ice">{ex.name}</p>
                      <p className="text-xs text-nfv-ice-muted">{ex.description}</p>
                      <p className="text-xs text-nfv-ice-medium">{ex.frequency} {ex.sets && `| ${ex.sets} séries`} {ex.reps && `| ${ex.reps}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <div className="text-center text-xs text-nfv-ice-muted pb-8">
        <p>{t('generatedBy')} NutriFitVision — {tCommon('poweredBy')}</p>
      </div>
    </div>
  );
}
