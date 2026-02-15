'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Users, Camera, History, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const mobileNavItems = [
    { label: t('home'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('clients'), href: '/clientes', icon: Users },
    { label: t('assess'), href: '/avaliacao', icon: Camera },
    { label: t('history'), href: '/avaliacao/historico', icon: History },
    { label: t('profile'), href: '/perfil', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 nfv-glass-strong border-t border-[rgba(0,188,212,0.1)]">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium
                transition-colors duration-200
                ${active ? 'text-nfv-cyan' : 'text-nfv-ice-muted'}
              `}
            >
              <Icon className={`w-5 h-5 ${active ? 'drop-shadow-[0_0_6px_rgba(0,188,212,0.4)]' : ''}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
