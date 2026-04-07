// Client para os endpoints de Pose Analysis
// Base URL aponta para nfc-core (porta 3100) — adicionar ao .env.local:
// NEXT_PUBLIC_POSE_API_URL=http://localhost:3100
// O nfc-core usa app.setGlobalPrefix('api') no main.ts — todos os endpoints
// ficam sob /api/. Por isso o BASE inclui /api.

const POSE_API_HOST =
  process.env.NEXT_PUBLIC_POSE_API_URL || 'http://localhost:3100';
const POSE_API = `${POSE_API_HOST.replace(/\/$/, '')}/api`;

export type CategoryType =
  | 'mens_physique'
  | 'bikini'
  | 'classic_physique'
  | 'wellness'
  | 'bodybuilding'
  | 'figure'
  | 'womens_physique';

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  mens_physique: 'Mens Physique',
  bikini: 'Bikini',
  classic_physique: 'Classic Physique',
  wellness: 'Wellness',
  bodybuilding: 'Bodybuilding Open',
  figure: 'Figure',
  womens_physique: "Women's Physique",
};

export const CATEGORY_POSES: Record<CategoryType, number> = {
  mens_physique: 3,
  bikini: 4,
  classic_physique: 5,
  wellness: 4,
  bodybuilding: 8,
  figure: 4,
  womens_physique: 7,
};

export const CATEGORY_GENDER: Record<CategoryType, 'M' | 'F' | 'MF'> = {
  mens_physique: 'M',
  bikini: 'F',
  classic_physique: 'M',
  wellness: 'F',
  bodybuilding: 'M',
  figure: 'F',
  womens_physique: 'F',
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
};
