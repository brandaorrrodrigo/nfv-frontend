# NutriFitVision - Frontend

Frontend independente da plataforma NutriFitVision, construído com Next.js 15, TypeScript e Tailwind CSS.

## 🎨 Design System: Aurora/Ice Theme

O projeto utiliza um design system único baseado em tons gelados (ice) e gradientes aurora (cyan, blue, indigo, purple).

### Cores Principais

- **Backgrounds**: `#f0f4f8` (deep), `#ffffff` (card), `#f8fafc` (elevated)
- **Aurora**: Cyan `#00bcd4`, Blue `#2962ff`, Indigo `#5c6bc0`, Purple `#7c4dff`
- **Ice/Frost**: Tons de azul claro para textos e elementos secundários
- **Semânticas**: Success `#00c853`, Warning `#ff9100`, Danger `#ff1744`

### Efeitos Visuais

- **Glass Morphism**: `.nfv-glass` e `.nfv-glass-strong` com backdrop blur
- **Aurora Gradient**: Degradê animado de cyan → blue → purple
- **Animações**: glow-pulse, aurora-breathe, float, shimmer, fade-up

## 🏗️ Arquitetura

```
src/
├── app/
│   ├── (auth)/          # Route group sem sidebar (login, register)
│   │   └── layout.tsx
│   ├── (app)/           # Route group com sidebar (dashboard, etc)
│   │   └── layout.tsx
│   ├── layout.tsx       # Root layout com fonts
│   ├── page.tsx         # Landing page
│   └── globals.css      # Tema NFV
├── components/
│   ├── providers/       # AuthProvider, LocaleProvider
│   ├── layout/          # Sidebar, Header, MobileNav
│   ├── ui/              # Componentes reutilizáveis
│   └── features/        # Componentes específicos de funcionalidades
├── lib/
│   └── api/             # API client e types
├── messages/            # Internacionalização (pt-BR, en, es)
└── middleware.ts        # Proteção de rotas + i18n
```

## 🚀 Tecnologias

- **Next.js 15.5.12** - App Router, Server Components, Server Actions
- **React 19** - Latest features
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4** - Styling com tema customizado
- **Framer Motion 11** - Animações suaves
- **next-intl 3.19** - Internacionalização (pt-BR, en, es)
- **Axios 1.7** - HTTP client
- **Recharts 2.12** - Gráficos e visualizações
- **Lucide React** - Ícones

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 🔐 Autenticação

O projeto usa JWT armazenado em `localStorage` com key `nfv_access_token`.

- **AuthProvider**: Gerencia estado de autenticação
- **Middleware**: Protege rotas privadas automaticamente
- **Redirecionamento**: Usuários não autenticados → `/login`

## 🌍 Internacionalização

Suporte para 3 idiomas:

- 🇧🇷 Português (pt-BR) - Padrão
- 🇺🇸 English (en)
- 🇪🇸 Español (es)

Mensagens em `src/messages/{locale}.json`

## 🎯 Rotas Principais

### Públicas
- `/` - Landing page
- `/login` - Login
- `/register` - Cadastro
- `/forgot-password` - Recuperação de senha
- `/reset-password` - Redefinir senha

### Protegidas (requerem autenticação)
- `/dashboard` - Dashboard principal
- `/pacientes` - Gestão de pacientes
- `/avaliacao` - Nova avaliação
- `/avaliacao/historico` - Histórico de avaliações
- `/relatorios` - Relatórios
- `/perfil` - Perfil do usuário
- `/planos` - Planos e assinatura

## 🔌 API Backend

**Desenvolvimento**: `http://localhost:3002/api/v1`
**Produção**: `https://api.nutrifitvision.com/api/v1`

Configurar em `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1
NEXT_PUBLIC_API_URL_PRODUCTION=https://api.nutrifitvision.com/api/v1
NEXT_PUBLIC_APP_NAME=NutriFitVision
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🎨 Componentes Principais

### Layout
- **Sidebar** - Navegação lateral (desktop)
- **Header** - Cabeçalho com breadcrumbs, notificações, perfil
- **MobileNav** - Navegação inferior (mobile)

### Providers
- **AuthProvider** - Contexto de autenticação
- **LocaleProvider** - Contexto de i18n

### UI
- **AuroraBackground** - Fundo animado com gradiente
- **GlassCard** - Card com efeito glass morphism
- **ScoreCircle** - Círculo de progresso
- **StatCard** - Card de estatística
- **StatusBadge** - Badge de status
- **SeverityBadge** - Badge de severidade
- **UploadZone** - Área de upload de arquivos
- **WizardStepper** - Stepper para wizards

## 🧪 Scripts

```bash
npm run dev      # Desenvolvimento (localhost:3000)
npm run build    # Build para produção
npm start        # Executar build
npm run lint     # ESLint
```

## 📝 Convenções de Código

### Imports
```typescript
// Providers
import AuthProvider from '@/components/providers/AuthProvider';
import { useAuthContext } from '@/components/providers/AuthProvider';

// Layout
import Sidebar from '@/components/layout/Sidebar';

// API
import { api } from '@/lib/api/client';
import type { NFVUser } from '@/lib/api/types';
```

### Classes CSS
```tsx
// Usar classes do tema NFV
<div className="nfv-glass rounded-xl p-6">
  <h1 className="nfv-text-aurora font-heading">Título</h1>
  <div className="animate-nfv-glow-pulse">Elemento com glow</div>
</div>
```

### Rotas
```tsx
// Sempre sem o prefixo /nfv
<Link href="/dashboard">Dashboard</Link>
<Link href="/pacientes">Pacientes</Link>
```

## 🔄 Migração do Monorepo

Este projeto foi migrado do monorepo NutriFitCoach Master. As principais mudanças:

1. **Componentes renomeados**: `NFVSidebar` → `Sidebar`, `NFVHeader` → `Header`
2. **Rotas simplificadas**: `/nfv/dashboard` → `/dashboard`
3. **Imports atualizados**: `@/lib/nfv-api` → `@/lib/api`
4. **API client**: `nfvApi` → `api`
5. **Classes CSS**: Mantidas com prefixo `nfv-` para evitar conflitos

## 📚 Documentação Adicional

- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guia completo de migração
- [Tailwind Config](./tailwind.config.ts) - Configuração do tema
- [Next Config](./next.config.mjs) - Configuração do Next.js (CSP, etc)

## 🤝 Contribuindo

1. Seguir convenções de nomenclatura
2. Manter o design system Aurora/Ice
3. Testar em mobile e desktop
4. Verificar i18n (todos os 3 idiomas)
5. Executar `npm run lint` antes do commit

## 📄 Licença

Propriedade de NutriFitVision. Todos os direitos reservados.

---

**Status**: ✅ Projeto configurado e pronto para desenvolvimento
**Última atualização**: 14 de fevereiro de 2026
