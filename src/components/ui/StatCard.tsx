'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import GlassCard from './GlassCard';

interface StatCardProps {
  title: string;
  value: number;
  format?: 'number' | 'decimal' | 'percent';
  icon: React.ReactNode;
  iconColor?: string;
  change?: number; // percentage change
  delay?: number;
}

export default function StatCard({
  title,
  value,
  format = 'number',
  icon,
  iconColor = '#00bcd4',
  change,
  delay = 0,
}: StatCardProps) {
  const t = useTranslations('dashboard');
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplayed(eased * value);
      if (progress < 1) requestAnimationFrame(step);
    };
    const timer = setTimeout(() => requestAnimationFrame(step), delay * 1000);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const formatValue = (v: number) => {
    if (format === 'decimal') return v.toFixed(1);
    if (format === 'percent') return Math.round(v) + '%';
    return Math.round(v).toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <GlassCard padding="md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-nfv-ice-muted text-xs font-medium uppercase tracking-wider mb-2">{title}</p>
            <p className="font-heading font-bold text-3xl text-nfv-ice">{formatValue(displayed)}</p>
          </div>
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl"
            style={{ backgroundColor: `${iconColor}15`, color: iconColor }}
          >
            {icon}
          </div>
        </div>
        {change !== undefined && (
          <div className="flex items-center gap-1 mt-3 text-xs">
            {change > 0 ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-nfv-success" />
                <span className="text-nfv-success">+{change}%</span>
              </>
            ) : change < 0 ? (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-nfv-danger" />
                <span className="text-nfv-danger">{change}%</span>
              </>
            ) : (
              <>
                <Minus className="w-3.5 h-3.5 text-nfv-ice-muted" />
                <span className="text-nfv-ice-muted">0%</span>
              </>
            )}
            <span className="text-nfv-ice-muted ml-1">{t('vsLastMonth')}</span>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
