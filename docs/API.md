# TuSpacio API Documentation

## Overview

The TuSpacio API is a RESTful web service that provides endpoints for managing an e-commerce platform. This API handles user authentication, product management, order processing, payment integration, and more.

## Base Information

- **Base URL**: `https://your-domain.com/api` (Production) or `http://localhost:3001/api` (Development)
- **API Version**: v1
- **Content Type**: `application/json`
- **Authentication**: JWT Bearer Token

## Authentication

### Overview

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require a valid JWT token in the Authorization header.

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Authentication Endpoints

#### POST /auth/login

Authenticate a user and receive a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer"
    }
  },
  "message": "Login successful"
}
```

#### POST /auth/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securepassword",
  "confirmPassword": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "customer"
    }
  },
  "message": "User registered successfully"
}
```

#### POST /auth/refresh

Refresh an expired JWT token.

**Request Body:**

```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

#### POST /auth/logout

Logout and invalidate the current session.

**Headers Required:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

## Users

### GET /users

Get all users (Admin only).

**Headers Required:**

```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by name or email

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "customer",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### GET /users/:id

Get a specific user by ID.

**Parameters:**

- `id`: User ID

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /users/:id

Update user information.

**Parameters:**

- `id`: User ID

**Request Body:**

```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Smith",
      "email": "johnsmith@example.com",
      "role": "customer",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "User updated successfully"
}
```

### DELETE /users/:id

Delete a user (Admin only).

**Parameters:**

- `id`: User ID

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Products

### GET /products

Get all products with optional filtering and pagination.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category ID
- `search` (optional): Search by product name or description
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sortBy` (optional): Sort field (name, price, createdAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Product Name",
        "description": "Product description",
        "price": 29.99,
        "stock": 100,
        "images": ["image1.jpg", "image2.jpg"],
        "category": {
          "id": 1,
          "name": "Category Name"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### GET /products/:id

Get a specific product by ID.

**Parameters:**

- `id`: Product ID

**Response:**

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "Product Name",
      "description": "Detailed product description",
      "price": 29.99,
      "stock": 100,
      "images": ["image1.jpg", "image2.jpg"],
      "category": {
        "id": 1,
        "name": "Category Name"
      },
      "reviews": [
        {
          "id": 1,
          "rating": 5,
          "comment": "Great product!",
          "user": {
            "name": "John Doe"
          }
        }
      ],
      "averageRating": 4.5,
      "reviewCount": 10
    }
  }
}
```

### POST /products

Create a new product (Admin only).

**Request Body:**

```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 39.99,
  "stock": 50,
  "categoryId": 1,
  "images": ["image1.jpg", "image2.jpg"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 2,
      "name": "New Product",
      "description": "Product description",
      "price": 39.99,
      "stock": 50,
      "categoryId": 1,
      "images": ["image1.jpg", "image2.jpg"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Product created successfully"
}
```

### PUT /products/:id

Update a product (Admin only).

**Parameters:**

- `id`: Product ID

**Request Body:**

```json
{
  "name": "Updated Product Name",
  "price": 34.99,
  "stock": 75
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "Updated Product Name",
      "price": 34.99,
      "stock": 75,
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Product updated successfully"
}
```

### DELETE /products/:id

Delete a product (Admin only).

**Parameters:**

- `id`: Product ID

**Response:**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

## Categories

### GET /categories

Get all categories.

**Response:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Electronics",
        "description": "Electronic devices and accessories",
        "productCount": 25,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### GET /categories/:id

Get a specific category with its products.

**Parameters:**

- `id`: Category ID

**Response:**

```json
{
  "success": true,
  "data": {
    "category": {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic devices and accessories",
      "products": [
        {
          "id": 1,
          "name": "Product Name",
          "price": 29.99,
          "images": ["image1.jpg"]
        }
      ]
    }
  }
}
```

### POST /categories

Create a new category (Admin only).

**Request Body:**

```json
{
  "name": "New Category",
  "description": "Category description"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "category": {
      "id": 2,
      "name": "New Category",
      "description": "Category description",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Category created successfully"
}
```

## Orders

### GET /orders

Get user's orders.

**Query Parameters:**

- `status` (optional): Filter by order status
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**

```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "status": "completed",
        "total": 59.98,
        "items": [
          {
            "productId": 1,
            "productName": "Product Name",
            "quantity": 2,
            "price": 29.99
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### GET /orders/:id

Get a specific order.

**Parameters:**

- `id`: Order ID

**Response:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "status": "completed",
      "total": 59.98,
      "subtotal": 59.98,
      "tax": 0,
      "shipping": 0,
      "items": [
        {
          "id": 1,
          "productId": 1,
          "productName": "Product Name",
          "quantity": 2,
          "price": 29.99,
          "total": 59.98
        }
      ],
      "shippingAddress": {
        "street": "123 Main St",
        "city": "City",
        "state": "State",
        "zipCode": "12345",
        "country": "Country"
      },
      "paymentMethod": "stripe",
      "paymentStatus": "paid",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### POST /orders

Create a new order.

**Request Body:**

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  },
  "paymentMethod": "stripe"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 2,
      "status": "pending",
      "total": 59.98,
      "items": [
        {
          "productId": 1,
          "quantity": 2,
          "price": 29.99
        }
      ],
      "paymentIntent": "pi_1234567890"
    }
  },
  "message": "Order created successfully"
}
```

### PUT /orders/:id/status

Update order status (Admin only).

**Parameters:**

- `id`: Order ID

**Request Body:**

```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "status": "shipped",
      "trackingNumber": "TRACK123456",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Order status updated successfully"
}
```

## Reviews

### GET /reviews/product/:productId

Get reviews for a specific product.

**Parameters:**

- `productId`: Product ID

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page
- `rating` (optional): Filter by rating

**Response:**

```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Excellent product!",
        "user": {
          "name": "John Doe"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "averageRating": 4.5,
    "totalReviews": 10
  }
}
```

### POST /reviews

Create a new review.

**Request Body:**

```json
{
  "productId": 1,
  "rating": 5,
  "comment": "Great product, highly recommend!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "review": {
      "id": 2,
      "productId": 1,
      "userId": 1,
      "rating": 5,
      "comment": "Great product, highly recommend!",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Review created successfully"
}
```

### PUT /reviews/:id

Update a review.

**Parameters:**

- `id`: Review ID

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Updated review comment"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "review": {
      "id": 1,
      "rating": 4,
      "comment": "Updated review comment",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Review updated successfully"
}
```

### DELETE /reviews/:id

Delete a review.

**Parameters:**

- `id`: Review ID

**Response:**

```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

## Payments

### POST /payments/create-intent

Create a Stripe payment intent.

**Request Body:**

```json
{
  "orderId": 1,
  "amount": 5998,
  "currency": "usd"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdef",
    "paymentIntentId": "pi_1234567890"
  }
}
```

### POST /payments/webhook

Stripe webhook handler for payment events.

**Headers Required:**

```
stripe-signature: webhook_signature
```

**Response:**

```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

### GET /payments/status/:paymentId

Get payment status.

**Parameters:**

- `paymentId`: Payment Intent ID

**Response:**

```json
{
  "success": true,
  "data": {
    "paymentId": "pi_1234567890",
    "status": "succeeded",
    "amount": 5998,
    "currency": "usd",
    "orderId": 1
  }
}
```

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Request validation failed
- `AUTHENTICATION_ERROR` - Authentication required or failed
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate email)
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window**: 15 minutes
- **Limit**: 100 requests per IP (production), 1000 (development)
- **Headers**: Rate limit information is included in response headers

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Format:**

```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

**Common Query Parameters:**

- `search`: Text search
- `sortBy`: Field to sort by
- `sortOrder`: `asc` or `desc`
- `filter[field]`: Filter by field value

**Example:**

```
GET /api/products?search=laptop&sortBy=price&sortOrder=asc&filter[category]=electronics
```

## Webhooks

The API supports webhooks for real-time notifications:

### Stripe Webhooks

- **Endpoint**: `POST /api/payments/webhook`
- **Events**: `payment_intent.succeeded`, `payment_intent.payment_failed`
- **Verification**: Stripe signature verification required

### Custom Webhooks (Future)

- Order status updates
- Inventory changes
- User registration events

## SDK and Libraries

### JavaScript/Node.js

```javascript
const TuSpacioAPI = require('tuspacio-api-client');

const client = new TuSpacioAPI({
  baseURL: 'https://api.tuspacio.com',
  apiKey: 'your-api-key',
});

// Get products
const products = await client.products.list({
  page: 1,
  limit: 10,
});
```

### cURL Examples

```bash
# Login
curl -X POST https://api.tuspacio.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Get products
curl -X GET https://api.tuspacio.com/products \
  -H "Authorization: Bearer your-jwt-token"

# Create order
curl -X POST https://api.tuspacio.com/orders \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":1,"quantity":2}]}'
```

## Changelog

### Version 1.0.0 (Current)

- Initial API release
- JWT authentication
- Product management
- Order processing
- Payment integration
- Review system
- Admin functionality

### Upcoming Features

- GraphQL endpoint
- Real-time notifications
- Advanced search
- Recommendation engine
- Multi-language support

## Support

For API support:

1. Check this documentation
2. Review error messages and status codes
3. Check rate limiting and authentication
4. Contact support: api-support@tuspacio.com

---

**API Version**: 1.0.0  
**Last Updated**: December 2024  
**Base URL**: https://api.tuspacio.com
