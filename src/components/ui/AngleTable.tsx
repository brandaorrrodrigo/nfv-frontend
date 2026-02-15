'use client';

import { useTranslations } from 'next-intl';
import type { NFVAngle } from '@/lib/api/types';
import GlassCard from './GlassCard';
import SeverityBadge from './SeverityBadge';

interface AngleTableProps {
  angles: NFVAngle[];
  title?: string;
}

export default function AngleTable({ angles, title }: AngleTableProps) {
  const t = useTranslations('results');
  const displayTitle = title || t('angles');
  return (
    <GlassCard padding="none">
      {displayTitle && (
        <div className="px-5 py-3 border-b border-[rgba(0,188,212,0.1)]">
          <h3 className="font-heading font-semibold text-sm text-nfv-ice">{displayTitle}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(0,188,212,0.1)]">
              <th className="text-left px-5 py-3 text-xs font-medium text-nfv-ice-muted uppercase tracking-wider">{t('angle')}</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-nfv-ice-muted uppercase tracking-wider">{t('value')}</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-nfv-ice-muted uppercase tracking-wider">{t('reference')}</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-nfv-ice-muted uppercase tracking-wider">{t('deviation')}</th>
              <th className="text-center px-3 py-3 text-xs font-medium text-nfv-ice-muted uppercase tracking-wider">{t('severity.label')}</th>
            </tr>
          </thead>
          <tbody>
            {angles.map((angle, i) => (
              <tr
                key={i}
                className="border-b border-[rgba(0,188,212,0.06)] hover:bg-[#e8f0fe] transition-colors"
              >
                <td className="px-5 py-3 text-nfv-ice-light font-medium">{angle.joint}</td>
                <td className="text-center px-3 py-3 font-mono text-nfv-ice">{angle.measured.toFixed(1)}°</td>
                <td className="text-center px-3 py-3 font-mono text-nfv-ice-medium">{angle.ideal.toFixed(1)}°</td>
                <td className="text-center px-3 py-3 font-mono text-nfv-ice">{angle.deviation.toFixed(1)}°</td>
                <td className="text-center px-3 py-3">
                  <SeverityBadge severity={angle.severity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
