'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, ChevronRight, Globe, LogOut, Menu, Settings, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthContext } from '@/components/providers/AuthProvider';
import { useLocale, type Locale } from '@/components/providers/LocaleProvider';

interface HeaderProps {
  onMenuToggle?: () => void;
}

const planBadgeColors: Record<string, string> = {
  FREE: 'bg-nfv-ice-muted/20 text-nfv-ice-medium',
  PROFESSIONAL: 'bg-nfv-cyan/15 text-nfv-cyan',
  CLINIC: 'bg-nfv-purple/15 text-nfv-purple',
};

function getBreadcrumbs(pathname: string, labelMap: Record<string, string>): { label: string; href?: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: 'NFV', href: '/dashboard' }];

  let path = '';
  for (const seg of segments) {
    path += '/' + seg;
    const label = labelMap[seg] || seg;
    crumbs.push({ label, href: path });
  }

  return crumbs;
}

const localeOptions: { value: Locale; flag: string; label: string }[] = [
  { value: 'pt-BR', flag: '🇧🇷', label: 'Português' },
  { value: 'en', flag: '🇺🇸', label: 'English' },
  { value: 'es', flag: '🇪🇸', label: 'Español' },
];

export default function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const { locale, setLocale } = useLocale();
  const t = useTranslations('nav');
  const tAuth = useTranslations('auth');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const labelMap: Record<string, string> = {
    pacientes: t('clients'),
    novo: t('new'),
    avaliacao: t('newAssessment'),
    historico: t('history'),
    relatorios: t('reports'),
    compartilhado: t('sharedReport'),
    perfil: t('profile'),
    planos: t('plans'),
    login: t('login'),
    register: t('register'),
  };

  const breadcrumbs = getBreadcrumbs(pathname, labelMap);
  const planBadge = user ? planBadgeColors[user.plan] || planBadgeColors.FREE : '';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 nfv-glass-strong border-b border-[rgba(0,188,212,0.1)]">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Menu + Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-nfv-ice-light hover:bg-nfv-bg-hover transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="hidden sm:flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-nfv-ice-muted" />}
                {crumb.href && i < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} className="text-nfv-ice-medium hover:text-nfv-ice-light transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-nfv-ice font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Right: Plan Badge + Notifications + User */}
        <div className="flex items-center gap-3">
          {user && (
            <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${planBadge}`}>
              {user.plan}
            </span>
          )}

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 p-2 rounded-lg text-nfv-ice-medium hover:text-nfv-ice-light hover:bg-nfv-bg-hover transition-colors"
              title={localeOptions.find(o => o.value === locale)?.label}
            >
              <Globe className="w-4.5 h-4.5" />
              <span className="hidden sm:inline text-xs font-medium">
                {localeOptions.find(o => o.value === locale)?.flag}
              </span>
            </button>

            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white/90 backdrop-blur-xl border border-[rgba(0,188,212,0.12)] shadow-nfv-lg z-50 py-1">
                  {localeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setLocale(opt.value);
                        setShowLangMenu(false);
                      }}
                      className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors ${
                        locale === opt.value
                          ? 'text-nfv-cyan bg-nfv-cyan/5 font-medium'
                          : 'text-nfv-ice-light hover:bg-nfv-bg-hover'
                      }`}
                    >
                      <span className="text-base">{opt.flag}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button className="relative p-2 rounded-lg text-nfv-ice-medium hover:text-nfv-ice-light hover:bg-nfv-bg-hover transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-nfv-cyan rounded-full" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-nfv-bg-hover transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-nfv-aurora flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white/90 backdrop-blur-xl border border-[rgba(0,188,212,0.12)] shadow-nfv-lg z-50 py-1">
                  <div className="px-4 py-3 border-b border-[rgba(0,188,212,0.1)]">
                    <p className="text-sm font-medium text-nfv-ice">{user?.name}</p>
                    <p className="text-xs text-nfv-ice-muted truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/perfil"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-nfv-ice-light hover:bg-nfv-bg-hover transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {t('profile')}
                  </Link>
                  <Link
                    href="/planos"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-nfv-ice-light hover:bg-nfv-bg-hover transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {t('plans')}
                  </Link>
                  <div className="border-t border-[rgba(0,188,212,0.1)]">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-nfv-danger hover:bg-nfv-bg-hover transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {tAuth('logout')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
