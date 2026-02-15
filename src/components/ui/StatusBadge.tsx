'use client';

import { useTranslations } from 'next-intl';
import type { NFVAssessmentStatus } from '@/lib/api/types';

interface StatusBadgeProps {
  status: NFVAssessmentStatus;
  label?: string;
}

const statusStyles: Record<NFVAssessmentStatus, { bg: string; text: string; animate?: string }> = {
  PENDING: { bg: 'bg-gray-100', text: 'text-gray-600' },
  PROCESSING: { bg: 'bg-cyan-50', text: 'text-cyan-700', animate: 'animate-pulse' },
  COMPLETED: { bg: 'bg-green-50', text: 'text-green-700' },
  FAILED: { bg: 'bg-red-50', text: 'text-red-700' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const t = useTranslations('assessment');
  const config = statusStyles[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${config.animate || ''}`}>
      {label || t(`status.${status}`)}
    </span>
  );
}
