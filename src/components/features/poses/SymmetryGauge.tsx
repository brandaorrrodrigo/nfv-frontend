'use client';

import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

interface SymmetryGaugeProps {
  score: number; // 0–100
  label?: string;
  showHistory?: number[]; // scores anteriores para sparkline
}

function getConfig(score: number) {
  if (score >= 90)
    return {
      color: '#00c853',
      label: 'Excelente',
      icon: <ShieldCheck className="w-5 h-5" />,
    };
  if (score >= 75)
    return {
      color: '#00bcd4',
      label: 'Bom',
      icon: <Shield className="w-5 h-5" />,
    };
  if (score >= 60)
    return {
      color: '#ff9100',
      label: 'Regular',
      icon: <ShieldAlert className="w-5 h-5" />,
    };
  return {
    color: '#ff1744',
    label: 'Atenção',
    icon: <ShieldAlert className="w-5 h-5" />,
  };
}

export default function SymmetryGauge({
  score,
  label = 'Simetria Geral',
  showHistory = [],
}: SymmetryGaugeProps) {
  const config = getConfig(score);
  const radius = 54;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const offset = circumference * (1 - progress);
  const size = (radius + stroke) * 2;

  const lastEight = showHistory.slice(-8);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* SVG Gauge */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0,188,212,0.1)"
            strokeWidth={stroke}
          />
          {/* Progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={config.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${config.color}40)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold text-2xl" style={{ color: config.color }}>
            {score}
          </span>
          <span className="text-[9px] text-nfv-ice-muted">/100</span>
        </div>
      </div>

      {/* Label + classification */}
      <div className="text-center">
        <p className="text-sm font-medium text-nfv-ice">{label}</p>
        <div
          className="flex items-center justify-center gap-1 mt-1"
          style={{ color: config.color }}
        >
          {config.icon}
          <span className="text-xs font-semibold">{config.label}</span>
        </div>
      </div>

      {/* Mini history */}
      {lastEight.length > 1 && (
        <div className="flex items-end gap-1 h-8">
          {lastEight.map((s, i) => (
            <div
              key={i}
              className="w-2.5 rounded-sm transition-all"
              style={{
                height: `${Math.max(4, (s / 100) * 32)}px`,
                backgroundColor: getConfig(s).color,
                opacity: 0.5 + (i / Math.max(1, lastEight.length)) * 0.5,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
