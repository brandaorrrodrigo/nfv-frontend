// Renderiza landmarks MediaPipe em canvas
// Landmarks são coordenadas normalizadas (0-1) — multiplicar por width/height

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

// Conexões do esqueleto MediaPipe Pose (33 landmarks)
export const POSE_CONNECTIONS: [string, string][] = [
  // Rosto
  ['nose', 'left_eye'],
  ['nose', 'right_eye'],
  ['left_eye', 'left_ear'],
  ['right_eye', 'right_ear'],
  // Ombros e braços
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  // Tronco
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  // Pernas
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
  // Pés
  ['left_ankle', 'left_heel'],
  ['left_heel', 'left_foot_index'],
  ['right_ankle', 'right_heel'],
  ['right_heel', 'right_foot_index'],
];

// Landmarks por grupo (para colorir diferente)
export const LANDMARK_GROUPS = {
  face: [
    'nose',
    'left_eye',
    'right_eye',
    'left_ear',
    'right_ear',
    'mouth_left',
    'mouth_right',
  ],
  upper_body: [
    'left_shoulder',
    'right_shoulder',
    'left_elbow',
    'right_elbow',
    'left_wrist',
    'right_wrist',
  ],
  torso: ['left_hip', 'right_hip'],
  lower_body: [
    'left_knee',
    'right_knee',
    'left_ankle',
    'right_ankle',
    'left_heel',
    'right_heel',
    'left_foot_index',
    'right_foot_index',
  ],
};

// Ângulos a exibir com arco + valor
export const DISPLAY_ANGLES = [
  {
    name: 'Cotovelo Esq',
    key: 'cotovelo_esq',
    points: ['left_wrist', 'left_elbow', 'left_shoulder'] as [
      string,
      string,
      string,
    ],
    color: '#00bcd4',
  },
  {
    name: 'Cotovelo Dir',
    key: 'cotovelo_dir',
    points: ['right_wrist', 'right_elbow', 'right_shoulder'] as [
      string,
      string,
      string,
    ],
    color: '#00bcd4',
  },
  {
    name: 'Joelho Esq',
    key: 'joelho_esq',
    points: ['left_hip', 'left_knee', 'left_ankle'] as [
      string,
      string,
      string,
    ],
    color: '#ff9100',
  },
  {
    name: 'Joelho Dir',
    key: 'joelho_dir',
    points: ['right_hip', 'right_knee', 'right_ankle'] as [
      string,
      string,
      string,
    ],
    color: '#ff9100',
  },
  {
    name: 'Ombro Esq',
    key: 'abducao_ombro_esq',
    points: ['left_elbow', 'left_shoulder', 'left_hip'] as [
      string,
      string,
      string,
    ],
    color: '#7c4dff',
  },
  {
    name: 'Ombro Dir',
    key: 'abducao_ombro_dir',
    points: ['right_elbow', 'right_shoulder', 'right_hip'] as [
      string,
      string,
      string,
    ],
    color: '#7c4dff',
  },
];

function toPixel(
  lm: LandmarkPoint,
  width: number,
  height: number,
): [number, number] {
  return [lm.x * width, lm.y * height];
}

function calcAngle(
  a: LandmarkPoint,
  b: LandmarkPoint,
  c: LandmarkPoint,
): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
  const magB = Math.sqrt(bc.x ** 2 + bc.y ** 2);
  if (magA === 0 || magB === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / (magA * magB)));
  return Math.round((Math.acos(cos) * 180) / Math.PI);
}

export interface RenderOptions {
  showAngles: boolean;
  showSkeleton: boolean;
  showPoints: boolean;
  championAngles?: Record<string, number>;
  highlightErrors: boolean;
  opacity: number;
}

export const DEFAULT_RENDER_OPTIONS: RenderOptions = {
  showAngles: true,
  showSkeleton: true,
  showPoints: true,
  highlightErrors: true,
  opacity: 1,
};

export function renderLandmarks(
  canvas: HTMLCanvasElement,
  landmarks: Record<string, LandmarkPoint>,
  options: RenderOptions = DEFAULT_RENDER_OPTIONS,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height } = canvas;

  // ── Skeleton connections ────────────────────────────────────────────────
  if (options.showSkeleton) {
    ctx.lineWidth = Math.max(2, width / 200);
    ctx.lineCap = 'round';
    ctx.strokeStyle = `rgba(0, 188, 212, ${options.opacity * 0.8})`;

    for (const [a, b] of POSE_CONNECTIONS) {
      const lmA = landmarks[a];
      const lmB = landmarks[b];
      if (!lmA || !lmB) continue;
      if ((lmA.visibility ?? 1) < 0.4 || (lmB.visibility ?? 1) < 0.4) continue;

      const [x1, y1] = toPixel(lmA, width, height);
      const [x2, y2] = toPixel(lmB, width, height);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // ── Landmark points ─────────────────────────────────────────────────────
  if (options.showPoints) {
    for (const [name, lm] of Object.entries(landmarks)) {
      if ((lm.visibility ?? 1) < 0.4) continue;

      const [x, y] = toPixel(lm, width, height);
      const radius = Math.max(4, width / 120);

      // Cor por grupo
      let color = '#00bcd4';
      if (LANDMARK_GROUPS.face.includes(name)) color = '#ffffff';
      if (LANDMARK_GROUPS.upper_body.includes(name)) color = '#00e5ff';
      if (LANDMARK_GROUPS.torso.includes(name)) color = '#69f0ae';
      if (LANDMARK_GROUPS.lower_body.includes(name)) color = '#ffab40';

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.globalAlpha = options.opacity;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  // ── Angle labels ─────────────────────────────────────────────────────────
  if (options.showAngles) {
    const fontSize = Math.max(11, width / 45);
    ctx.font = `bold ${fontSize}px system-ui`;
    ctx.textAlign = 'center';

    for (const angleDef of DISPLAY_ANGLES) {
      const [aName, bName, cName] = angleDef.points;
      const lmA = landmarks[aName];
      const lmB = landmarks[bName];
      const lmC = landmarks[cName];

      if (!lmA || !lmB || !lmC) continue;
      if (
        (lmA.visibility ?? 1) < 0.4 ||
        (lmB.visibility ?? 1) < 0.4 ||
        (lmC.visibility ?? 1) < 0.4
      )
        continue;

      const angle = calcAngle(lmA, lmB, lmC);
      const [vx, vy] = toPixel(lmB, width, height);

      // Comparar com ângulo do campeão
      const champAngle = options.championAngles?.[angleDef.key];
      const delta = champAngle !== undefined ? angle - Math.round(champAngle) : null;
      const isOff = delta !== null && Math.abs(delta) > 10;

      // Background do label
      const label = `${angle}°${
        delta !== null ? ` (${delta > 0 ? '+' : ''}${delta}°)` : ''
      }`;
      const textWidth = ctx.measureText(label).width;
      const padding = 4;
      const bx = vx - textWidth / 2 - padding;
      const by = vy - fontSize - padding * 2;
      const bw = textWidth + padding * 2;
      const bh = fontSize + padding * 2;

      // Fundo semi-transparente
      ctx.fillStyle =
        isOff && options.highlightErrors
          ? 'rgba(255, 23, 68, 0.85)'
          : 'rgba(0, 0, 0, 0.75)';
      ctx.globalAlpha = options.opacity;

      // roundRect (Chrome 99+, Safari 16+, Firefox 113+) com fallback
      const rr = (
        ctx as CanvasRenderingContext2D & {
          roundRect?: (
            x: number,
            y: number,
            w: number,
            h: number,
            r: number,
          ) => void;
        }
      ).roundRect;
      ctx.beginPath();
      if (typeof rr === 'function') {
        rr.call(ctx, bx, by, bw, bh, 4);
      } else {
        ctx.rect(bx, by, bw, bh);
      }
      ctx.fill();

      // Texto
      ctx.fillStyle =
        isOff && options.highlightErrors ? '#fff' : angleDef.color;
      ctx.globalAlpha = options.opacity;
      ctx.fillText(label, vx, vy - padding);
      ctx.globalAlpha = 1;
    }
  }
}

export function renderOnImage(
  canvas: HTMLCanvasElement,
  imageElement: HTMLImageElement,
  landmarks: Record<string, LandmarkPoint>,
  options: RenderOptions = DEFAULT_RENDER_OPTIONS,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Ajustar canvas ao tamanho da imagem
  canvas.width = imageElement.naturalWidth || imageElement.width;
  canvas.height = imageElement.naturalHeight || imageElement.height;

  // Desenhar imagem primeiro
  ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);

  // Overlay dos landmarks
  renderLandmarks(canvas, landmarks, options);
}
