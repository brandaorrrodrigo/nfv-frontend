# 🚀 NutriFitVision - Guia de Deploy em Produção

## 📋 Arquitetura

- **Frontend**: Next.js 15 → Vercel
- **Backend**: NestJS → Railway
- **Database**: Supabase (PostgreSQL)
- **Domínio**: www.nutrifitvision.com (Cloudflare)

---

## 1️⃣ Deploy Backend no Railway

### Pré-requisitos
- Conta Railway: https://railway.app
- Railway CLI instalado (opcional)

### Método 1: Via Railway Dashboard (Recomendado)

1. **Criar novo projeto:**
   - Acesse https://railway.app/new
   - Conecte seu repositório GitHub
   - Selecione o diretório `/nfv-backend`

2. **Configurar variáveis de ambiente:**

   Acesse `Settings > Variables` e adicione:

   ```env
   # Server
   PORT=3001
   NODE_ENV=production

   # Database (Railway provê automaticamente)
   DATABASE_URL=${{Postgres.DATABASE_URL}}

   # JWT (GERAR VALOR SEGURO!)
   JWT_SECRET=GERAR_UM_TOKEN_FORTE_AQUI_MIN_32_CHARS
   JWT_EXPIRATION=7d

   # Redis (Railway provê automaticamente)
   REDIS_HOST=${{Redis.REDIS_HOST}}
   REDIS_PORT=${{Redis.REDIS_PORT}}

   # Upload
   UPLOAD_DIR=/tmp/uploads
   MAX_FILE_SIZE=52428800

   # CV Scripts
   CV_SCRIPTS_PATH=./cv-scripts
   PYTHON_PATH=python3

   # Ollama (Opcional - deixe false em produção)
   USE_OLLAMA=false
   OLLAMA_API_URL=
   OLLAMA_MODEL=moondream

   # Logging
   LOG_LEVEL=warn
   ```

3. **Adicionar serviços:**
   - Adicionar PostgreSQL: `New > Database > PostgreSQL`
   - Adicionar Redis: `New > Database > Redis`

4. **Deploy:**
   - Railway detecta `Dockerfile` automaticamente
   - Clique em `Deploy` ou faça push para `main`

5. **Configurar domínio customizado (opcional):**
   - `Settings > Networking > Custom Domain`
   - Adicione: `api.nutrifitvision.com`
   - Configure no Cloudflare: CNAME apontando para Railway

6. **Obter URL pública:**
   - Copie a URL Railway (ex: `nfv-api-production.up.railway.app`)
   - Anote para usar no frontend

### Método 2: Via Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Criar projeto
cd /d/NUTRIFITCOACH_MASTER/nfv-backend
railway init

# Adicionar PostgreSQL
railway add --database postgres

# Adicionar Redis
railway add --database redis

# Configurar variáveis (ou use o dashboard)
railway variables set JWT_SECRET="seu-token-forte-aqui"

# Deploy
railway up
```

### Verificação

```bash
# Testar health endpoint
curl https://nfv-api-production.up.railway.app/api/v1/health

# Resposta esperada:
{
  "status": "ok",
  "service": "nfv-backend",
  "version": "1.0.0",
  "timestamp": "2026-02-15T...",
  "database": "connected",
  "uptime": 123.45
}
```

---

## 2️⃣ Deploy Frontend na Vercel

### Pré-requisitos
- Conta Vercel: https://vercel.com
- Vercel CLI instalado (opcional)

### Método 1: Via Vercel Dashboard (Recomendado)

1. **Importar projeto:**
   - Acesse https://vercel.com/new
   - Conecte GitHub e selecione repositório `nfv-frontend`
   - Root Directory: `./` (ou o diretório correto)

2. **Configurar variáveis de ambiente:**

   Em `Settings > Environment Variables`, adicione:

   ```env
   # API URL (ATUALIZAR COM URL DO RAILWAY!)
   NEXT_PUBLIC_NFV_API_URL=https://nfv-api-production.up.railway.app/api/v1

   # App Config
   NEXT_PUBLIC_APP_NAME=NutriFitVision
   NEXT_PUBLIC_APP_URL=https://www.nutrifitvision.com
   ```

   **IMPORTANTE:** Substitua `nfv-api-production.up.railway.app` pela URL real do Railway!

3. **Deploy:**
   - Clique em `Deploy`
   - Aguarde build (~2 minutos)

4. **Configurar domínio customizado:**
   - `Settings > Domains`
   - Adicione: `www.nutrifitvision.com` e `nutrifitvision.com`
   - Configure no Cloudflare:
     - `CNAME www` → `cname.vercel-dns.com`
     - `A @` → IP da Vercel (ou use Cloudflare Tunnel)

### Método 2: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /d/nfv-frontend
vercel

# Seguir prompts:
# - Set up project? Yes
# - Link to existing? No
# - Project name: nfv-frontend
# - Directory: ./
# - Deploy? Yes

# Configurar variáveis
vercel env add NEXT_PUBLIC_NFV_API_URL production
# Cole a URL do Railway: https://nfv-api-production.up.railway.app/api/v1

# Deploy em produção
vercel --prod
```

### Verificação

```bash
# Testar frontend
curl https://www.nutrifitvision.com

# Testar API call (abra DevTools no navegador)
fetch('https://www.nutrifitvision.com')
  .then(r => console.log('Frontend OK'))
```

---

## 3️⃣ Configuração Cloudflare (Se usar Tunnel)

Se você já tem Cloudflare Tunnel ativo:

1. **Atualizar configuração:**
   ```yaml
   tunnel: <seu-tunnel-id>
   credentials-file: /path/to/credentials.json

   ingress:
     # Frontend (Vercel)
     - hostname: www.nutrifitvision.com
       service: https://nfv-frontend.vercel.app

     - hostname: nutrifitvision.com
       service: https://nfv-frontend.vercel.app

     # Backend (Railway)
     - hostname: api.nutrifitvision.com
       service: https://nfv-api-production.up.railway.app

     - service: http_status:404
   ```

2. **Reiniciar tunnel:**
   ```bash
   cloudflared tunnel restart
   ```

---

## 4️⃣ Checklist Pós-Deploy

### Backend (Railway)

- [ ] Health endpoint responde: `/api/v1/health`
- [ ] PostgreSQL conectado (database: "connected")
- [ ] Redis conectado
- [ ] Logs sem erros críticos
- [ ] CORS permite apenas domínios de produção
- [ ] JWT_SECRET é forte (min 32 chars)

### Frontend (Vercel)

- [ ] Build passou sem erros
- [ ] `NEXT_PUBLIC_NFV_API_URL` aponta para Railway
- [ ] Domínio customizado configurado
- [ ] HTTPS ativo
- [ ] CSP permite Railway URL

### Geral

- [ ] Login funciona
- [ ] Upload de imagens funciona
- [ ] Processamento CV funciona
- [ ] Relatórios são gerados
- [ ] Sem erros CORS no console

---

## 5️⃣ Comandos Úteis

### Redeploy Backend (Railway)

```bash
# Via CLI
cd /d/NUTRIFITCOACH_MASTER/nfv-backend
railway up

# Via Git
git add .
git commit -m "Update backend"
git push origin main
# Railway faz deploy automático
```

### Redeploy Frontend (Vercel)

```bash
# Via CLI
cd /d/nfv-frontend
vercel --prod

# Via Git
git add .
git commit -m "Update frontend"
git push origin main
# Vercel faz deploy automático
```

### Ver Logs

```bash
# Railway
railway logs

# Vercel
vercel logs
```

---

## 6️⃣ Variáveis de Ambiente - Resumo

### Backend (Railway) - 12 variáveis

| Variável | Valor Exemplo | Obrigatório |
|----------|---------------|-------------|
| `PORT` | `3001` | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | ✅ |
| `JWT_SECRET` | `gerar-token-forte-32-chars` | ✅ |
| `JWT_EXPIRATION` | `7d` | ✅ |
| `REDIS_HOST` | `${{Redis.REDIS_HOST}}` | ✅ |
| `REDIS_PORT` | `${{Redis.REDIS_PORT}}` | ✅ |
| `UPLOAD_DIR` | `/tmp/uploads` | ✅ |
| `MAX_FILE_SIZE` | `52428800` | ❌ |
| `CV_SCRIPTS_PATH` | `./cv-scripts` | ✅ |
| `PYTHON_PATH` | `python3` | ✅ |
| `LOG_LEVEL` | `warn` | ❌ |

### Frontend (Vercel) - 3 variáveis

| Variável | Valor Exemplo | Obrigatório |
|----------|---------------|-------------|
| `NEXT_PUBLIC_NFV_API_URL` | `https://nfv-api-production.up.railway.app/api/v1` | ✅ |
| `NEXT_PUBLIC_APP_NAME` | `NutriFitVision` | ❌ |
| `NEXT_PUBLIC_APP_URL` | `https://www.nutrifitvision.com` | ❌ |

---

## 7️⃣ Troubleshooting

### Erro: CORS blocked

**Causa:** Backend não permite origem do frontend.

**Solução:**
```typescript
// src/main.ts
app.enableCors({
  origin: ['https://nutrifitvision.com', 'https://www.nutrifitvision.com'],
  credentials: true,
});
```

### Erro: Database connection failed

**Causa:** `DATABASE_URL` incorreto.

**Solução:**
```bash
# Railway
railway variables get DATABASE_URL

# Verificar formato:
postgresql://user:pass@host:port/dbname
```

### Erro: Python scripts não funcionam

**Causa:** `cv-scripts/requirements.txt` não instalado.

**Solução:** Dockerfile já instala. Verificar logs:
```bash
railway logs | grep -i python
```

### Build frontend falha

**Causa:** TypeScript errors ou missing deps.

**Solução:**
```bash
# Local
cd /d/nfv-frontend
npm run build

# Ver erros e corrigir
```

---

## 8️⃣ URLs Finais

Após deploy completo:

- **Frontend**: https://www.nutrifitvision.com
- **Backend API**: https://nfv-api-production.up.railway.app/api/v1
- **Docs (Swagger)**: https://nfv-api-production.up.railway.app/docs
- **Health Check**: https://nfv-api-production.up.railway.app/api/v1/health

---

## 🎉 Deploy Concluído!

Se tudo funcionar:
1. Teste login/registro
2. Crie um paciente
3. Faça upload de imagem
4. Gere relatório

**Problemas?** Verifique logs e checklist acima.
