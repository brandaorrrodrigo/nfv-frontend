'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  Camera,
  History,
  FileText,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const navItems: NavItem[] = [
    { label: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { label: t('clients'), href: '/clientes', icon: Users },
    { label: t('newAssessment'), href: '/avaliacao', icon: Camera },
    { label: t('history'), href: '/avaliacao/historico', icon: History },
    { label: t('reports'), href: '/relatorios', icon: FileText },
    { label: t('profile'), href: '/perfil', icon: User },
    { label: t('plans'), href: '/planos', icon: CreditCard },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      className="hidden lg:flex flex-col h-screen sticky top-0 nfv-glass-strong border-r border-[rgba(0,188,212,0.1)] z-40"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-[rgba(0,188,212,0.1)]">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-nfv-aurora shadow-nfv">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-heading font-bold text-lg nfv-text-aurora whitespace-nowrap overflow-hidden"
            >
              NutriFitVision
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${active
                  ? 'bg-nfv-cyan/10 text-nfv-cyan border-l-2 border-nfv-cyan shadow-nfv'
                  : 'text-nfv-ice-light hover:bg-nfv-bg-hover hover:text-nfv-cyan border-l-2 border-transparent'
                }
              `}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-nfv-cyan' : ''}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-3 border-t border-[rgba(0,188,212,0.1)]">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full py-2 rounded-lg text-nfv-ice-muted hover:text-nfv-ice-light hover:bg-nfv-bg-hover transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  );
}
