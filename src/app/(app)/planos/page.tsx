'use client';

import { motion } from 'framer-motion';
import { Check, X, Star, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';
import { usePlans } from '@/lib/api/hooks';
import { useAuthContext } from '@/components/providers/AuthProvider';

export default function PlanosPage() {
  const { plans, loading } = usePlans();
  const { user } = useAuthContext();
  const t = useTranslations('plans');

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-heading font-bold text-3xl text-nfv-ice">{t('title')}</h1>
        <p className="text-nfv-ice-medium text-sm mt-2 max-w-lg mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[...Array(3)].map((_, i) => <div key={i} className="h-96 bg-[#f5f8fb] rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto items-start">
          {plans.map((plan, i) => {
            const isCurrent = user?.plan === plan.type;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-nfv-aurora text-white text-xs font-bold shadow-nfv-glow">
                      <Star className="w-3 h-3" />
                      {t('popular')}
                    </span>
                  </div>
                )}

                <GlassCard
                  padding="lg"
                  glow={isPopular}
                  className={`${isPopular ? 'border-nfv-cyan/30 ring-1 ring-nfv-cyan/10' : ''} ${isCurrent ? 'ring-2 ring-nfv-success/30' : ''}`}
                >
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="font-heading font-bold text-xl text-nfv-ice">{plan.name}</h3>
                    <div className="mt-3">
                      {plan.price === 0 ? (
                        <span className="font-heading font-bold text-3xl text-nfv-ice">{t('free')}</span>
                      ) : (
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-sm text-nfv-ice-muted">R$</span>
                          <span className="font-heading font-bold text-4xl text-nfv-ice">{plan.price}</span>
                          <span className="text-sm text-nfv-ice-muted">/{plan.period}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-nfv-ice-muted mt-2">
                      {plan.assessmentsPerMonth === null
                        ? t('features.unlimited')
                        : `${plan.assessmentsPerMonth} ${t('features.assessmentsMonth')}`}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-start gap-2.5 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-nfv-success flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-nfv-ice-muted/40 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-nfv-ice-light' : 'text-nfv-ice-muted/60'}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {isCurrent ? (
                    <div className="w-full py-3 rounded-xl border border-nfv-success/30 text-nfv-success text-sm font-semibold text-center">
                      {t('currentPlan')}
                    </div>
                  ) : isPopular ? (
                    <button className="w-full py-3 rounded-xl bg-nfv-aurora text-white text-sm font-bold shadow-nfv hover:shadow-nfv-glow transition-all flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" />
                      {t('upgrade')}
                    </button>
                  ) : (
                    <button className="w-full py-3 rounded-xl border border-[rgba(0,188,212,0.12)] text-nfv-ice-light text-sm font-medium hover:bg-[#e8f0fe] transition-colors">
                      {plan.price === 0 ? t('free') : t('upgrade')}
                    </button>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* FAQ */}
      <div className="max-w-2xl mx-auto pt-8">
        <h2 className="font-heading font-bold text-xl text-nfv-ice text-center mb-6">{t('faq.title')}</h2>
        <div className="space-y-3">
          {[
            { q: t('faq.q1'), a: t('faq.a1') },
            { q: t('faq.q2'), a: t('faq.a2') },
            { q: t('faq.q3'), a: t('faq.a3') },
          ].map((faq, i) => (
            <GlassCard key={i} padding="md">
              <h3 className="font-medium text-sm text-nfv-ice mb-1">{faq.q}</h3>
              <p className="text-xs text-nfv-ice-muted leading-relaxed">{faq.a}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
