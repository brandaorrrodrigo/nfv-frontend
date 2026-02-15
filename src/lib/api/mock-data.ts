import type {
  NFVUser,
  NFVPatient,
  NFVAssessment,
  NFVReport,
  NFVPlan,
  NFVDashboardStats,
  NFVLoginResponse,
  NFVLandmark,
  NFVAngle,
  NFVDeviation,
  NFVRecommendation,
} from './types';

// ==================== Mock User ====================

const user: NFVUser = {
  id: 'prof-001',
  name: 'Dr. João Silva',
  email: 'joao.silva@nutrifitcoach.com',
  profession: 'PHYSIOTHERAPIST',
  registerNumber: 'CREF 012345-G/SP',
  clinicName: 'Clínica PosturaViva',
  plan: 'PROFESSIONAL',
  createdAt: '2025-06-15T10:00:00Z',
};

// ==================== Mock Patients ====================

const patients: NFVPatient[] = [
  {
    id: 'pat-001',
    professionalId: 'prof-001',
    name: 'Maria Santos',
    birthDate: '1990-03-15',
    gender: 'FEMALE',
    height: 165,
    weight: 62,
    phone: '(11) 98765-4321',
    email: 'maria.santos@email.com',
    notes: 'Queixa de dor lombar crônica',
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
    totalAssessments: 3,
    lastAssessmentDate: '2026-01-20T14:30:00Z',
    lastScore: 72,
  },
  {
    id: 'pat-002',
    professionalId: 'prof-001',
    name: 'Carlos Oliveira',
    birthDate: '1985-07-22',
    gender: 'MALE',
    height: 178,
    weight: 85,
    phone: '(11) 91234-5678',
    email: 'carlos.oliveira@email.com',
    notes: 'Atleta amador, ombro direito mais baixo',
    createdAt: '2025-10-15T08:00:00Z',
    updatedAt: '2026-02-05T11:00:00Z',
    totalAssessments: 5,
    lastAssessmentDate: '2026-02-05T11:00:00Z',
    lastScore: 85,
  },
  {
    id: 'pat-003',
    professionalId: 'prof-001',
    name: 'Ana Beatriz Costa',
    birthDate: '1998-11-08',
    gender: 'FEMALE',
    height: 170,
    weight: 58,
    phone: '(21) 99876-5432',
    email: 'ana.costa@email.com',
    notes: 'Pós-graduação em dança, hiperlordose',
    createdAt: '2025-12-01T09:00:00Z',
    updatedAt: '2026-01-28T16:00:00Z',
    totalAssessments: 2,
    lastAssessmentDate: '2026-01-28T16:00:00Z',
    lastScore: 58,
  },
  {
    id: 'pat-004',
    professionalId: 'prof-001',
    name: 'Pedro Henrique Lima',
    birthDate: '1978-02-14',
    gender: 'MALE',
    height: 182,
    weight: 92,
    phone: '(11) 97654-3210',
    email: 'pedro.lima@email.com',
    notes: 'Sedentário, trabalho em escritório',
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-02-10T09:30:00Z',
    totalAssessments: 1,
    lastAssessmentDate: '2026-02-10T09:30:00Z',
    lastScore: 45,
  },
  {
    id: 'pat-005',
    professionalId: 'prof-001',
    name: 'Fernanda Rodrigues',
    birthDate: '1995-06-30',
    gender: 'FEMALE',
    height: 160,
    weight: 55,
    phone: '(31) 98877-6655',
    email: 'fernanda.rodrigues@email.com',
    createdAt: '2026-01-15T14:00:00Z',
    updatedAt: '2026-02-08T10:00:00Z',
    totalAssessments: 2,
    lastAssessmentDate: '2026-02-08T10:00:00Z',
    lastScore: 91,
  },
  {
    id: 'pat-006',
    professionalId: 'prof-001',
    name: 'Ricardo Souza',
    birthDate: '1982-09-20',
    gender: 'MALE',
    height: 175,
    weight: 78,
    phone: '(41) 99988-7766',
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-02-01T08:00:00Z',
    totalAssessments: 0,
  },
];

// ==================== Mock Landmarks ====================

const landmarks: NFVLandmark[] = [
  { name: 'tragus_left', label: 'Tragus Esquerdo', x: 0.45, y: 0.08, confidence: 0.95 },
  { name: 'tragus_right', label: 'Tragus Direito', x: 0.55, y: 0.08, confidence: 0.94 },
  { name: 'acromion_left', label: 'Acrômio Esquerdo', x: 0.30, y: 0.18, confidence: 0.97 },
  { name: 'acromion_right', label: 'Acrômio Direito', x: 0.70, y: 0.20, confidence: 0.96 },
  { name: 'c7', label: 'C7 (Vértebra Proeminente)', x: 0.50, y: 0.15, confidence: 0.92 },
  { name: 'iliac_crest_left', label: 'Crista Ilíaca Esquerda', x: 0.35, y: 0.48, confidence: 0.93 },
  { name: 'iliac_crest_right', label: 'Crista Ilíaca Direita', x: 0.65, y: 0.47, confidence: 0.94 },
  { name: 'asis_left', label: 'EIAS Esquerda', x: 0.38, y: 0.52, confidence: 0.91 },
  { name: 'asis_right', label: 'EIAS Direita', x: 0.62, y: 0.51, confidence: 0.90 },
  { name: 'patella_left', label: 'Patela Esquerda', x: 0.40, y: 0.68, confidence: 0.96 },
  { name: 'patella_right', label: 'Patela Direita', x: 0.60, y: 0.67, confidence: 0.95 },
  { name: 'malleolus_left', label: 'Maléolo Esquerdo', x: 0.42, y: 0.90, confidence: 0.94 },
  { name: 'malleolus_right', label: 'Maléolo Direito', x: 0.58, y: 0.89, confidence: 0.93 },
];

// ==================== Mock Angles ====================

const angles: NFVAngle[] = [
  { joint: 'Inclinação Cervical', measured: 4.2, ideal: 0, deviation: 4.2, severity: 'mild' },
  { joint: 'Alinhamento de Ombros', measured: 2.8, ideal: 0, deviation: 2.8, severity: 'mild' },
  { joint: 'Cifose Torácica', measured: 42, ideal: 35, deviation: 7, severity: 'moderate' },
  { joint: 'Lordose Lombar', measured: 52, ideal: 40, deviation: 12, severity: 'moderate' },
  { joint: 'Inclinação Pélvica', measured: 15, ideal: 10, deviation: 5, severity: 'mild' },
  { joint: 'Valgo Joelho Esquerdo', measured: 8, ideal: 5, deviation: 3, severity: 'mild' },
  { joint: 'Valgo Joelho Direito', measured: 6, ideal: 5, deviation: 1, severity: 'normal' },
  { joint: 'Pronação Pé Esquerdo', measured: 12, ideal: 8, deviation: 4, severity: 'mild' },
  { joint: 'Pronação Pé Direito', measured: 9, ideal: 8, deviation: 1, severity: 'normal' },
];

// ==================== Mock Deviations ====================

const deviations: NFVDeviation[] = [
  {
    id: 'dev-001',
    name: 'Hiperlordose Lombar',
    region: 'Coluna Lombar',
    severity: 'moderate',
    description: 'Curvatura lombar aumentada em 12° além do padrão ideal. Associada a fraqueza de core e encurtamento de flexores de quadril.',
    recommendation: 'Fortalecimento de core (prancha, dead bug), alongamento de iliopsoas e reto femoral, educação postural.',
    angleDeviation: 12,
  },
  {
    id: 'dev-002',
    name: 'Hipercifose Torácica',
    region: 'Coluna Torácica',
    severity: 'moderate',
    description: 'Cifose torácica de 42° (ideal: 35°). Pode estar associada a uso prolongado de computador/celular.',
    recommendation: 'Extensão torácica em foam roller, fortalecimento de trapézio médio/inferior, alongamento de peitoral.',
    angleDeviation: 7,
  },
  {
    id: 'dev-003',
    name: 'Desnivelamento de Ombros',
    region: 'Ombros',
    severity: 'mild',
    description: 'Ombro direito 2.8° mais baixo que o esquerdo. Assimetria leve.',
    recommendation: 'Exercícios de estabilização escapular bilateral, correção de hábitos posturais no trabalho.',
    angleDeviation: 2.8,
  },
  {
    id: 'dev-004',
    name: 'Antepulsão Pélvica',
    region: 'Pelve',
    severity: 'mild',
    description: 'Inclinação anterior da pelve de 15° (ideal: 10°). Associada à hiperlordose.',
    recommendation: 'Ponte glútea, posterior tilt exercises, alongamento de quadríceps.',
    angleDeviation: 5,
  },
];

// ==================== Mock Recommendations ====================

const recommendations: NFVRecommendation[] = [
  {
    region: 'Coluna Lombar',
    exercises: [
      { name: 'Prancha Ventral', description: 'Manter posição de prancha com abdômen ativado', frequency: '3x/semana', sets: '3', reps: '30-45s' },
      { name: 'Dead Bug', description: 'Deitado, extensão alternada de braços e pernas', frequency: '3x/semana', sets: '3', reps: '10 cada lado' },
      { name: 'Alongamento Iliopsoas', description: 'Ajoelhado, avançar quadril para frente', frequency: 'Diário', sets: '2', reps: '30s cada lado' },
    ],
  },
  {
    region: 'Coluna Torácica',
    exercises: [
      { name: 'Extensão Torácica no Foam Roller', description: 'Deitar sobre foam roller na região torácica', frequency: '3x/semana', sets: '3', reps: '15 repetições' },
      { name: 'Face Pull', description: 'Puxada de corda na altura do rosto', frequency: '3x/semana', sets: '3', reps: '12-15' },
    ],
  },
  {
    region: 'Ombros',
    exercises: [
      { name: 'Retração Escapular', description: 'Puxar escápulas para trás e para baixo', frequency: 'Diário', sets: '3', reps: '10-15' },
      { name: 'Y-T-W com Halteres Leves', description: 'Elevações em padrão Y, T e W', frequency: '3x/semana', sets: '2', reps: '10 cada' },
    ],
  },
];

// ==================== Mock Assessments ====================

const assessments: NFVAssessment[] = [
  {
    id: 'assess-001',
    patientId: 'pat-001',
    patientName: 'Maria Santos',
    professionalId: 'prof-001',
    type: 'POSTURAL',
    view: 'ANTERIOR',
    status: 'COMPLETED',
    mediaUrl: '/assets/mock-posture-anterior.jpg',
    thumbnailUrl: '/assets/mock-posture-anterior-thumb.jpg',
    scores: { overall: 72, head: 85, shoulders: 65, spine: 58, pelvis: 70, kneeLeft: 75, kneeRight: 82 },
    landmarks,
    angles,
    deviations,
    recommendations,
    createdAt: '2026-01-20T14:30:00Z',
    completedAt: '2026-01-20T14:32:00Z',
  },
  {
    id: 'assess-002',
    patientId: 'pat-002',
    patientName: 'Carlos Oliveira',
    professionalId: 'prof-001',
    type: 'POSTURAL',
    view: 'LATERAL_LEFT',
    status: 'COMPLETED',
    mediaUrl: '/assets/mock-posture-lateral.jpg',
    scores: { overall: 85, head: 90, shoulders: 88, spine: 82, pelvis: 80, kneeLeft: 87, kneeRight: 85 },
    landmarks,
    angles: angles.map((a) => ({ ...a, deviation: a.deviation * 0.6, severity: 'normal' as const })),
    deviations: [deviations[2]],
    recommendations: [recommendations[2]],
    createdAt: '2026-02-05T11:00:00Z',
    completedAt: '2026-02-05T11:02:00Z',
  },
  {
    id: 'assess-003',
    patientId: 'pat-003',
    patientName: 'Ana Beatriz Costa',
    professionalId: 'prof-001',
    type: 'POSTURAL',
    view: 'LATERAL_RIGHT',
    status: 'COMPLETED',
    mediaUrl: '/assets/mock-posture-lateral-r.jpg',
    scores: { overall: 58, head: 70, shoulders: 55, spine: 42, pelvis: 50, kneeLeft: 68, kneeRight: 65 },
    landmarks,
    angles: angles.map((a) => ({ ...a, deviation: a.deviation * 1.5, severity: a.severity === 'normal' ? 'mild' as const : 'severe' as const })),
    deviations,
    recommendations,
    createdAt: '2026-01-28T16:00:00Z',
    completedAt: '2026-01-28T16:03:00Z',
  },
  {
    id: 'assess-004',
    patientId: 'pat-004',
    patientName: 'Pedro Henrique Lima',
    professionalId: 'prof-001',
    type: 'POSTURAL',
    view: 'POSTERIOR',
    status: 'COMPLETED',
    mediaUrl: '/assets/mock-posture-posterior.jpg',
    scores: { overall: 45, head: 50, shoulders: 40, spine: 35, pelvis: 45, kneeLeft: 55, kneeRight: 50 },
    landmarks,
    angles: angles.map((a) => ({ ...a, deviation: a.deviation * 2, severity: 'severe' as const })),
    deviations: deviations.map((d) => ({ ...d, severity: 'severe' as const })),
    recommendations,
    createdAt: '2026-02-10T09:30:00Z',
    completedAt: '2026-02-10T09:33:00Z',
  },
  {
    id: 'assess-005',
    patientId: 'pat-005',
    patientName: 'Fernanda Rodrigues',
    professionalId: 'prof-001',
    type: 'POSTURAL',
    view: 'ANTERIOR',
    status: 'COMPLETED',
    mediaUrl: '/assets/mock-posture-anterior-2.jpg',
    scores: { overall: 91, head: 95, shoulders: 90, spine: 88, pelvis: 92, kneeLeft: 90, kneeRight: 93 },
    landmarks,
    angles: angles.map((a) => ({ ...a, deviation: a.deviation * 0.3, severity: 'normal' as const })),
    deviations: [],
    recommendations: [],
    createdAt: '2026-02-08T10:00:00Z',
    completedAt: '2026-02-08T10:01:30Z',
  },
];

// ==================== Mock Report ====================

const report: NFVReport = {
  id: 'report-001',
  assessmentId: 'assess-001',
  patientId: 'pat-001',
  patientName: 'Maria Santos',
  professionalName: 'Dr. João Silva',
  clinicName: 'Clínica PosturaViva',
  generatedAt: '2026-01-20T14:35:00Z',
  shareToken: 'share-token-abc123',
  shareUrl: '/nfv/relatorios/compartilhado/share-token-abc123',
  assessment: assessments[0],
};

// ==================== Mock Plans ====================

const plans: NFVPlan[] = [
  {
    id: 'plan-free',
    name: 'Free',
    type: 'FREE',
    price: 0,
    currency: 'BRL',
    period: 'mês',
    popular: false,
    assessmentsPerMonth: 5,
    features: [
      { text: 'Até 5 avaliações/mês', included: true },
      { text: 'Até 10 pacientes', included: true },
      { text: 'Detecção de pose básica', included: true },
      { text: 'Relatório simplificado', included: true },
      { text: 'Análise avançada de ângulos', included: false },
      { text: 'Relatório PDF personalizado', included: false },
      { text: 'Compartilhamento com branding', included: false },
      { text: 'Suporte prioritário', included: false },
    ],
  },
  {
    id: 'plan-pro',
    name: 'Professional',
    type: 'PROFESSIONAL',
    price: 97,
    currency: 'BRL',
    period: 'mês',
    popular: true,
    assessmentsPerMonth: 50,
    features: [
      { text: 'Até 50 avaliações/mês', included: true },
      { text: 'Pacientes ilimitados', included: true },
      { text: 'Detecção de pose avançada', included: true },
      { text: 'Relatório completo', included: true },
      { text: 'Análise avançada de ângulos', included: true },
      { text: 'Relatório PDF personalizado', included: true },
      { text: 'Compartilhamento com branding', included: true },
      { text: 'Suporte prioritário', included: false },
    ],
  },
  {
    id: 'plan-clinic',
    name: 'Clinic',
    type: 'CLINIC',
    price: 297,
    currency: 'BRL',
    period: 'mês',
    popular: false,
    assessmentsPerMonth: null,
    features: [
      { text: 'Avaliações ilimitadas', included: true },
      { text: 'Pacientes ilimitados', included: true },
      { text: 'Detecção de pose avançada', included: true },
      { text: 'Relatório completo', included: true },
      { text: 'Análise avançada de ângulos', included: true },
      { text: 'Relatório PDF personalizado', included: true },
      { text: 'Compartilhamento com branding próprio', included: true },
      { text: 'Suporte prioritário 24/7', included: true },
    ],
  },
];

// ==================== Mock Dashboard Stats ====================

const dashboardStats: NFVDashboardStats = {
  totalPatients: 6,
  totalAssessments: 13,
  monthlyAssessments: 5,
  averageScore: 70.2,
  assessmentsRemaining: 45,
  recentAssessments: [
    { id: 'assess-004', patientName: 'Pedro Henrique Lima', type: 'POSTURAL', date: '2026-02-10T09:30:00Z', score: 45, status: 'COMPLETED' },
    { id: 'assess-005', patientName: 'Fernanda Rodrigues', type: 'POSTURAL', date: '2026-02-08T10:00:00Z', score: 91, status: 'COMPLETED' },
    { id: 'assess-002', patientName: 'Carlos Oliveira', type: 'POSTURAL', date: '2026-02-05T11:00:00Z', score: 85, status: 'COMPLETED' },
    { id: 'assess-003', patientName: 'Ana Beatriz Costa', type: 'POSTURAL', date: '2026-01-28T16:00:00Z', score: 58, status: 'COMPLETED' },
    { id: 'assess-001', patientName: 'Maria Santos', type: 'POSTURAL', date: '2026-01-20T14:30:00Z', score: 72, status: 'COMPLETED' },
  ],
  weeklyData: [
    { week: 'Sem 1', assessments: 2 },
    { week: 'Sem 2', assessments: 1 },
    { week: 'Sem 3', assessments: 3 },
    { week: 'Sem 4', assessments: 1 },
    { week: 'Sem 5', assessments: 4 },
    { week: 'Sem 6', assessments: 2 },
    { week: 'Sem 7', assessments: 3 },
    { week: 'Sem 8', assessments: 5 },
  ],
};

// ==================== Login Response ====================

function loginResponse(): NFVLoginResponse {
  return {
    access_token: 'mock-jwt-access-token-' + Date.now(),
    professional: {
      id: user.id,
      email: user.email,
      name: user.name,
      profession: user.profession || 'PERSONAL_TRAINER',
      plan: user.plan,
    },
  };
}

// ==================== Export ====================

export const mockData = {
  user,
  patients,
  assessments,
  landmarks,
  angles,
  deviations,
  recommendations,
  report,
  plans,
  dashboardStats,
  loginResponse,
};
