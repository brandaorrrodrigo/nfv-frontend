'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Mail, Phone, Scale, Ruler, Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';
import ScoreCircle from '@/components/ui/ScoreCircle';
import StatusBadge from '@/components/ui/StatusBadge';
import { usePatient } from '@/lib/api/hooks';
import { getScoreColor } from '@/lib/api/types';

function getAge(birthDate: string) {
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n.charAt(0)).join('').toUpperCase();
}

function calcBMI(weight: number, heightCm: number) {
  const heightM = heightCm / 100;
  return (weight / (heightM * heightM)).toFixed(1);
}

export default function ClientePerfilPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('clients');
  const tCommon = useTranslations('common');
  const tAssessment = useTranslations('assessment');
  const { id } = use(params);
  const { patient, assessments, loading } = usePatient(id);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[#f5f8fb] rounded animate-pulse" />
        <div className="h-48 bg-[#f5f8fb] rounded-2xl animate-pulse" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#f5f8fb] rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-16">
        <p className="text-nfv-ice-medium">{t('noClientsFound')}</p>
        <Link href="/clientes" className="text-nfv-cyan text-sm hover:underline mt-2 inline-block">
          {tCommon('back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="p-2 rounded-lg text-nfv-ice-medium hover:text-nfv-ice hover:bg-[#e8f0fe] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-heading font-bold text-2xl text-nfv-ice">{t('personalInfo')}</h1>
      </div>

      {/* Patient Info Card */}
      <GlassCard padding="lg">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-nfv-aurora/20 flex items-center justify-center text-nfv-cyan font-heading font-bold text-2xl flex-shrink-0">
            {getInitials(patient.name)}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h2 className="font-heading font-bold text-xl text-nfv-ice">{patient.name}</h2>
              <p className="text-sm text-nfv-ice-medium">
                {patient.birthDate ? `${getAge(patient.birthDate)} ${t('age')}` : ''}
                {patient.birthDate && patient.gender ? ' • ' : ''}
                {patient.gender === 'MALE' ? t('genders.MALE') : patient.gender === 'FEMALE' ? t('genders.FEMALE') : patient.gender === 'OTHER' ? t('genders.OTHER') : ''}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-nfv-ice-medium">
              {patient.height && <span className="flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" />{patient.height} cm</span>}
              {patient.weight && <span className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" />{patient.weight} kg</span>}
              {patient.weight && patient.height && <span className="flex items-center gap-1.5">{t('bmi')}: {calcBMI(patient.weight, patient.height)}</span>}
              {patient.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{patient.phone}</span>}
              {patient.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{patient.email}</span>}
            </div>

            {patient.notes && <p className="text-sm text-nfv-ice-muted bg-[#f5f8fb] rounded-lg px-3 py-2">{patient.notes}</p>}
          </div>

          <Link
            href={`/avaliacao?cliente=${patient.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all flex-shrink-0"
          >
            <Camera className="w-4 h-4" />
            {tAssessment('title')}
          </Link>
        </div>
      </GlassCard>

      {/* Assessments Timeline */}
      <div>
        <h3 className="font-heading font-semibold text-lg text-nfv-ice mb-4">{t('assessmentHistory')}</h3>

        {assessments.length === 0 ? (
          <GlassCard padding="lg" className="text-center">
            <Camera className="w-12 h-12 text-nfv-ice-muted/40 mx-auto mb-3" />
            <p className="text-nfv-ice-medium text-sm">{t('noClients')}</p>
            <Link
              href={`/avaliacao?cliente=${patient.id}`}
              className="inline-flex items-center gap-1 text-nfv-cyan text-sm hover:underline mt-2"
            >
              {t('addFirst')}
            </Link>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {assessments.map((assessment, i) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/avaliacao/${assessment.id}`}>
                  <GlassCard hoverable padding="md">
                    <div className="flex items-center gap-4">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getScoreColor(assessment.scores.overall) }} />
                        {i < assessments.length - 1 && <div className="w-0.5 h-8 bg-[rgba(0,188,212,0.1)] mt-1" />}
                      </div>

                      <ScoreCircle score={assessment.scores.overall} size="sm" />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-nfv-ice">{assessment.type === 'POSTURAL' ? tAssessment('types.POSTURAL') : tAssessment('types.BIOMECHANICAL')} — {assessment.view.replace('_', ' ')}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3 h-3 text-nfv-ice-muted" />
                          <span className="text-xs text-nfv-ice-muted">
                            {new Date(assessment.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <StatusBadge status={assessment.status} />
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
