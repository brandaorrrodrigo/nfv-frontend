'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Trophy, AlertTriangle, Clock, Share2, ShieldAlert } from 'lucide-react';
import ScoreCircle from '@/components/ui/ScoreCircle';
import GlassCard from '@/components/ui/GlassCard';
import { CATEGORY_LABELS } from '@/lib/api/pose-analysis';
import type { CategoryType } from '@/lib/api/pose-analysis';
import {
  decodeShareToken,
  type ShareTokenPayload,
  type DecodeResult,
} from '@/lib/share-token';

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-500';
  if (score >= 75) return 'text-nfv-cyan';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-400';
}

function getScoreKey(score: number): 'elite' | 'competitive' | 'evolving' | 'beginner' {
  if (score >= 90) return 'elite';
  if (score >= 75) return 'competitive';
  if (score >= 60) return 'evolving';
  return 'beginner';
}

function ErrorScreen({
  icon: Icon,
  iconColor,
  borderColor,
  title,
  description,
  ctaLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  borderColor: string;
  title: string;
  description: string;
  ctaLabel: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1a2332] flex items-center justify-center p-4">
      <GlassCard
        padding="lg"
        className={`max-w-md text-center bg-[#1e293b] ${borderColor}`}
      >
        <Icon className={`w-12 h-12 ${iconColor} mx-auto mb-4`} />
        <h1 className="text-lg font-bold text-white mb-2">{title}</h1>
        <p className="text-sm text-gray-400">{description}</p>
        <a
          href="/register"
          className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2962ff] to-[#00bcd4] text-white text-sm font-semibold"
        >
          {ctaLabel}
        </a>
      </GlassCard>
    </div>
  );
}

export default function AnalisePublicaPage() {
  const params = useParams();
  const token = params.token as string;
  const t = useTranslations('analise');
  const [data, setData] = useState<ShareTokenPayload | null>(null);
  const [error, setError] = useState<DecodeResult | null>(null);

  useEffect(() => {
    if (!token) {
      setError({ ok: false, reason: 'invalid' });
      return;
    }
    const result = decodeShareToken(token);
    if (!result.ok) {
      setError(result);
      return;
    }
    setData(result.data);
  }, [token]);

  if (error && !error.ok) {
    if (error.reason === 'expired') {
      return (
        <ErrorScreen
          icon={Clock}
          iconColor="text-amber-400"
          borderColor="border-amber-500/30"
          title={t('expiredTitle')}
          description={t('expiredDesc')}
          ctaLabel={t('createAccountSimple')}
        />
      );
    }
    if (error.reason === 'tampered') {
      return (
        <ErrorScreen
          icon={ShieldAlert}
          iconColor="text-red-400"
          borderColor="border-red-500/30"
          title={t('tamperedTitle')}
          description={t('tamperedDesc')}
          ctaLabel={t('createAccountSimple')}
        />
      );
    }
    return (
      <ErrorScreen
        icon={AlertTriangle}
        iconColor="text-red-400"
        borderColor="border-red-500/30"
        title={t('invalidTitle')}
        description={t('invalidDesc')}
        ctaLabel={t('createAccountSimple')}
      />
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1a2332] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00bcd4]/30 border-t-[#00bcd4] rounded-full animate-spin" />
      </div>
    );
  }

  const classification = {
    label: t(`classifications.${getScoreKey(data.s)}`),
    color: getScoreColor(data.s),
  };
  const catLabel = CATEGORY_LABELS[data.c as CategoryType] ?? data.c;
  const analysisDate = new Date(data.t).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1a2332] p-4">
      <div className="max-w-lg mx-auto space-y-6 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">{t('title')}</h1>
          </div>
          <p className="text-sm text-gray-400">
            {catLabel} &mdash; {analysisDate}
          </p>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <GlassCard padding="lg" className="bg-[#1e293b] border-[#334155]">
            <div className="flex flex-col items-center gap-4">
              <ScoreCircle
                score={data.s}
                size="lg"
                label={t('scoreGeral')}
                showClassification
              />
              <div className="text-center">
                <p className={`text-lg font-bold ${classification.color}`}>
                  {classification.label}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t('categoria')} {catLabel}
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard padding="md" className="bg-[#1e293b] border-[#334155]">
            <div className="flex items-start gap-3">
              <Share2 className="w-5 h-5 text-nfv-cyan flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">{t('sharedResult')}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{t('sharedDesc')}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-center space-y-3"
        >
          <a
            href="/register"
            className="inline-flex items-center justify-center w-full py-3 rounded-2xl bg-gradient-to-r from-[#2962ff] to-[#00bcd4] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            {t('createAccount')}
          </a>
          <p className="text-[10px] text-gray-500">{t('bulletPoints')}</p>
        </motion.div>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-[10px] text-gray-600">{t('footerLine')}</p>
        </div>
      </div>
    </div>
  );
}
