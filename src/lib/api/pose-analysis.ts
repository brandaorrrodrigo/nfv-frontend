// Client para os endpoints de Pose Analysis
// Base URL aponta para nfc-core (porta 3100) — adicionar ao .env.local:
// NEXT_PUBLIC_POSE_API_URL=http://localhost:3100
// O nfc-core usa app.setGlobalPrefix('api') no main.ts — todos os endpoints
// ficam sob /api/. Por isso o BASE inclui /api.

const POSE_API_HOST =
  process.env.NEXT_PUBLIC_POSE_API_URL || 'http://localhost:3100';
const POSE_API = `${POSE_API_HOST.replace(/\/$/, '')}/api`;

// NFV Backend (assessments + MediaPipe pipeline) — porta 3002
const NFV_BACKEND_HOST =
  process.env.NEXT_PUBLIC_NFV_BACKEND_URL || 'http://localhost:3002';
const NFV_BACKEND = `${NFV_BACKEND_HOST.replace(/\/$/, '')}/api/v1`;

export type CategoryType =
  | 'mens_physique'
  | 'bikini'
  | 'classic_physique'
  | 'wellness'
  | 'bodybuilding'
  | 'figure'
  | 'womens_physique'
  | 'bodybuilding_212'
  | 'womens_bodybuilding';

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  mens_physique: 'Mens Physique',
  bikini: 'Bikini',
  classic_physique: 'Classic Physique',
  wellness: 'Wellness',
  bodybuilding: 'Bodybuilding Open',
  figure: 'Figure',
  womens_physique: "Women's Physique",
  bodybuilding_212: '212 Bodybuilding',
  womens_bodybuilding: "Women's Bodybuilding",
};

export const CATEGORY_POSES: Record<CategoryType, number> = {
  mens_physique: 6,
  bikini: 5,
  classic_physique: 6,
  wellness: 5,
  bodybuilding: 9,
  figure: 5,
  womens_physique: 8,
  bodybuilding_212: 9,
  womens_bodybuilding: 9,
};

export const VALID_CATEGORIES: CategoryType[] = [
  'mens_physique',
  'classic_physique',
  'bodybuilding',
  'bodybuilding_212',
  'bikini',
  'wellness',
  'figure',
  'womens_physique',
  'womens_bodybuilding',
];

export const CATEGORY_GENDER: Record<CategoryType, 'M' | 'F' | 'MF'> = {
  mens_physique: 'M',
  bikini: 'F',
  classic_physique: 'M',
  wellness: 'F',
  bodybuilding: 'M',
  figure: 'F',
  womens_physique: 'F',
  bodybuilding_212: 'M',
  womens_bodybuilding: 'F',
};

export interface LandmarkPoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseAnalysisResult {
  pose_id: string;
  nome_pose: string;
  categoria: CategoryType;
  score_angulos: number;
  score_simetria: number;
  score_final: number;
  pontos_fortes: string[];
  correcoes_prioritarias: string[];
  dica_coach: string;
  comparacao_campeoes: { atleta: string; similaridade: number }[];
}

export interface PersonalizedPose {
  pose_id: string;
  nome_pose: string;
  score_estimado_sem_ajuste: number;
  score_estimado_com_ajuste: number;
  delta_melhoria: number;
  instrucoes_resumidas: string[];
  estrategias_aplicadas: {
    assimetria_alvo: string;
    instrucao_completa_pt: string;
    score_delta_estimado: number;
  }[];
}

export interface AthletePosingProtocol {
  atleta_id: string;
  categoria: CategoryType;
  gerado_em: string;
  poses: PersonalizedPose[];
  resumo_coach_pt: string;
  prioridades_treino_posing: string[];
  poses_mais_criticas: string[];
  poses_mais_fortes: string[];
  ganho_total_estimado: number;
}

export interface DetectedAsymmetry {
  tipo: string;
  regiao: string;
  magnitude: number;
  lado_afetado: string;
  mascarabilidade: 'total' | 'partial' | 'impossible';
  descricao_pt: string;
  impacto_competitivo: 'alto' | 'medio' | 'baixo';
}

export interface AsymmetryProfile {
  atletaId: string;
  categoria: CategoryType;
  score_simetria_geral: number;
  assimetrias: DetectedAsymmetry[];
  pontos_fortes: { regiao: string; score: number; descricao: string }[];
  resumo: string;
  total_assimetrias: number;
  mascaraveis: number;
}

// Mock de landmarks para demonstração (substitui MediaPipe temporariamente)
export const MOCK_SYMMETRIC_LANDMARKS: Record<string, LandmarkPoint> = {
  left_shoulder: { x: 0.35, y: 0.35, z: 0.0, visibility: 0.99 },
  right_shoulder: { x: 0.65, y: 0.35, z: 0.0, visibility: 0.99 },
  left_elbow: { x: 0.2, y: 0.35, z: 0.05, visibility: 0.99 },
  right_elbow: { x: 0.8, y: 0.35, z: 0.05, visibility: 0.99 },
  left_wrist: { x: 0.2, y: 0.55, z: 0.05, visibility: 0.99 },
  right_wrist: { x: 0.8, y: 0.55, z: 0.05, visibility: 0.99 },
  left_hip: { x: 0.4, y: 0.6, z: 0.0, visibility: 0.99 },
  right_hip: { x: 0.6, y: 0.6, z: 0.0, visibility: 0.99 },
  left_knee: { x: 0.4, y: 0.78, z: 0.0, visibility: 0.99 },
  right_knee: { x: 0.6, y: 0.78, z: 0.0, visibility: 0.99 },
  left_ankle: { x: 0.4, y: 0.95, z: 0.0, visibility: 0.99 },
  right_ankle: { x: 0.6, y: 0.95, z: 0.0, visibility: 0.99 },
  nose: { x: 0.5, y: 0.15, z: -0.1, visibility: 0.99 },
  left_ear: { x: 0.43, y: 0.15, z: 0.0, visibility: 0.9 },
  right_ear: { x: 0.57, y: 0.15, z: 0.0, visibility: 0.9 },
};

export const poseAnalysisApi = {
  async generateProtocol(
    atletaId: string,
    categoria: CategoryType,
    landmarks = MOCK_SYMMETRIC_LANDMARKS,
    salvar = true,
  ): Promise<AthletePosingProtocol> {
    const res = await fetch(`${POSE_API}/nfv/pose-analysis/protocol`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ atletaId, categoria, landmarks, salvar }),
    });
    if (!res.ok) throw new Error(`Protocol error: ${res.status}`);
    return res.json();
  },

  async detectAsymmetries(
    atletaId: string,
    categoria: CategoryType,
    landmarks = MOCK_SYMMETRIC_LANDMARKS,
  ): Promise<AsymmetryProfile> {
    const res = await fetch(`${POSE_API}/nfv/pose-analysis/asymmetries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ atletaId, categoria, landmarks }),
    });
    if (!res.ok) throw new Error(`Asymmetry error: ${res.status}`);
    return res.json();
  },

  async getHistory(atletaId: string, categoria?: CategoryType) {
    const url = `${POSE_API}/nfv/pose-analysis/history/${atletaId}${categoria ? `?categoria=${categoria}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`History error: ${res.status}`);
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${POSE_API}/nfv/pose-analysis/categories`);
    if (!res.ok) throw new Error(`Categories error: ${res.status}`);
    return res.json();
  },

  async analyzeSession(
    atletaId: string,
    categoria: CategoryType,
    poses: { poseId: string; landmarks: Record<string, LandmarkPoint> }[],
    salvar = true,
  ) {
    const res = await fetch(`${POSE_API}/nfv/pose-analysis/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ atletaId, categoria, poses, salvar }),
    });
    if (!res.ok) throw new Error(`Session error: ${res.status}`);
    return res.json();
  },

  // ─── Upload de foto real → MediaPipe → nfc-core protocolo ────────────────
  // Cria assessment do tipo POSE_ANALYSIS no nfv-backend, faz polling até
  // o BullMQ rodar pose_analysis.py que extrai landmarks via MediaPipe e
  // chama o nfc-core para gerar o protocolo IFBB completo.
  async uploadAndAnalyze(
    file: File,
    categoria: CategoryType,
    atletaId: string,
    patientId: string,
  ): Promise<{
    assessmentId: string;
    status: string;
    landmarks: Record<string, LandmarkPoint>;
    protocol: AthletePosingProtocol;
    asymmetries: AsymmetryProfile | null;
    scores: Record<string, number>;
    avg_confidence?: number;
  }> {
    // 1. Foto → base64 data URI
    const base64 = await fileToBase64(file);

    // 2. Token do cookie nfv_token (se houver)
    const token = readCookie('nfv_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // 3. POST /assessments
    const createRes = await fetch(`${NFV_BACKEND}/assessments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId,
        type: 'POSE_ANALYSIS',
        mediaUrl: base64,
        mediaType: 'PHOTO',
        rawResults: { categoria, atletaId },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text().catch(() => '');
      throw new Error(
        `Falha ao criar assessment (${createRes.status}): ${errText.slice(0, 200)}`,
      );
    }

    const created = await createRes.json();
    const assessmentId: string = created.id ?? created.assessmentId;
    if (!assessmentId) {
      throw new Error('Resposta do backend sem assessmentId');
    }

    // 4. Polling — 60 tentativas × 2s = 120s máx
    const MAX_POLLS = 60;
    const POLL_INTERVAL_MS = 2000;

    for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

      const statusRes = await fetch(
        `${NFV_BACKEND}/assessments/${assessmentId}`,
        { headers },
      );
      if (!statusRes.ok) continue;

      const data = await statusRes.json();
      const status: string = data.status;

      if (status === 'COMPLETED') {
        // O processor salva o resultado completo do pose_analysis.py em rawResults
        const raw = data.rawResults ?? {};
        return {
          assessmentId,
          status,
          landmarks: raw.landmarks ?? data.landmarks ?? {},
          protocol: raw.protocol ?? null,
          asymmetries: raw.asymmetries ?? null,
          scores: raw.scores ?? data.scores ?? {},
          avg_confidence: raw.avg_confidence,
        };
      }

      if (status === 'FAILED') {
        throw new Error(
          data.errorMessage ||
            'Análise falhou. Verifique se a foto tem corpo inteiro visível.',
        );
      }
      // status === PENDING / QUEUED / PROCESSING → continua polling
    }

    throw new Error(
      'Timeout: a análise demorou mais de 2 minutos. Tente novamente com uma foto menor.',
    );
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1] ?? '') : null;
}
