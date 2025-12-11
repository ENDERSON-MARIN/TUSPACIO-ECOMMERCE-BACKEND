# TuSpacio E-commerce Backend API

A modern, secure, and scalable e-commerce backend API built with Node.js, Express, and PostgreSQL. This system has been modernized to use the latest stable versions of all technologies while maintaining backward compatibility.

## 🚀 Features

- **Modern Technology Stack**: Updated to latest stable versions
- **Secure Authentication**: JWT-based authentication with Auth0 integration
- **Payment Processing**: Stripe integration for secure payments
- **Email Services**: Nodemailer for transactional emails
- **Performance Monitoring**: Built-in health checks and metrics
- **Comprehensive Testing**: Unit tests and property-based testing
- **Security First**: Helmet, rate limiting, and CORS protection
- **Database ORM**: Sequelize with PostgreSQL
- **API Documentation**: Comprehensive REST API documentation

## 📋 Technology Stack

### Core Technologies

- **Node.js**: 20.x LTS (Latest stable)
- **Express.js**: 4.21.2+ (Modern web framework)
- **PostgreSQL**: 17+ (Latest stable database)
- **Sequelize**: 6.37.5+ (Modern ORM)

### Security & Authentication

- **Helmet**: 8.0.0+ (Security headers)
- **express-rate-limit**: 7.4.1+ (Rate limiting)
- **bcrypt**: 5.1.1+ (Password hashing)
- **jsonwebtoken**: 9.0.3+ (JWT tokens)
- **express-openid-connect**: 2.19.3+ (Auth0 integration)

### Payment & Communication

- **Stripe**: 17.3.1+ (Payment processing)
- **Nodemailer**: 7.0.11+ (Email services)

### Development & Testing

- **Mocha**: 10.8.2+ (Testing framework)
- **Chai**: 4.5.0+ (Assertion library)
- **Supertest**: 7.0.0+ (HTTP testing)
- **fast-check**: 3.23.1+ (Property-based testing)
- **ESLint**: 8.57.1+ (Code linting)
- **Prettier**: 3.4.2+ (Code formatting)
- **nodemon**: 3.1.9+ (Development server)

### Utilities & Middleware

- **Joi**: 17.13.3+ (Request validation)
- **CORS**: 2.8.5+ (Cross-origin requests)
- **Morgan**: 1.10.0+ (HTTP logging)
- **dotenv**: 16.4.7+ (Environment variables)

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 20.x LTS or higher
- npm 10.0.0 or higher
- PostgreSQL 17 or higher
- Docker (optional, for containerized database)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tuspacio-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL database**

   **Option A: Using Docker (Recommended)**

   ```bash
   docker-compose up -d postgres
   ```

   **Option B: Local PostgreSQL**
   - Install PostgreSQL 17+
   - Create database: `tuspacio_db`
   - Update connection settings in `.env`

5. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

### Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/tuspacio_db
# OR individual database settings:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tuspacio_db
DB_USER=postgres
DB_PASSWORD=postgres

# Authentication & Security
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
SESSION_SECRET=your-super-secure-session-secret-key-minimum-32-characters
BCRYPT_ROUNDS=12

# Auth0 Configuration (Optional)
ENABLE_AUTH0=false
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=http://localhost:3001
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@tuspacio.com

# Performance & Monitoring
ENABLE_PERFORMANCE_MONITORING=true
CACHE_TTL=300000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Development Tools
LOG_LEVEL=info
ENABLE_LOAD_TESTING=true
```

## 🚀 Deployment

### Vercel Deployment

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Configure vercel.json**

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
     }
   }
   ```

3. **Deploy**

   ```bash
   vercel --prod
   ```

4. **Set environment variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   # Add all required environment variables
   ```

### Railway Deployment

1. **Install Railway CLI**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize**

   ```bash
   railway login
   railway init
   ```

3. **Add PostgreSQL service**

   ```bash
   railway add postgresql
   ```

4. **Deploy**

   ```bash
   railway up
   ```

5. **Set environment variables**
   ```bash
   railway variables set JWT_SECRET=your-secret
   # Set all required variables
   ```

### Heroku Deployment

1. **Install Heroku CLI**

   ```bash
   # Follow Heroku CLI installation guide
   ```

2. **Create Heroku app**

   ```bash
   heroku create your-app-name
   ```

3. **Add PostgreSQL addon**

   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set environment variables**

   ```bash
   heroku config:set JWT_SECRET=your-secret
   heroku config:set NODE_ENV=production
   # Set all required variables
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

### Docker Deployment

1. **Build Docker image**

   ```bash
   docker build -t tuspacio-backend .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 📚 Documentation

### Complete Documentation

For comprehensive documentation, see the **[docs/](./docs/)** directory:

- **[Setup Guide](./docs/SETUP.md)** - Complete setup instructions for new developers
- **[API Documentation](./docs/API.md)** - Full API reference with examples
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Step-by-step deployment for all platforms
- **[Troubleshooting Guide](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Documentation Index](./docs/README.md)** - Complete documentation overview

### Quick API Reference

#### Base URL

- Development: `http://localhost:3001/api`
- Production: `https://your-domain.com/api`

### Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

#### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

#### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

#### Orders

- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status (Admin only)

#### Reviews

- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

#### Payments

- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/status/:paymentId` - Get payment status

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run property-based tests
npm run test:property

# Run tests in watch mode
npm run test:watch
```

### Test Structure

- **Unit Tests**: `tests/unit/` - Test individual functions and modules
- **Integration Tests**: `tests/integration/` - Test API endpoints
- **Property Tests**: `tests/property-tests/` - Property-based testing

### Writing Tests

Example unit test:

```javascript
const { expect } = require('chai');
const { validateEmail } = require('../src/utils/validation');

describe('Email Validation', () => {
  it('should validate correct email format', () => {
    expect(validateEmail('user@example.com')).to.be.true;
  });

  it('should reject invalid email format', () => {
    expect(validateEmail('invalid-email')).to.be.false;
  });
});
```

Example property test:

```javascript
const fc = require('fast-check');
const { expect } = require('chai');

describe('Property: User Creation', () => {
  it('should always create valid user objects', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.emailAddress(),
        (name, email) => {
          const user = createUser({ name, email });
          expect(user).to.have.property('id');
          expect(user.name).to.equal(name);
          expect(user.email).to.equal(email);
        }
      )
    );
  });
});
```

## 🔧 Development

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
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
# Run migrations
npm run db:migrate

# Rollback migrations
npm run db:rollback

# Seed database
npm run db:seed

# Reset database
npm run db:reset
```

### Performance Monitoring

The application includes built-in performance monitoring:

- **Health Check**: `GET /health` - Comprehensive health status
- **Metrics**: `GET /metrics` - Performance metrics
- **Cache Stats**: `GET /cache/stats` - Cache statistics

### Load Testing

In development mode, you can run load tests:

```bash
curl -X POST http://localhost:3001/load-test \
  -H "Content-Type: application/json" \
  -d '{
    "concurrency": 10,
    "totalRequests": 100,
    "path": "/api/products"
  }'
```

## 🔒 Security

### Security Features

- **Helmet**: Security headers protection
- **Rate Limiting**: Prevents brute force attacks
- **CORS**: Controlled cross-origin requests
- **Input Validation**: Joi schema validation
- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Secure token management
- **Session Security**: Secure session configuration

### Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS**: Always use HTTPS in production
3. **Database Security**: Use connection pooling and SSL
4. **Input Validation**: Validate all user inputs
5. **Error Handling**: Don't expose sensitive information in errors
6. **Logging**: Log security events for monitoring

## 📊 Monitoring & Logging

### Log Levels

- `error` - Error conditions
- `warn` - Warning conditions
- `info` - Informational messages
- `debug` - Debug-level messages

### Log Files

- `logs/app.log` - Application logs
- `logs/error.log` - Error logs

### Monitoring Endpoints

- `/health` - Application health status
- `/metrics` - Performance metrics
- `/ping` - Simple health check

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run quality checks: `npm run quality`
6. Commit changes: `git commit -m 'Add new feature'`
7. Push to branch: `git push origin feature/new-feature`
8. Submit a pull request

### Code Style

- Use ESLint configuration
- Format code with Prettier
- Follow conventional commit messages
- Write tests for new features
- Update documentation

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

1. Check the [Troubleshooting Guide](#troubleshooting)
2. Review the [API Documentation](#api-documentation)
3. Create an issue in the repository
4. Contact the development team

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Node.js**: 20.x LTS  
**Database**: PostgreSQL 17+
