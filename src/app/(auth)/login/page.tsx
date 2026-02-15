'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useTranslations } from 'next-intl';
import AuroraBackground from '@/components/ui/AuroraBackground';
import GlassCard from '@/components/ui/GlassCard';
import { useAuthContext } from '@/components/providers/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthContext();
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <AuroraBackground intensity="vivid" />

      <div className="relative z-10 w-full max-w-md">
        <GlassCard padding="lg" className="border-[rgba(0,188,212,0.12)]">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-nfv-aurora shadow-nfv-glow flex items-center justify-center mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading font-bold text-2xl nfv-text-aurora">NutriFitVision</h1>
            <p className="text-text-secondary text-sm mt-1">{t('loginSubtitle')}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-nfv-danger/10 border border-nfv-danger/20 text-nfv-danger text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#d0dbe6] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-nfv-cyan/40 focus:shadow-nfv transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#d0dbe6] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-nfv-cyan/40 focus:shadow-nfv transition-all text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-nfv-aurora text-white font-semibold text-sm shadow-nfv hover:shadow-nfv-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {t('login')}
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-text-secondary mt-6">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-nfv-cyan hover:underline font-medium">
              {t('register')}
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
