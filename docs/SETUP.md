# Developer Setup Guide

This guide will help new developers set up the TuSpacio backend API development environment from scratch.

## Prerequisites

Before starting, ensure you have the following installed on your system:

### Required Software

1. **Node.js 20.x LTS**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` (should be 20.x.x)

2. **npm 10.x or higher**
   - Comes with Node.js
   - Verify installation: `npm --version` (should be 10.x.x)

3. **PostgreSQL 17 or higher**
   - **Option A**: Install locally from [postgresql.org](https://www.postgresql.org/download/)
   - **Option B**: Use Docker (recommended for development)

4. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

### Optional but Recommended

1. **Docker & Docker Compose**
   - Download from [docker.com](https://www.docker.com/get-started)
   - For easy database setup

2. **Visual Studio Code**
   - Download from [code.visualstudio.com](https://code.visualstudio.com/)
   - Recommended extensions listed below

3. **Postman or Insomnia**
   - For API testing
   - [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd tuspacio-backend

# Check if you're on the correct branch
git branch
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

If you encounter permission errors on macOS/Linux:

```bash
# Fix npm permissions (if needed)
sudo chown -R $(whoami) ~/.npm
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your preferred editor
nano .env
# or
code .env
```

**Required Environment Variables:**

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration (choose one method)
# Method 1: Full connection string (recommended)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tuspacio_db

# Method 2: Individual components
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=tuspacio_db
# DB_USER=postgres
# DB_PASSWORD=postgres

# Authentication & Security
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
SESSION_SECRET=your-super-secure-session-secret-key-minimum-32-characters
BCRYPT_ROUNDS=12

# Auth0 Configuration (Optional - for OAuth)
ENABLE_AUTH0=false
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3001
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@tuspacio.com

# Development Settings
LOG_LEVEL=debug
ENABLE_PERFORMANCE_MONITORING=true
CACHE_TTL=300000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=1000
ENABLE_LOAD_TESTING=true
```

**Generate Secure Secrets:**

```bash
# Generate JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Set Up Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Verify container is running
docker ps | grep postgres

# Check logs if needed
docker-compose logs postgres
```

#### Option B: Local PostgreSQL Installation

1. **Install PostgreSQL:**

   **macOS (using Homebrew):**

   ```bash
   brew install postgresql@17
   brew services start postgresql@17
   ```

   **Ubuntu/Debian:**

   ```bash
   sudo apt update
   sudo apt install postgresql-17 postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

   **Windows:**
   - Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Follow installation wizard

2. **Create Database:**

   ```bash
   # Connect to PostgreSQL
   sudo -u postgres psql
   # or on Windows/macOS
   psql -U postgres

   # Create database and user
   CREATE DATABASE tuspacio_db;
   CREATE USER tuspacio_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE tuspacio_db TO tuspacio_user;
   \q
   ```

3. **Update .env file:**
   ```env
   DATABASE_URL=postgresql://tuspacio_user:secure_password@localhost:5432/tuspacio_db
   ```

### 5. Initialize Database

```bash
# Run database migrations (if available)
npm run db:migrate

# Seed database with sample data (if available)
npm run db:seed

# Verify database connection
npm run db:test
```

If migration scripts don't exist yet, you can test the connection:

```bash
# Test database connection
node -e "
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
sequelize.authenticate()
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection failed:', err));
"
```

### 6. Start the Development Server

```bash
# Start in development mode with auto-reload
npm run dev

# Or start normally
npm start
```

You should see output similar to:

```
🚀 Server running on http://localhost:3001
✅ Database connected successfully
📊 Performance monitoring enabled
🔒 Security middleware loaded
```

### 7. Verify Installation

#### Test Health Endpoint

```bash
# Test health check
curl http://localhost:3001/health

# Expected response:
{
  "status": "HEALTHY",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 10,
  "database": {
    "status": "connected",
    "responseTime": 5
  }
}
```

#### Test API Endpoints

```bash
# Test products endpoint
curl http://localhost:3001/api/products

# Test with pretty formatting
curl http://localhost:3001/api/products | jq '.'
```

### 8. Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run property-based tests
npm run test:property

# Run tests in watch mode (for development)
npm run test:watch
```

Expected output:

```
✅ All tests passing
📊 Coverage: 85% statements, 80% branches, 90% functions, 85% lines
```

## Development Tools Setup

### Visual Studio Code Extensions

Install these recommended extensions:

```bash
# Install VS Code extensions via command line
code --install-extension ms-vscode.vscode-json
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension humao.rest-client
code --install-extension ms-vscode.vscode-docker
```

**Manual Installation:**

1. **ESLint** - Real-time linting
2. **Prettier** - Code formatting
3. **REST Client** - Test API endpoints in VS Code
4. **Docker** - Docker support
5. **GitLens** - Enhanced Git capabilities
6. **Thunder Client** - API testing (alternative to Postman)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/coverage": true,
    "**/.nyc_output": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/coverage": true,
    "**/.nyc_output": true
  }
}
```

### Git Configuration

```bash
# Set up Git (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set up Git hooks (optional)
npm run prepare
```

## External Services Setup

### Stripe (Payment Processing)

1. **Create Stripe Account:**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for a free account

2. **Get API Keys:**
   - Go to Dashboard → Developers → API keys
   - Copy "Publishable key" and "Secret key" (test mode)

3. **Set up Webhooks:**

   ```bash
   # Install Stripe CLI
   # macOS
   brew install stripe/stripe-cli/stripe

   # Login to Stripe
   stripe login

   # Forward webhooks to local server
   stripe listen --forward-to localhost:3001/api/payments/webhook
   ```

4. **Update .env:**
   ```env
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

### Email Service (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

3. **Update .env:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

### Auth0 (Optional OAuth)

1. **Create Auth0 Account:**
   - Go to [auth0.com](https://auth0.com)
   - Sign up for free account

2. **Create Application:**
   - Dashboard → Applications → Create Application
   - Choose "Regular Web Applications"

3. **Configure Settings:**
   - Allowed Callback URLs: `http://localhost:3001/auth/callback`
   - Allowed Logout URLs: `http://localhost:3001`

4. **Update .env:**
   ```env
   ENABLE_AUTH0=true
   AUTH0_SECRET=your-auth0-secret
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
   AUTH0_CLIENT_SECRET=your-client-secret
   ```

## Development Workflow

### Daily Development

1. **Start Development Environment:**

   ```bash
   # Start database (if using Docker)
   docker-compose up -d postgres

   # Start development server
   npm run dev
   ```

2. **Make Changes:**
   - Edit code in your preferred editor
   - Server automatically restarts on changes (nodemon)

3. **Test Changes:**

   ```bash
   # Run tests
   npm test

   # Check code quality
   npm run lint
   npm run format:check
   ```

4. **Commit Changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature-branch
   ```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Run all quality checks
npm run quality
```

### Database Operations

```bash
# Create migration (if using migrations)
npm run db:migration:create -- --name add-new-table

# Run migrations
npm run db:migrate

# Rollback last migration
npm run db:rollback

# Reset database (development only)
npm run db:reset

# Seed database
npm run db:seed
```

## Troubleshooting Setup Issues

### Common Issues

1. **Port 3001 already in use:**

   ```bash
   # Find and kill process
   lsof -i :3001
   kill -9 <PID>

   # Or use different port
   PORT=3002 npm run dev
   ```

2. **Database connection failed:**

   ```bash
   # Check if PostgreSQL is running
   docker ps | grep postgres
   # or
   sudo systemctl status postgresql

   # Test connection manually
   psql $DATABASE_URL
   ```

3. **Permission errors:**

   ```bash
   # Fix npm permissions (macOS/Linux)
   sudo chown -R $(whoami) ~/.npm

   # Fix file permissions
   chmod +x scripts/*.sh
   ```

4. **Module not found errors:**
   ```bash
   # Clear npm cache and reinstall
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

### Getting Help

1. **Check logs:**

   ```bash
   # Application logs
   tail -f logs/app.log

   # Error logs
   tail -f logs/error.log
   ```

2. **Enable debug mode:**

   ```bash
   DEBUG=* npm run dev
   ```

3. **Test individual components:**

   ```bash
   # Test database connection
   npm run db:test

   # Test email service
   npm run test:email

   # Test Stripe integration
   npm run test:stripe
   ```

## Next Steps

After completing the setup:

1. **Explore the codebase:**
   - Read the [API Documentation](./API.md)
   - Review the code structure
   - Understand the data models

2. **Make your first contribution:**
   - Pick a small issue or feature
   - Create a feature branch
   - Make changes and add tests
   - Submit a pull request

3. **Learn the development process:**
   - Review the [Contributing Guide](../CONTRIBUTING.md)
   - Understand the testing strategy
   - Learn about deployment process

## Useful Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Sequelize Documentation](https://sequelize.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe API Reference](https://stripe.com/docs/api)
- [JWT.io](https://jwt.io/) - JWT token debugger

---

Welcome to the TuSpacio development team! If you encounter any issues during setup, don't hesitate to ask for help.
