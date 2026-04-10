'use client';

import { useState, useEffect } from 'react';
import { Calendar, Target, ChevronRight, X, Trophy, Clock } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import type { CategoryType } from '@/lib/api/pose-analysis';

interface CompetitionCountdownProps {
  categoria?: CategoryType;
  compact?: boolean;
}

interface Competition {
  name: string;
  date: string;
  categoria: CategoryType;
}

const STORAGE_KEY = 'nfv_competition';

function getPhase(daysLeft: number): {
  label: string;
  color: string;
  advice: string;
} {
  if (daysLeft > 56)
    return {
      label: 'Fase de construção',
      color: 'text-blue-600',
      advice:
        'Foco em aprender e fixar cada pose. Pratique 20min/dia sem pressão.',
    };
  if (daysLeft > 28)
    return {
      label: 'Fase de refinamento',
      color: 'text-amber-600',
      advice:
        'Corrija os erros das poses críticas. Grave semanalmente e compare.',
    };
  if (daysLeft > 14)
    return {
      label: 'Fase de polimento',
      color: 'text-orange-600',
      advice:
        'Sequência completa diariamente. Foco em transições e presença de palco.',
    };
  if (daysLeft > 7)
    return {
      label: 'Semana decisiva',
      color: 'text-red-600',
      advice:
        'Sequência completa 2x/dia. Sem aprender poses novas — só fixar o que já sabe.',
    };
  if (daysLeft > 0)
    return {
      label: 'Última semana!',
      color: 'text-red-700',
      advice:
        'Descanse, hidrate, visualização mental. Uma sequência leve por dia.',
    };
  return {
    label: 'Competição encerrada',
    color: 'text-green-600',
    advice:
      'Parabéns! Registre seus resultados e comece a planejar a próxima.',
  };
}

export default function CompetitionCountdown({
  categoria,
  compact = false,
}: CompetitionCountdownProps) {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCompetition(JSON.parse(saved));
    } catch {
      /* noop */
    }
  }, []);

  const save = () => {
    if (!newDate) return;
    const comp: Competition = {
      name: newName || 'Minha competição',
      date: newDate,
      categoria: categoria ?? 'mens_physique',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comp));
    setCompetition(comp);
    setShowSetup(false);
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCompetition(null);
  };

  const getDaysLeft = (dateStr: string) => {
    const now = new Date();
    const compDate = new Date(dateStr);
    return Math.ceil(
      (compDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
  };

  // Sem competição + sem setup
  if (!competition && !showSetup) {
    if (compact)
      return (
        <button
          onClick={() => setShowSetup(true)}
          className="flex items-center gap-2 text-xs text-nfv-ice-muted hover:text-nfv-cyan transition-colors"
        >
          <Calendar className="w-3.5 h-3.5" />
          Definir data da competição
        </button>
      );

    return (
      <GlassCard padding="md" className="border-dashed">
        <button
          onClick={() => setShowSetup(true)}
          className="w-full flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-nfv-ice">
              Definir competição
            </p>
            <p className="text-xs text-nfv-ice-muted">
              Ative o modo competição com countdown
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-nfv-ice-muted" />
        </button>
      </GlassCard>
    );
  }

  // Setup form
  if (showSetup)
    return (
      <GlassCard padding="md" className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-nfv-ice">Modo Competição</p>
          <button onClick={() => setShowSetup(false)}>
            <X className="w-4 h-4 text-nfv-ice-muted" />
          </button>
        </div>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da competição (ex: Campeonato Mineiro)"
          className="w-full px-4 py-2.5 bg-[#f5f8fb] border border-[#d0dbe6] rounded-xl text-sm focus:outline-none focus:border-nfv-cyan/50"
        />
        <input
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          type="date"
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2.5 bg-[#f5f8fb] border border-[#d0dbe6] rounded-xl text-sm focus:outline-none focus:border-nfv-cyan/50"
        />
        <button
          onClick={save}
          disabled={!newDate}
          className="w-full py-2.5 rounded-xl bg-nfv-aurora text-white text-sm font-semibold disabled:opacity-30"
        >
          Ativar modo competição
        </button>
      </GlassCard>
    );

  if (!competition) return null;

  const daysLeft = getDaysLeft(competition.date);
  const weeksLeft = Math.ceil(Math.max(0, daysLeft) / 7);
  const phase = getPhase(daysLeft);

  // Compact mode (dashboard)
  if (compact)
    return (
      <button
        onClick={() => setShowSetup(true)}
        className="flex items-center gap-2 text-xs"
      >
        <Clock className="w-3.5 h-3.5 text-purple-500" />
        <span className="text-nfv-ice font-semibold">
          {daysLeft > 0 ? `${daysLeft} dias` : 'Hoje!'}
        </span>
        <span className="text-nfv-ice-muted">para {competition.name}</span>
      </button>
    );

  // Full mode
  return (
    <GlassCard padding="md" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <p className="text-sm font-bold text-nfv-ice">{competition.name}</p>
        </div>
        <button
          onClick={clear}
          className="text-[10px] text-nfv-ice-muted hover:text-red-500 transition-colors"
        >
          remover
        </button>
      </div>

      {/* Countdown */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { value: Math.max(0, daysLeft), label: 'dias' },
          { value: Math.max(0, weeksLeft), label: 'semanas' },
          {
            value: Math.max(0, Math.ceil(daysLeft / 30)),
            label: 'meses',
          },
        ].map((item, i) => (
          <div key={i} className="bg-[#f5f8fb] rounded-xl p-2">
            <p className="text-xl font-black text-nfv-ice">{item.value}</p>
            <p className="text-[10px] text-nfv-ice-muted">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Fase atual */}
      <div className="p-3 rounded-xl bg-white border border-[#d0dbe6]">
        <p className={`text-xs font-bold mb-1 ${phase.color}`}>
          {phase.label}
        </p>
        <p className="text-xs text-nfv-ice-muted leading-relaxed">
          {phase.advice}
        </p>
      </div>

      <p className="text-[10px] text-nfv-ice-muted text-center">
        {new Date(competition.date).toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </p>
    </GlassCard>
  );
}
