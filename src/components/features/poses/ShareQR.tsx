'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Copy, Check, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';
import GlassCard from '@/components/ui/GlassCard';
import { encodeShareToken } from '@/lib/share-token';

interface ShareQRProps {
  scoreGeral: number;
  categoria: string;
}

export default function ShareQR({
  scoreGeral,
  categoria,
}: ShareQRProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const token = encodeShareToken(scoreGeral, categoria);
    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/analise/${encodeURIComponent(token)}`;
    setShareUrl(url);

    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: { dark: '#1a2332', light: '#ffffff' },
      }).catch(console.error);
    }
  }, [scoreGeral, categoria]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <GlassCard padding="lg">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-nfv-cyan" />
          <p className="text-sm font-bold text-nfv-ice">
            Link de compartilhamento
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            className="rounded-xl border border-[#d0dbe6]"
          />

          <p className="text-[10px] text-nfv-ice-muted text-center">
            Escaneie o QR code ou copie o link abaixo.
            <br />O link expira em 7 dias.
          </p>

          <div className="w-full flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-[#f5f8fb] border border-[#d0dbe6] text-[10px] text-nfv-ice-muted truncate font-mono">
              {shareUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg border transition-all flex-shrink-0 ${
                copied
                  ? 'bg-green-50 border-green-300 text-green-600'
                  : 'border-[#d0dbe6] text-nfv-ice-muted hover:border-nfv-cyan/30'
              }`}
              title="Copiar link"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-[#d0dbe6] text-nfv-ice-muted hover:border-nfv-cyan/30 transition-all flex-shrink-0"
              title="Abrir em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
