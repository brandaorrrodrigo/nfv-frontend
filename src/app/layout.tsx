import type { Metadata } from 'next';
import { Exo_2, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import AuthProvider from '@/components/providers/AuthProvider';
import LocaleProvider from '@/components/providers/LocaleProvider';
import './globals.css';

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const ibmPlex = IBM_Plex_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NutriFitVision - Análise Nutricional com IA',
  description: 'Plataforma de análise nutricional automatizada com visão computacional e inteligência artificial',
  keywords: ['nutrição', 'fitness', 'visão computacional', 'IA', 'saúde', 'bem-estar'],
  authors: [{ name: 'NutriFitVision Team' }],
  openGraph: {
    title: 'NutriFitVision',
    description: 'Análise Nutricional com IA e Visão Computacional',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${exo2.variable} ${ibmPlex.variable} ${jetbrains.variable}`}>
      <body>
        <AuthProvider>
          <LocaleProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              {children}
            </NextIntlClientProvider>
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
