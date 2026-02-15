'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { api } from '@/lib/api/client';

import ptBR from '@/messages/pt-BR.json';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

export type Locale = 'pt-BR' | 'en' | 'es';

const LOCALE_KEY = 'nfv-locale';

const messagesMap: Record<Locale, typeof ptBR> = {
  'pt-BR': ptBR,
  en,
  es,
};

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

function detectLocale(userLocale?: string | null): Locale {
  // 1. localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(LOCALE_KEY);
    if (stored === 'pt-BR' || stored === 'en' || stored === 'es') {
      return stored;
    }
  }

  // 2. User profile locale
  if (userLocale === 'pt-BR' || userLocale === 'en' || userLocale === 'es') {
    return userLocale;
  }

  // 3. navigator.language
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('pt')) return 'pt-BR';
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('en')) return 'en';
  }

  // 4. Fallback
  return 'pt-BR';
}

interface LocaleProviderProps {
  children: ReactNode;
  initialLocale?: string | null;
}

export default function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(() => detectLocale(initialLocale));

  // Sync when initialLocale changes (user profile loaded)
  useEffect(() => {
    if (initialLocale && !localStorage.getItem(LOCALE_KEY)) {
      const detected = detectLocale(initialLocale);
      setLocaleState(detected);
    }
  }, [initialLocale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_KEY, newLocale);
    }

    // Persist to backend if authenticated
    const token = api.getToken();
    if (token) {
      api.updateProfile({ locale: newLocale }).catch(() => {
        // Silent fail — locale is still saved locally
      });
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messagesMap[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
