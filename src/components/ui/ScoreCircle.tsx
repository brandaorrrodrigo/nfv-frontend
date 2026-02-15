'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { getScoreColor, getScoreClassification, getScoreLabel } from '@/lib/api/types';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showAnimation?: boolean;
  showClassification?: boolean;
}

const sizeConfig = {
  sm: { diameter: 64, stroke: 4, fontSize: 'text-base', labelSize: 'text-[9px]' },
  md: { diameter: 100, stroke: 5, fontSize: 'text-2xl', labelSize: 'text-xs' },
  lg: { diameter: 160, stroke: 6, fontSize: 'text-4xl', labelSize: 'text-sm' },
};

export default function ScoreCircle({
  score,
  size = 'md',
  label,
  showAnimation = true,
  showClassification = false,
}: ScoreCircleProps) {
  const config = sizeConfig[size];
  const radius = (config.diameter - config.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const offset = circumference * (1 - progress);
  const color = getScoreColor(score);
  const classification = getScoreClassification(score);

  const motionScore = useMotionValue(0);
  const displayScore = useTransform(motionScore, (v) => Math.round(v));
  const [displayed, setDisplayed] = useState(showAnimation ? 0 : score);

  useEffect(() => {
    if (showAnimation) {
      const controls = animate(motionScore, score, {
        duration: 1.5,
        ease: 'easeOut',
        onUpdate: (v) => setDisplayed(Math.round(v)),
      });
      return controls.stop;
    } else {
      setDisplayed(score);
    }
  }, [score, showAnimation, motionScore]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: config.diameter, height: config.diameter }}>
        <svg
          width={config.diameter}
          height={config.diameter}
          viewBox={`0 0 ${config.diameter} ${config.diameter}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke="rgba(0,188,212,0.1)"
            strokeWidth={config.stroke}
          />
          {/* Progress circle */}
          <motion.circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: showAnimation ? 1.5 : 0, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-heading font-bold ${config.fontSize}`} style={{ color }}>
            {displayed}
          </span>
        </div>
      </div>
      {label && <span className={`text-nfv-ice-medium ${config.labelSize} text-center`}>{label}</span>}
      {showClassification && (
        <span className={`${config.labelSize} font-medium`} style={{ color }}>
          {getScoreLabel(classification)}
        </span>
      )}
    </div>
  );
}
