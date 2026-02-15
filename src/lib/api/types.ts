// NFV (NutriFitVision) - TypeScript Types

// ==================== Auth ====================

export interface NFVLoginRequest {
  email: string;
  password: string;
}

export type NFVProfession =
  | 'NUTRITIONIST'
  | 'PERSONAL_TRAINER'
  | 'PHYSIOTHERAPIST'
  | 'DOCTOR'
  | 'PILATES_INSTRUCTOR'
  | 'CROSSFIT_COACH'
  | 'SPA_THERAPIST'
  | 'OTHER';

export interface NFVRegisterRequest {
  name: string;
  email: string;
  password: string;
  profession: NFVProfession;
  registerNumber?: string;
  clinicName?: string;
  phone?: string;
}

// Real backend response format
export interface NFVLoginResponse {
  access_token: string;
  professional: {
    id: string;
    email: string;
    name: string;
    profession: NFVProfession;
    plan: NFVPlanType;
  };
}

// ==================== User / Professional ====================

export interface NFVUser {
  id: string;
  name: string;
  email: string;
  profession?: NFVProfession;
  registerNumber?: string;
  clinicName?: string;
  phone?: string;
  logoUrl?: string;
  brandColor?: string;
  locale?: string;
  plan: NFVPlanType;
  planStatus?: string;
  createdAt: string;
  updatedAt?: string;
  _count?: { patients: number; assessments: number };
}

export type NFVPlanType = 'FREE' | 'PROFESSIONAL' | 'CLINIC';

// ==================== Patient ====================

export type NFVGender = 'MALE' | 'FEMALE' | 'OTHER';

export interface NFVPatient {
  id: string;
  professionalId: string;
  name: string;
  birthDate?: string;
  gender?: NFVGender;
  height?: number; // cm
  weight?: number; // kg
  bodyFat?: number;
  phone?: string;
  email?: string;
  notes?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  totalAssessments?: number;
  lastAssessmentDate?: string;
  lastScore?: number;
  _count?: { assessments: number };
}

export interface NFVCreatePatientRequest {
  name: string;
  birthDate?: string;
  gender?: NFVGender;
  height?: number;
  weight?: number;
  bodyFat?: number;
  phone?: string;
  email?: string;
  notes?: string;
  avatarUrl?: string;
}

// ==================== Assessment ====================

export type NFVAssessmentType = 'POSTURAL' | 'BIOMECHANICAL';
export type NFVAssessmentView = 'ANTERIOR' | 'POSTERIOR' | 'LATERAL_LEFT' | 'LATERAL_RIGHT';
export type NFVAssessmentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface NFVAssessment {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  type: NFVAssessmentType;
  view: NFVAssessmentView;
  status: NFVAssessmentStatus;
  mediaUrl: string;
  thumbnailUrl?: string;
  scores: NFVScores;
  landmarks: NFVLandmark[];
  angles: NFVAngle[];
  deviations: NFVDeviation[];
  recommendations: NFVRecommendation[];
  createdAt: string;
  completedAt?: string;
}

export interface NFVCreateAssessmentRequest {
  patientId: string;
  type: NFVAssessmentType;
  view: NFVAssessmentView;
  mediaFile: File;
}

// ==================== Scores ====================

export interface NFVScores {
  overall: number;
  head: number;
  shoulders: number;
  spine: number;
  pelvis: number;
  kneeLeft: number;
  kneeRight: number;
}

export type NFVScoreClassification = 'excellent' | 'good' | 'moderate' | 'poor';

export function getScoreClassification(score: number): NFVScoreClassification {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'moderate';
  return 'poor';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#00e676';
  if (score >= 60) return '#00e5ff';
  if (score >= 40) return '#ffab40';
  return '#ff5252';
}

export function getScoreLabel(classification: NFVScoreClassification): string {
  const labels: Record<NFVScoreClassification, string> = {
    excellent: 'Excelente',
    good: 'Bom',
    moderate: 'Moderado',
    poor: 'Necessita Atenção',
  };
  return labels[classification];
}

// ==================== Landmarks ====================

export interface NFVLandmark {
  name: string;
  label: string;
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  confidence: number;
}

// ==================== Angles ====================

export type NFVSeverity = 'normal' | 'mild' | 'moderate' | 'severe';

export interface NFVAngle {
  joint: string;
  measured: number;
  ideal: number;
  deviation: number;
  severity: NFVSeverity;
}

// ==================== Deviations ====================

export interface NFVDeviation {
  id: string;
  name: string;
  region: string;
  severity: NFVSeverity;
  description: string;
  recommendation: string;
  angleDeviation?: number;
}

// ==================== Recommendations ====================

export interface NFVRecommendation {
  region: string;
  exercises: NFVExercise[];
}

export interface NFVExercise {
  name: string;
  description: string;
  frequency: string;
  sets?: string;
  reps?: string;
}

// ==================== Reports ====================

export interface NFVReport {
  id: string;
  assessmentId: string;
  patientId: string;
  patientName: string;
  professionalName: string;
  clinicName?: string;
  generatedAt: string;
  shareToken?: string;
  shareUrl?: string;
  pdfUrl?: string;
  assessment: NFVAssessment;
}

// ==================== Plans ====================

export interface NFVPlan {
  id: string;
  name: string;
  type: NFVPlanType;
  price: number;
  currency: string;
  period: string;
  features: NFVPlanFeature[];
  popular: boolean;
  assessmentsPerMonth: number | null; // null = unlimited
}

export interface NFVPlanFeature {
  text: string;
  included: boolean;
}

// ==================== Dashboard ====================

export interface NFVDashboardStats {
  totalPatients: number;
  totalAssessments: number;
  monthlyAssessments: number;
  averageScore?: number;
  assessmentsRemaining?: number | null;
  recentAssessments: NFVRecentAssessment[];
  weeklyData?: NFVWeeklyDataPoint[];
}

export interface NFVRecentAssessment {
  id: string;
  patientName: string;
  type: NFVAssessmentType;
  date: string;
  score: number;
  status: NFVAssessmentStatus;
}

export interface NFVWeeklyDataPoint {
  week: string;
  assessments: number;
}

// ==================== API Response ====================

export interface NFVApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface NFVPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
