'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX, Activity } from 'lucide-react';
import type { DetectedAsymmetry } from '@/lib/api/pose-analysis';

const MASKABILITY_CONFIG = {
  total: {
    icon: <ShieldCheck className="w-4 h-4" />,
    label: 'Totalmente mascarável',
    color: 'text-green-500',
    bg: 'bg-green-50 border-green-200',
  },
  partial: {
    icon: <ShieldAlert className="w-4 h-4" />,
    label: 'Parcialmente mascarável',
    color: 'text-amber-500',
    bg: 'bg-amber-50 border-amber-200',
  },
  impossible: {
    icon: <ShieldX className="w-4 h-4" />,
    label: 'Não mascarável',
    color: 'text-red-400',
    bg: 'bg-red-50 border-red-200',
  },
};

const IMPACT_COLOR: Record<string, string> = {
  alto: 'bg-red-100 text-red-600',
  medio: 'bg-amber-100 text-amber-600',
  baixo: 'bg-blue-100 text-blue-600',
};

interface AsymmetryAlertProps {
  asymmetry: DetectedAsymmetry;
  index: number;
}

export default function AsymmetryAlert({
  asymmetry,
  index,
}: AsymmetryAlertProps) {
  const config = MASKABILITY_CONFIG[asymmetry.mascarabilidade];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className={`flex items-start gap-3 p-3 rounded-xl border ${config.bg}`}
    >
      {/* Magnitude bar */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
        <Activity className={`w-4 h-4 ${config.color}`} />
        <div className="w-1.5 h-12 rounded-full bg-gray-200 overflow-hidden">
          <motion.div
            className={`w-full rounded-full ${
              asymmetry.magnitude > 60
                ? 'bg-red-400'
                : asymmetry.magnitude > 30
                  ? 'bg-amber-400'
                  : 'bg-green-400'
            }`}
            initial={{ height: '0%' }}
            animate={{ height: `${asymmetry.magnitude}%` }}
            transition={{ delay: index * 0.07 + 0.3, duration: 0.6 }}
            style={{ originY: 1 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-nfv-ice">
          {asymmetry.descricao_pt}
        </p>
        <p className="text-xs text-nfv-ice-muted mt-0.5 capitalize">
          Região: {asymmetry.regiao} • Lado: {asymmetry.lado_afetado}
        </p>

        <div className="flex items-center gap-2 mt-2">
          {/* Maskability badge */}
          <span
            className={`flex items-center gap-1 text-xs font-medium ${config.color}`}
          >
            {config.icon}
            {config.label}
          </span>
        </div>

        {/* Impact badge */}
        <span
          className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${IMPACT_COLOR[asymmetry.impacto_competitivo] ?? 'bg-gray-100 text-gray-600'}`}
        >
          Impacto {asymmetry.impacto_competitivo}
        </span>
      </div>
    </motion.div>
  );
}
