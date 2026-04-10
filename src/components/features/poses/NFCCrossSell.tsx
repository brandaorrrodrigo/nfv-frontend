'use client';

import { motion } from 'framer-motion';
import { Salad, ChevronRight } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

interface NFCCrossSellProps {
  absScore?: number;
  categoria: string;
}

export default function NFCCrossSell({ absScore, categoria }: NFCCrossSellProps) {
  // Só mostra se score de abs for baixo
  if (absScore !== undefined && absScore >= 65) return null;

  const isAbsCategory = [
    'bodybuilding',
    'classic_physique',
    'bodybuilding_212',
    'womens_bodybuilding',
    'womens_physique',
  ].includes(categoria);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <GlassCard padding="md" className="border-amber-200 bg-amber-50/50">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Salad className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-nfv-ice">
              {isAbsCategory
                ? 'Definição abdominal no palco'
                : 'Nutrição para stage presence'}
            </p>
            <p className="text-xs text-nfv-ice-muted mt-1 leading-relaxed">
              {isAbsCategory
                ? 'Seu score abdominal pode melhorar com ajuste nutricional. O NutrifitCoach cria planos de cutting específicos para competição.'
                : 'A nutrição impacta diretamente seu condicionamento no palco. Conheça o NutrifitCoach para planos personalizados.'}
            </p>
            <a
              href="https://app.nutrifitcoach.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
            >
              Ver plano nutricional
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
