'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Video, Upload, X, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoUploadProps {
  onVideoSelected: (file: File, preview: string) => void;
  onClear: () => void;
  preview: string | null;
  fileName: string | null;
  fileSize: number | null;
  disabled?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TIPS = [
  { icon: '👕', text: 'Roupa ajustada de cor clara' },
  { icon: '💡', text: 'Boa iluminação, fundo neutro' },
  { icon: '📐', text: 'Câmera na altura do peito' },
  { icon: '⏱️', text: 'Segure cada pose 3-5 segundos' },
  { icon: '🔄', text: 'Faça todas as poses em sequência' },
  { icon: '📏', text: 'Corpo inteiro no enquadramento' },
];

export default function VideoUpload({
  onVideoSelected,
  onClear,
  preview,
  fileName,
  fileSize,
  disabled = false,
}: VideoUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const code = rejected[0]?.errors[0]?.code;
        if (code === 'file-too-large') {
          setError('Vídeo maior que 500MB. Reduza o tamanho ou duração.');
        } else if (code === 'file-invalid-type') {
          setError('Formato inválido. Use MP4, MOV ou WebM.');
        } else {
          setError('Não foi possível usar este arquivo.');
        }
        return;
      }
      setError(null);
      const file = accepted[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      onVideoSelected(file, url);
    },
    [onVideoSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4':       ['.mp4'],
      'video/quicktime': ['.mov'],
      'video/webm':      ['.webm'],
      'video/x-msvideo': ['.avi'],
    },
    maxSize: 500 * 1024 * 1024,
    maxFiles: 1,
    disabled,
  });

  if (fileName) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#f5f8fb] border-2 border-nfv-cyan/30 rounded-2xl p-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-nfv-aurora/10 flex items-center justify-center flex-shrink-0">
            <Video className="w-6 h-6 text-nfv-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-nfv-ice truncate">
              {fileName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <p className="text-xs text-green-600">
                {fileSize ? formatSize(fileSize) : ''} — pronto para análise
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            type="button"
            className="p-2 rounded-lg text-nfv-ice-muted hover:text-red-500 hover:bg-red-50 transition-colors"
            aria-label="Remover vídeo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {preview && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={preview}
            controls
            className="w-full mt-3 rounded-xl max-h-48 bg-black"
          />
        )}
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${
            isDragActive
              ? 'border-nfv-cyan bg-nfv-cyan/5'
              : 'border-[#d0dbe6] hover:border-nfv-cyan/50 hover:bg-[#f5f8fb]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-nfv-aurora/10 flex items-center justify-center">
            {isDragActive ? (
              <Upload className="w-7 h-7 text-nfv-cyan" />
            ) : (
              <Video className="w-7 h-7 text-nfv-ice-muted" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-nfv-ice">
              {isDragActive
                ? 'Solte o vídeo aqui'
                : 'Arraste ou clique para enviar o vídeo'}
            </p>
            <p className="text-xs text-nfv-ice-muted mt-1">
              MP4, MOV ou WebM • Máximo 500MB • 10 minutos
            </p>
          </div>
        </div>
      </div>

      {/* Instruções de gravação */}
      <div className="bg-[#f5f8fb] rounded-xl p-3 space-y-2">
        <p className="text-xs font-semibold text-nfv-ice">
          🎬 Como gravar para melhor análise:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-sm">{tip.icon}</span>
              <p className="text-[10px] text-nfv-ice-muted">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tempo estimado */}
      <div className="flex items-center gap-2 text-xs text-nfv-ice-muted">
        <Clock className="w-3.5 h-3.5" />
        <span>
          Tempo de processamento: ~2-5 min dependendo da duração do vídeo
        </span>
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
