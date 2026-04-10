'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, Check } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { notificationsManager } from '@/lib/notifications';

export default function NotificationSetup() {
  const [permission, setPermission] = useState<
    NotificationPermission | 'unsupported'
  >('default');
  const [loading, setLoading] = useState(false);
  const [daysSince, setDaysSince] = useState<number | null>(null);

  useEffect(() => {
    setPermission(notificationsManager.getPermission());
    setDaysSince(notificationsManager.getDaysSinceLastAnalysis());
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const result = await notificationsManager.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        await notificationsManager.registerServiceWorker();
        await notificationsManager.scheduleLocal(
          'Notificações ativadas!',
          'Você será lembrado quando for hora de treinar suas poses.',
          'nfv-setup',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (permission === 'unsupported') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <GlassCard padding="sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              permission === 'granted'
                ? 'bg-green-100 text-green-600'
                : 'bg-[#f5f8fb] text-nfv-ice-muted'
            }`}
          >
            {permission === 'granted' ? (
              <Check className="w-4 h-4" />
            ) : permission === 'denied' ? (
              <BellOff className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-nfv-ice">
              {permission === 'granted'
                ? 'Lembretes ativos'
                : permission === 'denied'
                  ? 'Notificações bloqueadas'
                  : 'Ativar lembretes'}
            </p>
            <p className="text-[10px] text-nfv-ice-muted">
              {permission === 'granted'
                ? daysSince !== null
                  ? `Última análise: ${daysSince} dia${daysSince !== 1 ? 's' : ''} atrás`
                  : 'Lembrete a cada 7 dias sem treino'
                : permission === 'denied'
                  ? 'Desbloqueie nas configurações do navegador'
                  : 'Receba lembretes para treinar poses'}
            </p>
          </div>
          {permission === 'default' && (
            <button
              onClick={handleEnable}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-nfv-aurora text-white text-[10px] font-semibold disabled:opacity-50"
            >
              {loading ? '...' : 'Ativar'}
            </button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
