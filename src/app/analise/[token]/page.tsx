'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, AlertTriangle, Clock, Share2 } from 'lucide-react';
import ScoreCircle from '@/components/ui/ScoreCircle';
import GlassCard from '@/components/ui/GlassCard';
import { CATEGORY_LABELS } from '@/lib/api/pose-analysis';
import type { CategoryType } from '@/lib/api/pose-analysis';

interface TokenPayload {
  s: number; // score
  c: string; // categoria
  t: number; // timestamp
}

const EXPIRY_DAYS = 7;

function decodeToken(token: string): TokenPayload | null {
  try {
    const json = atob(decodeURIComponent(token));
    const parsed = JSON.parse(json);
    if (
      typeof parsed.s === 'number' &&
      typeof parsed.c === 'string' &&
      typeof parsed.t === 'number'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function isExpired(timestamp: number): boolean {
  const diff = Date.now() - timestamp;
  return diff > EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

function getScoreClassification(score: number): {
  label: string;
  color: string;
} {
  if (score >= 90) return { label: 'Elite IFBB', color: 'text-green-500' };
  if (score >= 75) return { label: 'Competitivo', color: 'text-nfv-cyan' };
  if (score >= 60) return { label: 'Em evolucao', color: 'text-amber-500' };
  return { label: 'Iniciante', color: 'text-red-400' };
}

export default function AnalisePublicaPage() {
  const params = useParams();
  const token = params.token as string;
  const [data, setData] = useState<TokenPayload | null>(null);
  const [expired, setExpired] = useState(false);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalid(true);
      return;
    }
    const decoded = decodeToken(token);
    if (!decoded) {
      setInvalid(true);
      return;
    }
    if (isExpired(decoded.t)) {
      setExpired(true);
      return;
    }
    setData(decoded);
  }, [token]);

  if (invalid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1a2332] flex items-center justify-center p-4">
        <GlassCard padding="lg" className="max-w-md text-center bg-[#1e293b] border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-white mb-2">Link invalido</h1>
          <p className="text-sm text-gray-400">
            Este link de analise nao e valido. Verifique se o link esta correto.
          </p>
          <a
            href="/register"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2962ff] to-[#00bcd4] text-white text-sm font-semibold"
          >
            Criar minha conta
          </a>
        </GlassCard>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1a2332] flex items-center justify-center p-4">
        <GlassCard padding="lg" className="max-w-md text-center bg-[#1e293b] border-amber-500/30">
          <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-white mb-2">Link expirado</h1>
          <p className="text-sm text-gray-400">
            Este link de analise expirou apos {EXPIRY_DAYS} dias. Crie uma
            conta para acessar seus resultados sem limite de tempo.
          </p>
          <a
            href="/register"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2962ff] to-[#00bcd4] text-white text-sm font-semibold"
          >
            Criar minha conta
          </a>
        </GlassCard>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1a2332] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00bcd4]/30 border-t-[#00bcd4] rounded-full animate-spin" />
      </div>
    );
  }

  const classification = getScoreClassification(data.s);
  const catLabel =
    CATEGORY_LABELS[data.c as CategoryType] ?? data.c;
  const analysisDate = new Date(data.t).toLocaleDateString('pt-BR');

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1a2332] p-4">
      <div className="max-w-lg mx-auto space-y-6 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-white">
              Analise IFBB Pro League
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            {catLabel} - {analysisDate}
          </p>
        </motion.div>

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <GlassCard padding="lg" className="bg-[#1e293b] border-[#334155]">
            <div className="flex flex-col items-center gap-4">
              <ScoreCircle
                score={data.s}
                size="lg"
                label="Score Geral"
                showClassification
              />
              <div className="text-center">
                <p className={`text-lg font-bold ${classification.color}`}>
                  {classification.label}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Categoria: {catLabel}
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard padding="md" className="bg-[#1e293b] border-[#334155]">
            <div className="flex items-start gap-3">
              <Share2 className="w-5 h-5 text-nfv-cyan flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Resultado compartilhado
                </p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Esta analise foi gerada pelo sistema NutriFitVision com
                  tecnologia MediaPipe e referencias de campeoes IFBB Pro
                  League. Para acessar o protocolo completo, relatorio
                  detalhado e plano de treino, crie sua conta.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-center space-y-3"
        >
          <a
            href="/register"
            className="inline-flex items-center justify-center w-full py-3 rounded-2xl bg-gradient-to-r from-[#2962ff] to-[#00bcd4] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            Criar minha conta gratis
          </a>
          <p className="text-[10px] text-gray-500">
            Analise completa - Protocolo IFBB - Coach IA - Evolucao
          </p>
        </motion.div>

        {/* Footer */}
        <div className="text-center pt-4 pb-8">
          <p className="text-[10px] text-gray-600">
            NutriFitVision - Analise de Poses IFBB Pro League
          </p>
        </div>
      </div>
    </div>
  );
}
