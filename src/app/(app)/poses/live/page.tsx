'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Check, Play } from 'lucide-react';
import { CATEGORY_POSE_LIST, CATEGORY_LABELS } from '@/lib/api/pose-analysis';
import type { CategoryType } from '@/lib/api/pose-analysis';

// Ângulos alvo simplificados para feedback em tempo real
const TARGET_ANGLES: Record<
  string,
  { joint: string; min: number; max: number }[]
> = {
  quarter_turn_front: [
    { joint: 'alinhamento_tronco', min: 165, max: 185 },
    { joint: 'joelho_esq', min: 160, max: 180 },
    { joint: 'joelho_dir', min: 160, max: 180 },
  ],
  front_double_biceps_open: [
    { joint: 'cotovelo_esq', min: 80, max: 110 },
    { joint: 'cotovelo_dir', min: 80, max: 110 },
    { joint: 'abducao_ombro_esq', min: 70, max: 110 },
    { joint: 'abducao_ombro_dir', min: 70, max: 110 },
  ],
  front_double_biceps: [
    { joint: 'cotovelo_esq', min: 75, max: 105 },
    { joint: 'cotovelo_dir', min: 75, max: 105 },
    { joint: 'abducao_ombro_esq', min: 70, max: 110 },
    { joint: 'abducao_ombro_dir', min: 70, max: 110 },
  ],
  neutral_stage_presence: [
    { joint: 'alinhamento_tronco', min: 168, max: 185 },
    { joint: 'joelho_esq', min: 160, max: 180 },
    { joint: 'joelho_dir', min: 160, max: 180 },
  ],
};

function calcAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number },
): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const mag =
    Math.sqrt(ba.x ** 2 + ba.y ** 2) * Math.sqrt(bc.x ** 2 + bc.y ** 2);
  if (mag === 0) return 0;
  return Math.round(
    (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI,
  );
}

// MediaPipe landmark indices for joints
const JOINTS: Record<string, [number, number, number]> = {
  cotovelo_esq: [15, 13, 11],
  cotovelo_dir: [16, 14, 12],
  joelho_esq: [23, 25, 27],
  joelho_dir: [24, 26, 28],
  abducao_ombro_esq: [13, 11, 23],
  abducao_ombro_dir: [14, 12, 24],
  alinhamento_tronco: [11, 23, 25],
};

// Skeleton connections (MediaPipe indices)
const CONNECTIONS: [number, number][] = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

function LiveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoria = (searchParams.get('categoria') ??
    'mens_physique') as CategoryType;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const detectorRef = useRef<any>(null);
  const holdRef = useRef(0);

  const [poseIdx, setPoseIdx] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'off' | null>(null);
  const [correction, setCorrection] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [holdTimer, setHoldTimer] = useState(0);
  const [poseOK, setPoseOK] = useState(false);

  const poses = CATEGORY_POSE_LIST[categoria] ?? [];
  const currentPose = poses[poseIdx];
  const targets = currentPose
    ? (TARGET_ANGLES[currentPose.id] ?? [])
    : [];

  // Inicializar MediaPipe WASM
  const initMediaPipe = useCallback(async () => {
    setLoading(true);
    try {
      const { PoseLandmarker, FilesetResolver } = await import(
        '@mediapipe/tasks-vision'
      );
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
      );
      detectorRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    } catch (err) {
      console.error('MediaPipe init error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Loop de detecção
  const runDetection = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !detectorRef.current) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const detect = (timestamp: number) => {
      if (!video.paused && !video.ended && detectorRef.current) {
        try {
          const results = detectorRef.current.detectForVideo(video, timestamp);

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();

          if (results.landmarks?.[0]) {
            const lm = results.landmarks[0];
            drawSkeleton(ctx, lm, canvas.width, canvas.height);
            evaluatePose(lm);
          }
        } catch {
          /* noop */
        }
      }
      animRef.current = requestAnimationFrame(detect);
    };

    animRef.current = requestAnimationFrame(detect);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets]);

  const drawSkeleton = (
    ctx: CanvasRenderingContext2D,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lm: any[],
    w: number,
    h: number,
  ) => {
    const isCorrect = feedback === 'correct';
    ctx.lineWidth = 3;
    ctx.strokeStyle = isCorrect ? '#00c853' : '#00bcd4';
    ctx.globalAlpha = 0.8;

    for (const [a, b] of CONNECTIONS) {
      if (lm[a]?.visibility > 0.5 && lm[b]?.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo((1 - lm[a].x) * w, lm[a].y * h);
        ctx.lineTo((1 - lm[b].x) * w, lm[b].y * h);
        ctx.stroke();
      }
    }

    for (const point of lm) {
      if (point.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc((1 - point.x) * w, point.y * h, 4, 0, 2 * Math.PI);
        ctx.fillStyle = isCorrect ? '#00c853' : '#00e5ff';
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const evaluatePose = (lm: any[]) => {
    if (targets.length === 0) {
      setFeedback('correct');
      return;
    }

    const pts = (i: number) => ({ x: lm[i]?.x ?? 0, y: lm[i]?.y ?? 0 });

    let allOK = true;
    let firstErr: string | null = null;

    for (const target of targets) {
      const indices = JOINTS[target.joint];
      if (!indices) continue;
      const angle = calcAngle(
        pts(indices[0]),
        pts(indices[1]),
        pts(indices[2]),
      );
      if (angle < target.min || angle > target.max) {
        allOK = false;
        if (!firstErr) {
          const diff =
            angle < target.min ? target.min - angle : angle - target.max;
          firstErr = `${target.joint.replace(/_/g, ' ')}: ajuste ${diff}°`;
        }
      }
    }

    if (allOK) {
      setFeedback('correct');
      setCorrection(null);
      holdRef.current += 1;
      if (holdRef.current >= 30) {
        setPoseOK(true);
        setHoldTimer(5);
      }
    } else {
      setFeedback('off');
      setCorrection(firstErr);
      holdRef.current = 0;
      setPoseOK(false);
    }
  };

  // Iniciar câmera
  const startCamera = useCallback(async () => {
    await initMediaPipe();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStarted(true);
        // Delay para o vídeo inicializar
        setTimeout(() => runDetection(), 500);
      }
    } catch (err) {
      console.error('Camera error:', err);
    }
  }, [initMediaPipe, runDetection]);

  // Countdown quando pose OK → avança pra próxima
  useEffect(() => {
    if (!poseOK) return;
    if (holdTimer === 0) {
      if (poseIdx < poses.length - 1) {
        setPoseIdx((prev) => prev + 1);
        setPoseOK(false);
        holdRef.current = 0;
        setFeedback(null);
      }
      return;
    }
    const timer = setTimeout(() => setHoldTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [poseOK, holdTimer, poseIdx, poses.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-black/50 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-center">
          <p className="text-white text-xs font-semibold">
            {CATEGORY_LABELS[categoria]}
          </p>
          {currentPose && (
            <p className="text-[#00bcd4] text-xs">{currentPose.nome_pt}</p>
          )}
        </div>
        <div className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-lg">
          {poseIdx + 1}/{poses.length}
        </div>
      </div>

      {/* Canvas / Start screen */}
      <div className="flex-1 relative">
        {!started ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 p-6">
              <Camera className="w-16 h-16 text-[#64748b] mx-auto" />
              <div>
                <p className="text-white font-bold text-lg">
                  Análise em Tempo Real
                </p>
                <p className="text-[#64748b] text-sm mt-1">
                  MediaPipe detecta sua pose ao vivo e guia as correções
                </p>
              </div>
              <button
                onClick={startCamera}
                disabled={loading}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#2962ff] to-[#00bcd4] text-white font-bold flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
                {loading
                  ? 'Carregando MediaPipe...'
                  : 'Iniciar análise ao vivo'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} className="hidden" playsInline muted />
            <canvas ref={canvasRef} className="w-full h-full object-cover" />

            {/* Feedback overlay */}
            <div className="absolute bottom-32 left-0 right-0 flex flex-col items-center gap-3 px-4">
              {poseOK && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-green-500 px-6 py-3 rounded-2xl"
                >
                  <Check className="w-5 h-5 text-white" />
                  <span className="text-white font-bold">
                    Pose correta! Mantendo... {holdTimer}s
                  </span>
                </motion.div>
              )}
              {correction && !poseOK && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-black/70 backdrop-blur-sm px-5 py-3 rounded-2xl"
                >
                  <p className="text-[#ff9100] text-xs font-bold text-center">
                    {correction}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Instrução da pose */}
            {currentPose && (
              <div className="absolute top-16 left-0 right-0 px-4">
                <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 text-center">
                  <p className="text-white text-xs leading-relaxed">
                    {currentPose.instrucao}
                  </p>
                </div>
              </div>
            )}

            {/* Progress bar */}
            <div className="absolute bottom-6 left-4 right-4">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#00bcd4] rounded-full"
                  animate={{
                    width: `${(poseIdx / Math.max(1, poses.length)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function LivePosePage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#00bcd4]/30 border-t-[#00bcd4] rounded-full animate-spin" />
        </div>
      }
    >
      <LiveContent />
    </Suspense>
  );
}
