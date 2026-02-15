# Guia de Migração - NFV Frontend Independente

Este guia detalha os passos para migrar os componentes, páginas e arquivos do NFV do projeto monorepo NutriFitCoach para o projeto independente.

## Status do Projeto

✅ **Concluído:**
- Estrutura de pastas criada
- Dependências instaladas (419 pacotes)
- Arquivos de configuração criados:
  - `tsconfig.json` - TypeScript
  - `tailwind.config.ts` - Tailwind com tema NFV
  - `next.config.mjs` - Next.js com CSP
  - `postcss.config.mjs` - PostCSS
  - `.env.local` - Variáveis de ambiente
  - `.env.example` - Template de variáveis
  - `.gitignore` - Git ignore
  - `.eslintrc.json` - ESLint
- `src/app/globals.css` - Tema NFV completo com animações Aurora

⏳ **Pendente:**
1. Copiar e adaptar API client
2. Copiar e renomear componentes
3. Copiar mensagens de internacionalização
4. Criar layouts (root, auth, app)
5. Copiar e adaptar páginas
6. Criar middleware de autenticação
7. Testar build e dev server
8. Inicializar repositório Git

---

## Etapa 1: Copiar API Client

### Origem
```
D:\NUTRIFITCOACH_MASTER\lib\nfv-api\
├── client.ts
├── types.ts
└── endpoints\
    ├── auth.ts
    ├── users.ts
    ├── meals.ts
    └── ...
```

### Destino
```
D:\nfv-frontend\src\lib\api\
```

### Modificações necessárias:
1. **client.ts**: Já está configurado com URL correta
2. **types.ts**: Copiar sem modificações
3. **endpoints/**: Copiar todos os arquivos
4. Atualizar imports internos se necessário

---

## Etapa 2: Copiar Componentes Core

### 2.1 Providers (contextos)

**Origem:** `D:\NUTRIFITCOACH_MASTER\components\nfv\providers\`

**Destino:** `D:\nfv-frontend\src\components\providers\`

Arquivos:
- `AuthProvider.tsx` → `AuthProvider.tsx`
- `LocaleProvider.tsx` → `LocaleProvider.tsx`
- `ThemeProvider.tsx` (se existir) → `ThemeProvider.tsx`

**Modificações:**
- Remover prefixo "NFV" dos nomes de componentes
- Atualizar imports de `@/lib/nfv-api` para `@/lib/api`

### 2.2 Layout Components

**Origem:** `D:\NUTRIFITCOACH_MASTER\components\nfv\layout\`

**Destino:** `D:\nfv-frontend\src\components\layout\`

Arquivos e renomeações:
- `NFVSidebar.tsx` → `Sidebar.tsx`
- `NFVHeader.tsx` → `Header.tsx`
- `NFVMobileNav.tsx` → `MobileNav.tsx`
- `NFVFooter.tsx` → `Footer.tsx` (se existir)

**Modificações:**
- Renomear componentes (remover prefixo NFV)
- Atualizar imports de componentes UI
- Atualizar links: `/nfv/dashboard` → `/dashboard`

### 2.3 UI Components

**Origem:** `D:\NUTRIFITCOACH_MASTER\components\nfv\ui\`

**Destino:** `D:\nfv-frontend\src\components\ui\`

Arquivos e renomeações:
- `NFVButton.tsx` → `Button.tsx`
- `NFVCard.tsx` → `Card.tsx`
- `NFVGlassCard.tsx` → `GlassCard.tsx`
- `NFVAuroraBackground.tsx` → `AuroraBackground.tsx`
- `NFVModal.tsx` → `Modal.tsx`
- `NFVInput.tsx` → `Input.tsx`
- `NFVSelect.tsx` → `Select.tsx`
- `NFVBadge.tsx` → `Badge.tsx`
- Todos os outros componentes UI

**Modificações:**
- Renomear componentes e exports
- Classes CSS já estão em globals.css (nfv-glass, nfv-text-aurora, etc.)

### 2.4 Feature Components

**Origem:** `D:\NUTRIFITCOACH_MASTER\components\nfv\features\`

**Destino:** `D:\nfv-frontend\src\components\features\`

Copiar todos os componentes de funcionalidades:
- Dashboard widgets
- Meal components
- Analysis components
- Report components
- Profile components

---

## Etapa 3: Copiar Mensagens de Internacionalização

**Origem:** `D:\NUTRIFITCOACH_MASTER\messages\nfv\`

**Destino:** `D:\nfv-frontend\src\messages\`

Estrutura:
```
src/messages/
├── pt-BR.json
├── en.json
└── es.json
```

**Modificações:**
- Mesclar arquivos se estiverem separados
- Remover prefixo "nfv." das chaves se necessário

---

## Etapa 4: Criar Layouts

### 4.1 Root Layout

**Arquivo:** `D:\nfv-frontend\src\app\layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Exo_2, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
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
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${exo2.variable} ${ibmPlex.variable} ${jetbrains.variable}`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 4.2 Auth Layout (sem sidebar)

**Arquivo:** `D:\nfv-frontend\src\app\(auth)\layout.tsx`

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-deep">
      {children}
    </div>
  );
}
```

### 4.3 App Layout (com sidebar)

**Arquivo:** `D:\nfv-frontend\src\app\(app)\layout.tsx`

```typescript
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-bg-deep">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
```

---

## Etapa 5: Copiar e Adaptar Páginas

### 5.1 Landing Page (root)

**Origem:** `D:\NUTRIFITCOACH_MASTER\app\nfv\landing\page.tsx`

**Destino:** `D:\nfv-frontend\src\app\page.tsx`

**Modificações:**
- Atualizar imports de componentes
- Atualizar links: `/nfv/login` → `/login`

### 5.2 Auth Pages

**Origem → Destino:**
- `app\nfv\login\page.tsx` → `src\app\(auth)\login\page.tsx`
- `app\nfv\register\page.tsx` → `src\app\(auth)\register\page.tsx`
- `app\nfv\forgot-password\page.tsx` → `src\app\(auth)\forgot-password\page.tsx`
- `app\nfv\reset-password\page.tsx` → `src\app\(auth)\reset-password\page.tsx`

**Modificações:**
- Atualizar imports
- Atualizar links de navegação
- Atualizar chamadas de API

### 5.3 App Pages (Dashboard, Profile, etc.)

**Origem → Destino:**
- `app\nfv\dashboard\page.tsx` → `src\app\(app)\dashboard\page.tsx`
- `app\nfv\profile\page.tsx` → `src\app\(app)\profile\page.tsx`
- `app\nfv\meals\page.tsx` → `src\app\(app)\meals\page.tsx`
- `app\nfv\analysis\page.tsx` → `src\app\(app)\analysis\page.tsx`
- `app\nfv\reports\page.tsx` → `src\app\(app)\reports\page.tsx`
- `app\nfv\settings\page.tsx` → `src\app\(app)\settings\page.tsx`

**Modificações para todas as páginas:**
1. Atualizar imports de `@/components/nfv/*` para `@/components/*`
2. Atualizar imports de `@/lib/nfv-api` para `@/lib/api`
3. Atualizar links internos (remover `/nfv/` prefix)
4. Verificar mensagens i18n (remover prefixo `nfv.` se necessário)

---

## Etapa 6: Criar Middleware de Autenticação

**Arquivo:** `D:\nfv-frontend\src\middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
const AUTH_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se tem token de autenticação
  const token = request.cookies.get('nfv_token')?.value;
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/api'));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  // Redirecionar usuário autenticado das páginas de auth
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirecionar usuário não autenticado para login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

---

## Etapa 7: Checklist de Validação

### Antes de testar:
- [ ] API client copiado e imports atualizados
- [ ] Todos os providers copiados e renomeados
- [ ] Componentes de layout copiados e renomeados
- [ ] Componentes UI copiados e renomeados
- [ ] Componentes de features copiados
- [ ] Mensagens i18n copiadas
- [ ] Root layout criado com Google Fonts
- [ ] Auth layout criado
- [ ] App layout criado
- [ ] Landing page copiada e adaptada
- [ ] Páginas de auth copiadas e adaptadas
- [ ] Páginas de app copiadas e adaptadas
- [ ] Middleware criado
- [ ] Todas as referências `/nfv/` removidas dos links
- [ ] Todos os imports `@/components/nfv/*` atualizados
- [ ] Todos os imports `@/lib/nfv-api` atualizados
- [ ] Prefixos "NFV" removidos dos nomes de componentes

### Testes:
```bash
cd D:\nfv-frontend

# Teste de desenvolvimento
npm run dev
# Acessar: http://localhost:3000

# Teste de build
npm run build
npm start
```

### Validações:
- [ ] Landing page carrega corretamente
- [ ] Login redireciona corretamente
- [ ] Dashboard carrega (com autenticação)
- [ ] Sidebar aparece nas páginas de app
- [ ] Tema Aurora/Ice está aplicado
- [ ] Animações funcionam
- [ ] API conecta ao backend (localhost:3002)
- [ ] Internacionalização funciona
- [ ] Sem erros de hydration
- [ ] Sem violações de CSP
- [ ] Build completa sem erros

---

## Etapa 8: Inicializar Git

```bash
cd D:\nfv-frontend

git init
git add .
git commit -m "chore: setup independent NFV frontend project

- Next.js 15 with App Router
- TypeScript configuration
- Tailwind CSS with NFV Aurora/Ice theme
- next-intl for i18n
- Framer Motion for animations
- CSP headers configured
- Environment variables setup
- All NFV components migrated from monorepo
- Routes reorganized (removed /nfv/ prefix)
- Components renamed (removed NFV prefix)

Tech stack:
- Next.js 15.5.12
- React 19
- TypeScript 5
- Tailwind CSS 3.4
- Framer Motion 11
- Axios 1.7
- Recharts 2.12
- next-intl 3.19

API Backend: http://localhost:3002 (dev) | https://api.nutrifitvision.com (prod)"
```

---

## Notas Importantes

### Padrão de Renomeação de Componentes

**Antes (monorepo):**
```typescript
import { NFVButton } from '@/components/nfv/ui/NFVButton';
import { NFVSidebar } from '@/components/nfv/layout/NFVSidebar';
```

**Depois (projeto independente):**
```typescript
import { Button } from '@/components/ui/Button';
import { Sidebar } from '@/components/layout/Sidebar';
```

### Padrão de Atualização de Links

**Antes:**
```typescript
<Link href="/nfv/dashboard">Dashboard</Link>
```

**Depois:**
```typescript
<Link href="/dashboard">Dashboard</Link>
```

### Padrão de API Client

**Antes:**
```typescript
import { nfvApi } from '@/lib/nfv-api/client';
```

**Depois:**
```typescript
import { api } from '@/lib/api/client';
```

### Classes CSS (mantém prefixo nfv-)

As classes CSS mantêm o prefixo `nfv-` para evitar conflitos futuros:
- `.nfv-glass`
- `.nfv-glass-strong`
- `.nfv-text-aurora`
- `.nfv-border-aurora`
- `.animate-nfv-glow-pulse`
- etc.

---

## Próximos Passos Após Migração

1. **Configurar CI/CD**
   - GitHub Actions para deploy
   - Vercel ou Railway para hosting
   - Variáveis de ambiente de produção

2. **Configurar Domínio**
   - nutrifitvision.com → landing page
   - app.nutrifitvision.com → aplicação

3. **Testes**
   - Configurar Jest
   - Testes unitários dos componentes
   - Testes E2E com Playwright

4. **Monitoramento**
   - Sentry para error tracking
   - Analytics (Google Analytics ou Plausible)
   - Performance monitoring

5. **Documentação**
   - README.md completo
   - Documentação de componentes (Storybook?)
   - Guia de contribuição
