'use client';

import { useRef, useState } from 'react';
import { Download, Instagram } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/api/pose-analysis';
import type {
  AthletePosingProtocol,
  CategoryType,
} from '@/lib/api/pose-analysis';

interface ShareCardProps {
  protocol: AthletePosingProtocol;
  categoria: CategoryType;
  confidence?: number | null;
  userName?: string;
}

export default function ShareCard({
  protocol,
  categoria,
  confidence,
  userName,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const scoreGeral = Math.round(
    protocol.poses.reduce((a, p) => a + p.score_estimado_com_ajuste, 0) /
      protocol.poses.length,
  );

  const scoreColor =
    scoreGeral >= 80
      ? '#00c853'
      : scoreGeral >= 60
        ? '#00bcd4'
        : scoreGeral >= 40
          ? '#ff9100'
          : '#ff1744';

  const handleDownload = async () => {
    setSaving(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current!, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `nfv-pose-analysis-${categoria}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!navigator.share) {
      handleDownload();
      return;
    }
    setSaving(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current!, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'nfv-pose.png', { type: 'image/png' });
        await navigator.share({
          title: `Análise de Pose IFBB — ${CATEGORY_LABELS[categoria]}`,
          text: `Score ${scoreGeral}/100 em ${CATEGORY_LABELS[categoria]} 🏆 Analisado pelo NutriFitVision`,
          files: [file],
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Card para captura */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl"
        style={{
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          width: '100%',
          aspectRatio: '1/1',
          padding: '32px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '300px',
            height: '300px',
            background: `radial-gradient(circle, ${scoreColor}15 0%, transparent 70%)`,
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2962ff, #00bcd4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}
            >
              N
            </span>
          </div>
          <span
            style={{
              color: '#94a3b8',
              fontSize: '12px',
              letterSpacing: '0.1em',
            }}
          >
            NUTRIFITVISION
          </span>
        </div>

        {/* Categoria */}
        <div style={{ marginBottom: '8px' }}>
          <span
            style={{
              color: '#00bcd4',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
            }}
          >
            IFBB Pro League • {CATEGORY_LABELS[categoria]}
          </span>
        </div>

        {/* Score principal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '80px',
              fontWeight: '900',
              lineHeight: 1,
              color: scoreColor,
              textShadow: `0 0 40px ${scoreColor}60`,
            }}
          >
            {scoreGeral}
          </div>
          <div style={{ paddingBottom: '12px' }}>
            <div style={{ color: '#94a3b8', fontSize: '14px' }}>/100</div>
            <div style={{ color: '#64748b', fontSize: '11px' }}>
              Score Geral
            </div>
          </div>
        </div>

        {/* Ganho estimado */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0,188,212,0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            border: '1px solid rgba(0,188,212,0.2)',
          }}
        >
          <span style={{ fontSize: '20px' }}>⚡</span>
          <div>
            <div
              style={{
                color: '#00bcd4',
                fontSize: '18px',
                fontWeight: '700',
              }}
            >
              +{protocol.ganho_total_estimado} pts
            </div>
            <div style={{ color: '#64748b', fontSize: '11px' }}>
              ganho estimado com ajustes
            </div>
          </div>
        </div>

        {/* Poses badges */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap' as const,
            gap: '6px',
            marginBottom: '20px',
          }}
        >
          {protocol.poses.slice(0, 6).map((pose) => (
            <div
              key={pose.pose_id}
              style={{
                background:
                  pose.score_estimado_com_ajuste >= 60
                    ? 'rgba(0,200,83,0.15)'
                    : 'rgba(255,145,0,0.15)',
                border: `1px solid ${
                  pose.score_estimado_com_ajuste >= 60
                    ? 'rgba(0,200,83,0.3)'
                    : 'rgba(255,145,0,0.3)'
                }`,
                borderRadius: '8px',
                padding: '4px 10px',
                color:
                  pose.score_estimado_com_ajuste >= 60
                    ? '#00c853'
                    : '#ff9100',
                fontSize: '11px',
                fontWeight: '600',
              }}
            >
              {pose.score_estimado_com_ajuste}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div>
            {userName && (
              <div
                style={{
                  color: '#e2e8f0',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                {userName}
              </div>
            )}
            {confidence != null && (
              <div style={{ color: '#64748b', fontSize: '11px' }}>
                MediaPipe {Math.round(confidence * 100)}% confiança
              </div>
            )}
          </div>
          <div
            style={{
              color: '#334155',
              fontSize: '11px',
              textAlign: 'right' as const,
            }}
          >
            nutrifitvision.com
          </div>
        </div>

        {/* Watermark */}
        <div
          style={{
            position: 'absolute' as const,
            bottom: '24px',
            right: '-20px',
            color: 'rgba(255,255,255,0.03)',
            fontSize: '48px',
            fontWeight: '900',
            transform: 'rotate(-15deg)',
            userSelect: 'none' as const,
            pointerEvents: 'none' as const,
          }}
        >
          NFV
        </div>
      </div>

      {/* Botões */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDownload}
          disabled={saving}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#f5f8fb] border border-[#d0dbe6] text-sm font-semibold text-nfv-ice hover:border-nfv-cyan/30 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          Salvar PNG
        </button>
        <button
          onClick={handleShare}
          disabled={saving}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all disabled:opacity-50"
        >
          <Instagram className="w-4 h-4" />
          Compartilhar
        </button>
      </div>

      <p className="text-[10px] text-nfv-ice-muted text-center">
        Compartilhe sua análise IFBB Pro League 🏆
      </p>
    </div>
  );
}
