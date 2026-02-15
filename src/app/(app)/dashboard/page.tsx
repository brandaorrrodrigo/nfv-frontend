'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Camera, Activity, Award, Plus, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslations } from 'next-intl';
import { useAuthContext } from '@/components/providers/AuthProvider';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import ScoreCircle from '@/components/ui/ScoreCircle';
import { useDashboard } from '@/lib/api/hooks';

function getGreetingKey(hour: number): string {
  if (hour < 12) return 'greeting';
  if (hour < 18) return 'greetingAfternoon';
  return 'greetingEvening';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const { user } = useAuthContext();
  const { stats, loading } = useDashboard();
  const [mounted, setMounted] = useState(false);
  const [currentHour, setCurrentHour] = useState(12);
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentHour(now.getHours());
      setDateStr(now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-heading font-bold text-2xl lg:text-3xl text-nfv-ice">
          {mounted && t(getGreetingKey(currentHour))}, {user?.name?.split(' ')[0] || t('professional')}
        </h1>
        <p className="text-nfv-ice-medium text-sm mt-1 capitalize">{mounted && dateStr}</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('totalClients')}
          value={stats?.totalPatients || 0}
          icon={<Users className="w-5 h-5" />}
          iconColor="#00bcd4"
          change={12}
          delay={0}
        />
        <StatCard
          title={t('monthlyAssessments')}
          value={stats?.monthlyAssessments || 0}
          icon={<Camera className="w-5 h-5" />}
          iconColor="#2979ff"
          change={25}
          delay={0.1}
        />
        <StatCard
          title={t('averageScore')}
          value={stats?.averageScore || 0}
          format="decimal"
          icon={<Activity className="w-5 h-5" />}
          iconColor="#1de9b6"
          change={3}
          delay={0.2}
        />
        <StatCard
          title={t('remainingAssessments')}
          value={stats?.assessmentsRemaining ?? 0}
          icon={<Award className="w-5 h-5" />}
          iconColor="#7c4dff"
          delay={0.3}
        />
      </div>

      {/* Quick Actions + Chart */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="space-y-4">
          <Link href="/avaliacao">
            <GlassCard hoverable glow padding="md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-nfv-aurora flex items-center justify-center shadow-nfv">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-nfv-ice">{t('newAssessment')}</p>
                  <p className="text-xs text-nfv-ice-muted">{t('startPosturalAssessment')}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-nfv-ice-muted" />
              </div>
            </GlassCard>
          </Link>
          <Link href="/clientes/novo">
            <GlassCard hoverable padding="md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#f5f8fb] flex items-center justify-center">
                  <Plus className="w-6 h-6 text-nfv-cyan" />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-nfv-ice">{t('addClient')}</p>
                  <p className="text-xs text-nfv-ice-muted">{t('registerNewClient')}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-nfv-ice-muted" />
              </div>
            </GlassCard>
          </Link>
        </div>

        {/* Weekly Chart */}
        <div className="lg:col-span-2">
          <GlassCard padding="md">
            <h3 className="font-heading font-semibold text-sm text-nfv-ice mb-4">{t('weeklyChart')}</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.weeklyData || []}>
                  <XAxis dataKey="week" tick={{ fill: '#6e8ca0', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6e8ca0', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(0, 188, 212, 0.15)',
                      borderRadius: '12px',
                      color: '#1a2332',
                      fontSize: '12px',
                      boxShadow: '0 4px 20px rgba(41, 98, 255, 0.08)',
                    }}
                  />
                  <Bar dataKey="assessments" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00bcd4" />
                      <stop offset="100%" stopColor="#2962ff" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Recent Assessments */}
      <GlassCard padding="none">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(0,188,212,0.1)]">
          <h3 className="font-heading font-semibold text-sm text-nfv-ice">{t('recentAssessments')}</h3>
          <Link href="/avaliacao/historico" className="text-xs text-nfv-cyan hover:underline">
            {tCommon('viewAll')}
          </Link>
        </div>
        <div className="divide-y divide-[rgba(0,188,212,0.06)]">
          {(stats?.recentAssessments || []).map((assessment, i) => (
            <motion.div
              key={assessment.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/avaliacao/${assessment.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-[#e8f0fe] transition-colors"
              >
                <ScoreCircle score={assessment.score} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-nfv-ice truncate">{assessment.patientName}</p>
                  <p className="text-xs text-nfv-ice-muted">{assessment.type} — {formatDate(assessment.date)}</p>
                </div>
                <StatusBadge status={assessment.status} />
              </Link>
            </motion.div>
          ))}
          {(!stats?.recentAssessments || stats.recentAssessments.length === 0) && (
            <div className="px-5 py-8 text-center text-nfv-ice-muted text-sm">
              {t('noRecentAssessments')}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
