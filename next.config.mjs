import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    const cspConnectSrc = isDev
      ? [
          "'self'",
          "http://localhost:3002",
          "http://localhost:3100",   // ← nfc-core pose analysis
          "http://localhost:8000",
          "http://127.0.0.1:8000",
          "http://localhost:11434",
          "https://api.nutrifitvision.com",
          "https://*.supabase.co",
          "https://api.stripe.com",
          "https://www.google-analytics.com",
          "wss://*.supabase.co",
        ].join(' ')
      : [
          "'self'",
          "https://*.up.railway.app",
          "https://api.nutrifitvision.com",
          "https://nfv-api.nutrifitcoach.com.br",
          "https://nfc-core.nutrifitcoach.com.br",  // ← nfc-core em produção
          "https://*.supabase.co",
          "https://api.stripe.com",
          "https://www.google-analytics.com",
          "wss://*.supabase.co",
        ].join(' ');

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              `default-src 'self'`,
              `connect-src ${cspConnectSrc}`,
              `img-src 'self' data: blob: https:`,
              `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
              `font-src 'self' https://fonts.gstatic.com data:`,
              `script-src 'self' 'unsafe-eval' 'unsafe-inline'`,
            ].join('; '),
          },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
