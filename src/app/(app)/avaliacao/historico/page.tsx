'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import ScoreCircle from '@/components/ui/ScoreCircle';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAssessments } from '@/lib/api/hooks';
import type { NFVAssessment } from '@/lib/api/types';

type SortField = 'date' | 'patient' | 'score' | 'type';
type SortDir = 'asc' | 'desc';

export default function HistoricoPage() {
  const t = useTranslations('history');
  const tAssessment = useTranslations('assessment');
  const tCommon = useTranslations('common');
  const tReports = useTranslations('reports');
  const { data, loading } = useAssessments();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  let assessments = data?.data || [];

  // Filter
  if (search) {
    assessments = assessments.filter((a) =>
      a.patientName.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Sort
  assessments = [...assessments].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'date': return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'patient': return dir * a.patientName.localeCompare(b.patientName);
      case 'score': return dir * (a.scores.overall - b.scores.overall);
      case 'type': return dir * a.type.localeCompare(b.type);
      default: return 0;
    }
  });

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-nfv-ice-muted uppercase tracking-wider hover:text-nfv-ice-light transition-colors"
    >
      {children}
      <ArrowUpDown className={`w-3 h-3 ${sortField === field ? 'text-nfv-cyan' : ''}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <h1 className="font-heading font-bold text-2xl text-nfv-ice">{t('title')}</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nfv-ice-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tCommon('search')}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-[#d0dbe6] text-nfv-ice placeholder:text-nfv-ice-muted focus:outline-none focus:border-nfv-cyan/40 text-sm"
        />
      </div>

      {/* Table */}
      <GlassCard padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,188,212,0.1)]">
                <th className="text-left px-5 py-3"><SortHeader field="date">{tReports('date')}</SortHeader></th>
                <th className="text-left px-3 py-3"><SortHeader field="patient">{tReports('client')}</SortHeader></th>
                <th className="text-center px-3 py-3"><SortHeader field="type">{tAssessment('assessmentType')}</SortHeader></th>
                <th className="text-center px-3 py-3"><SortHeader field="score">Score</SortHeader></th>
                <th className="text-center px-3 py-3 text-xs font-medium text-nfv-ice-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-[rgba(0,188,212,0.06)]">
                    <td colSpan={5} className="px-5 py-4"><div className="h-4 bg-[#f5f8fb] rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : assessments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-nfv-ice-muted">
                    {tCommon('noResults')}
                  </td>
                </tr>
              ) : (
                assessments.map((assessment, i) => (
                  <motion.tr
                    key={assessment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[rgba(0,188,212,0.06)] hover:bg-[#e8f0fe] transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/avaliacao/${assessment.id}`}
                  >
                    <td className="px-5 py-3 text-nfv-ice-light">
                      {new Date(assessment.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-3 py-3 font-medium text-nfv-ice">{assessment.patientName}</td>
                    <td className="text-center px-3 py-3 text-nfv-ice-medium">
                      {tAssessment(`types.${assessment.type}`)}
                    </td>
                    <td className="text-center px-3 py-3">
                      <div className="flex justify-center">
                        <ScoreCircle score={assessment.scores.overall} size="sm" />
                      </div>
                    </td>
                    <td className="text-center px-3 py-3">
                      <StatusBadge status={assessment.status} />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
