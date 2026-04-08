'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Eye, EyeOff, Ruler, Download } from 'lucide-react';
import {
  renderLandmarks,
  DEFAULT_RENDER_OPTIONS,
  type LandmarkPoint,
  type RenderOptions,
} from '@/lib/landmark-renderer';

interface LandmarkOverlayProps {
  imageDataUrl: string | null;
  landmarks: Record<string, LandmarkPoint>;
  championAngles?: Record<string, number>;
  label?: string;
  confidence?: number;
}

export default function LandmarkOverlay({
  imageDataUrl,
  landmarks,
  championAngles,
  label = 'Sua análise',
  confidence,
}: LandmarkOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [options, setOptions] = useState<RenderOptions>({
    ...DEFAULT_RENDER_OPTIONS,
    championAngles,
  });
  const [canvasSize, setCanvasSize] = useState({ w: 400, h: 533 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Sincronizar championAngles externos com options
  useEffect(() => {
    setOptions((prev) => ({ ...prev, championAngles }));
  }, [championAngles]);

  // Carregar imagem e ajustar canvas
  useEffect(() => {
    if (!imageDataUrl) {
      // Sem foto — canvas com fundo escuro, proporção 3:4
      const maxW = containerRef.current?.clientWidth || 400;
      setCanvasSize({ w: maxW, h: Math.round(maxW * 1.33) });
      setImageLoaded(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const aspect = img.naturalHeight / img.naturalWidth;
      const maxW = containerRef.current?.clientWidth || 400;
      const w = Math.min(maxW, img.naturalWidth);
      const h = Math.round(w * aspect);
      setCanvasSize({ w, h });
      setImageLoaded(true);
    };
    img.onerror = () => {
      // Fallback para canvas sem imagem
      const maxW = containerRef.current?.clientWidth || 400;
      setCanvasSize({ w: maxW, h: Math.round(maxW * 1.33) });
      setImageLoaded(true);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  // Renderizar canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    canvas.width = canvasSize.w;
    canvas.height = canvasSize.h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (imgRef.current) {
      ctx.drawImage(imgRef.current, 0, 0, canvasSize.w, canvasSize.h);
    } else {
      // Sem imagem — fundo escuro
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);
    }

    renderLandmarks(canvas, landmarks, options);
  }, [imageLoaded, canvasSize, landmarks, options]);

  useEffect(() => {
    render();
  }, [render]);

  const toggle = (key: keyof RenderOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'pose-analysis-overlay.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-[rgba(0,188,212,0.2)] bg-[#0f172a]">
        <canvas
          ref={canvasRef}
          width={canvasSize.w}
          height={canvasSize.h}
          className="w-full"
        />

        {/* Badge de confiança */}
        {confidence !== undefined && (
          <div className="absolute top-3 left-3 bg-black/70 text-nfv-cyan text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm">
            MediaPipe {Math.round(confidence * 100)}% confiança
          </div>
        )}

        {/* Label */}
        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm">
          {label}
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => toggle('showSkeleton')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            options.showSkeleton
              ? 'bg-nfv-cyan/10 text-nfv-cyan border border-nfv-cyan/30'
              : 'bg-[#f5f8fb] text-nfv-ice-muted border border-[#d0dbe6]'
          }`}
        >
          {options.showSkeleton ? (
            <Eye className="w-3 h-3" />
          ) : (
            <EyeOff className="w-3 h-3" />
          )}
          Esqueleto
        </button>

        <button
          type="button"
          onClick={() => toggle('showAngles')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            options.showAngles
              ? 'bg-purple-100 text-purple-600 border border-purple-200'
              : 'bg-[#f5f8fb] text-nfv-ice-muted border border-[#d0dbe6]'
          }`}
        >
          <Ruler className="w-3 h-3" />
          Ângulos
        </button>

        <button
          type="button"
          onClick={() => toggle('showPoints')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            options.showPoints
              ? 'bg-amber-50 text-amber-600 border border-amber-200'
              : 'bg-[#f5f8fb] text-nfv-ice-muted border border-[#d0dbe6]'
          }`}
        >
          Pontos
        </button>

        <button
          type="button"
          onClick={() => toggle('highlightErrors')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            options.highlightErrors
              ? 'bg-red-50 text-red-500 border border-red-200'
              : 'bg-[#f5f8fb] text-nfv-ice-muted border border-[#d0dbe6]'
          }`}
        >
          Erros
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#f5f8fb] text-nfv-ice-muted border border-[#d0dbe6] hover:border-nfv-cyan/30 hover:text-nfv-cyan transition-all"
        >
          <Download className="w-3 h-3" />
          Salvar
        </button>
      </div>

      {/* Legenda de cores */}
      {options.showAngles && championAngles && (
        <div className="flex items-center gap-3 text-[10px] text-nfv-ice-muted flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#00bcd4]" />
            <span>Ângulo atual</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Diferença &gt;10° do campeão</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#00e5ff]" />
            <span>Membros superiores</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#ffab40]" />
            <span>Membros inferiores</span>
          </div>
        </div>
      )}
    </div>
  );
}
