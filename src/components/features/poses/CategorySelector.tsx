'use client';

import { motion } from 'framer-motion';
import { Trophy, Star, Dumbbell, Sparkles, Users } from 'lucide-react';
import type { CategoryType } from '@/lib/api/pose-analysis';
import {
  CATEGORY_LABELS,
  CATEGORY_POSES,
  CATEGORY_GENDER,
} from '@/lib/api/pose-analysis';

const CATEGORY_ICONS: Record<CategoryType, React.ReactNode> = {
  mens_physique: <Users className="w-5 h-5" />,
  bikini: <Sparkles className="w-5 h-5" />,
  classic_physique: <Trophy className="w-5 h-5" />,
  wellness: <Star className="w-5 h-5" />,
  bodybuilding: <Dumbbell className="w-5 h-5" />,
  figure: <Star className="w-5 h-5" />,
  womens_physique: <Trophy className="w-5 h-5" />,
};

const CATEGORY_COLORS: Record<CategoryType, string> = {
  mens_physique: 'from-blue-500/20 to-blue-600/10 border-blue-400/20',
  bikini: 'from-pink-500/20 to-pink-600/10 border-pink-400/20',
  classic_physique: 'from-amber-500/20 to-amber-600/10 border-amber-400/20',
  wellness: 'from-green-500/20 to-green-600/10 border-green-400/20',
  bodybuilding: 'from-red-500/20 to-red-600/10 border-red-400/20',
  figure: 'from-purple-500/20 to-purple-600/10 border-purple-400/20',
  womens_physique: 'from-rose-500/20 to-rose-600/10 border-rose-400/20',
};

const CATEGORY_ICON_COLORS: Record<CategoryType, string> = {
  mens_physique: 'text-blue-400',
  bikini: 'text-pink-400',
  classic_physique: 'text-amber-400',
  wellness: 'text-green-400',
  bodybuilding: 'text-red-400',
  figure: 'text-purple-400',
  womens_physique: 'text-rose-400',
};

const GENDER_LABEL: Record<string, string> = {
  M: 'Masculino',
  F: 'Feminino',
  MF: 'Misto',
};

interface CategorySelectorProps {
  selected: CategoryType | null;
  onSelect: (cat: CategoryType) => void;
}

const CATEGORIES: CategoryType[] = [
  'mens_physique',
  'classic_physique',
  'bodybuilding',
  'bikini',
  'wellness',
  'figure',
  'womens_physique',
];

export default function CategorySelector({
  selected,
  onSelect,
}: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {CATEGORIES.map((cat, i) => (
        <motion.button
          key={cat}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(cat)}
          className={`
            relative flex items-center gap-3 p-4 rounded-2xl border text-left
            bg-gradient-to-br transition-all duration-200
            ${
              selected === cat
                ? `${CATEGORY_COLORS[cat]} shadow-lg scale-[1.02]`
                : 'from-[#f5f8fb] to-white border-[#d0dbe6] hover:border-nfv-cyan/30 hover:from-[#e8f0fe]'
            }
          `}
        >
          {/* Icon */}
          <div
            className={`
            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${selected === cat ? CATEGORY_ICON_COLORS[cat] : 'text-nfv-ice-muted'}
            ${selected === cat ? 'bg-white/40' : 'bg-[#e8f0fe]'}
          `}
          >
            {CATEGORY_ICONS[cat]}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold truncate ${selected === cat ? 'text-nfv-ice' : 'text-nfv-ice-medium'}`}
            >
              {CATEGORY_LABELS[cat]}
            </p>
            <p className="text-xs text-nfv-ice-muted mt-0.5">
              {CATEGORY_POSES[cat]} poses •{' '}
              {GENDER_LABEL[CATEGORY_GENDER[cat]]}
            </p>
          </div>

          {/* Selected indicator */}
          {selected === cat && (
            <motion.div
              layoutId="cat-indicator"
              className="w-2 h-2 rounded-full bg-nfv-cyan flex-shrink-0"
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
