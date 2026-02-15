'use client';

import { useTranslations } from 'next-intl';
import type { NFVSeverity } from '@/lib/api/types';

interface SeverityBadgeProps {
  severity: NFVSeverity;
  label?: string;
}

const severityStyles: Record<NFVSeverity, { bg: string; text: string; dot: string }> = {
  normal: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  mild: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  moderate: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  severe: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export default function SeverityBadge({ severity, label }: SeverityBadgeProps) {
  const t = useTranslations('results');
  const config = severityStyles[severity];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${severity === 'severe' ? 'animate-pulse' : ''}`} />
      {label || t(`severity.${severity}`)}
    </span>
  );
}
