const POSE_API = `${(process.env.NEXT_PUBLIC_POSE_API_URL || 'http://localhost:3100')}/api`;

export interface SessionSummary {
  id: string;
  atletaId: string;
  categoria: string;
  scoreGeral: number;
  totalPoses: number;
  dataAnalise: string;
  poses: {
    poseId: string;
    nomePose: string;
    scoreFinal: number;
    createdAt: string;
  }[];
  protocol?: {
    ganhoTotalEstimado: number;
    resumoCoach: string;
    prioridadesTreino: string[];
  };
}

export interface PoseEvolution {
  poseId: string;
  atletaId: string;
  historico: {
    scoreFinal: number;
    scoreAngulos: number;
    scoreSimetria: number;
    createdAt: string;
    correcoesPrioritarias: string[];
  }[];
  evolucao_total: number;
  tendencia: 'melhora' | 'piora' | 'estavel';
  total_sessoes: number;
}

export interface CategoryStats {
  categoria: string;
  total_sessoes: number;
  score_medio: number;
  melhor_score: number;
  ultima_sessao: string;
  tendencia: 'melhora' | 'piora' | 'estavel';
}

export const poseEvolutionApi = {
  async getHistory(
    atletaId: string,
    categoria?: string,
  ): Promise<SessionSummary[]> {
    const url = `${POSE_API}/nfv/pose-analysis/history/${atletaId}${categoria ? `?categoria=${categoria}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`History error: ${res.status}`);
    return res.json();
  },

  async getPoseEvolution(
    atletaId: string,
    poseId: string,
  ): Promise<PoseEvolution> {
    const res = await fetch(
      `${POSE_API}/nfv/pose-analysis/evolution/${atletaId}/${poseId}`,
    );
    if (!res.ok) throw new Error(`Evolution error: ${res.status}`);
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${POSE_API}/nfv/pose-analysis/categories`);
    if (!res.ok) throw new Error(`Categories error: ${res.status}`);
    return res.json();
  },

  // Calcula stats por categoria a partir do histórico
  calcCategoryStats(sessions: SessionSummary[]): CategoryStats[] {
    const byCategory: Record<string, SessionSummary[]> = {};
    for (const s of sessions) {
      if (!byCategory[s.categoria]) byCategory[s.categoria] = [];
      byCategory[s.categoria]!.push(s);
    }

    return Object.entries(byCategory).map(([cat, sess]) => {
      const sorted = [...sess].sort(
        (a, b) =>
          new Date(a.dataAnalise).getTime() - new Date(b.dataAnalise).getTime(),
      );
      const scores = sorted.map((s) => s.scoreGeral);
      const first = scores[0] ?? 0;
      const last = scores[scores.length - 1] ?? 0;
      const delta = last - first;

      return {
        categoria: cat,
        total_sessoes: sess.length,
        score_medio: Math.round(
          scores.reduce((a, b) => a + b, 0) / scores.length,
        ),
        melhor_score: Math.max(...scores),
        ultima_sessao: sorted[sorted.length - 1]?.dataAnalise ?? '',
        tendencia: delta > 2 ? 'melhora' : delta < -2 ? 'piora' : 'estavel',
      };
    });
  },

  // Prepara dados para o gráfico de linha (Recharts)
  buildChartData(sessions: SessionSummary[]): {
    data: { data: string; score: number; ganho: number; label: string }[];
  } {
    const sorted = [...sessions].sort(
      (a, b) =>
        new Date(a.dataAnalise).getTime() - new Date(b.dataAnalise).getTime(),
    );
    return {
      data: sorted.map((s) => ({
        data: new Date(s.dataAnalise).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        score: s.scoreGeral,
        ganho: s.protocol?.ganhoTotalEstimado ?? 0,
        label: s.categoria,
      })),
    };
  },

  // Prepara dados do heatmap de poses
  buildPoseHeatmap(sessions: SessionSummary[]): {
    poseId: string;
    nomePose: string;
    scores: number[];
    media: number;
    tendencia: 'melhora' | 'piora' | 'estavel';
  }[] {
    const byPose: Record<string, { nomePose: string; scores: number[] }> = {};

    for (const s of sessions) {
      for (const p of s.poses ?? []) {
        if (!byPose[p.poseId]) {
          byPose[p.poseId] = { nomePose: p.nomePose, scores: [] };
        }
        byPose[p.poseId]!.scores.push(p.scoreFinal);
      }
    }

    return Object.entries(byPose).map(([poseId, { nomePose, scores }]) => {
      const first = scores[0] ?? 0;
      const last = scores[scores.length - 1] ?? 0;
      const delta = last - first;
      return {
        poseId,
        nomePose,
        scores,
        media: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        tendencia: delta > 3 ? 'melhora' : delta < -3 ? 'piora' : 'estavel',
      };
    });
  },
};
