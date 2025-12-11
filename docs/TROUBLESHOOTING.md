# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the TuSpacio backend API.

## Quick Diagnostics

### Health Check

First, check if the application is running:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "HEALTHY",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "connected",
    "responseTime": 5
  },
  "memory": {
    "used": "45.2 MB",
    "total": "128 MB"
  }
}
```

### Check Logs

```bash
# Application logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log

# Real-time logs (development)
npm run dev
```

## Common Issues and Solutions

### 1. Application Won't Start

#### Issue: Port Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solutions:**

```bash
# Find process using port 3001
lsof -i :3001
# or on Windows
netstat -ano | findstr :3001

# Kill the process
kill -9 <PID>
# or on Windows
taskkill /PID <PID> /F

# Use different port
PORT=3002 npm start
```

#### Issue: Missing Environment Variables

**Error:**

```
Error: JWT_SECRET is required
```

**Solutions:**

1. Check if `.env` file exists:

```bash
ls -la .env
```

2. Verify environment variables:

```bash
# Check specific variable
echo $JWT_SECRET

# Check all environment variables
printenv | grep -E "(JWT|DATABASE|STRIPE)"
```

3. Create missing `.env` file:

```bash
cp .env.example .env
# Edit .env with your values
```

#### Issue: Node.js Version Mismatch

**Error:**

```
Error: The engine "node" is incompatible with this module
```

**Solutions:**

```bash
# Check current Node.js version
node --version

# Install Node.js 20.x LTS
# Using nvm (recommended)
nvm install 20
nvm use 20

# Using package manager
# macOS with Homebrew
brew install node@20

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Database Connection Issues

#### Issue: Database Connection Failed

**Error:**

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

1. **Check if PostgreSQL is running:**

```bash
# Check PostgreSQL status
sudo systemctl status postgresql
# or
brew services list | grep postgresql

# Start PostgreSQL
sudo systemctl start postgresql
# or
brew services start postgresql
```

2. **Using Docker:**

```bash
# Check if container is running
docker ps | grep postgres

# Start PostgreSQL container
docker-compose up -d postgres

# Check container logs
docker-compose logs postgres
```

3. **Verify connection string:**

```bash
# Test connection manually
psql "postgresql://postgres:postgres@localhost:5432/tuspacio_db"

# Check if database exists
psql -U postgres -l | grep tuspacio
```

#### Issue: Authentication Failed for User

**Error:**

```
Error: password authentication failed for user "postgres"
```

**Solutions:**

1. **Reset PostgreSQL password:**

```bash
# Connect as superuser
sudo -u postgres psql

# Change password
ALTER USER postgres PASSWORD 'newpassword';
```

2. **Check pg_hba.conf configuration:**

```bash
# Find pg_hba.conf location
sudo -u postgres psql -c "SHOW hba_file;"

# Edit configuration (change 'peer' to 'md5')
sudo nano /etc/postgresql/13/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql
```

3. **Update environment variables:**

```env
DATABASE_URL=postgresql://postgres:newpassword@localhost:5432/tuspacio_db
```

#### Issue: Database Does Not Exist

**Error:**

```
Error: database "tuspacio_db" does not exist
```

**Solutions:**

```bash
# Create database
createdb -U postgres tuspacio_db

# Or using psql
psql -U postgres -c "CREATE DATABASE tuspacio_db;"

# Run migrations
npm run db:migrate
```

### 3. Authentication Issues

#### Issue: JWT Token Invalid

**Error:**

```
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid token"
  }
}
```

**Solutions:**

1. **Check JWT secret:**

```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Generate new secret if needed
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **Check token format:**

```bash
# Token should be in format: Bearer <token>
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3001/api/users
```

3. **Verify token expiration:**

```javascript
// Decode JWT to check expiration
const jwt = require('jsonwebtoken');
const decoded = jwt.decode('your-token-here');
console.log('Expires:', new Date(decoded.exp * 1000));
```

#### Issue: Session Expired

**Error:**

```
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Session expired"
  }
}
```

**Solutions:**

1. **Login again:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

2. **Use refresh token:**

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'
```

### 4. Payment Integration Issues

#### Issue: Stripe Webhook Verification Failed

**Error:**

```
Error: Invalid signature
```

**Solutions:**

1. **Check webhook secret:**

```bash
# Verify STRIPE_WEBHOOK_SECRET is set
echo $STRIPE_WEBHOOK_SECRET
```

2. **Test webhook locally:**

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3001/api/payments/webhook

# Test webhook
stripe trigger payment_intent.succeeded
```

3. **Verify webhook endpoint:**

```bash
# Check if endpoint is accessible
curl -X POST http://localhost:3001/api/payments/webhook \
  -H "stripe-signature: test" \
  -d '{}'
```

#### Issue: Payment Intent Creation Failed

**Error:**

```
Error: No such customer: cus_xxxxx
```

**Solutions:**

1. **Check Stripe API keys:**

```bash
# Verify keys are for correct environment
echo $STRIPE_SECRET_KEY | head -c 8
# Should be sk_test_ for test or sk_live_ for live
```

2. **Test Stripe connection:**

```bash
curl https://api.stripe.com/v1/customers \
  -u sk_test_your_key:
```

### 5. Email Service Issues

#### Issue: Email Sending Failed

**Error:**

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solutions:**

1. **Check email credentials:**

```bash
# Verify email environment variables
echo $EMAIL_USER
echo $EMAIL_HOST
echo $EMAIL_PORT
```

2. **For Gmail, use App Password:**

```bash
# Generate App Password in Google Account settings
# Use App Password instead of regular password
EMAIL_PASS=your-16-character-app-password
```

3. **Test SMTP connection:**

```bash
# Test SMTP manually
telnet smtp.gmail.com 587
```

4. **Check firewall/network:**

```bash
# Test port connectivity
nc -zv smtp.gmail.com 587
```

### 6. Performance Issues

#### Issue: Slow Response Times

**Symptoms:**

- API responses taking > 5 seconds
- Database queries timing out
- High memory usage

**Solutions:**

1. **Check database performance:**

```bash
# Monitor database queries
curl http://localhost:3001/metrics | jq '.database'

# Check slow queries in PostgreSQL
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

2. **Optimize database connections:**

```javascript
// In db.js, optimize connection pool
const sequelize = new Sequelize(DATABASE_URL, {
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});
```

3. **Enable caching:**

```bash
# Check cache statistics
curl http://localhost:3001/cache/stats
```

4. **Monitor memory usage:**

```bash
# Check memory metrics
curl http://localhost:3001/metrics | jq '.memory'

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=2048"
```

#### Issue: High CPU Usage

**Solutions:**

1. **Profile the application:**

```bash
# Use Node.js profiler
node --prof index.js

# Generate profile report
node --prof-process isolate-*.log > profile.txt
```

2. **Check for infinite loops:**

```bash
# Monitor CPU usage
top -p $(pgrep node)

# Check event loop lag
curl http://localhost:3001/metrics | jq '.eventLoop'
```

### 7. Deployment Issues

#### Issue: Build Failures

**Error:**

```
npm ERR! Failed at the tuspacio@1.0.0 build script
```

**Solutions:**

1. **Check Node.js version:**

```bash
# Ensure Node.js 20.x is used
node --version

# Update package.json engines
"engines": {
  "node": ">=20.0.0",
  "npm": ">=10.0.0"
}
```

2. **Clear npm cache:**

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

3. **Check dependencies:**

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix
```

#### Issue: Environment Variables Not Set

**Error:**

```
Error: Cannot read property 'JWT_SECRET' of undefined
```

**Solutions:**

1. **Platform-specific variable setting:**

**Vercel:**

```bash
vercel env add JWT_SECRET
```

**Railway:**

```bash
railway variables set JWT_SECRET=your-secret
```

**Heroku:**

```bash
heroku config:set JWT_SECRET=your-secret
```

2. **Check variable names:**

```bash
# List all environment variables
env | sort

# Check specific platform
heroku config
railway variables
vercel env ls
```

### 8. Testing Issues

#### Issue: Tests Failing

**Error:**

```
Error: timeout of 2000ms exceeded
```

**Solutions:**

1. **Increase test timeout:**

```javascript
// In test files
describe('API Tests', function () {
  this.timeout(10000); // 10 seconds

  it('should respond', async function () {
    // test code
  });
});
```

2. **Check test database:**

```bash
# Use separate test database
NODE_ENV=test DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tuspacio_test npm test
```

3. **Mock external services:**

```javascript
// Mock Stripe in tests
const sinon = require('sinon');
sinon.stub(stripe.paymentIntents, 'create').resolves({
  id: 'pi_test_123',
  client_secret: 'pi_test_123_secret',
});
```

#### Issue: Property Tests Failing

**Error:**

```
Property failed after 1 tests
```

**Solutions:**

1. **Check test generators:**

```javascript
// Ensure generators produce valid data
fc.assert(
  fc.property(
    fc.string({ minLength: 1, maxLength: 100 }), // Valid string length
    fc.emailAddress(), // Valid email format
    (name, email) => {
      // test logic
    }
  )
);
```

2. **Add preconditions:**

```javascript
fc.assert(
  fc.property(fc.integer({ min: 1, max: 1000 }), price => {
    fc.pre(price > 0); // Precondition
    // test logic
  })
);
```

### 9. Security Issues

#### Issue: CORS Errors

**Error:**

```
Access to fetch at 'http://localhost:3001/api/products' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions:**

1. **Update CORS configuration:**

```javascript
// In app.js
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-frontend-domain.com',
  ],
  credentials: true,
};
```

2. **Check preflight requests:**

```bash
# Test OPTIONS request
curl -X OPTIONS http://localhost:3001/api/products \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"
```

#### Issue: Rate Limiting Triggered

**Error:**

```
{
  "error": "Too many requests from this IP, please try again later."
}
```

**Solutions:**

1. **Check rate limit configuration:**

```javascript
// Adjust rate limits for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
});
```

2. **Reset rate limit:**

```bash
# Clear cache to reset rate limits
curl -X DELETE http://localhost:3001/cache
```

### 10. Monitoring and Debugging

#### Enable Debug Logging

```bash
# Set debug log level
LOG_LEVEL=debug npm start

# Enable specific debug modules
DEBUG=express:* npm start
```

#### Use Application Monitoring

```bash
# Check application metrics
curl http://localhost:3001/metrics | jq '.'

# Monitor in real-time
watch -n 5 'curl -s http://localhost:3001/health | jq .'
```

#### Database Query Monitoring

```sql
-- Enable query logging in PostgreSQL
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;
```

## Getting Help

### Before Asking for Help

1. **Check this troubleshooting guide**
2. **Review application logs**
3. **Test with minimal configuration**
4. **Verify environment setup**
5. **Check recent changes**

### Information to Include

When reporting issues, include:

- **Error message** (full stack trace)
- **Environment details** (OS, Node.js version, platform)
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Configuration** (sanitized, no secrets)
- **Logs** (relevant portions)

### Useful Commands for Debugging

```bash
# System information
node --version
npm --version
psql --version

# Application status
curl http://localhost:3001/health
curl http://localhost:3001/metrics

# Database status
psql $DATABASE_URL -c "SELECT version();"

# Network connectivity
nc -zv localhost 3001
nc -zv localhost 5432

# Process information
ps aux | grep node
lsof -i :3001

# Memory and CPU
top -p $(pgrep node)
free -h
df -h
```

### Log Analysis

```bash
# Search for errors
grep -i error logs/app.log

# Count error types
grep -i error logs/app.log | cut -d' ' -f4- | sort | uniq -c

# Monitor logs in real-time
tail -f logs/app.log | grep -i error

# Analyze response times
grep "response time" logs/app.log | awk '{print $NF}' | sort -n
```

## Prevention

### Best Practices

1. **Use health checks** in production
2. **Monitor key metrics** (response time, error rate)
3. **Set up alerts** for critical issues
4. **Regular backups** of database
5. **Keep dependencies updated**
6. **Use staging environment** for testing
7. **Document configuration changes**
8. **Regular security audits**

### Monitoring Setup

```javascript
// Add custom monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});
```

---

This troubleshooting guide covers the most common issues. For additional help, check the API documentation or contact support.
