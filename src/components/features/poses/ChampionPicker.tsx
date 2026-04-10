'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

export interface Champion {
  id: string;
  nome: string;
  categoria: string;
  titulos: string;
  estilo: string;
  pose_forte: string;
  angulos: Record<string, number>;
}

const CHAMPIONS_BY_CATEGORY: Record<string, Champion[]> = {
  mens_physique: [
    { id: 'ryan_terry', nome: 'Ryan Terry', categoria: 'Mens Physique', titulos: 'Mr. Olympia 2024', estilo: 'Proporção e simetria perfeitas', pose_forte: 'Quarter Turn Front', angulos: { cotovelo_esq: 122.5, cotovelo_dir: 122.6, joelho_esq: 172.1, joelho_dir: 171.4, abducao_ombro_esq: 36.5, abducao_ombro_dir: 34.2, nivelamento_ombros: 86.9 } },
    { id: 'brandon_hendrickson', nome: 'Brandon Hendrickson', categoria: 'Mens Physique', titulos: '4x Mr. Olympia', estilo: 'Cintura estreita e posing dinâmico', pose_forte: 'Back Pose', angulos: { cotovelo_esq: 132.3, cotovelo_dir: 134.3, joelho_esq: 173.7, joelho_dir: 173.2, abducao_ombro_esq: 29.7, abducao_ombro_dir: 35.4, nivelamento_ombros: 88.3 } },
    { id: 'raymont_edmonds', nome: 'Raymont Edmonds', categoria: 'Mens Physique', titulos: 'Top 5 Olympia 2024', estilo: 'Físico atlético e condicionado', pose_forte: 'Quarter Turn Side', angulos: { cotovelo_esq: 128.1, cotovelo_dir: 125.6, joelho_esq: 167.4, joelho_dir: 166.6, abducao_ombro_esq: 26.4, abducao_ombro_dir: 23.8, nivelamento_ombros: 89.0 } },
  ],
  classic_physique: [
    { id: 'cbum', nome: 'Chris Bumstead', categoria: 'Classic Physique', titulos: '6x Mr. Olympia (aposentado)', estilo: 'Era dourada — proporção perfeita', pose_forte: 'Side Chest', angulos: { cotovelo_esq: 88.0, cotovelo_dir: 87.5, joelho_esq: 170.2, joelho_dir: 168.9, abducao_ombro_esq: 85.3, abducao_ombro_dir: 86.1, nivelamento_ombros: 89.5 } },
    { id: 'ramon_dino', nome: 'Ramon Dino', categoria: 'Classic Physique', titulos: 'Mr. Olympia 2024', estilo: 'Musculatura densa e vacuum impressionante', pose_forte: 'Front Double Biceps', angulos: { cotovelo_esq: 89.2, cotovelo_dir: 88.8, joelho_esq: 169.5, joelho_dir: 170.1, abducao_ombro_esq: 87.0, abducao_ombro_dir: 86.5, nivelamento_ombros: 90.0 } },
    { id: 'urs_kalecinski', nome: 'Urs Kalecinski', categoria: 'Classic Physique', titulos: 'Top 3 Olympia 2024', estilo: 'V-taper extraordinário', pose_forte: 'Back Double Biceps', angulos: { cotovelo_esq: 87.5, cotovelo_dir: 88.0, joelho_esq: 171.0, joelho_dir: 170.5, abducao_ombro_esq: 88.0, abducao_ombro_dir: 87.0, nivelamento_ombros: 89.8 } },
  ],
  bodybuilding: [
    { id: 'samson_dauda', nome: 'Samson Dauda', categoria: 'Bodybuilding Open', titulos: 'Mr. Olympia 2024', estilo: 'Massa e definição equilibradas', pose_forte: 'Most Muscular', angulos: { cotovelo_esq: 85.0, cotovelo_dir: 84.5, joelho_esq: 168.0, joelho_dir: 167.5, abducao_ombro_esq: 80.0, abducao_ombro_dir: 81.0, nivelamento_ombros: 90.0 } },
    { id: 'derek_lunsford', nome: 'Derek Lunsford', categoria: 'Bodybuilding Open', titulos: '2x Mr. Olympia', estilo: 'Proporção e condicionamento elite', pose_forte: 'Front Double Biceps', angulos: { cotovelo_esq: 87.0, cotovelo_dir: 86.5, joelho_esq: 169.0, joelho_dir: 168.5, abducao_ombro_esq: 82.0, abducao_ombro_dir: 83.0, nivelamento_ombros: 89.5 } },
    { id: 'hadi_choopan', nome: 'Hadi Choopan', categoria: 'Bodybuilding Open', titulos: 'Mr. Olympia 2023', estilo: 'Condicionamento extremo', pose_forte: 'Abdominals & Thighs', angulos: { cotovelo_esq: 84.0, cotovelo_dir: 83.5, joelho_esq: 166.0, joelho_dir: 167.0, abducao_ombro_esq: 79.0, abducao_ombro_dir: 80.0, nivelamento_ombros: 90.0 } },
  ],
  bikini: [
    { id: 'jennifer_dorie', nome: 'Jennifer Dorie', categoria: 'Bikini', titulos: '3x Ms. Olympia', estilo: 'Proporção e apresentação impecáveis', pose_forte: 'Quarter Turn Back', angulos: { joelho_esq: 172.0, joelho_dir: 171.5, alinhamento_tronco: 178.0, nivelamento_ombros: 89.5, nivelamento_quadril: 90.0 } },
    { id: 'maureen_blanquisco', nome: 'Maureen Blanquisco', categoria: 'Bikini', titulos: 'Ms. Olympia 2022', estilo: 'Glúteos e simetria excepcionais', pose_forte: 'Quarter Turn Front', angulos: { joelho_esq: 173.0, joelho_dir: 172.5, alinhamento_tronco: 177.5, nivelamento_ombros: 90.0, nivelamento_quadril: 89.5 } },
  ],
  wellness: [
    { id: 'angela_borges', nome: 'Angela Borges', categoria: 'Wellness', titulos: 'Top 3 Olympia', estilo: 'Lower body proporção elite', pose_forte: 'Quarter Turn Back', angulos: { joelho_esq: 170.0, joelho_dir: 169.5, alinhamento_tronco: 176.0, nivelamento_ombros: 89.0, nivelamento_quadril: 90.5 } },
    { id: 'franciele_mattos', nome: 'Franciele Mattos', categoria: 'Wellness', titulos: '3x Ms. Olympia', estilo: 'Glúteos e coxas referência mundial', pose_forte: 'Quarter Turn Back', angulos: { joelho_esq: 171.0, joelho_dir: 170.5, alinhamento_tronco: 177.0, nivelamento_ombros: 89.5, nivelamento_quadril: 90.0 } },
  ],
  bodybuilding_212: [
    { id: 'flex_lewis', nome: 'Flex Lewis', categoria: '212 Bodybuilding', titulos: '7x Olympia 212', estilo: 'Simetria perfeita — padrão ouro', pose_forte: 'Front Lat Spread', angulos: { cotovelo_esq: 86.0, cotovelo_dir: 85.5, joelho_esq: 168.0, joelho_dir: 167.5, abducao_ombro_esq: 80.0, abducao_ombro_dir: 81.5, nivelamento_ombros: 90.0 } },
    { id: 'keone_pearson', nome: 'Keone Pearson', categoria: '212 Bodybuilding', titulos: '2x Olympia 212', estilo: 'Condicionamento e proporção elite', pose_forte: 'Back Double Biceps', angulos: { cotovelo_esq: 87.0, cotovelo_dir: 86.0, joelho_esq: 169.0, joelho_dir: 168.0, abducao_ombro_esq: 81.0, abducao_ombro_dir: 82.0, nivelamento_ombros: 89.5 } },
  ],
  womens_physique: [
    { id: 'natalia_coelho', nome: 'Natalia Abraham Coelho', categoria: "Women's Physique", titulos: 'Ms. Olympia 2023', estilo: 'Musculatura feminina de elite', pose_forte: 'Back Double Biceps', angulos: { cotovelo_esq: 87.0, cotovelo_dir: 86.5, joelho_esq: 169.5, joelho_dir: 168.5, abducao_ombro_esq: 83.0, abducao_ombro_dir: 82.5, nivelamento_ombros: 89.5 } },
  ],
  figure: [
    { id: 'cydney_gillon', nome: 'Cydney Gillon', categoria: 'Figure', titulos: '7x Ms. Olympia', estilo: 'Simetria e proporção perfeitas', pose_forte: 'Quarter Turn Front', angulos: { joelho_esq: 171.0, joelho_dir: 170.5, alinhamento_tronco: 177.0, nivelamento_ombros: 89.5, nivelamento_quadril: 90.0 } },
  ],
  womens_bodybuilding: [
    { id: 'andrea_shaw', nome: 'Andrea Shaw', categoria: "Women's Bodybuilding", titulos: '5x Ms. Olympia', estilo: 'Maior e mais condicionada da história', pose_forte: 'Front Lat Spread', angulos: { cotovelo_esq: 84.0, cotovelo_dir: 83.5, joelho_esq: 166.0, joelho_dir: 165.5, abducao_ombro_esq: 78.0, abducao_ombro_dir: 79.0, nivelamento_ombros: 90.0 } },
  ],
};

interface ChampionPickerProps {
  categoria: string;
  atletaAngulos: Record<string, number>;
  onSelectChampion: (champion: Champion) => void;
  selectedId?: string;
}

export default function ChampionPicker({
  categoria,
  atletaAngulos,
  onSelectChampion,
  selectedId,
}: ChampionPickerProps) {
  const champions = CHAMPIONS_BY_CATEGORY[categoria] ?? [];

  if (champions.length === 0)
    return (
      <GlassCard padding="md" className="text-center py-6">
        <p className="text-sm text-nfv-ice-muted">
          Campeões desta categoria em breve
        </p>
      </GlassCard>
    );

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-nfv-ice-medium">
        Escolha seu ídolo para comparar
      </p>
      {champions.map((champion, i) => {
        const isSelected = champion.id === selectedId;
        const commonAngles = Object.keys(champion.angulos).filter(
          (k) => atletaAngulos[k] !== undefined,
        );
        const avgDiff =
          commonAngles.length > 0
            ? commonAngles.reduce(
                (acc, k) =>
                  acc +
                  Math.abs(
                    (atletaAngulos[k] ?? 0) - (champion.angulos[k] ?? 0),
                  ),
                0,
              ) / commonAngles.length
            : 180;
        // Normalizar: 0° diff = 100%, 45° diff = 50%, 90°+ diff = 0%
        const similarity = Math.round(
          Math.max(0, Math.min(100, 100 - (avgDiff / 90) * 100)),
        );

        return (
          <motion.button
            key={champion.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelectChampion(champion)}
            className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
              isSelected
                ? 'bg-amber-50 border-amber-300'
                : 'bg-white border-[#d0dbe6] hover:border-nfv-cyan/30'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xl ${
                isSelected ? 'bg-amber-100 text-amber-700' : 'bg-[#f5f8fb] text-nfv-ice-muted'
              }`}
            >
              {champion.nome.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-nfv-ice">
                  {champion.nome}
                </p>
                {i === 0 && (
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                )}
              </div>
              <p className="text-xs text-nfv-cyan font-semibold mt-0.5">
                {champion.titulos}
              </p>
              <p className="text-xs text-nfv-ice-muted mt-1">
                {champion.estilo}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 bg-[#e8f0fe] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${similarity}%` }}
                  />
                </div>
                <span className="text-[10px] text-nfv-ice-muted flex-shrink-0">
                  {similarity}% similar
                </span>
              </div>
            </div>
            {isSelected && (
              <Trophy className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
