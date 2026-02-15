'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Plus, UserCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';
import ScoreCircle from '@/components/ui/ScoreCircle';
import { usePatients } from '@/lib/api/hooks';

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n.charAt(0)).join('').toUpperCase();
}

function getAge(birthDate: string) {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export default function ClientesPage() {
  const t = useTranslations('clients');
  const { patients, loading, searchPatients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    searchPatients(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-heading font-bold text-2xl text-nfv-ice">{t('title')}</h1>
        <Link
          href="/clientes/novo"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('newClient')}
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nfv-ice-muted" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-[#d0dbe6] text-nfv-ice placeholder:text-nfv-ice-muted focus:outline-none focus:border-nfv-cyan/40 focus:shadow-nfv transition-all text-sm"
        />
      </div>

      {/* Client Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-[#f5f8fb] animate-pulse" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UserCircle className="w-16 h-16 text-nfv-ice-muted/40 mb-4" />
          <p className="text-nfv-ice-medium font-medium">{searchTerm ? t('noClientsFound') : t('noClients')}</p>
          <p className="text-nfv-ice-muted text-sm mt-1">
            {searchTerm ? t('tryOtherSearch') : t('addFirst')}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient, i) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/clientes/${patient.id}`}>
                <GlassCard hoverable padding="md">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-nfv-aurora/20 flex items-center justify-center text-nfv-cyan font-heading font-bold text-sm flex-shrink-0">
                      {getInitials(patient.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-nfv-ice truncate">{patient.name}</p>
                      <p className="text-xs text-nfv-ice-muted mt-0.5">
                        {patient.birthDate ? `${getAge(patient.birthDate)} ${t('age')}` : ''}
                        {patient.birthDate && patient.gender ? ' • ' : ''}
                        {patient.gender === 'MALE' ? t('genders.MALE') : patient.gender === 'FEMALE' ? t('genders.FEMALE') : patient.gender === 'OTHER' ? t('genders.OTHER') : ''}
                      </p>
                    </div>
                    {patient.lastScore !== undefined && (
                      <ScoreCircle score={patient.lastScore} size="sm" />
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(0,188,212,0.1)]">
                    <span className="text-[11px] text-nfv-ice-muted">
                      {patient.totalAssessments} {patient.totalAssessments === 1 ? t('assessment') : t('assessments')}
                    </span>
                    {patient.lastAssessmentDate && (
                      <span className="text-[11px] text-nfv-ice-muted">
                        {t('last')}: {new Date(patient.lastAssessmentDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
