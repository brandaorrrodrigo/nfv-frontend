'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Square } from 'lucide-react';
import type {
  AthletePosingProtocol,
  CategoryType,
} from '@/lib/api/pose-analysis';
import { CATEGORY_LABELS } from '@/lib/api/pose-analysis';

interface CoachVoiceProps {
  protocol: AthletePosingProtocol;
  categoria: CategoryType;
}

export default function CoachVoice({ protocol, categoria }: CoachVoiceProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const scoreGeral = Math.round(
    protocol.poses.reduce((a, p) => a + p.score_estimado_com_ajuste, 0) /
      protocol.poses.length,
  );

  const getBestVoice = useCallback(() => {
    const ptVoices = voices.filter(
      (v) =>
        v.lang.startsWith('pt') ||
        v.lang.includes('pt-BR') ||
        v.lang.includes('pt-PT'),
    );
    return (
      ptVoices.find((v) => v.lang === 'pt-BR') ??
      ptVoices[0] ??
      voices[0] ??
      null
    );
  }, [voices]);

  const buildScript = (): { text: string; step: number }[] => {
    const prioridades = protocol.prioridades_treino_posing.slice(0, 3);
    const criticas = protocol.poses_mais_criticas.slice(0, 2);
    const pose = protocol.poses.find((p) => criticas.includes(p.pose_id));

    return [
      {
        step: 0,
        text: `Olá! Aqui é seu Coach de posing NFV. Analisei sua apresentação em ${CATEGORY_LABELS[categoria]} e seu score atual é ${scoreGeral} de 100.`,
      },
      {
        step: 1,
        text: `Com as correções deste protocolo, você pode ganhar mais ${protocol.ganho_total_estimado} pontos. Vou te passar as 3 principais prioridades agora.`,
      },
      {
        step: 2,
        text: `Primeira prioridade: ${prioridades[0] ?? 'Pratique as poses críticas diariamente'}.`,
      },
      {
        step: 3,
        text: `Segunda prioridade: ${prioridades[1] ?? 'Grave sua sequência completa semanalmente'}.`,
      },
      {
        step: 4,
        text: `Terceira prioridade: ${prioridades[2] ?? 'Execute a sequência completa no tempo oficial 3 vezes por semana'}.`,
      },
      {
        step: 5,
        text: pose
          ? `Atenção especial para a pose ${pose.nome_pose}. ${pose.instrucoes_resumidas?.[0] ?? 'Revise o protocolo para as correções específicas.'}`
          : 'Foque nas poses críticas do seu protocolo.',
      },
      {
        step: 6,
        text: 'Lembre-se: consistência é o segredo. Pratique 20 minutos por dia e refaça a análise em 2 semanas. Bom treino!',
      },
    ];
  };

  const speak = () => {
    if (!supported || speaking) return;

    window.speechSynthesis.cancel();
    const script = buildScript();
    const voice = getBestVoice();
    let idx = 0;

    const speakNext = () => {
      if (idx >= script.length) {
        setSpeaking(false);
        setActiveStep(null);
        return;
      }

      const item = script[idx]!;
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setActiveStep(item.step);
      utterance.onend = () => {
        idx++;
        speakNext();
      };
      utterance.onerror = () => {
        setSpeaking(false);
        setActiveStep(null);
      };

      window.speechSynthesis.speak(utterance);
    };

    setSpeaking(true);
    speakNext();
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setActiveStep(null);
  };

  if (!supported) return null;

  const script = buildScript();

  return (
    <div className="space-y-3">
      {/* Botão principal */}
      <div className="flex items-center gap-3">
        <button
          onClick={speaking ? stop : speak}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
            speaking
              ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
              : 'bg-nfv-aurora text-white shadow-nfv hover:shadow-nfv-glow'
          }`}
        >
          {speaking ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              Parar
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              Ouvir protocolo
            </>
          )}
        </button>

        {speaking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ height: ['8px', '20px', '8px'] }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.15,
                  repeat: Infinity,
                }}
                className="w-1 bg-nfv-cyan rounded-full"
              />
            ))}
          </motion.div>
        )}

        <span className="text-xs text-nfv-ice-muted">
          {speaking ? 'Coach IA falando...' : 'Coach IA · voz PT-BR'}
        </span>
      </div>

      {/* Script com highlight */}
      <div className="space-y-2">
        {script.map((item) => (
          <motion.div
            key={item.step}
            animate={{
              background:
                activeStep === item.step
                  ? 'rgba(0,188,212,0.08)'
                  : 'transparent',
              borderColor:
                activeStep === item.step
                  ? 'rgba(0,188,212,0.3)'
                  : 'rgba(208,219,230,1)',
            }}
            className="p-3 rounded-xl border text-xs text-nfv-ice-medium leading-relaxed transition-all"
          >
            {activeStep === item.step && (
              <Volume2 className="w-3 h-3 text-nfv-cyan inline mr-1.5 mb-0.5" />
            )}
            {item.text}
          </motion.div>
        ))}
      </div>

      <p className="text-[10px] text-nfv-ice-muted text-center">
        Powered by Web Speech API · funciona offline · voz em português
      </p>
    </div>
  );
}
