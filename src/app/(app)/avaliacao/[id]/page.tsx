'use client';

import { use } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Share2, Camera, FileText } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import ScoreCircle from '@/components/ui/ScoreCircle';
import AngleTable from '@/components/ui/AngleTable';
import DeviationCard from '@/components/ui/DeviationCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAssessment } from '@/lib/api/hooks';
import { getScoreColor, getScoreClassification, getScoreLabel } from '@/lib/api/types';

const regionKeys = ['head', 'shoulders', 'spine', 'pelvis', 'kneeLeft', 'kneeRight'] as const;

export default function AvaliacaoResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tResults = useTranslations('results');
  const tAnthro = useTranslations('anthropometry');
  const tCommon = useTranslations('common');
  const { assessment, loading } = useAssessment(id);

  const regionLabels: Record<string, string> = {
    head: tResults('regions.head'),
    shoulders: tResults('regions.shoulders'),
    spine: tResults('regions.hips'),
    pelvis: tResults('regions.hips'),
    kneeLeft: tResults('regions.knee_left'),
    kneeRight: tResults('regions.knee_right'),
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[#f5f8fb] rounded animate-pulse" />
        <div className="h-64 bg-[#f5f8fb] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-16">
        <p className="text-nfv-ice-medium">{tCommon('noResults')}</p>
        <Link href="/avaliacao/historico" className="text-nfv-cyan text-sm hover:underline mt-2 inline-block">
          {tCommon('back')}
        </Link>
      </div>
    );
  }

  const overallClassification = getScoreClassification(assessment.scores.overall);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/clientes/${assessment.patientId}`} className="p-2 rounded-lg text-nfv-ice-medium hover:text-nfv-ice hover:bg-[#e8f0fe] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-nfv-ice">{tResults('overallScore')}</h1>
            <p className="text-xs text-nfv-ice-muted mt-0.5">{assessment.patientName} — {new Date(assessment.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/relatorios/${assessment.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[rgba(0,188,212,0.12)] text-nfv-ice-light text-xs font-medium hover:bg-[#e8f0fe] transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            {tResults('generatePdf')}
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[rgba(0,188,212,0.12)] text-nfv-ice-light text-xs font-medium hover:bg-[#e8f0fe] transition-colors">
            <Share2 className="w-3.5 h-3.5" />
            {tResults('share')}
          </button>
          <Link
            href={`/avaliacao?cliente=${assessment.patientId}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-nfv-aurora text-white text-xs font-semibold shadow-nfv hover:shadow-nfv-glow transition-all"
          >
            <Camera className="w-3.5 h-3.5" />
            {tResults('newAssessment')}
          </Link>
        </div>
      </div>

      {/* Score Hero */}
      <GlassCard padding="lg" glow>
        <div className="flex flex-col items-center py-4">
          <ScoreCircle score={assessment.scores.overall} size="lg" showAnimation showClassification />
          <StatusBadge status={assessment.status} />
        </div>
      </GlassCard>

      {/* Regional Scores Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {(Object.entries(regionLabels) as [string, string][]).map(([key, label], i) => {
          const score = assessment.scores[key as keyof typeof assessment.scores] as number;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <GlassCard padding="sm" className="text-center">
                <ScoreCircle score={score} size="sm" label={label} />
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Angles Table */}
      {assessment.angles.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <AngleTable angles={assessment.angles} />
        </motion.div>
      )}

      {/* Deviations */}
      {assessment.deviations.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-lg text-nfv-ice mb-4">{tResults('deviations')}</h3>
          <div className="space-y-3">
            {assessment.deviations.map((deviation, i) => (
              <motion.div
                key={deviation.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <DeviationCard deviation={deviation} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {assessment.recommendations.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-lg text-nfv-ice mb-4">{tResults('recommendations')}</h3>
          <div className="space-y-3">
            {assessment.recommendations.map((rec, i) => (
              <motion.div
                key={rec.region}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
              >
                <GlassCard padding="md">
                  <h4 className="font-heading font-semibold text-sm text-nfv-cyan mb-3">{rec.region}</h4>
                  <div className="space-y-2">
                    {rec.exercises.map((ex, j) => (
                      <div key={j} className="flex items-start gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-nfv-cyan/10 text-nfv-cyan text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {j + 1}
                        </span>
                        <div>
                          <p className="font-medium text-nfv-ice">{ex.name}</p>
                          <p className="text-xs text-nfv-ice-muted">{ex.description}</p>
                          <p className="text-xs text-nfv-ice-medium mt-0.5">
                            {ex.frequency} {ex.sets && `• ${ex.sets} séries`} {ex.reps && `• ${ex.reps}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {assessment.deviations.length === 0 && (
        <GlassCard padding="lg" className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="font-heading font-semibold text-nfv-success">{tResults('classifications.excellent')}</p>
          <p className="text-sm text-nfv-ice-muted mt-1">{tCommon('noResults')}</p>
        </GlassCard>
      )}
    </div>
  );
}
