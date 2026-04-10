import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED = ['pt-BR', 'en', 'es'] as const;
type Locale = typeof SUPPORTED[number];

export default getRequestConfig(async () => {
  let locale: Locale = 'pt-BR';

  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('nfv-locale')?.value;
    if (raw && SUPPORTED.includes(raw as Locale)) {
      locale = raw as Locale;
    }
  } catch {
    // SSR context sem cookies (static generation) — usa pt-BR
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
