# ⚡ Deploy NFV - Resumo Executivo

## 📦 Arquivos Criados/Modificados

### Backend (`/d/NUTRIFITCOACH_MASTER/nfv-backend/`)
- ✅ `.dockerignore` (criado)
- ✅ `src/main.ts` (modificado - CORS atualizado)

### Frontend (`/d/nfv-frontend/`)
- ✅ `.env.production` (criado)
- ✅ `.dockerignore` (criado)
- ✅ `next.config.mjs` (modificado - CSP atualizado)
- ✅ `DEPLOY.md` (documentação completa)

---

## 🚀 Comandos de Deploy

### 1. Backend → Railway

```bash
# Via Railway CLI
cd /d/NUTRIFITCOACH_MASTER/nfv-backend
railway login
railway init
railway add --database postgres
railway add --database redis
railway up
```

**OU** use o dashboard: https://railway.app/new

### 2. Frontend → Vercel

```bash
# Via Vercel CLI
cd /d/nfv-frontend
vercel login
vercel
vercel --prod
```

**OU** use o dashboard: https://vercel.com/new

---

## 🔐 Variáveis de Ambiente

### Railway (Backend) - 12 variáveis

Configure em: `Railway Dashboard > Settings > Variables`

```env
PORT=3001
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=GERAR_TOKEN_FORTE_MIN_32_CHARS
JWT_EXPIRATION=7d
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=52428800
CV_SCRIPTS_PATH=./cv-scripts
PYTHON_PATH=python3
LOG_LEVEL=warn
```

**IMPORTANTE:** Gerar `JWT_SECRET` forte:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Vercel (Frontend) - 3 variáveis

Configure em: `Vercel Dashboard > Settings > Environment Variables`

```env
NEXT_PUBLIC_NFV_API_URL=https://SEU-PROJETO.up.railway.app/api/v1
NEXT_PUBLIC_APP_NAME=NutriFitVision
NEXT_PUBLIC_APP_URL=https://www.nutrifitvision.com
```

**IMPORTANTE:** Substituir `SEU-PROJETO.up.railway.app` pela URL real após deploy no Railway!

---

## ✅ Checklist Rápido

1. [ ] Deploy backend no Railway
2. [ ] Adicionar PostgreSQL + Redis no Railway
3. [ ] Configurar 12 variáveis no Railway
4. [ ] Copiar URL pública do Railway (ex: `nfv-api-production.up.railway.app`)
5. [ ] Deploy frontend na Vercel
6. [ ] Configurar 3 variáveis na Vercel (usar URL do passo 4)
7. [ ] Testar: `curl https://SEU-BACKEND.up.railway.app/api/v1/health`
8. [ ] Configurar domínio customizado (Cloudflare)

---

## 🎯 Ordem de Execução

1. **Backend primeiro** (Railway)
2. **Copiar URL do backend**
3. **Frontend depois** (Vercel) usando URL do backend
4. **Configurar DNS** (Cloudflare)

Documentação completa: `DEPLOY.md`
