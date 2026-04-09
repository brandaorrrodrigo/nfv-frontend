'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import type { AthletePosingProtocol, CategoryType } from '@/lib/api/pose-analysis';
import { CATEGORY_LABELS } from '@/lib/api/pose-analysis';

interface WeeklyPlanProps {
  protocol: AthletePosingProtocol;
  categoria: CategoryType;
}

interface DayPlan {
  dia: string;
  foco: string;
  duracao: string;
  sessoes: { pose: string; tempo: string; instrucao: string }[];
  intensidade: 'leve' | 'moderada' | 'intensa';
}

function generateWeeklyPlan(protocol: AthletePosingProtocol): DayPlan[] {
  const criticas = protocol.poses_mais_criticas.slice(0, 3);
  const fortes = protocol.poses_mais_fortes.slice(0, 2);
  const todas = protocol.poses.map((p) => p.nome_pose);

  const findName = (id: string) =>
    protocol.poses.find((p) => p.pose_id === id)?.nome_pose ?? id;

  return [
    {
      dia: 'Segunda-feira',
      foco: 'Poses críticas — maior impacto',
      duracao: '20 min',
      intensidade: 'intensa',
      sessoes: [
        {
          pose: criticas[0] ? findName(criticas[0]) : todas[0] ?? 'Pose 1',
          tempo: '8 min',
          instrucao:
            'Foque nas correções de ângulo — use espelho ou grave em vídeo',
        },
        {
          pose: criticas[1]
            ? findName(criticas[1])
            : todas[1] ?? todas[0] ?? 'Pose 2',
          tempo: '8 min',
          instrucao:
            'Repita a pose 10x seguidas mantendo a posição por 5 segundos',
        },
        {
          pose: 'Postura de Palco',
          tempo: '4 min',
          instrucao: 'Pratique a transição entre as poses',
        },
      ],
    },
    {
      dia: 'Terça-feira',
      foco: 'Descanso ativo',
      duracao: '10 min',
      intensidade: 'leve',
      sessoes: [
        {
          pose: 'Sequência completa',
          tempo: '10 min',
          instrucao:
            'Execute todas as poses devagar, sem pressa — foco na consciência corporal',
        },
      ],
    },
    {
      dia: 'Quarta-feira',
      foco: 'Poses fortes — maximizar vantagem',
      duracao: '20 min',
      intensidade: 'moderada',
      sessoes: [
        {
          pose: fortes[0] ? findName(fortes[0]) : todas[0] ?? 'Pose 1',
          tempo: '10 min',
          instrucao:
            'Explore variações — ângulo da cabeça, inclinação do tronco',
        },
        {
          pose: fortes[1]
            ? findName(fortes[1])
            : todas[1] ?? todas[0] ?? 'Pose 2',
          tempo: '6 min',
          instrucao: 'Fixe a pose por 10 segundos seguidos — resistência',
        },
        {
          pose: 'Postura de Palco',
          tempo: '4 min',
          instrucao: 'Simule a espera no palco — postura 100% do tempo',
        },
      ],
    },
    {
      dia: 'Quinta-feira',
      foco: 'Descanso',
      duracao: '0 min',
      intensidade: 'leve',
      sessoes: [
        {
          pose: 'Visualização mental',
          tempo: '5 min',
          instrucao:
            'Sem espelho — visualize cada pose mentalmente em sequência',
        },
      ],
    },
    {
      dia: 'Sexta-feira',
      foco: 'Sequência competitiva completa',
      duracao: '30 min',
      intensidade: 'intensa',
      sessoes: [
        {
          pose: 'Aquecimento',
          tempo: '5 min',
          instrucao: 'Mobilidade de ombros, quadril e joelhos',
        },
        {
          pose: 'Sequência completa no tempo oficial',
          tempo: '15 min',
          instrucao:
            'Simule o palco: 60 segundos por pose, sem pausa — como na competição real',
        },
        {
          pose: 'Revisão das poses críticas',
          tempo: '10 min',
          instrucao:
            'Volte nas poses com menor score e aplique as correções do protocolo',
        },
      ],
    },
    {
      dia: 'Sábado',
      foco: 'Gravação e análise',
      duracao: '15 min',
      intensidade: 'moderada',
      sessoes: [
        {
          pose: 'Sessão de vídeo',
          tempo: '10 min',
          instrucao:
            'Grave todas as poses. Compare com a sessão anterior no NFV',
        },
        {
          pose: 'Nova análise NFV',
          tempo: '5 min',
          instrucao:
            'Faça upload do vídeo no NutriFitVision para medir a evolução',
        },
      ],
    },
    {
      dia: 'Domingo',
      foco: 'Descanso total',
      duracao: '0 min',
      intensidade: 'leve',
      sessoes: [
        {
          pose: 'Recuperação',
          tempo: '—',
          instrucao:
            'Descanse. O corpo consolida os padrões motores durante o sono',
        },
      ],
    },
  ];
}

const INTENSITY_CONFIG = {
  leve: {
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    label: 'Leve',
  },
  moderada: {
    color: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    label: 'Moderada',
  },
  intensa: {
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    label: 'Intensa',
  },
};

export default function WeeklyPlan({ protocol, categoria }: WeeklyPlanProps) {
  const plan = generateWeeklyPlan(protocol);
  const [expanded, setExpanded] = useState<number | null>(0);

  const scoreGeral = Math.round(
    protocol.poses.reduce((a, p) => a + p.score_estimado_com_ajuste, 0) /
      protocol.poses.length,
  );

  const handleExportPDF = () => {
    const printContent = `
      <html><head>
      <title>Plano Semanal de Posing — ${CATEGORY_LABELS[categoria]}</title>
      <style>
        body { font-family: system-ui; padding: 32px; color: #1e293b; }
        h1 { color: #2962ff; margin-bottom: 4px; }
        .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        .day { margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
        .day-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .day-name { font-weight: 700; font-size: 16px; }
        .day-focus { color: #64748b; font-size: 13px; }
        .session { background: #f8fafc; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; }
        .session-pose { font-weight: 600; font-size: 13px; }
        .session-time { color: #2962ff; font-size: 12px; }
        .session-instrucao { color: #64748b; font-size: 12px; margin-top: 4px; }
        .footer { margin-top: 32px; color: #94a3b8; font-size: 12px; text-align: center; }
      </style></head><body>
      <h1>Plano Semanal de Posing IFBB</h1>
      <div class="subtitle">${CATEGORY_LABELS[categoria]} · NutriFitVision · Score atual: ${scoreGeral}/100</div>
      ${plan
        .map(
          (day) => `
        <div class="day">
          <div class="day-header">
            <div><div class="day-name">${day.dia}</div><div class="day-focus">${day.foco}</div></div>
            <div style="color:#64748b;font-size:13px">${day.duracao}</div>
          </div>
          ${day.sessoes
            .map(
              (s) => `
            <div class="session">
              <div style="display:flex;justify-content:space-between"><span class="session-pose">${s.pose}</span><span class="session-time">${s.tempo}</span></div>
              <div class="session-instrucao">${s.instrucao}</div>
            </div>`,
            )
            .join('')}
        </div>`,
        )
        .join('')}
      <div class="footer">Gerado pelo NutriFitVision · nutrifitvision.com</div>
      </body></html>
    `;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(printContent);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-base text-nfv-ice">
            Plano Semanal de Posing
          </h3>
          <p className="text-xs text-nfv-ice-muted mt-0.5">
            {CATEGORY_LABELS[categoria]} · 4 semanas recomendadas
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#f5f8fb] border border-[#d0dbe6] text-xs font-semibold text-nfv-ice hover:border-nfv-cyan/30 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          PDF
        </button>
      </div>

      {/* Dias */}
      <div className="space-y-2">
        {plan.map((day, i) => {
          const cfg = INTENSITY_CONFIG[day.intensidade];
          const isExpanded = expanded === i;

          return (
            <motion.div
              key={day.dia}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className={`rounded-xl border ${cfg.bg} overflow-hidden`}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : i)}
                  className="w-full flex items-center gap-3 p-3 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Calendar className="w-4 h-4 text-nfv-ice-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-nfv-ice">
                      {day.dia}
                    </p>
                    <p className="text-xs text-nfv-ice-muted truncate">
                      {day.foco}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {day.duracao !== '0 min' && (
                      <div className="flex items-center gap-1 text-xs text-nfv-ice-muted">
                        <Clock className="w-3 h-3" />
                        {day.duracao}
                      </div>
                    )}
                    <span className={`text-[10px] font-semibold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-nfv-ice-muted" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-nfv-ice-muted" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 space-y-2 border-t border-white/50">
                        {day.sessoes.map((sessao, j) => (
                          <div
                            key={j}
                            className="bg-white/70 rounded-xl p-3 mt-2"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-nfv-ice">
                                {sessao.pose}
                              </p>
                              <span className="text-xs font-bold text-nfv-cyan">
                                {sessao.tempo}
                              </span>
                            </div>
                            <p className="text-xs text-nfv-ice-muted leading-relaxed">
                              {sessao.instrucao}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Resumo */}
      <GlassCard padding="sm" className="text-center">
        <p className="text-xs text-nfv-ice-muted">
          Execute este plano por{' '}
          <strong className="text-nfv-ice">4 semanas</strong> e refaça a análise
          para medir a evolução quantitativa
        </p>
      </GlassCard>
    </div>
  );
}
