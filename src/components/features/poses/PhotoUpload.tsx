'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, AlertCircle, Camera, Info } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoSelected: (file: File | null) => void;
  selectedFile: File | null;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
};

const TIPS = [
  'Roupa ajustada que mostre o contorno do corpo',
  'Corpo inteiro visível (cabeça aos pés)',
  'Fundo neutro e iluminação uniforme',
  'Câmera na altura do quadril, distância 2-3m',
];

export default function PhotoUpload({
  onPhotoSelected,
  selectedFile,
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const code = rejectedFiles[0]?.errors[0]?.code;
        if (code === 'file-too-large') {
          setError('Arquivo maior que 10MB. Reduza o tamanho da imagem.');
        } else if (code === 'file-invalid-type') {
          setError('Formato inválido. Use JPG, PNG ou WebP.');
        } else {
          setError('Não foi possível usar este arquivo.');
        }
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      // Gerar preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      onPhotoSelected(file);
    },
    [onPhotoSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE_BYTES,
    multiple: false,
  });

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onPhotoSelected(null);
  };

  // Estado: COM PREVIEW
  if (selectedFile && preview) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="relative rounded-2xl overflow-hidden border border-[#d0dbe6] bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Pose do atleta"
            className="w-full h-64 object-contain bg-[#f5f8fb]"
          />
          <button
            onClick={handleRemove}
            type="button"
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/95 text-red-500 hover:bg-red-50 transition-colors shadow-md"
            aria-label="Remover foto"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/95 text-white text-xs font-semibold shadow-md">
            <Check className="w-3 h-3" />
            Foto carregada
          </div>
        </div>

        <div className="bg-[#f5f8fb] rounded-xl p-3">
          <div className="flex items-center justify-between text-xs text-nfv-ice-medium">
            <span className="font-medium truncate flex-1 mr-2">
              {selectedFile.name}
            </span>
            <span className="text-nfv-ice-muted flex-shrink-0">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Estado: VAZIO ou DRAG ACTIVE
  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`
          relative rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-200 p-8
          ${
            isDragActive
              ? 'border-nfv-cyan bg-nfv-cyan/5 scale-[1.01]'
              : error
                ? 'border-red-300 bg-red-50/30'
                : 'border-[#d0dbe6] bg-[#f5f8fb] hover:border-nfv-cyan/40 hover:bg-[#e8f0fe]'
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
              isDragActive
                ? 'bg-nfv-cyan/20 text-nfv-cyan scale-110'
                : 'bg-white text-nfv-ice-muted'
            }`}
          >
            {isDragActive ? (
              <Upload className="w-6 h-6" />
            ) : (
              <Camera className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-nfv-ice">
              {isDragActive
                ? 'Solte a foto aqui'
                : 'Arraste uma foto ou clique para enviar'}
            </p>
            <p className="text-xs text-nfv-ice-muted mt-1">
              JPG, PNG ou WebP — máx. 10MB
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200"
          >
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dicas */}
      <div className="bg-[#f5f8fb] rounded-xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Info className="w-3.5 h-3.5 text-nfv-cyan" />
          <p className="text-xs font-semibold text-nfv-ice">
            Dicas para melhor detecção
          </p>
        </div>
        <ul className="space-y-1.5">
          {TIPS.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-xs text-nfv-ice-medium"
            >
              <span className="text-nfv-cyan mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
