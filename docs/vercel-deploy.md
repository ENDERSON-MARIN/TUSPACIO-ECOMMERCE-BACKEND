# 🚀 Guia de Deploy na Vercel - TuSpacio API

## 📋 Pré-requisitos

Antes de fazer o deploy, certifique-se de ter:

- ✅ Conta na [Vercel](https://vercel.com)
- ✅ Repositório Git (GitHub, GitLab ou Bitbucket)
- ✅ Database PostgreSQL configurado (Neon, Supabase, Railway, etc.)
- ✅ Variáveis de ambiente configuradas

## 🔧 Configuração do Banco de Dados

### Opção 1: Neon Database (Recomendado)

1. Acesse [Neon](https://neon.tech)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Copie a `DATABASE_URL` fornecida

### Opção 2: Supabase

1. Acesse [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Vá em Settings > Database
4. Copie a connection string

### Opção 3: Railway

1. Acesse [Railway](https://railway.app)
2. Crie um novo projeto
3. Adicione PostgreSQL
4. Copie a `DATABASE_URL`

## 🚀 Deploy via Dashboard da Vercel

### Passo 1: Conectar Repositório

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Conecte seu repositório Git
4. Selecione o repositório do TuSpacio

### Passo 2: Configurar Variáveis de Ambiente

Na seção "Environment Variables", adicione:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Server
NODE_ENV=production
PORT=3001

# JWT
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Session
SESSION_SECRET=your-super-secure-session-secret-minimum-32-characters

# Security
BCRYPT_SALT_ROUNDS=12

# Stripe (se usar)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_API_VERSION=2024-11-20.acacia

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# CORS
CLIENT_URL=https://your-frontend-domain.com
```

### Passo 3: Deploy

1. Clique em "Deploy"
2. Aguarde o build completar
3. Acesse a URL fornecida pela Vercel

## 🖥️ Deploy via CLI da Vercel

### Passo 1: Instalar CLI

```bash
npm install -g vercel
```

### Passo 2: Login

```bash
vercel login
```

### Passo 3: Configurar Projeto

```bash
# No diretório do projeto
vercel

# Siga as instruções:
# ? Set up and deploy "~/tuspacio"? [Y/n] y
# ? Which scope do you want to deploy to? [Use arrows to move, type to filter]
# ? Link to existing project? [y/N] n
# ? What's your project's name? tuspacio-api
# ? In which directory is your code located? ./
```

### Passo 4: Configurar Variáveis de Ambiente

```bash
# Database
vercel env add DATABASE_URL production
# Cole sua DATABASE_URL quando solicitado

# JWT
vercel env add JWT_SECRET production
# Cole seu JWT_SECRET quando solicitado

vercel env add SESSION_SECRET production
# Cole seu SESSION_SECRET quando solicitado

# Adicione outras variáveis conforme necessário
vercel env add NODE_ENV production
vercel env add BCRYPT_SALT_ROUNDS production
vercel env add RATE_LIMIT_MAX production
```

### Passo 5: Deploy para Produção

```bash
vercel --prod
```

## 🔍 Verificação do Deploy

### Teste os Endpoints

```bash
# Health check
curl https://your-app.vercel.app/health

# Ping
curl https://your-app.vercel.app/ping

# API test
curl https://your-app.vercel.app/api/health
```

### Verificar Logs

```bash
# Ver logs em tempo real
vercel logs --follow

# Ver logs específicos
vercel logs [deployment-url]
```

## ⚙️ Configurações Avançadas

### Custom Domain

```bash
# Adicionar domínio customizado
vercel domains add your-domain.com

# Configurar DNS
# Adicione um CNAME record apontando para cname.vercel-dns.com
```

### Configurar Aliases

```bash
# Criar alias para produção
vercel alias set your-deployment-url.vercel.app your-domain.com
```

### Configurar Redirects

Adicione no `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/docs",
      "destination": "/api/docs"
    }
  ]
}
```

## 🔒 Configurações de Segurança

### Headers de Segurança

O projeto já inclui configurações de segurança via Helmet.js:

- ✅ HSTS (HTTP Strict Transport Security)
- ✅ Content Security Policy
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Rate Limiting

### CORS

Configure os domínios permitidos no arquivo `src/app.js`:

```javascript
const allowedOrigins = [
  'https://your-frontend-domain.com',
  'https://your-admin-panel.com',
  // Adicione outros domínios conforme necessário
];
```

## 📊 Monitoramento

### Analytics da Vercel

1. Acesse o dashboard da Vercel
2. Vá na aba "Analytics"
3. Configure alertas para:
   - Tempo de resposta alto
   - Taxa de erro elevada
   - Uso de recursos

### Logs Customizados

O projeto inclui logging avançado. Para visualizar:

```bash
# Logs de aplicação
curl https://your-app.vercel.app/metrics

# Status de saúde detalhado
curl https://your-app.vercel.app/health
```

## 🐛 Troubleshooting

### Problemas Comuns

#### 1. Erro de Conexão com Database

```bash
# Verificar se a DATABASE_URL está correta
vercel env ls

# Testar conexão
curl https://your-app.vercel.app/health
```

#### 2. Timeout de Function

Se a função estiver dando timeout, aumente o `maxDuration` no `vercel.json`:

```json
{
  "functions": {
    "index.js": {
      "maxDuration": 60
    }
  }
}
```

#### 3. Problemas de CORS

Verifique se o domínio do frontend está na lista de `allowedOrigins` no `src/app.js`.

#### 4. Variáveis de Ambiente

```bash
# Listar todas as variáveis
vercel env ls

# Remover variável incorreta
vercel env rm VARIABLE_NAME production

# Adicionar variável correta
vercel env add VARIABLE_NAME production
```

### Logs de Debug

```bash
# Habilitar logs detalhados
vercel env add LOG_LEVEL debug production

# Redeploy para aplicar
vercel --prod
```

## 🔄 CI/CD Automático

### GitHub Actions (Opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📈 Otimizações de Performance

### 1. Caching

O projeto já inclui cache inteligente. Para configurar:

```bash
# Configurar TTL do cache
vercel env add CACHE_TTL 300000 production
```

### 2. Compressão

A Vercel automaticamente comprime responses. Para otimizar:

- Use JSON responses menores
- Implemente paginação
- Use campos específicos em queries

### 3. Database Connection Pooling

Configure connection pooling no PostgreSQL:

```javascript
// Já configurado no projeto
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Configure monitoramento
2. ✅ Configure backup do database
3. ✅ Configure domínio customizado
4. ✅ Configure SSL/TLS
5. ✅ Configure alertas
6. ✅ Documente APIs
7. ✅ Configure staging environment

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `vercel logs --follow`
2. Consulte a [documentação da Vercel](https://vercel.com/docs)
3. Verifique o status da Vercel: [status.vercel.com](https://status.vercel.com)

---

🎉 **Parabéns!** Sua API TuSpacio está agora rodando na Vercel com alta disponibilidade e performance otimizada!
