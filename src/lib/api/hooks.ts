'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from './client';
import { mockData } from './mock-data';
import type {
  NFVUser,
  NFVPatient,
  NFVAssessment,
  NFVReport,
  NFVPlan,
  NFVDashboardStats,
  NFVPaginatedResponse,
  NFVAssessmentStatus,
  NFVProfession,
} from './types';

/** Check if error is a network error (backend offline) vs auth/server error */
function isNetworkError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const axiosErr = err as { code?: string; response?: { status: number } };
  // Network error (no response) or ECONNREFUSED
  if (axiosErr.code === 'ERR_NETWORK' || axiosErr.code === 'ECONNABORTED') return true;
  // No response at all = backend offline
  if (!axiosErr.response) return true;
  return false;
}

// ==================== Auth Hook ====================

export function useNFVAuth() {
  const [user, setUser] = useState<NFVUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api
        .getProfile()
        .then((profile) => {
          setUser(profile);
          setIsAuthenticated(true);
        })
        .catch((err) => {
          if (isNetworkError(err)) {
            // Backend offline: decode JWT for basic user data
            const decoded = api.decodeToken(token);
            if (decoded) {
              setUser({
                id: decoded.id as string,
                email: decoded.email as string,
                name: (decoded.name as string) || 'Profissional',
                plan: (decoded.plan as NFVUser['plan']) || 'FREE',
                createdAt: new Date().toISOString(),
              });
              setIsAuthenticated(true);
            } else {
              api.clearTokens();
              setIsAuthenticated(false);
              setUser(null);
            }
          } else {
            api.clearTokens();
            setIsAuthenticated(false);
            setUser(null);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login({ email, password });
    setUser({
      id: response.professional.id,
      email: response.professional.email,
      name: response.professional.name,
      profession: response.professional.profession,
      plan: response.professional.plan,
      createdAt: new Date().toISOString(),
    });
    setIsAuthenticated(true);
    return response;
  }, []);

  const register = useCallback(async (data: {
    name: string;
    email: string;
    password: string;
    profession: NFVProfession;
    registerNumber?: string;
  }) => {
    const response = await api.register(data);
    setUser({
      id: response.professional.id,
      email: response.professional.email,
      name: response.professional.name,
      profession: response.professional.profession,
      plan: response.professional.plan,
      createdAt: new Date().toISOString(),
    });
    setIsAuthenticated(true);
    return response;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await api.getProfile();
    setUser(profile);
  }, []);

  return { user, isLoading, isAuthenticated, login, register, logout, refreshProfile };
}

// ==================== Dashboard Hook ====================

export function useNFVDashboard() {
  const [stats, setStats] = useState<NFVDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      if (isNetworkError(err)) {
        setStats(mockData.dashboardStats);
        setError(null);
      } else {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { stats, loading, error, refresh: fetch };
}

// ==================== Patients Hook ====================

export function useNFVPatients(initialSearch?: string) {
  const [patients, setPatients] = useState<NFVPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState(initialSearch || '');

  const fetch = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);
      const result = await api.listPatients(searchTerm || search || undefined);
      setPatients(result.data);
      setError(null);
    } catch (err) {
      if (isNetworkError(err)) {
        let mockPatients = mockData.patients;
        const term = searchTerm || search;
        if (term) {
          mockPatients = mockPatients.filter((p) =>
            p.name.toLowerCase().includes(term.toLowerCase())
          );
        }
        setPatients(mockPatients);
        setError(null);
      } else {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const searchPatients = useCallback((term: string) => {
    setSearch(term);
  }, []);

  return { patients, loading, error, refresh: fetch, search, searchPatients };
}

// ==================== Single Patient Hook ====================

export function useNFVPatient(id: string | null) {
  const [patient, setPatient] = useState<NFVPatient | null>(null);
  const [assessments, setAssessments] = useState<NFVAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [patientData, assessmentData] = await Promise.all([
        api.getPatient(id),
        api.listAssessments({ patientId: id }),
      ]);
      setPatient(patientData);
      setAssessments(assessmentData.data);
      setError(null);
    } catch (err) {
      if (isNetworkError(err)) {
        const mockPatient = mockData.patients.find((p) => p.id === id) || mockData.patients[0];
        const mockAssessments = mockData.assessments.filter((a) => a.patientId === id);
        setPatient(mockPatient);
        setAssessments(mockAssessments);
        setError(null);
      } else {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { patient, assessments, loading, error, refresh: fetch };
}

// ==================== Assessment Hook ====================

export function useNFVAssessment(id: string | null) {
  const [assessment, setAssessment] = useState<NFVAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getAssessment(id);
      setAssessment(data);
      setError(null);
    } catch (err) {
      if (isNetworkError(err)) {
        setAssessment(mockData.assessments.find((a) => a.id === id) || mockData.assessments[0]);
        setError(null);
      } else {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { assessment, loading, error, refresh: fetch };
}

// ==================== Assessment List Hook ====================

export function useNFVAssessments(filters?: {
  patientId?: string;
  status?: NFVAssessmentStatus;
}) {
  const [data, setData] = useState<NFVPaginatedResponse<NFVAssessment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.listAssessments(filters);
      setData(result);
      setError(null);
    } catch (err) {
      if (isNetworkError(err)) {
        let assessments = mockData.assessments;
        if (filters?.patientId) {
          assessments = assessments.filter((a) => a.patientId === filters.patientId);
        }
        if (filters?.status) {
          assessments = assessments.filter((a) => a.status === filters.status);
        }
        setData({ data: assessments, total: assessments.length, page: 1, limit: 20, pages: 1 });
        setError(null);
      } else {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [filters?.patientId, filters?.status]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}

// ==================== Report Hook ====================

export function useNFVReport(id: string | null) {
  const [report, setReport] = useState<NFVReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getReport(id);
      setReport(data);
      setError(null);
    } catch (err) {
      if (isNetworkError(err)) {
        setReport(mockData.report);
        setError(null);
      } else {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { report, loading, error, refresh: fetch };
}

// ==================== Shared Report Hook ====================

export function useNFVSharedReport(token: string | null) {
  const [report, setReport] = useState<NFVReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getSharedReport(token);
      setReport(data);
      setError(null);
    } catch (err) {
      if (isNetworkError(err)) {
        setReport(mockData.report);
        setError(null);
      } else {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { report, loading, error, refresh: fetch };
}

// ==================== Plans Hook ====================

export function useNFVPlans() {
  const [plans, setPlans] = useState<NFVPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      if (isNetworkError(err)) {
        setPlans(mockData.plans);
        setError(null);
      } else {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { plans, loading, error, refresh: fetch };
}

// Export aliases without NFV prefix for convenience
export { useNFVAuth as useAuth };
export { useNFVDashboard as useDashboard };
export { useNFVPatients as usePatients };
export { useNFVPatient as usePatient };
export { useNFVAssessment as useAssessment };
export { useNFVAssessments as useAssessments };
export { useNFVReport as useReport };
export { useNFVSharedReport as useSharedReport };
export { useNFVPlans as usePlans };
