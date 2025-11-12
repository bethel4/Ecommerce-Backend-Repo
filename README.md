# 🏗️ E-commerce Backend - Clean Architecture

A production-ready e-commerce backend built with **Clean Architecture** principles, featuring Express.js, TypeScript, PostgreSQL, Prisma, and Redis.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Running with Docker](#running-with-docker)
- [Environment Variables](#environment-variables)
- [Security Features](#security-features)
- [API Endpoints](#api-endpoints)
- [Prisma Migrations](#prisma-migrations)

## 🎯 Overview

This project implements a clean, scalable backend architecture following **Clean Architecture** principles, ensuring:

- **Separation of Concerns**: Clear boundaries between domain, application, infrastructure, and interface layers
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Testability**: Business logic is isolated and easily testable
- **Maintainability**: Changes in one layer don't affect others
- **Scalability**: Easy to add new features and modify existing ones

## 🏛️ Architecture

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│         Interfaces (HTTP)              │
│  Controllers, Routes, Middlewares       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Application Layer                │
│  Use Cases (Business Logic)             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Domain Layer                     │
│  Entities, Repository Interfaces        │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Infrastructure Layer             │
│  Database, Services, Config             │
└─────────────────────────────────────────┘
```

### Layer Responsibilities

1. **Domain Layer**: Core business entities and repository interfaces (no dependencies)
2. **Application Layer**: Use cases containing business logic (depends only on domain)
3. **Infrastructure Layer**: External concerns (database, services, config)
4. **Interface Layer**: HTTP controllers, routes, middlewares

## 🛠️ Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching**: Redis (ioredis)
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Security**: Helmet, CORS, CSRF protection
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
src/
├── domain/                    # Domain Layer
│   ├── entities/             # Business entities
│   │   ├── UserEntity.ts
│   │   ├── ProductEntity.ts
│   │   ├── OrderEntity.ts
│   │   └── OrderItemEntity.ts
│   └── repositories/         # Repository interfaces
│       ├── UserRepository.ts
│       ├── ProductRepository.ts
│       └── OrderRepository.ts
│
├── application/              # Application Layer
│   └── use-cases/           # Business logic
│       ├── auth/
│       │   ├── registerUser.ts
│       │   └── loginUser.ts
│       ├── products/
│       │   ├── createProduct.ts
│       │   ├── updateProduct.ts
│       │   ├── listProducts.ts
│       │   ├── searchProducts.ts
│       │   ├── getProduct.ts
│       │   └── deleteProduct.ts
│       └── orders/
│           ├── placeOrder.ts
│           └── listUserOrders.ts
│
├── infrastructure/           # Infrastructure Layer
│   ├── database/
│   │   └── prisma/
│   │       ├── prismaClient.ts
│   │       ├── PrismaUserRepository.ts
│   │       ├── PrismaProductRepository.ts
│   │       └── PrismaOrderRepository.ts
│   ├── services/
│   │   ├── hashService.ts
│   │   ├── jwtService.ts
│   │   ├── redisCacheService.ts
│   │   └── csrfService.ts
│   ├── config/
│   │   └── env.ts
│   └── server/
│       └── expressServer.ts
│
└── interfaces/              # Interface Layer
    └── http/
        ├── controllers/
        │   ├── AuthController.ts
        │   ├── ProductController.ts
        │   └── OrderController.ts
        ├── routes/
        │   ├── authRoutes.ts
        │   ├── productRoutes.ts
        │   └── orderRoutes.ts
        └── middlewares/
            ├── authMiddleware.ts
            ├── roleMiddleware.ts
            ├── validateMiddleware.ts
            ├── cacheMiddleware.ts
            ├── errorMiddleware.ts
            └── csrfMiddleware.ts

prisma/
├── schema.prisma
└── seed.ts

docker/
├── Dockerfile
└── docker-compose.yml
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- npm or yarn

### Step 1: Clone and Install

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate
```

### Step 2: Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CSRF_SECRET="your-csrf-secret-key-change-in-production"
```

### Step 3: Database Setup

```bash
# Run migrations
npm run prisma:migrate

# Seed the database (creates ADMIN and USER roles)
npm run prisma:seed
```

### Step 4: Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 🐳 Running with Docker

### Quick Start

```bash
# Start all services (app, db, redis)
cd docker
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Docker Services

- **app**: Express.js application (port 3000)
- **db**: PostgreSQL database (port 5432)
- **redis**: Redis cache (port 6379)

### First-Time Setup with Docker

```bash
# 1. Start services
docker-compose up -d

# 2. Run migrations (inside app container)
docker-compose exec app npx prisma migrate deploy

# 3. Seed database
docker-compose exec app npm run prisma:seed
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `JWT_SECRET` | Secret for access tokens | Required |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Required |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiration | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `CSRF_SECRET` | CSRF token secret | Required |

## 🔒 Security Features

### Authentication & Authorization

- **JWT Access Tokens**: Short-lived tokens (15 minutes) for API access
- **JWT Refresh Tokens**: Long-lived tokens (7 days) stored as httpOnly cookies
- **Role-Based Access Control (RBAC)**: ADMIN and USER roles
- **Password Hashing**: bcrypt with salt rounds

### Additional Security

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **CSRF Protection**: Double-submit cookie pattern
- **Input Validation**: Zod schema validation
- **Error Handling**: Secure error messages (no stack traces in production)

### CSRF Token Flow

1. Client requests `/api/csrf-token`
2. Server generates token and sets it as httpOnly cookie
3. Client includes token in `X-CSRF-Token` header for state-changing requests
4. Server validates token matches cookie

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user (protected)

### Products

- `GET /api/products` - List all products (cached)
- `GET /api/products/search?q=query` - Search products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders

- `POST /api/orders` - Place order (protected, CSRF required)
- `GET /api/orders` - List user orders (protected)

### Utility

- `GET /health` - Health check
- `GET /api/csrf-token` - Get CSRF token
- `GET /api-docs` - API documentation (Swagger)

## 🗄️ Prisma Migrations

### Create Migration

```bash
npm run prisma:migrate
```

### Apply Migrations

```bash
# Development
npm run prisma:migrate

# Production (Docker)
docker-compose exec app npx prisma migrate deploy
```

### Prisma Studio

```bash
npm run prisma:studio
```

Opens Prisma Studio at `http://localhost:5555`

## 📊 Database Schema

### Tables

- **Role**: User roles (ADMIN, USER)
- **User**: User accounts with role assignment
- **Product**: Products with stock management
- **Order**: User orders with status tracking
- **OrderItem**: Order line items

### Relations

- User → Role (many-to-one)
- User → Product (one-to-many)
- User → Order (one-to-many)
- Order → OrderItem (one-to-many)
- Product → OrderItem (one-to-many)

## 🧪 Development

### Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open Prisma Studio
```

### Code Quality

- TypeScript strict mode enabled
- ESLint recommended (add if needed)
- Consistent code formatting

## 🚢 Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, unique secrets for JWT and CSRF
3. Configure CORS origin properly
4. Use environment-specific database URLs
5. Enable HTTPS
6. Set up proper logging and monitoring
7. Run migrations before starting: `npx prisma migrate deploy`

## 📝 License

ISC

## 🤝 Contributing

This is a clean architecture template. Feel free to extend it with:

- Unit and integration tests
- API rate limiting
- Request logging
- Monitoring and observability
- Additional use cases
- GraphQL support
- WebSocket support

---

**Built with ❤️ using Clean Architecture principles**

