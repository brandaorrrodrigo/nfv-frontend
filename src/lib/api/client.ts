import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  NFVLoginRequest,
  NFVLoginResponse,
  NFVRegisterRequest,
  NFVUser,
  NFVPatient,
  NFVCreatePatientRequest,
  NFVAssessment,
  NFVAssessmentStatus,
  NFVReport,
  NFVPlan,
  NFVDashboardStats,
  NFVPaginatedResponse,
} from './types';

const NFV_API_URL = process.env.NEXT_PUBLIC_NFV_API_URL || 'http://localhost:3002/api/v1';
const NFV_TOKEN_KEY = 'nfv_access_token';

class NFVApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: NFV_API_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    // Request interceptor: attach JWT
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem(NFV_TOKEN_KEY);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response interceptor: handle 401
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem(NFV_TOKEN_KEY);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== Token Management ====================

  setToken(accessToken: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(NFV_TOKEN_KEY, accessToken);
    }
  }

  clearTokens() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(NFV_TOKEN_KEY);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(NFV_TOKEN_KEY);
    }
    return null;
  }

  /** Decode JWT payload without verification (for extracting user info) */
  decodeToken(token: string): Record<string, unknown> | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  // ==================== Auth ====================

  async login(data: NFVLoginRequest): Promise<NFVLoginResponse> {
    const res = await this.client.post<NFVLoginResponse>('/auth/login', data);
    this.setToken(res.data.access_token);
    return res.data;
  }

  async register(data: NFVRegisterRequest): Promise<NFVLoginResponse> {
    const res = await this.client.post<NFVLoginResponse>('/auth/register', data);
    this.setToken(res.data.access_token);
    return res.data;
  }

  async logout(): Promise<void> {
    this.clearTokens();
  }

  // ==================== Professional Profile ====================

  async getProfile(): Promise<NFVUser> {
    const res = await this.client.get<NFVUser>('/professionals/me');
    return res.data;
  }

  async updateProfile(data: Partial<NFVUser>): Promise<NFVUser> {
    const res = await this.client.put<NFVUser>('/professionals/me', data);
    return res.data;
  }

  // ==================== Dashboard ====================

  async getDashboardStats(): Promise<NFVDashboardStats> {
    const res = await this.client.get<NFVDashboardStats>('/professionals/dashboard');
    return res.data;
  }

  // ==================== Patients ====================

  async listPatients(search?: string): Promise<NFVPaginatedResponse<NFVPatient>> {
    const res = await this.client.get<NFVPaginatedResponse<NFVPatient>>('/patients', {
      params: { search: search || '', page: 1, limit: 50 },
    });
    return res.data;
  }

  async getPatient(id: string): Promise<NFVPatient> {
    const res = await this.client.get<NFVPatient>(`/patients/${id}`);
    return res.data;
  }

  async createPatient(data: NFVCreatePatientRequest): Promise<NFVPatient> {
    const res = await this.client.post<NFVPatient>('/patients', data);
    return res.data;
  }

  async updatePatient(id: string, data: Partial<NFVCreatePatientRequest>): Promise<NFVPatient> {
    const res = await this.client.put<NFVPatient>(`/patients/${id}`, data);
    return res.data;
  }

  // ==================== Assessments ====================

  async listAssessments(filters?: {
    patientId?: string;
    status?: NFVAssessmentStatus;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<NFVPaginatedResponse<NFVAssessment>> {
    const res = await this.client.get<NFVPaginatedResponse<NFVAssessment>>(
      '/assessments',
      { params: { ...filters, page: filters?.page || 1, limit: filters?.limit || 20 } }
    );
    return res.data;
  }

  async getAssessment(id: string): Promise<NFVAssessment> {
    const res = await this.client.get<NFVAssessment>(`/assessments/${id}`);
    return res.data;
  }

  async createAssessment(data: {
    patientId: string;
    type: string;
    mediaUrl: string;
    mediaType: string;
    viewType?: string;
  }): Promise<NFVAssessment> {
    const res = await this.client.post<NFVAssessment>('/assessments', data);
    return res.data;
  }

  async getAssessmentStatus(id: string): Promise<{ status: NFVAssessmentStatus; progress: number }> {
    const res = await this.client.get<{ status: NFVAssessmentStatus; progress: number }>(
      `/assessments/${id}/status`
    );
    return res.data;
  }

  // ==================== Reports ====================

  async getReport(id: string): Promise<NFVReport> {
    const res = await this.client.get<NFVReport>(`/reports/${id}`);
    return res.data;
  }

  async shareReport(reportId: string): Promise<{ shareToken: string; shareUrl: string }> {
    const res = await this.client.post<{ shareToken: string; shareUrl: string }>(
      `/reports/${reportId}/share`
    );
    return res.data;
  }

  async getSharedReport(token: string): Promise<NFVReport> {
    const res = await this.client.get<NFVReport>(`/reports/share/${token}`);
    return res.data;
  }

  // ==================== Upload ====================

  async uploadMedia(file: File): Promise<{ url: string; thumbnailUrl?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await this.client.post<{ url: string; thumbnailUrl?: string }>(
      '/upload/media',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  }

  // ==================== Plans ====================

  async getPlans(): Promise<NFVPlan[]> {
    const res = await this.client.get<NFVPlan[]>('/plans');
    return res.data;
  }
}

// Singleton instance
export const api = new NFVApiClient();
