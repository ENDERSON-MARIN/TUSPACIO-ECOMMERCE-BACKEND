# TuSpacio Backend API Documentation

Welcome to the comprehensive documentation for the TuSpacio e-commerce backend API. This documentation covers everything you need to know about setting up, developing, deploying, and maintaining the API.

## 📚 Documentation Overview

### Getting Started

- **[Setup Guide](./SETUP.md)** - Complete setup instructions for new developers
- **[API Documentation](./API.md)** - Comprehensive API reference and examples
- **[Main README](../README.md)** - Project overview and quick start guide

### Deployment & Operations

- **[Deployment Guide](./DEPLOYMENT.md)** - Step-by-step deployment instructions for all platforms
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[Changelog](../CHANGELOG.md)** - Version history and release notes

## 🚀 Quick Navigation

### For New Developers

1. Start with the **[Setup Guide](./SETUP.md)** to get your development environment ready
2. Review the **[API Documentation](./API.md)** to understand the endpoints
3. Check the **[Main README](../README.md)** for project overview and architecture

### For DevOps/Deployment

1. Follow the **[Deployment Guide](./DEPLOYMENT.md)** for your target platform
2. Use the **[Troubleshooting Guide](./TROUBLESHOOTING.md)** for common deployment issues
3. Review the **[Changelog](../CHANGELOG.md)** for version-specific requirements

### For API Consumers

1. Read the **[API Documentation](./API.md)** for endpoint details
2. Check authentication requirements and response formats
3. Review rate limiting and error handling information

## 📖 Documentation Structure

```
docs/
├── README.md              # This file - documentation index
├── SETUP.md              # Developer setup guide
├── API.md                # Complete API reference
├── DEPLOYMENT.md         # Deployment instructions
└── TROUBLESHOOTING.md    # Common issues and solutions

Root files:
├── README.md             # Project overview and quick start
├── CHANGELOG.md          # Version history and changes
└── CONTRIBUTING.md       # Contribution guidelines (if exists)
```

## 🔧 Technology Stack

### Core Technologies

- **Node.js 20.x LTS** - Runtime environment
- **Express.js 4.21.2+** - Web framework
- **PostgreSQL 17+** - Database
- **Sequelize 6.37.5+** - ORM

### Security & Authentication

- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

### External Services

- **Stripe 17.3.1+** - Payment processing
- **Nodemailer 7.0.11+** - Email services
- **Auth0** - OAuth integration (optional)

### Development & Testing

- **Mocha 10.8.2+** - Testing framework
- **Chai 4.5.0+** - Assertion library
- **fast-check 3.23.1+** - Property-based testing
- **ESLint & Prettier** - Code quality

## 🌟 Key Features

### API Features

- **RESTful API** design with consistent responses
- **JWT Authentication** with refresh token support
- **Role-based Authorization** (Admin, Customer)
- **Input Validation** with Joi schemas
- **Error Handling** with structured error responses
- **Rate Limiting** for API protection
- **CORS Support** for cross-origin requests

### E-commerce Features

- **User Management** - Registration, authentication, profiles
- **Product Catalog** - Products, categories, search, filtering
- **Order Management** - Cart, checkout, order tracking
- **Payment Processing** - Stripe integration with webhooks
- **Review System** - Product reviews and ratings
- **Email Notifications** - Order confirmations, updates

### Performance & Monitoring

- **Health Checks** - Comprehensive system health monitoring
- **Performance Metrics** - Response times, memory usage, database performance
- **Caching** - Built-in caching for improved performance
- **Load Testing** - Development tools for performance testing
- **Logging** - Structured logging with multiple levels

### Security Features

- **Security Headers** - Helmet.js protection
- **Input Sanitization** - XSS and injection protection
- **Rate Limiting** - Brute force protection
- **Session Security** - Secure cookie configuration
- **HTTPS Enforcement** - SSL/TLS in production
- **Vulnerability Scanning** - Regular security audits

## 🚦 API Status Codes

| Code | Status                | Description                   |
| ---- | --------------------- | ----------------------------- |
| 200  | OK                    | Request successful            |
| 201  | Created               | Resource created successfully |
| 400  | Bad Request           | Invalid request data          |
| 401  | Unauthorized          | Authentication required       |
| 403  | Forbidden             | Insufficient permissions      |
| 404  | Not Found             | Resource not found            |
| 409  | Conflict              | Resource conflict (duplicate) |
| 422  | Unprocessable Entity  | Validation error              |
| 429  | Too Many Requests     | Rate limit exceeded           |
| 500  | Internal Server Error | Server error                  |

## 🔗 Quick Links

### Development

- **Health Check**: `GET /health` - Check application status
- **API Base**: `GET /api` - API root endpoint
- **Metrics**: `GET /metrics` - Performance metrics
- **Cache Stats**: `GET /cache/stats` - Cache statistics

### Authentication

- **Login**: `POST /api/auth/login` - User authentication
- **Register**: `POST /api/auth/register` - User registration
- **Refresh**: `POST /api/auth/refresh` - Token refresh

### Core Resources

- **Products**: `GET /api/products` - Product catalog
- **Categories**: `GET /api/categories` - Product categories
- **Orders**: `GET /api/orders` - User orders
- **Users**: `GET /api/users` - User management (Admin)

## 📋 Environment Requirements

### Development

- Node.js 20.x LTS
- PostgreSQL 17+
- npm 10.x+
- Git

### Production

- Node.js 20.x LTS runtime
- PostgreSQL 17+ database
- SSL certificate
- Environment variables configured
- Monitoring setup

### Optional

- Docker & Docker Compose
- Redis (for caching)
- Load balancer
- CDN for static assets

## 🔍 Common Use Cases

### Developer Onboarding

1. Follow **[Setup Guide](./SETUP.md)**
2. Review **[API Documentation](./API.md)**
3. Run tests: `npm test`
4. Start development: `npm run dev`

### API Integration

1. Review **[API Documentation](./API.md)**
2. Obtain API credentials
3. Implement authentication
4. Test endpoints with Postman/curl

### Deployment

1. Choose platform from **[Deployment Guide](./DEPLOYMENT.md)**
2. Configure environment variables
3. Set up database
4. Deploy and verify

### Troubleshooting

1. Check **[Troubleshooting Guide](./TROUBLESHOOTING.md)**
2. Review application logs
3. Test health endpoints
4. Verify configuration

## 📞 Support & Resources

### Documentation

- **Setup Issues**: See [Setup Guide](./SETUP.md)
- **API Questions**: See [API Documentation](./API.md)
- **Deployment Problems**: See [Deployment Guide](./DEPLOYMENT.md)
- **Common Issues**: See [Troubleshooting Guide](./TROUBLESHOOTING.md)

### External Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize Documentation](https://sequelize.org/docs/)
- [Stripe API Reference](https://stripe.com/docs/api)

### Tools & Utilities

- [Postman](https://www.postman.com/) - API testing
- [JWT.io](https://jwt.io/) - JWT token debugging
- [JSON Formatter](https://jsonformatter.org/) - JSON validation
- [RegEx Tester](https://regex101.com/) - Regular expression testing

## 🔄 Version Information

- **Current Version**: 1.0.0
- **API Version**: v1
- **Node.js**: 20.x LTS
- **Database**: PostgreSQL 17+
- **Last Updated**: December 2024

For version history and changes, see the **[Changelog](../CHANGELOG.md)**.

## 📝 Contributing

We welcome contributions! Please:

1. Read the documentation thoroughly
2. Follow the setup guide for development environment
3. Write tests for new features
4. Follow code style guidelines (ESLint + Prettier)
5. Update documentation as needed

## 📄 License

This project is licensed under the ISC License. See the LICENSE file for details.

---

**Need help?** Start with the appropriate guide above, or check the troubleshooting section for common issues.
