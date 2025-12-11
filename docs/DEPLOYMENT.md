# Deployment Guide

This guide provides step-by-step instructions for deploying the TuSpacio backend API to various cloud platforms.

## Prerequisites

Before deploying, ensure you have:

- Node.js 20.x LTS installed locally
- Git repository with your code
- Environment variables configured
- Database setup completed
- All tests passing locally

## Platform-Specific Deployment Guides

### 1. Vercel Deployment

Vercel is excellent for serverless deployment with automatic scaling.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Create vercel.json Configuration

Create a `vercel.json` file in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "index.js": {
      "maxDuration": 30
    }
  }
}
```

#### Step 4: Configure Environment Variables

Set up your environment variables in Vercel:

```bash
# Database
vercel env add DATABASE_URL
# Enter your PostgreSQL connection string

# Authentication
vercel env add JWT_SECRET
vercel env add SESSION_SECRET

# Stripe
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET

# Email
vercel env add EMAIL_HOST
vercel env add EMAIL_PORT
vercel env add EMAIL_USER
vercel env add EMAIL_PASS

# Other variables
vercel env add NODE_ENV production
```

#### Step 5: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Step 6: Set up Database

For Vercel, you'll need an external PostgreSQL database:

**Option A: Vercel Postgres**

```bash
vercel postgres create
```

**Option B: External Provider (Recommended)**

- Use Supabase, PlanetScale, or Neon
- Update `DATABASE_URL` environment variable

#### Step 7: Verify Deployment

```bash
curl https://your-app.vercel.app/health
```

### 2. Railway Deployment

Railway provides excellent PostgreSQL integration and simple deployment.

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

#### Step 2: Login and Initialize

```bash
railway login
railway init
```

#### Step 3: Add PostgreSQL Database

```bash
railway add postgresql
```

#### Step 4: Configure Environment Variables

```bash
# Railway automatically provides DATABASE_URL for PostgreSQL
# Add other required variables:

railway variables set JWT_SECRET=your-super-secure-jwt-secret
railway variables set SESSION_SECRET=your-super-secure-session-secret
railway variables set NODE_ENV=production
railway variables set STRIPE_SECRET_KEY=sk_live_your-stripe-key
railway variables set STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
railway variables set EMAIL_HOST=smtp.gmail.com
railway variables set EMAIL_PORT=587
railway variables set EMAIL_USER=your-email@gmail.com
railway variables set EMAIL_PASS=your-app-password
```

#### Step 5: Deploy

```bash
railway up
```

#### Step 6: Run Database Migrations

```bash
railway run npm run db:migrate
```

#### Step 7: Get Your Domain

```bash
railway domain
```

#### Step 8: Verify Deployment

```bash
curl https://your-app.up.railway.app/health
```

### 3. Heroku Deployment

Heroku is a traditional PaaS with excellent add-on ecosystem.

#### Step 1: Install Heroku CLI

Download and install from [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

#### Step 2: Login and Create App

```bash
heroku login
heroku create your-app-name
```

#### Step 3: Add PostgreSQL Add-on

```bash
# Free tier (limited)
heroku addons:create heroku-postgresql:mini

# Production tier
heroku addons:create heroku-postgresql:standard-0
```

#### Step 4: Configure Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secure-jwt-secret
heroku config:set SESSION_SECRET=your-super-secure-session-secret
heroku config:set STRIPE_SECRET_KEY=sk_live_your-stripe-key
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_PORT=587
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
```

#### Step 5: Create Procfile

Create a `Procfile` in your project root:

```
web: node index.js
```

#### Step 6: Deploy

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### Step 7: Run Database Migrations

```bash
heroku run npm run db:migrate
```

#### Step 8: Scale and Verify

```bash
heroku ps:scale web=1
heroku open
```

### 4. DigitalOcean App Platform

DigitalOcean App Platform offers managed deployment with database integration.

#### Step 1: Create App via Dashboard

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App"
3. Connect your GitHub repository
4. Select your repository and branch

#### Step 2: Configure Build Settings

```yaml
# .do/app.yaml
name: tuspacio-backend
services:
  - name: api
    source_dir: /
    github:
      repo: your-username/tuspacio-backend
      branch: main
      deploy_on_push: true
    run_command: npm start
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    env:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        value: your-jwt-secret
        type: SECRET
      - key: SESSION_SECRET
        value: your-session-secret
        type: SECRET

databases:
  - name: tuspacio-db
    engine: PG
    version: '13'
    size: db-s-1vcpu-1gb
```

#### Step 3: Add Database

1. In the App Platform dashboard
2. Go to "Database" tab
3. Add PostgreSQL database
4. Note the connection details

#### Step 4: Configure Environment Variables

Add these in the App Platform dashboard:

```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret
SESSION_SECRET=your-super-secure-session-secret
STRIPE_SECRET_KEY=sk_live_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Step 5: Deploy

The app will automatically deploy when you push to your connected branch.

### 5. AWS Elastic Beanstalk

AWS Elastic Beanstalk provides managed deployment with AWS integration.

#### Step 1: Install EB CLI

```bash
pip install awsebcli
```

#### Step 2: Initialize Elastic Beanstalk

```bash
eb init
# Select region, platform (Node.js), and application name
```

#### Step 3: Create Environment

```bash
eb create production
```

#### Step 4: Configure Environment Variables

```bash
eb setenv NODE_ENV=production
eb setenv JWT_SECRET=your-super-secure-jwt-secret
eb setenv SESSION_SECRET=your-super-secure-session-secret
eb setenv DATABASE_URL=your-rds-connection-string
eb setenv STRIPE_SECRET_KEY=sk_live_your-stripe-key
eb setenv STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

#### Step 5: Set up RDS Database

1. Go to AWS RDS Console
2. Create PostgreSQL instance
3. Configure security groups
4. Update DATABASE_URL environment variable

#### Step 6: Deploy

```bash
eb deploy
```

#### Step 7: Configure Health Checks

Create `.ebextensions/health-check.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:application:
    Application Healthcheck URL: /health
  aws:elasticbeanstalk:healthreporting:system:
    SystemType: enhanced
```

### 6. Google Cloud Platform (Cloud Run)

Google Cloud Run provides serverless container deployment.

#### Step 1: Install Google Cloud SDK

Follow the [installation guide](https://cloud.google.com/sdk/docs/install)

#### Step 2: Create Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
```

#### Step 3: Build and Deploy

```bash
# Set project
gcloud config set project your-project-id

# Build and deploy
gcloud run deploy tuspacio-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Step 4: Set Environment Variables

```bash
gcloud run services update tuspacio-backend \
  --set-env-vars NODE_ENV=production,JWT_SECRET=your-secret \
  --region us-central1
```

#### Step 5: Set up Cloud SQL

```bash
# Create PostgreSQL instance
gcloud sql instances create tuspacio-db \
  --database-version=POSTGRES_13 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create tuspacio \
  --instance=tuspacio-db
```

### 7. Docker Deployment

For self-hosted or custom deployment scenarios.

#### Step 1: Create Dockerfile

```dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Bundle app source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD [ "node", "index.js" ]
```

#### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3001:3001'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/tuspacio_db
      - JWT_SECRET=your-super-secure-jwt-secret
      - SESSION_SECRET=your-super-secure-session-secret
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:17-alpine
    environment:
      - POSTGRES_DB=tuspacio_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Step 3: Create nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3001;
    }

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### Step 4: Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Scale app
docker-compose up -d --scale app=3
```

## Post-Deployment Checklist

After deploying to any platform:

### 1. Verify Health Endpoints

```bash
curl https://your-domain.com/health
curl https://your-domain.com/ping
```

### 2. Test API Endpoints

```bash
# Test authentication
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test products endpoint
curl https://your-domain.com/api/products
```

### 3. Run Database Migrations

```bash
# Platform-specific migration commands
npm run db:migrate
```

### 4. Configure Monitoring

Set up monitoring for:

- Application health
- Database performance
- Error rates
- Response times

### 5. Set up SSL/TLS

Ensure HTTPS is properly configured:

- Use platform-provided SSL (Vercel, Railway)
- Configure Let's Encrypt for self-hosted
- Update CORS settings for HTTPS

### 6. Configure Domain

- Set up custom domain
- Configure DNS records
- Update environment variables with production URLs

### 7. Performance Testing

```bash
# Load test the deployment
curl -X POST https://your-domain.com/load-test \
  -H "Content-Type: application/json" \
  -d '{"concurrency":10,"totalRequests":100}'
```

## Environment-Specific Configurations

### Development

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tuspacio_db
JWT_SECRET=dev-jwt-secret
RATE_LIMIT_MAX=1000
LOG_LEVEL=debug
```

### Staging

```env
NODE_ENV=staging
PORT=3001
DATABASE_URL=postgresql://user:pass@staging-db:5432/tuspacio_staging
JWT_SECRET=staging-jwt-secret
RATE_LIMIT_MAX=500
LOG_LEVEL=info
```

### Production

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@prod-db:5432/tuspacio_prod
JWT_SECRET=super-secure-production-jwt-secret
RATE_LIMIT_MAX=100
LOG_LEVEL=warn
```

## Troubleshooting Common Issues

### Database Connection Issues

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check connection pooling
curl https://your-domain.com/health | jq '.database'
```

### Memory Issues

```bash
# Check memory usage
curl https://your-domain.com/metrics | jq '.memory'

# Optimize Node.js memory
export NODE_OPTIONS="--max-old-space-size=512"
```

### SSL/HTTPS Issues

```bash
# Test SSL certificate
openssl s_client -connect your-domain.com:443

# Check security headers
curl -I https://your-domain.com
```

### Performance Issues

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/api/products

# Monitor database queries
# Enable query logging in PostgreSQL
```

## Scaling Considerations

### Horizontal Scaling

- Use load balancers
- Implement session storage (Redis)
- Database read replicas
- CDN for static assets

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Implement caching
- Use connection pooling

### Auto-scaling

Most platforms support auto-scaling:

**Vercel**: Automatic serverless scaling
**Railway**: Configure auto-scaling rules
**Heroku**: Use dyno auto-scaling
**AWS**: Configure Auto Scaling Groups
**GCP**: Cloud Run auto-scaling

## Security Considerations

### Production Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured (Helmet)
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure session configuration
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API keys rotated regularly
- [ ] Monitoring and alerting configured

### Security Headers

Ensure these headers are set:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

## Monitoring and Logging

### Application Monitoring

Set up monitoring for:

- Response times
- Error rates
- Database performance
- Memory usage
- CPU usage

### Log Management

Configure centralized logging:

- Use structured logging (JSON)
- Set appropriate log levels
- Implement log rotation
- Monitor error logs

### Alerting

Set up alerts for:

- High error rates
- Slow response times
- Database connection issues
- Memory/CPU spikes
- Security events

---

This deployment guide covers the most common platforms and scenarios. Choose the platform that best fits your needs, budget, and technical requirements.
