'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AuroraBackground from '@/components/ui/AuroraBackground';
import GlassCard from '@/components/ui/GlassCard';
import { useAuthContext } from '@/components/providers/AuthProvider';
import type { NFVProfession } from '@/lib/api/types';

const professionValues: NFVProfession[] = [
  'PERSONAL_TRAINER',
  'NUTRITIONIST',
  'PHYSIOTHERAPIST',
  'DOCTOR',
  'PILATES_INSTRUCTOR',
  'CROSSFIT_COACH',
  'SPA_THERAPIST',
  'OTHER',
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthContext();
  const tAuth = useTranslations('auth');
  const tProf = useTranslations('professions');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    profession: 'PERSONAL_TRAINER' as NFVProfession,
    registerNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (form.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (!acceptTerms) {
      setError('Você precisa aceitar os termos de uso');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        profession: form.profession,
        registerNumber: form.registerNumber || undefined,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white border border-[#d0dbe6] text-nfv-ice placeholder:text-nfv-ice-muted focus:outline-none focus:border-nfv-cyan/40 focus:shadow-nfv transition-all text-sm";

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <AuroraBackground intensity="vivid" />

      <div className="relative z-10 w-full max-w-md">
        <GlassCard padding="lg" className="border-[rgba(0,188,212,0.12)]">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-nfv-aurora shadow-nfv-glow flex items-center justify-center mb-3">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-heading font-bold text-xl nfv-text-aurora">{tAuth('registerTitle')}</h1>
            <p className="text-nfv-ice-medium text-sm mt-1">{tAuth('registerSubtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-nfv-danger/10 border border-nfv-danger/20 text-nfv-danger text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{tAuth('name')}</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder={tAuth('namePlaceholder')} required className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{tAuth('email')}</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder={tAuth('emailPlaceholder')} required className={inputClass} />
            </div>

            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{tAuth('profession')}</label>
              <select
                value={form.profession}
                onChange={(e) => update('profession', e.target.value)}
                required
                className={`${inputClass} appearance-none`}
              >
                {professionValues.map((value) => (
                  <option key={value} value={value} className="bg-white text-[#1a2332]">
                    {tProf(value)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">
                {tAuth('registerNumber')}
              </label>
              <input type="text" value={form.registerNumber} onChange={(e) => update('registerNumber', e.target.value)} placeholder={tAuth('registerNumberPlaceholder')} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{tAuth('password')}</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="••••••"
                    required
                    className={`${inputClass} pr-10`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-nfv-ice-muted">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-nfv-ice-medium mb-1.5">{tAuth('confirmPassword')}</label>
                <input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} placeholder="••••••" required className={inputClass} />
              </div>
            </div>

            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5 rounded border-[#d0dbe6] bg-white text-nfv-cyan focus:ring-nfv-cyan/30" />
              <span className="text-xs text-nfv-ice-medium">
                Li e aceito os <a href="#" className="text-nfv-cyan hover:underline">Termos de Uso</a> e <a href="#" className="text-nfv-cyan hover:underline">Política de Privacidade</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-nfv-aurora text-white font-semibold text-sm shadow-nfv hover:shadow-nfv-glow transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {tAuth('register')}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-nfv-ice-medium mt-5">
            {tAuth('hasAccount')}{' '}
            <Link href="/login" className="text-nfv-cyan hover:underline font-medium">
              {tAuth('login')}
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
