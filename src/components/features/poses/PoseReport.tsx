'use client';

import { useRef, useState } from 'react';
import {
  FileText,
  Download,
  Loader2,
} from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/api/pose-analysis';
import type {
  AthletePosingProtocol,
  AsymmetryProfile,
  CategoryType,
} from '@/lib/api/pose-analysis';

interface PoseReportProps {
  protocol: AthletePosingProtocol;
  asymmetries: AsymmetryProfile | null;
  categoria: CategoryType;
  confidence?: number | null;
  userName?: string;
  date?: string;
}

export default function PoseReport({
  protocol,
  asymmetries,
  categoria,
  confidence,
  userName,
  date,
}: PoseReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const scoreGeral = Math.round(
    protocol.poses.reduce((a, p) => a + p.score_estimado_com_ajuste, 0) /
      protocol.poses.length,
  );

  const dataFormatada = date
    ? new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const style = document.createElement('style');
      style.innerHTML = `
        @media print {
          body * { visibility: hidden !important; }
          #pose-report, #pose-report * { visibility: visible !important; }
          #pose-report { position: fixed; left: 0; top: 0; width: 100%; padding: 24px !important; }
          .no-print { display: none !important; }
        }
      `;
      document.head.appendChild(style);
      window.print();
      document.head.removeChild(style);
    } finally {
      setGenerating(false);
    }
  };

  const scoreColor =
    scoreGeral >= 70 ? '#00c853' : scoreGeral >= 50 ? '#ff9100' : '#ff1744';
  const scoreLabel =
    scoreGeral >= 70
      ? 'Bom'
      : scoreGeral >= 50
        ? 'Regular'
        : 'Necessita Atenção';

  return (
    <div className="space-y-4">
      {/* Botões — não aparecem no print */}
      <div className="flex gap-3 no-print">
        <button
          onClick={handleDownloadPDF}
          disabled={generating}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Baixar PDF
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#f5f8fb] border border-[#d0dbe6] text-sm font-semibold text-nfv-ice hover:border-nfv-cyan/30 transition-all"
        >
          <FileText className="w-4 h-4" />
          Imprimir
        </button>
      </div>

      {/* Relatório — este bloco vai para o PDF */}
      <div
        id="pose-report"
        ref={reportRef}
        style={{
          fontFamily: 'system-ui, sans-serif',
          color: '#1e293b',
          background: '#ffffff',
          padding: '40px',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
            borderBottom: '2px solid #2962ff',
            paddingBottom: '20px',
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2962ff, #00bcd4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  N
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#1e293b',
                  }}
                >
                  NutriFitVision
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Análise Biomecânica IFBB Pro League
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#1e293b',
                marginTop: '8px',
              }}
            >
              Relatório de Posing
            </div>
            <div
              style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}
            >
              {CATEGORY_LABELS[categoria]} • IFBB Pro League
            </div>
          </div>
          <div style={{ textAlign: 'right' as const }}>
            {userName && (
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#1e293b',
                }}
              >
                {userName}
              </div>
            )}
            <div
              style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}
            >
              {dataFormatada}
            </div>
            {confidence != null && (
              <div
                style={{
                  fontSize: '11px',
                  color: '#00bcd4',
                  marginTop: '4px',
                }}
              >
                Confiança MediaPipe: {Math.round(confidence * 100)}%
              </div>
            )}
          </div>
        </div>

        {/* Score Overview */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '16px',
              padding: '24px',
              flex: '0 0 180px',
              textAlign: 'center' as const,
              border: `2px solid ${scoreColor}20`,
            }}
          >
            <div
              style={{
                fontSize: '64px',
                fontWeight: '900',
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {scoreGeral}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
              /100 — {scoreLabel}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              Score Geral
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            }}
          >
            {[
              {
                label: 'Ganho estimado',
                value: `+${protocol.ganho_total_estimado} pts`,
                color: '#00bcd4',
              },
              {
                label: 'Poses analisadas',
                value: `${protocol.poses.length}`,
                color: '#2962ff',
              },
              {
                label: 'Poses críticas',
                value: `${protocol.poses_mais_criticas.length}`,
                color: '#ff1744',
              },
              {
                label: 'Assimetrias',
                value: `${asymmetries?.total_assimetrias ?? 0} (${asymmetries?.mascaraveis ?? 0} mascaráveis)`,
                color: '#ff9100',
              },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: '#f8fafc',
                  borderRadius: '12px',
                  padding: '14px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#64748b',
                    marginTop: '2px',
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo do Coach */}
        <div
          style={{
            background: '#f0f7ff',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '28px',
            borderLeft: '4px solid #2962ff',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: '700',
              color: '#2962ff',
              marginBottom: '6px',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}
          >
            Avaliação do Coach IA
          </div>
          <div
            style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}
          >
            {protocol.resumo_coach_pt}
          </div>
        </div>

        {/* Tabela de Poses */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                background: '#2962ff',
                color: '#fff',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '12px',
              }}
            >
              POSES
            </span>
            Análise Individual por Pose
          </div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse' as const,
              fontSize: '12px',
            }}
          >
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th
                  style={{
                    textAlign: 'left' as const,
                    padding: '10px 12px',
                    color: '#64748b',
                    fontWeight: '600',
                  }}
                >
                  Pose
                </th>
                <th
                  style={{
                    textAlign: 'center' as const,
                    padding: '10px 12px',
                    color: '#64748b',
                    fontWeight: '600',
                  }}
                >
                  Atual
                </th>
                <th
                  style={{
                    textAlign: 'center' as const,
                    padding: '10px 12px',
                    color: '#64748b',
                    fontWeight: '600',
                  }}
                >
                  Ajustado
                </th>
                <th
                  style={{
                    textAlign: 'center' as const,
                    padding: '10px 12px',
                    color: '#64748b',
                    fontWeight: '600',
                  }}
                >
                  Ganho
                </th>
                <th
                  style={{
                    textAlign: 'left' as const,
                    padding: '10px 12px',
                    color: '#64748b',
                    fontWeight: '600',
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {protocol.poses.map((pose) => {
                const isCritical = protocol.poses_mais_criticas.includes(
                  pose.pose_id,
                );
                const isStrong = protocol.poses_mais_fortes.includes(
                  pose.pose_id,
                );
                return (
                  <tr
                    key={pose.pose_id}
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td
                      style={{
                        padding: '10px 12px',
                        fontWeight: '500',
                        color: '#334155',
                      }}
                    >
                      {pose.nome_pose}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        textAlign: 'center' as const,
                        color: '#64748b',
                      }}
                    >
                      {pose.score_estimado_sem_ajuste}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        textAlign: 'center' as const,
                        fontWeight: '700',
                        color:
                          pose.score_estimado_com_ajuste >= 60
                            ? '#00c853'
                            : '#ff9100',
                      }}
                    >
                      {pose.score_estimado_com_ajuste}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        textAlign: 'center' as const,
                        color:
                          pose.delta_melhoria > 0 ? '#00bcd4' : '#94a3b8',
                        fontWeight: '600',
                      }}
                    >
                      {pose.delta_melhoria > 0
                        ? `+${pose.delta_melhoria}`
                        : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          background: isCritical
                            ? '#fff0f0'
                            : isStrong
                              ? '#f0fff4'
                              : '#f8fafc',
                          color: isCritical
                            ? '#ff1744'
                            : isStrong
                              ? '#00c853'
                              : '#94a3b8',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '11px',
                          fontWeight: '600',
                        }}
                      >
                        {isCritical
                          ? '⚠ Crítica'
                          : isStrong
                            ? '★ Forte'
                            : 'Regular'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Correções por pose */}
        {protocol.poses.some(
          (p) => p.instrucoes_resumidas?.length > 0,
        ) && (
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  background: '#ff9100',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '12px',
                }}
              >
                CORREÇÕES
              </span>
              Ajustes por Pose
            </div>
            {protocol.poses
              .filter((p) => p.instrucoes_resumidas?.length > 0)
              .map((pose) => (
                <div
                  key={pose.pose_id}
                  style={{
                    marginBottom: '12px',
                    padding: '14px',
                    background: '#fffbf0',
                    borderRadius: '10px',
                    border: '1px solid #fed7aa',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#92400e',
                      marginBottom: '6px',
                    }}
                  >
                    {pose.nome_pose}
                  </div>
                  {pose.instrucoes_resumidas.map((inst, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: '12px',
                        color: '#78350f',
                        marginBottom: '3px',
                        paddingLeft: '12px',
                      }}
                    >
                      {inst}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}

        {/* Assimetrias */}
        {asymmetries && asymmetries.assimetrias.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  background: '#7c3aed',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '12px',
                }}
              >
                SIMETRIA
              </span>
              Score de Simetria: {asymmetries.score_simetria_geral}/100
            </div>
            {asymmetries.assimetrias.map((a, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  marginBottom: '8px',
                  padding: '12px',
                  background: '#faf5ff',
                  borderRadius: '10px',
                  border: '1px solid #e9d5ff',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#6d28d9',
                    minWidth: '80px',
                  }}
                >
                  {a.tipo.replace(/_/g, ' ')}
                </div>
                <div style={{ flex: 1, fontSize: '12px', color: '#4c1d95' }}>
                  {a.descricao_pt}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#7c3aed',
                    fontWeight: '600',
                  }}
                >
                  {a.mascarabilidade === 'total'
                    ? '✓ Mascarável'
                    : '~ Parcial'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Prioridades */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                background: '#00bcd4',
                color: '#fff',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '12px',
              }}
            >
              PLANO
            </span>
            Prioridades de Treino
          </div>
          {protocol.prioridades_treino_posing.map((p, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#0369a1',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div
                style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}
              >
                {p}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Gerado pelo NutriFitVision • nutrifitvision.com
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Análise biomecânica via MediaPipe • IFBB Pro League 2024
          </div>
        </div>
      </div>
    </div>
  );
}
