'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import GlassCard from '@/components/ui/GlassCard';
import { api } from '@/lib/api/client';

export default function NovoClientePage() {
  const t = useTranslations('clients');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    height: '',
    weight: '',
    phone: '',
    email: '',
    notes: '',
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError(t('fillName'));
      return;
    }

    setLoading(true);
    try {
      const patient = await api.createPatient({
        name: form.name.trim(),
        birthDate: form.birthDate || undefined,
        gender: form.gender,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        notes: form.notes || undefined,
      });
      router.push(`/clientes/${patient.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || t('errorCreating'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white border border-[#d0dbe6] text-nfv-ice placeholder:text-nfv-ice-muted focus:outline-none focus:border-nfv-cyan/40 focus:shadow-nfv transition-all text-sm";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="p-2 rounded-lg text-nfv-ice-medium hover:text-nfv-ice hover:bg-[#e8f0fe] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-heading font-bold text-2xl text-nfv-ice">{t('newClient')}</h1>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-nfv-danger/10 border border-nfv-danger/20 text-nfv-danger text-sm">
          {error}
        </div>
      )}

      <GlassCard padding="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('name')} *</label>
            <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder={t('namePlaceholder')} required className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('birthDate')}</label>
              <input type="date" value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('gender')}</label>
              <div className="flex gap-3 pt-1">
                {([['MALE', t('genders.MALE')], ['FEMALE', t('genders.FEMALE')], ['OTHER', t('genders.OTHER')]] as [string, string][]).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={value}
                      checked={form.gender === value}
                      onChange={() => update('gender', value)}
                      className="text-nfv-cyan focus:ring-nfv-cyan/30"
                    />
                    <span className="text-sm text-nfv-ice-light">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('height')}</label>
              <input type="number" value={form.height} onChange={(e) => update('height', e.target.value)} placeholder={t('heightPlaceholder')} min="50" max="250" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('weight')}</label>
              <input type="number" value={form.weight} onChange={(e) => update('weight', e.target.value)} placeholder={t('weightPlaceholder')} min="20" max="300" step="0.1" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('phone')}</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder={t('phonePlaceholder')} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('email')}</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder={t('emailPlaceholder')} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{t('notes')}</label>
            <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder={t('notesPlaceholder')} rows={3} className={`${inputClass} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/clientes" className="flex-1 py-3 rounded-xl border border-[rgba(0,188,212,0.12)] text-nfv-ice-light text-sm font-medium text-center hover:bg-[#e8f0fe] transition-colors">
              {tCommon('cancel')}
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-nfv-aurora text-white text-sm font-semibold shadow-nfv hover:shadow-nfv-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>{t('saving')}</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('saveClient')}
                </>
              )}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
