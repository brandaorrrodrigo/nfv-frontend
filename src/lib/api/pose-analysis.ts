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

export interface PoseInfo {
  id: string;
  nome: string;
  nome_pt: string;
  plano: 'frontal' | 'posterior' | 'sagital' | 'diagonal';
  instrucao: string;
  dica: string;
}

export const PLANE_LABELS: Record<string, string> = {
  frontal: '⬜ Frente para a câmera',
  posterior: '⬛ Costas para a câmera',
  sagital: '◧ Lateral para a câmera',
  diagonal: '◈ Diagonal para a câmera',
};

export const CATEGORY_POSE_LIST: Record<CategoryType, PoseInfo[]> = {
  mens_physique: [
    { id: 'front_double_biceps_open', nome: 'Front Double Biceps', nome_pt: 'Duplo Bíceps Frontal', plano: 'frontal', instrucao: 'Fique de frente, levante os braços com cotovelos na altura dos ombros, abra as mãos', dica: 'Pés paralelos, joelhos levemente dobrados, abdômen contraído' },
    { id: 'back_pose', nome: 'Back Pose', nome_pt: 'Pose de Costas', plano: 'posterior', instrucao: 'Vire de costas, abra os dorsais, um pé levemente atrás na ponta', dica: 'Ombros para trás e para baixo, cintura estreita' },
    { id: 'quarter_turn_front', nome: 'Quarter Turn Front', nome_pt: 'Quarto de Volta — Frente', plano: 'frontal', instrucao: 'Postura neutra de frente, pés paralelos na largura dos ombros', dica: 'Olhar fixo à frente, ombros abertos, abdômen contraído' },
    { id: 'quarter_turn_right', nome: 'Quarter Turn Right', nome_pt: 'Quarter Turn — Lateral Direito', plano: 'sagital', instrucao: 'Vire o lado direito para a câmera, pé direito levemente à frente', dica: 'Tronco completamente lateral, joelho dianteiro levemente dobrado' },
    { id: 'quarter_turn_left', nome: 'Quarter Turn Left', nome_pt: 'Quarter Turn — Lateral Esquerdo', plano: 'sagital', instrucao: 'Vire o lado esquerdo para a câmera, pé esquerdo levemente à frente', dica: 'Mesmo padrão do lateral direito — lado oposto' },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva — como você fica esperando entre as poses', dica: 'Pés paralelos, ombros abertos, mãos naturais ao lado do corpo' },
  ],
  classic_physique: [
    { id: 'front_double_biceps', nome: 'Front Double Biceps', nome_pt: 'Duplo Bíceps Frontal', plano: 'frontal', instrucao: 'De frente, cotovelos levemente abaixo de 90°, punhos fechados', dica: 'Pico máximo do bíceps — cotovelo levemente abaixo da linha do ombro' },
    { id: 'side_chest', nome: 'Side Chest', nome_pt: 'Peitoral Lateral', plano: 'sagital', instrucao: 'Lateral para a câmera, braço frontal cruzando o tórax, joelho dianteiro dobrado', dica: 'Escolha o melhor lado — maximize a espessura do peitoral' },
    { id: 'back_double_biceps', nome: 'Back Double Biceps', nome_pt: 'Duplo Bíceps Costas', plano: 'posterior', instrucao: 'De costas, mesmo posição do front double biceps, um pé atrás na ponta', dica: 'Mostre a cintura estreita — diferencial do Classic Physique' },
    { id: 'side_triceps', nome: 'Side Triceps', nome_pt: 'Tríceps Lateral', plano: 'sagital', instrucao: 'Lateral para a câmera, braço estendido ao lado do corpo mostrando o tríceps', dica: 'Extensão máxima — separa o tríceps lateralmente' },
    { id: 'abdominals_thighs', nome: 'Abdominals & Thighs', nome_pt: 'Abdômen e Coxas', plano: 'frontal', instrucao: 'De frente, mãos atrás da nuca, joelho dianteiro dobrado, contraia o abdômen', dica: 'Não empurre o abdômen — contraia e mostre a definição' },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva', dica: 'Pés paralelos, ombros abertos, mãos naturais' },
  ],
  bikini: [
    { id: 'quarter_turn_front', nome: 'Quarter Turn Front', nome_pt: 'Quarto de Volta — Frente', plano: 'frontal', instrucao: 'De frente, postura elegante, um pé ligeiramente à frente do outro', dica: 'Sorriso natural, ombros para trás, quadril levemente projetado' },
    { id: 'quarter_turn_right', nome: 'Quarter Turn Right', nome_pt: 'Quarto de Volta — Lateral Direito', plano: 'sagital', instrucao: 'Lateral direita para a câmera, postura elegante', dica: 'Glúteo contraído, coluna ereta, expressão confiante' },
    { id: 'quarter_turn_back', nome: 'Quarter Turn Back', nome_pt: 'Quarto de Volta — Costas', plano: 'posterior', instrucao: 'De costas para a câmera, postura elegante', dica: 'Glúteo firme, postura vertical, não se curve' },
    { id: 'quarter_turn_left', nome: 'Quarter Turn Left', nome_pt: 'Quarto de Volta — Lateral Esquerdo', plano: 'sagital', instrucao: 'Lateral esquerda para a câmera', dica: 'Mesmo padrão do lateral direito' },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva feminina', dica: 'Elegante, confiante, sorriso natural' },
  ],
  wellness: [
    { id: 'quarter_turn_front', nome: 'Quarter Turn Front', nome_pt: 'Quarto de Volta — Frente', plano: 'frontal', instrucao: 'De frente, postura elegante destacando a proporção', dica: 'Glúteo e coxas desenvolvidos são o foco — posicione para valorizar' },
    { id: 'quarter_turn_right', nome: 'Quarter Turn Right', nome_pt: 'Quarto de Volta — Lateral Direito', plano: 'sagital', instrucao: 'Lateral direita para a câmera', dica: 'Perfil do glúteo e coxas — diferencial do Wellness' },
    { id: 'quarter_turn_back', nome: 'Quarter Turn Back', nome_pt: 'Quarto de Volta — Costas', plano: 'posterior', instrucao: 'De costas para a câmera', dica: 'Glúteo e isquiotibiais são avaliados aqui' },
    { id: 'quarter_turn_left', nome: 'Quarter Turn Left', nome_pt: 'Quarto de Volta — Lateral Esquerdo', plano: 'sagital', instrucao: 'Lateral esquerda para a câmera', dica: 'Mesmo padrão do lateral direito' },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva', dica: 'Feminina e confiante' },
  ],
  bodybuilding: [
    { id: 'bb_front_double_biceps', nome: 'Front Double Biceps', nome_pt: 'Duplo Bíceps Frontal', plano: 'frontal', instrucao: 'De frente, cotovelos na linha dos ombros, punhos fechados', dica: 'Máxima contração — cada músculo visível' },
    { id: 'bb_front_lat_spread', nome: 'Front Lat Spread', nome_pt: 'Abertura de Dorsais Frontal', plano: 'frontal', instrucao: 'De frente, cotovelos para baixo e para fora, mãos no quadril abrindo os dorsais', dica: 'V-taper máximo' },
    { id: 'bb_side_chest', nome: 'Side Chest', nome_pt: 'Peitoral Lateral', plano: 'sagital', instrucao: 'Lateral para a câmera, braço frontal cruzando o tórax', dica: 'Espessura máxima do peitoral' },
    { id: 'bb_back_double_biceps', nome: 'Back Double Biceps', nome_pt: 'Duplo Bíceps Costas', plano: 'posterior', instrucao: 'De costas, mesma posição do front, um pé atrás na ponta', dica: 'Densidade muscular posterior total' },
    { id: 'bb_back_lat_spread', nome: 'Back Lat Spread', nome_pt: 'Abertura de Dorsais Costas', plano: 'posterior', instrucao: 'De costas, abrindo os dorsais ao máximo', dica: 'Largura máxima de costas' },
    { id: 'bb_side_triceps', nome: 'Side Triceps', nome_pt: 'Tríceps Lateral', plano: 'sagital', instrucao: 'Lateral para a câmera, tríceps estendido', dica: 'Separação máxima do tríceps' },
    { id: 'bb_abdominals_thighs', nome: 'Abdominals & Thighs', nome_pt: 'Abdômen e Coxas', plano: 'frontal', instrucao: 'De frente, mãos atrás da nuca, joelho dianteiro dobrado', dica: 'Definição abdominal e separação do quad' },
    { id: 'bb_most_muscular', nome: 'Most Muscular', nome_pt: 'Pose Mais Muscular', plano: 'frontal', instrucao: 'Crab ou mãos no quadril — contração máxima de todo o corpo', dica: 'Máxima densidade e separação muscular' },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra entre poses', dica: 'Nunca relaxe — os juízes sempre estão olhando' },
  ],
  figure: [
    { id: 'fig_quarter_turn_front', nome: 'Quarter Turn Front', nome_pt: 'Quarto de Volta — Frente', plano: 'frontal', instrucao: 'De frente, postura elegante com musculatura desenvolvida', dica: 'Figure é entre Bikini e Women\'s Physique — mostre músculo com feminilidade' },
    { id: 'fig_quarter_turn_right', nome: 'Quarter Turn Right', nome_pt: 'Quarto de Volta — Lateral Direito', plano: 'sagital', instrucao: 'Lateral direita para a câmera', dica: 'Perfil da musculatura' },
    { id: 'fig_quarter_turn_back', nome: 'Quarter Turn Back', nome_pt: 'Quarto de Volta — Costas', plano: 'posterior', instrucao: 'De costas para a câmera', dica: 'Musculatura posterior desenvolvida' },
    { id: 'fig_quarter_turn_left', nome: 'Quarter Turn Left', nome_pt: 'Quarto de Volta — Lateral Esquerdo', plano: 'sagital', instrucao: 'Lateral esquerda para a câmera', dica: 'Mesmo padrão do lateral direito' },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva', dica: 'Elegante e musculosa' },
  ],
  womens_physique: [
    { id: 'wp_front_double_biceps', nome: 'Front Double Biceps', nome_pt: 'Duplo Bíceps Frontal', plano: 'frontal', instrucao: 'De frente, cotovelos na linha dos ombros', dica: 'Musculatura feminina desenvolvida' },
    { id: 'wp_front_lat_spread', nome: 'Front Lat Spread', nome_pt: 'Abertura de Dorsais Frontal', plano: 'frontal', instrucao: 'De frente, abrindo os dorsais', dica: 'V-taper feminino de elite' },
    { id: 'wp_side_chest', nome: 'Side Chest', nome_pt: 'Peitoral Lateral', plano: 'sagital', instrucao: 'Lateral para a câmera, peitoral lateral', dica: 'Espessura com feminilidade' },
    { id: 'wp_back_double_biceps', nome: 'Back Double Biceps', nome_pt: 'Duplo Bíceps Costas', plano: 'posterior', instrucao: 'De costas, duplo bíceps', dica: 'Densidade muscular posterior' },
    { id: 'wp_back_lat_spread', nome: 'Back Lat Spread', nome_pt: 'Abertura de Dorsais Costas', plano: 'posterior', instrucao: 'De costas, abrindo dorsais', dica: 'V-taper de costas' },
    { id: 'wp_side_triceps', nome: 'Side Triceps', nome_pt: 'Tríceps Lateral', plano: 'sagital', instrucao: 'Lateral, tríceps estendido', dica: 'Separação do tríceps' },
    { id: 'wp_abdominals_thighs', nome: 'Abdominals & Thighs', nome_pt: 'Abdômen e Coxas', plano: 'frontal', instrucao: 'De frente, mãos atrás da nuca', dica: 'Definição abdominal feminina' },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva', dica: 'Musculosa e feminina' },
  ],
  bodybuilding_212: [
    { id: 'b212_front_double_biceps', nome: 'Front Double Biceps', nome_pt: 'Duplo Bíceps Frontal', plano: 'frontal', instrucao: 'De frente, cotovelos na linha dos ombros', dica: 'No 212, simetria é mais decisiva que tamanho' },
    { id: 'b212_front_lat_spread', nome: 'Front Lat Spread', nome_pt: 'Abertura de Dorsais Frontal', plano: 'frontal', instrucao: 'De frente, abrindo dorsais', dica: 'V-taper proporcional ao frame' },
    { id: 'b212_side_chest', nome: 'Side Chest', nome_pt: 'Peitoral Lateral', plano: 'sagital', instrucao: 'Lateral, peitoral lateral', dica: 'Espessura proporcional' },
    { id: 'b212_back_double_biceps', nome: 'Back Double Biceps', nome_pt: 'Duplo Bíceps Costas', plano: 'posterior', instrucao: 'De costas, duplo bíceps', dica: 'Cintura estreita — diferencial do 212' },
    { id: 'b212_back_lat_spread', nome: 'Back Lat Spread', nome_pt: 'Abertura de Dorsais Costas', plano: 'posterior', instrucao: 'De costas, abrindo dorsais', dica: 'V-taper proporcional' },
    { id: 'b212_side_triceps', nome: 'Side Triceps', nome_pt: 'Tríceps Lateral', plano: 'sagital', instrucao: 'Lateral, tríceps estendido', dica: 'Separação do tríceps' },
    { id: 'b212_abdominals_thighs', nome: 'Abdominals & Thighs', nome_pt: 'Abdômen e Coxas', plano: 'frontal', instrucao: 'De frente, mãos atrás da nuca', dica: 'Definição pode superar o Open' },
    { id: 'b212_most_muscular', nome: 'Most Muscular', nome_pt: 'Pose Mais Muscular', plano: 'frontal', instrucao: 'Crab ou mãos no quadril — contração máxima', dica: 'Densidade compensa volume menor' },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra entre poses', dica: 'Nunca relaxe' },
  ],
  womens_bodybuilding: [
    { id: 'wb_front_double_biceps', nome: 'Front Double Biceps', nome_pt: 'Duplo Bíceps Frontal', plano: 'frontal', instrucao: 'De frente, cotovelos na linha dos ombros', dica: 'Musculatura extrema é valorizada' },
    { id: 'wb_front_lat_spread', nome: 'Front Lat Spread', nome_pt: 'Abertura de Dorsais Frontal', plano: 'frontal', instrucao: 'De frente, abrindo dorsais', dica: 'V-taper feminino de elite' },
    { id: 'wb_side_chest', nome: 'Side Chest', nome_pt: 'Peitoral Lateral', plano: 'sagital', instrucao: 'Lateral, peitoral lateral', dica: 'Espessura com feminilidade' },
    { id: 'wb_back_double_biceps', nome: 'Back Double Biceps', nome_pt: 'Duplo Bíceps Costas', plano: 'posterior', instrucao: 'De costas, duplo bíceps', dica: 'Musculatura posterior máxima' },
    { id: 'wb_back_lat_spread', nome: 'Back Lat Spread', nome_pt: 'Abertura de Dorsais Costas', plano: 'posterior', instrucao: 'De costas, abrindo dorsais', dica: 'Largura máxima' },
    { id: 'wb_side_triceps', nome: 'Side Triceps', nome_pt: 'Tríceps Lateral', plano: 'sagital', instrucao: 'Lateral, tríceps estendido', dica: 'Separação máxima' },
    { id: 'wb_abdominals_thighs', nome: 'Abdominals & Thighs', nome_pt: 'Abdômen e Coxas', plano: 'frontal', instrucao: 'De frente, mãos atrás da nuca', dica: 'Definição extrema' },
    { id: 'wb_most_muscular', nome: 'Most Muscular', nome_pt: 'Pose Mais Muscular', plano: 'frontal', instrucao: 'Crab ou mãos no quadril', dica: 'Única categoria feminina com Most Muscular' },
    { id: 'neutral_stage_presence', nome: 'Stage Presence', nome_pt: 'Postura de Palco', plano: 'frontal', instrucao: 'Postura neutra competitiva', dica: 'Feminilidade é avaliada mesmo em repouso' },
  ],
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

  async compareWithChampions(
    atletaId: string,
    categoria: CategoryType,
    landmarks: Record<string, LandmarkPoint>,
    poseId?: string,
  ): Promise<{
    pose: string;
    score_atleta: number;
    comparacoes: Array<{
      atleta: string;
      similaridade: number;
      angulos_campeao: Record<string, number>;
    }>;
    melhor_match: {
      atleta: string;
      similaridade: number;
      angulos_campeao: Record<string, number>;
    } | null;
    gap_para_elite: number | null;
  } | null> {
    try {
      const res = await fetch(
        `${POSE_API}/nfv/pose-analysis/compare-champions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ atletaId, categoria, landmarks, poseId }),
        },
      );
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
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
    poseId?: string,
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
        rawResults: { categoria, atletaId, ...(poseId ? { poseId } : {}) },
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

  // ─── Upload de vídeo → MediaPipe → múltiplas poses → protocolo ───────────
  // Cria assessment do tipo POSE_ANALYSIS_VIDEO. O nfv-backend roda
  // pose_analysis_video.py que extrai frames a 2fps, detecta segmentos
  // estáticos, identifica cada pose IFBB e gera protocolo via nfc-core.
  async uploadVideoAndAnalyze(
    file: File,
    categoria: CategoryType,
    atletaId: string,
    patientId: string,
    onProgress?: (step: string) => void,
  ): Promise<{
    assessmentId: string;
    status: string;
    poses_detected?: Array<{
      segmento_idx: number;
      pose_id: string;
      avg_confidence: number;
      frames_no_segmento: number;
      landmarks: Record<string, LandmarkPoint>;
    }>;
    session?: unknown;
    protocol?: AthletePosingProtocol;
    video_duration_s?: number;
    total_poses_found?: number;
    avg_confidence?: number;
  }> {
    onProgress?.('Convertendo vídeo...');

    const base64 = await fileToBase64(file);
    const token = readCookie('nfv_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    onProgress?.('Enviando para o servidor...');

    const createRes = await fetch(`${NFV_BACKEND}/assessments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        patientId,
        type: 'POSE_ANALYSIS_VIDEO',
        mediaUrl: base64,
        mediaType: 'VIDEO',
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

    onProgress?.('Processando vídeo com MediaPipe...');

    // Vídeos demoram mais — máximo 10 minutos (300 polls × 2s)
    const MAX_POLLS = 300;
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
        const raw = data.rawResults ?? {};
        return {
          assessmentId,
          status,
          poses_detected: raw.poses_detected,
          session: raw.session,
          protocol: raw.protocol,
          video_duration_s: raw.video_duration_s,
          total_poses_found: raw.total_poses_found,
          avg_confidence: raw.avg_confidence,
        };
      }

      if (status === 'FAILED') {
        throw new Error(
          data.errorMessage || 'Processamento do vídeo falhou.',
        );
      }

      // Mensagens de progresso baseadas no tempo decorrido
      const elapsed = (attempt * POLL_INTERVAL_MS) / 1000;
      if (elapsed < 30) onProgress?.('Extraindo frames do vídeo...');
      else if (elapsed < 60) onProgress?.('Detectando landmarks com MediaPipe...');
      else if (elapsed < 120) onProgress?.('Identificando poses IFBB...');
      else if (elapsed < 240) onProgress?.('Filtrando segmentos estáticos...');
      else onProgress?.('Gerando protocolo personalizado...');
    }

    throw new Error(
      'Timeout: processamento do vídeo demorou mais de 10 minutos.',
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
