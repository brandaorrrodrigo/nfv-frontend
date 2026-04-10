'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Star,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { usePlans } from '@/lib/api/hooks';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { api } from '@/lib/api/client';

const FAQ = [
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim. Você pode cancelar sua assinatura a qualquer momento pelo portal de billing. O acesso continua até o fim do período pago.',
  },
  {
    q: 'Como funciona o período grátis?',
    a: '7 dias de acesso completo ao plano escolhido sem cobrança. Você só é cobrado após o período de trial.',
  },
  {
    q: 'Quais formas de pagamento são aceitas?',
    a: 'Cartão de crédito e débito via Stripe. Processamento 100% seguro com certificação PCI DSS.',
  },
];

function PlanosContent() {
  const { plans, loading } = usePlans();
  const { user } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const success  = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const hasActivePlan = user?.plan !== 'FREE';
  const isPastDue = (user as { planStatus?: string } | null)?.planStatus === 'PAST_DUE';

  const handleUpgrade = async (planType: string) => {
    if (planType === 'FREE') return;
    setError(null);
    setUpgrading(planType);
    try {
      const { url } = await api.createCheckout(planType as 'PROFESSIONAL' | 'CLINIC');
      window.location.href = url;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao iniciar checkout. Tente novamente.';
      setError(msg);
      setUpgrading(null);
    }
  };

  const handleManageBilling = async () => {
    setError(null);
    setUpgrading('portal');
    try {
      const { url } = await api.createBillingPortal();
      window.location.href = url;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao abrir portal de billing.';
      setError(msg);
      setUpgrading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast sucesso */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl max-w-2xl mx-auto"
        >
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">Assinatura ativada!</p>
            <p className="text-xs text-green-600 mt-0.5">
              Seu plano foi atualizado. Aproveite todos os recursos disponíveis.
            </p>
          </div>
        </motion.div>
      )}

      {/* Toast cancelado */}
      {canceled && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl max-w-2xl mx-auto"
        >
          <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Pagamento cancelado. Nenhuma cobrança foi feita.
          </p>
        </motion.div>
      )}

      {/* Alerta past_due */}
      {isPastDue && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl max-w-2xl mx-auto"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">Pagamento em atraso</p>
            <p className="text-xs text-red-600 mt-0.5">
              Atualize seu método de pagamento para manter o acesso.
            </p>
          </div>
          <button
            onClick={handleManageBilling}
            disabled={!!upgrading}
            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold disabled:opacity-50"
          >
            {upgrading === 'portal' ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Atualizar'}
          </button>
        </motion.div>
      )}

      {/* Erro */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 max-w-2xl mx-auto"
        >
          {error}
        </motion.div>
      )}

      {/* Header */}
      <div className="text-center">
        <h1 className="font-heading font-bold text-3xl text-nfv-ice">
          Planos e Preços
        </h1>
        <p className="text-nfv-ice-medium text-sm mt-2 max-w-lg mx-auto">
          Escolha o plano ideal para o seu negócio. 7 dias grátis nos planos pagos.
        </p>
        {hasActivePlan && (
          <button
            onClick={handleManageBilling}
            disabled={!!upgrading}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-nfv-cyan hover:underline disabled:opacity-50"
          >
            {upgrading === 'portal' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Settings className="w-3 h-3" />
            )}
            Gerenciar assinatura
          </button>
        )}
      </div>

      {/* Grid de planos */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 bg-[#f5f8fb] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto items-start">
          {plans.map((plan, i) => {
            const isCurrent = user?.plan === plan.type;
            const isPopular = plan.popular;
            const isLoading = upgrading === plan.type;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-nfv-aurora text-white text-xs font-bold shadow-nfv-glow">
                      <Star className="w-3 h-3" />
                      Mais popular
                    </span>
                  </div>
                )}

                <GlassCard
                  padding="lg"
                  glow={isPopular}
                  className={`${isPopular ? 'border-nfv-cyan/30 ring-1 ring-nfv-cyan/10' : ''} ${isCurrent ? 'ring-2 ring-green-400/30' : ''}`}
                >
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h3 className="font-heading font-bold text-xl text-nfv-ice">
                      {plan.name}
                    </h3>
                    <div className="mt-3">
                      {plan.price === 0 ? (
                        <span className="font-heading font-bold text-3xl text-nfv-ice">
                          Grátis
                        </span>
                      ) : (
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-sm text-nfv-ice-muted">R$</span>
                          <span className="font-heading font-bold text-4xl text-nfv-ice">
                            {plan.price}
                          </span>
                          <span className="text-sm text-nfv-ice-muted">/{plan.period}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-nfv-ice-muted mt-2">
                      {plan.assessmentsPerMonth === null
                        ? 'Avaliações ilimitadas'
                        : `${plan.assessmentsPerMonth} avaliações/mês`}
                    </p>
                    {plan.price > 0 && (
                      <p className="text-[10px] text-green-600 font-semibold mt-1">
                        ✓ 7 dias grátis para testar
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-start gap-2.5 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-nfv-ice-muted/40 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            feature.included
                              ? 'text-nfv-ice-light'
                              : 'text-nfv-ice-muted/60'
                          }
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {isCurrent ? (
                    <div className="w-full py-3 rounded-xl border border-green-400/30 text-green-600 text-sm font-semibold text-center flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Plano atual
                    </div>
                  ) : plan.type === 'FREE' ? (
                    <div className="w-full py-3 rounded-xl border border-[#d0dbe6] text-nfv-ice-muted text-sm text-center">
                      Plano gratuito
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.type)}
                      disabled={!!upgrading}
                      className={`w-full py-3 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                        isPopular
                          ? 'bg-nfv-aurora shadow-nfv hover:shadow-nfv-glow'
                          : 'bg-[#1e293b] hover:bg-[#334155]'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      {isLoading ? 'Redirecionando...' : 'Começar 7 dias grátis'}
                    </button>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Garantia */}
      <div className="text-center max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2 text-xs text-nfv-ice-muted">
          <Shield className="w-3.5 h-3.5 text-nfv-cyan" />
          <span>
            Pagamento seguro via Stripe &bull; Cancele a qualquer momento &bull; Sem multa
          </span>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto pt-4">
        <h2 className="font-heading font-bold text-xl text-nfv-ice text-center mb-6">
          Dúvidas frequentes
        </h2>
        <div className="space-y-3">
          {FAQ.map((faq, i) => (
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

export default function PlanosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-nfv-cyan animate-spin" />
        </div>
      }
    >
      <PlanosContent />
    </Suspense>
  );
}
