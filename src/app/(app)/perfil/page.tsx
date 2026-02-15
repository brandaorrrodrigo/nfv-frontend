'use client';

import { useState, useEffect } from 'react';
import { Save, Camera } from 'lucide-react';
import { useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { api } from '@/lib/api/client';

export default function PerfilPage() {
  const { user, refreshProfile } = useAuthContext();
  const t = useTranslations('profile');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    registerNumber: '',
    clinicName: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        registerNumber: user.registerNumber || '',
        clinicName: user.clinicName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    setLoading(true);
    try {
      await api.updateProfile(form);
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.error || t('errorSaving'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white border border-[#d0dbe6] text-nfv-ice placeholder:text-nfv-ice-muted focus:outline-none focus:border-nfv-cyan/40 focus:shadow-nfv transition-all text-sm";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-heading font-bold text-2xl text-nfv-ice">{t('title')}</h1>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-nfv-danger/10 border border-nfv-danger/20 text-nfv-danger text-sm">
          {error}
        </div>
      )}

      {saved && (
        <div className="px-4 py-3 rounded-xl bg-nfv-success/10 border border-nfv-success/20 text-nfv-success text-sm">
          {t('saved')}
        </div>
      )}

      {/* Profile Photo */}
      <GlassCard padding="md">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-nfv-aurora/20 flex items-center justify-center text-nfv-cyan font-heading font-bold text-2xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <button className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-nfv-bg-card border border-[rgba(0,188,212,0.12)] text-nfv-ice-medium hover:text-nfv-cyan transition-colors">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <p className="font-medium text-nfv-ice">{user?.name}</p>
            <p className="text-xs text-nfv-ice-muted">{user?.email}</p>
            <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-nfv-cyan/15 text-nfv-cyan">
              {user?.plan}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Profile Form */}
      <GlassCard padding="lg">
        <h3 className="font-heading font-semibold text-sm text-nfv-ice mb-4">{t('professionalInfo')}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{tAuth('name')}</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{tAuth('email')}</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('registerNumber')}</label>
              <input type="text" value={form.registerNumber} onChange={(e) => update('registerNumber', e.target.value)} placeholder="CREF 012345-G/SP" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{tAuth('phone')}</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(11) 98765-4321" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('clinicName')}</label>
            <input type="text" value={form.clinicName} onChange={(e) => update('clinicName', e.target.value)} placeholder="Clínica PosturaViva" className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t('saveChanges')}
              </>
            )}
          </button>
        </form>
      </GlassCard>

      {/* Password Section */}
      <GlassCard padding="lg">
        <h3 className="font-heading font-semibold text-sm text-nfv-ice mb-4">{t('changePassword')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('currentPassword')}</label>
            <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('newPassword')}</label>
              <input type="password" value={passwordForm.new} onChange={(e) => setPasswordForm((p) => ({ ...p, new: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('confirmNew')}</label>
              <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <button className="px-6 py-2.5 rounded-xl border border-[rgba(0,188,212,0.12)] text-nfv-ice-light text-sm font-medium hover:bg-[#e8f0fe] transition-colors">
            {t('changePassword')}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
