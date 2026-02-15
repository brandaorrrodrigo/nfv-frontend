'use client';

import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

export default function GlassCard({
  children,
  className = '',
  padding = 'md',
  glow = false,
  hoverable = false,
  onClick,
}: GlassCardProps) {
  const baseClasses = `
    relative rounded-2xl
    bg-white/75 backdrop-blur-xl
    border border-[rgba(0,188,212,0.12)]
    ${paddingMap[padding]}
    ${glow ? 'shadow-nfv-glow border-nfv-cyan/20' : 'shadow-nfv-frost'}
    ${hoverable ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  if (hoverable) {
    return (
      <motion.div
        className={baseClasses}
        onClick={onClick}
        whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0, 188, 212, 0.12)' }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
}
