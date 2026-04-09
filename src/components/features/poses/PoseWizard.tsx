'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Camera,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import PhotoUpload from './PhotoUpload';
import PoseIllustration from './PoseIllustration';
import CameraCapture from './CameraCapture';
import {
  CATEGORY_POSE_LIST,
  PLANE_LABELS,
} from '@/lib/api/pose-analysis';
import type { CategoryType } from '@/lib/api/pose-analysis';

export interface PoseCapture {
  poseId: string;
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  result?: unknown;
}

interface PoseWizardProps {
  categoria: CategoryType;
  onComplete: (results: PoseCapture[]) => void;
  onCancel: () => void;
  uploadFn: (file: File, poseId: string) => Promise<unknown>;
}

export default function PoseWizard({
  categoria,
  onComplete,
  onCancel,
  uploadFn,
}: PoseWizardProps) {
  const poses = CATEGORY_POSE_LIST[categoria] ?? [];
  const [currentPoseIdx, setCurrentPoseIdx] = useState(0);
  const [captures, setCaptures] = useState<PoseCapture[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const currentPose = poses[currentPoseIdx];
  const isLast = currentPoseIdx === poses.length - 1;
  const progress = Math.round(
    ((currentPoseIdx + (currentFile ? 0.5 : 0)) / poses.length) * 100,
  );

  const handleCameraCapture = useCallback((file: File) => {
    setCurrentFile(file);
    setCameraOpen(false);
    setError(null);
  }, []);

  const handlePhotoSelected = useCallback((file: File | null) => {
    setCurrentFile(file);
    setError(null);
  }, []);

  const handleNext = async () => {
    if (!currentFile || !currentPose) return;
    setUploading(true);
    setError(null);

    try {
      // Redimensionar antes de enviar (economiza banda + sessionStorage)
      const objectUrl = URL.createObjectURL(currentFile);
      const canvas = document.createElement('canvas');
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = objectUrl;
      });

      const scale = Math.min(1, 800 / img.naturalWidth);
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.8),
      );
      const resizedFile = new File([blob], currentFile.name, {
        type: 'image/jpeg',
      });

      // Upload e análise via nfv-backend → MediaPipe → nfc-core
      const result = await uploadFn(resizedFile, currentPose.id);

      const capture: PoseCapture = {
        poseId: currentPose.id,
        file: resizedFile,
        status: 'done',
        result,
      };

      const newCaptures = [...captures, capture];
      setCaptures(newCaptures);

      if (isLast) {
        onComplete(newCaptures);
      } else {
        setCurrentPoseIdx((prev) => prev + 1);
        setCurrentFile(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pose');
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    if (isLast) {
      onComplete(captures);
    } else {
      setCurrentPoseIdx((prev) => prev + 1);
      setCurrentFile(null);
      setError(null);
    }
  };

  if (!currentPose) return null;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-nfv-ice-muted">
          <span>
            Pose {currentPoseIdx + 1} de {poses.length}
          </span>
          <span>{progress}% concluído</span>
        </div>
        <div className="h-2 bg-[#e8f0fe] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-nfv-aurora rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Dots de progresso */}
        <div className="flex gap-1.5 flex-wrap">
          {poses.map((pose, i) => {
            const done = i < currentPoseIdx || captures.some((c) => c.poseId === pose.id);
            const current = i === currentPoseIdx;
            return (
              <div
                key={pose.id}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  done
                    ? 'bg-green-400 text-white'
                    : current
                      ? 'bg-nfv-aurora text-white ring-2 ring-nfv-aurora/30'
                      : 'bg-[#e8f0fe] text-nfv-ice-muted'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pose atual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPose.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <GlassCard padding="lg" className="space-y-4">
            {/* Header com ilustração */}
            <div className="flex items-start gap-3">
              <PoseIllustration poseId={currentPose.id} size="md" />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-nfv-ice">
                    {currentPose.nome_pt}
                  </p>
                  <span className="text-[10px] bg-[#f5f8fb] text-nfv-ice-muted px-2 py-0.5 rounded-full border border-[#d0dbe6]">
                    {PLANE_LABELS[currentPose.plano]}
                  </span>
                </div>
                <p className="text-xs text-nfv-ice-muted mt-1 leading-relaxed">
                  {currentPose.instrucao}
                </p>
              </div>
            </div>

            {/* Dica */}
            <div className="bg-nfv-cyan/5 border border-nfv-cyan/20 rounded-xl p-3">
              <p className="text-xs text-nfv-cyan">
                💡 <strong>Dica:</strong> {currentPose.dica}
              </p>
            </div>

            {/* Erros comuns */}
            {currentPose.erros_comuns && currentPose.erros_comuns.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
                <p className="text-xs font-semibold text-red-700">
                  ❌ Erros comuns a evitar:
                </p>
                {currentPose.erros_comuns.map((erro, j) => (
                  <p key={j} className="text-xs text-red-600">
                    • {erro}
                  </p>
                ))}
              </div>
            )}

            {/* Upload da foto (reutiliza PhotoUpload existente) */}
            <PhotoUpload
              onPhotoSelected={handlePhotoSelected}
              selectedFile={currentFile}
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Ações: câmera + pular */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCameraOpen(true)}
                disabled={uploading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#d0dbe6] text-xs font-semibold text-nfv-ice hover:border-nfv-cyan/30 transition-all disabled:opacity-30"
              >
                <Camera className="w-3.5 h-3.5" />
                Abrir câmera
              </button>
              <button
                onClick={handleSkip}
                disabled={uploading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#d0dbe6] text-xs font-semibold text-nfv-ice-muted hover:border-nfv-cyan/30 transition-all disabled:opacity-30"
              >
                Pular pose
              </button>
            </div>

            {/* Botão principal */}
            <button
              onClick={handleNext}
              disabled={!currentFile || uploading}
              className="w-full py-2.5 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all disabled:opacity-30 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analisando...
                </>
              ) : isLast ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Finalizar
                </>
              ) : (
                <>
                  Próxima pose
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Câmera fullscreen com instrução da pose */}
      {cameraOpen && currentPose && (
        <div className="fixed inset-0 z-50">
          {/* Instrução flutuante sobre o viewfinder */}
          <div className="absolute top-16 left-0 right-0 z-[60] px-4 pointer-events-none">
            <div className="bg-black/70 text-white text-xs text-center p-3 rounded-xl backdrop-blur-sm">
              <p className="font-bold text-nfv-cyan mb-1">
                {currentPose.nome_pt}
              </p>
              <p className="text-[11px] opacity-80">{currentPose.instrucao}</p>
            </div>
          </div>
          <CameraCapture
            mode="photo"
            onCapture={handleCameraCapture}
            onClose={() => setCameraOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
