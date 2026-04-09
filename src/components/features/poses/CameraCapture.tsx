'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Video, Square, RotateCcw, Check, X } from 'lucide-react';

type CaptureMode = 'photo' | 'video';

interface CameraCaptureProps {
  mode: CaptureMode;
  onCapture: (file: File, preview: string) => void;
  onClose: () => void;
}

export default function CameraCapture({
  mode,
  onCapture,
  onClose,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [started, setStarted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [captured, setCaptured] = useState<File | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment',
  );
  const [error, setError] = useState<string | null>(null);
  const [recTime, setRecTime] = useState(0);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: mode === 'video',
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStarted(true);
      setError(null);
    } catch {
      setError(
        'Câmera não disponível. Permita o acesso à câmera nas configurações do navegador.',
      );
    }
  }, [facingMode, mode]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Timer de gravação
  useEffect(() => {
    if (!recording) {
      setRecTime(0);
      return;
    }
    const interval = setInterval(() => setRecTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [recording]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], 'camera-pose.jpg', {
          type: 'image/jpeg',
        });
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreview(dataUrl);
        setCaptured(file);
      },
      'image/jpeg',
      0.85,
    );
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const mr = new MediaRecorder(streamRef.current, { mimeType });
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const file = new File([blob], 'camera-video.webm', {
        type: 'video/webm',
      });
      const url = URL.createObjectURL(blob);
      setPreview(url);
      setCaptured(file);
    };
    mr.start(100);
    mediaRef.current = mr;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const handleFlip = () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const handleConfirm = () => {
    if (!captured || !preview) return;
    onCapture(captured, preview);
    onClose();
  };

  const handleRetake = () => {
    setPreview(null);
    setCaptured(null);
    setRecTime(0);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={onClose} className="p-2">
          <X className="w-6 h-6" />
        </button>
        <p className="text-sm font-semibold">
          {mode === 'photo' ? '📸 Foto da Pose' : '🎬 Gravar Poses'}
        </p>
        <button onClick={handleFlip} className="p-2">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        {preview && mode === 'photo' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            className="w-full h-full object-contain bg-black"
            alt="preview"
          />
        ) : preview && mode === 'video' ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            src={preview}
            className="w-full h-full object-contain bg-black"
            controls
          />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        )}

        {/* Grid overlay + silhueta guia */}
        {!preview && started && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '33.33% 33.33%',
              }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
              <div
                style={{
                  width: '120px',
                  height: '280px',
                  border: '2px solid #00bcd4',
                  borderRadius: '60px 60px 20px 20px',
                }}
              />
            </div>
          </div>
        )}

        {/* Recording indicator */}
        {recording && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-white text-sm font-bold">
              {formatTime(recTime)}
            </span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/80 text-white text-sm text-center p-6 rounded-2xl mx-4">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Controles */}
      <div className="p-8 flex items-center justify-center gap-8">
        {preview ? (
          <>
            <button
              onClick={handleRetake}
              className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center"
            >
              <RotateCcw className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={handleConfirm}
              className="w-20 h-20 rounded-full bg-nfv-aurora flex items-center justify-center shadow-2xl"
            >
              <Check className="w-8 h-8 text-white" />
            </button>
          </>
        ) : mode === 'photo' ? (
          <button
            onClick={capturePhoto}
            disabled={!started}
            className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl disabled:opacity-30"
          >
            <div className="w-16 h-16 rounded-full border-4 border-gray-300" />
          </button>
        ) : recording ? (
          <button
            onClick={stopRecording}
            className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-2xl"
          >
            <Square className="w-8 h-8 text-white fill-white" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            disabled={!started}
            className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-2xl disabled:opacity-30"
          >
            <Video className="w-8 h-8 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
