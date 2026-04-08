'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import type {
  AthletePosingProtocol,
  AsymmetryProfile,
  CategoryType,
} from '@/lib/api/pose-analysis';
import { CATEGORY_LABELS } from '@/lib/api/pose-analysis';

const OLLAMA_URL =
  process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'llama3:8b';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  loading?: boolean;
}

interface CoachChatProps {
  isOpen: boolean;
  onClose: () => void;
  protocol: AthletePosingProtocol;
  asymmetries: AsymmetryProfile | null;
  categoria: CategoryType;
  confidence?: number | null;
}

function getSuggestedQuestions(
  protocol: AthletePosingProtocol,
  categoria: CategoryType,
): string[] {
  const criticas = protocol.poses_mais_criticas.slice(0, 2);
  const fortes = protocol.poses_mais_fortes.slice(0, 1);

  return [
    `Como melhorar meu score na pose ${criticas[0] ?? 'mais crítica'}?`,
    `Qual é o erro mais comum em ${CATEGORY_LABELS[categoria]}?`,
    `Quanto tempo por dia devo treinar posing?`,
    `Como maximizar minha pose ${fortes[0] ?? 'mais forte'} no palco?`,
  ];
}

function buildSystemPrompt(
  protocol: AthletePosingProtocol,
  asymmetries: AsymmetryProfile | null,
  categoria: CategoryType,
  confidence?: number | null,
): string {
  const scoreGeral = Math.round(
    protocol.poses.reduce((a, p) => a + p.score_estimado_com_ajuste, 0) /
      protocol.poses.length,
  );

  const posesStr = protocol.poses
    .map(
      (p) =>
        `- ${p.nome_pose}: ${p.score_estimado_sem_ajuste}→${p.score_estimado_com_ajuste} pts | ${p.instrucoes_resumidas.slice(0, 2).join('; ')}`,
    )
    .join('\n');

  const assimetriaStr =
    asymmetries?.assimetrias
      .map(
        (a) =>
          `- ${a.tipo}: ${a.descricao_pt} (impacto: ${a.impacto_competitivo})`,
      )
      .join('\n') ?? 'Nenhuma assimetria significativa detectada';

  const pontosFortes =
    asymmetries?.pontos_fortes.map((p) => `- ${p.descricao}`).join('\n') ?? '';

  return `Você é o Coach IA do NutriFitVision (NFV), especialista em posing de fisiculturismo IFBB Pro League.

Você acabou de analisar o atleta com os seguintes dados reais:

═══════════════════════════════════
ANÁLISE DO ATLETA
═══════════════════════════════════
Categoria: ${CATEGORY_LABELS[categoria]}
Score geral: ${scoreGeral}/100
Ganho estimado com ajustes: +${protocol.ganho_total_estimado} pontos
Confiança da detecção MediaPipe: ${confidence ? `${Math.round(confidence * 100)}%` : 'N/A'}
Fonte: ${confidence ? 'foto real com MediaPipe' : 'simulação demo'}

POSES ANALISADAS:
${posesStr}

POSES CRÍTICAS (prioridade máxima):
${protocol.poses_mais_criticas.join(', ') || 'Nenhuma'}

POSES FORTES (maximizar no palco):
${protocol.poses_mais_fortes.join(', ') || 'Nenhuma'}

ASSIMETRIAS DETECTADAS:
${assimetriaStr}

PONTOS FORTES ESTRUTURAIS:
${pontosFortes || 'Não detectados'}

PROTOCOLO DO COACH:
${protocol.resumo_coach_pt}

PRIORIDADES DE TREINO:
${protocol.prioridades_treino_posing.slice(0, 5).join('\n')}
═══════════════════════════════════

INSTRUÇÕES:
- Responda sempre em português brasileiro
- Seja direto, técnico e motivador — como um coach experiente de fisiculturismo
- Use os dados reais da análise acima para personalizar cada resposta
- Quando mencionar poses, use os nomes em português do Brasil
- Dê orientações práticas e específicas, não genéricas
- Mencione os ângulos e correções específicas quando relevante
- Máximo 200 palavras por resposta — seja conciso e impactante
- Use emojis com moderação para tornar a conversa mais dinâmica
- Se não souber algo sobre a análise específica, seja honesto`;
}

export default function CoachChat({
  isOpen,
  onClose,
  protocol,
  asymmetries,
  categoria,
  confidence,
}: CoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggested = getSuggestedQuestions(protocol, categoria);
  const systemPrompt = buildSystemPrompt(
    protocol,
    asymmetries,
    categoria,
    confidence,
  );

  // Boas-vindas
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      const scoreGeral = Math.round(
        protocol.poses.reduce((a, p) => a + p.score_estimado_com_ajuste, 0) /
          protocol.poses.length,
      );
      const welcome: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `Olá! Sou seu Coach IA de posing 🏆\n\nAnalisei sua performance em **${CATEGORY_LABELS[categoria]}** e você está com **${scoreGeral}/100** pontos. Com os ajustes do protocolo, pode ganhar mais **+${protocol.ganho_total_estimado} pontos**.\n\nO que quer trabalhar primeiro?`,
      };
      setMessages([welcome]);
    }
  }, [isOpen, hasOpened, protocol, categoria]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text.trim(),
      };

      const loadingMsg: Message = {
        id: 'loading',
        role: 'assistant',
        content: '',
        loading: true,
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setInput('');
      setLoading(true);

      try {
        // Histórico para Ollama (system + user/assistant alternados)
        const history = [...messages, userMsg]
          .filter((m) => !m.loading && m.id !== 'welcome')
          .map((m) => ({ role: m.role, content: m.content }));

        const ollamaMessages = [
          { role: 'system', content: systemPrompt },
          ...history,
        ];

        const response = await fetch(`${OLLAMA_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages: ollamaMessages,
            stream: false,
            options: {
              temperature: 0.7,
              num_predict: 500,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Ollama error: ${response.status}`);
        }

        const data = await response.json();
        const reply: string =
          data.message?.content ?? 'Sem resposta do modelo.';

        const assistantMsg: Message = {
          id: Date.now().toString() + '_reply',
          role: 'assistant',
          content: reply,
        };

        setMessages((prev) => [
          ...prev.filter((m) => m.id !== 'loading'),
          assistantMsg,
        ]);
      } catch (err) {
        const errorMsg: Message = {
          id: 'error_' + Date.now(),
          role: 'assistant',
          content:
            'Não consegui falar com o Coach agora 😕\n\nVerifique se o Ollama está rodando: `ollama serve` e o modelo `' +
            OLLAMA_MODEL +
            '` está disponível (`ollama pull ' +
            OLLAMA_MODEL +
            '`).\n\nSe estiver tudo certo, pode ser CORS — inicie o Ollama com `OLLAMA_ORIGINS=* ollama serve`.',
        };
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== 'loading'),
          errorMsg,
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, systemPrompt],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Markdown simples (negrito **)
  function formatMessage(text: string) {
    return text.split('**').map((part, i) =>
      i % 2 === 1 ? (
        <strong key={i} className="font-semibold text-nfv-cyan">
          {part}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />

          {/* Chat panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col border-l border-[#d0dbe6]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-[#d0dbe6] bg-gradient-to-r from-nfv-aurora/5 to-nfv-cyan/5">
              <div className="w-10 h-10 rounded-xl bg-nfv-aurora/15 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-nfv-cyan" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-nfv-ice">Coach IA</p>
                <p className="text-xs text-nfv-ice-muted truncate">
                  {CATEGORY_LABELS[categoria]} • {OLLAMA_MODEL}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-green-600 font-medium">
                  Local
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-nfv-ice-muted hover:text-nfv-ice hover:bg-[#f5f8fb] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'assistant'
                        ? 'bg-nfv-aurora/15'
                        : 'bg-[#e8f0fe]'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <Bot className="w-4 h-4 text-nfv-cyan" />
                    ) : (
                      <User className="w-4 h-4 text-nfv-ice-muted" />
                    )}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-nfv-aurora text-white rounded-tr-sm'
                        : 'bg-[#f5f8fb] text-nfv-ice rounded-tl-sm'
                    }`}
                  >
                    {msg.loading ? (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-nfv-cyan animate-bounce"
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-nfv-cyan animate-bounce"
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-nfv-cyan animate-bounce"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {msg.role === 'assistant'
                          ? formatMessage(msg.content)
                          : msg.content}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested */}
            {messages.filter((m) => m.role === 'user').length === 0 && (
              <div className="px-4 pb-2 space-y-2">
                <p className="text-[10px] text-nfv-ice-muted font-semibold uppercase tracking-wide">
                  Perguntas sugeridas
                </p>
                <div className="space-y-1.5">
                  {suggested.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      disabled={loading}
                      className="w-full text-left text-xs text-nfv-ice-medium bg-[#f5f8fb] hover:bg-nfv-cyan/5 hover:text-nfv-cyan border border-[#d0dbe6] hover:border-nfv-cyan/30 rounded-xl px-3 py-2 transition-all disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-[#d0dbe6]">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte ao seu coach..."
                  disabled={loading}
                  className="flex-1 bg-[#f5f8fb] border border-[#d0dbe6] rounded-xl px-4 py-2.5 text-sm text-nfv-ice placeholder:text-nfv-ice-muted focus:outline-none focus:border-nfv-cyan/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-nfv-aurora text-white flex items-center justify-center disabled:opacity-30 hover:shadow-nfv transition-all flex-shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
              <p className="text-[9px] text-nfv-ice-muted text-center mt-2">
                Coach IA powered by Ollama ({OLLAMA_MODEL}) · Local · NFV Pro
                League
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
