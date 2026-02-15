'use client';

import { useTranslations } from 'next-intl';
import type { NFVDeviation } from '@/lib/api/types';
import GlassCard from './GlassCard';
import SeverityBadge from './SeverityBadge';
import { AlertTriangle } from 'lucide-react';

interface DeviationCardProps {
  deviation: NFVDeviation;
}

const borderColors: Record<string, string> = {
  normal: 'border-l-nfv-success',
  mild: 'border-l-nfv-warning',
  moderate: 'border-l-orange-400',
  severe: 'border-l-nfv-danger',
};

export default function DeviationCard({ deviation }: DeviationCardProps) {
  const t = useTranslations('results');
  return (
    <GlassCard padding="md" className={`border-l-[3px] ${borderColors[deviation.severity] || 'border-l-nfv-ice-muted'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-nfv-ice-muted flex-shrink-0" />
          <h4 className="font-heading font-semibold text-sm text-nfv-ice">{deviation.name}</h4>
        </div>
        <SeverityBadge severity={deviation.severity} />
      </div>

      <p className="text-sm text-nfv-ice-light leading-relaxed mb-3">{deviation.description}</p>

      {deviation.angleDeviation !== undefined && (
        <p className="text-xs text-nfv-ice-muted mb-3">
          {t('deviation')}: <span className="font-mono text-nfv-ice">{deviation.angleDeviation.toFixed(1)}°</span>
        </p>
      )}

      <div className="bg-cyan-50 border border-[rgba(0,188,212,0.12)] rounded-lg px-3 py-2.5">
        <p className="text-xs font-medium text-nfv-cyan mb-1">{t('recommendation')}:</p>
        <p className="text-xs text-nfv-ice-light leading-relaxed">{deviation.recommendation}</p>
      </div>
    </GlassCard>
  );
}
