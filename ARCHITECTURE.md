# E‑commerce Backend – Architecture and Implementation Guide

This document explains the system from an interviewer’s perspective: the architecture, key design decisions, tools used and why, data flows, and how to extend and operate the codebase.


## 1) Executive Summary

- Stack: Node.js (Express) + TypeScript, PostgreSQL (Prisma ORM), Redis (ioredis), JWT auth (access + refresh), Zod validation, Docker.
- Architecture: Clean Architecture with strict separation of concerns:
  - Domain: pure business entities and repository interfaces
  - Application: use‑cases (business logic only, framework‑agnostic)
  - Infrastructure: database implementations (Prisma), services (JWT, hash, CSRF, cache), config
  - Interface/HTTP: controllers, routes, middlewares
- Cross‑cutting: standardized API responses, global error handling, Swagger/OpenAPI docs, CSRF for state‑changing endpoints, role‑based auth (ADMIN/USER), Redis cache for product list/search.


## 2) Why Clean Architecture here?

- Testability: business rules live in use‑cases independent from Express/Prisma; easy to unit test.
- Replaceability: e.g., swap Prisma/Postgres with another DB by re‑implementing repository adapters only.
- Separation of concerns: controllers adapt HTTP to use‑cases; use‑cases depend on domain interfaces; infra implements those interfaces.


## 3) Repository Layout

```
src/
  domain/                  # Business model & contracts only
    entities/              # User, Product, Order, OrderItem
    repositories/          # UserRepository, ProductRepository, OrderRepository

  application/             # Use‑cases (pure business logic)
    use-cases/
      auth/                # registerUser, loginUser
      products/            # create/update/list/search/get/delete
      orders/              # placeOrder, listUserOrders

  infrastructure/
    database/prisma/       # Prisma repositories + PrismaClient
    services/              # hash (bcrypt), jwt, redis cache, csrf
    config/                # env loading & zod validation
    server/                # expressServer + swagger bootstrapping

  interfaces/http/
    controllers/           # AuthController, ProductController, OrderController
    routes/                # auth, product, order routes
    middlewares/           # auth, role, validate, cache, error, csrf

index.ts                   # Starts the HTTP server
prisma/                    # schema.prisma & seed.ts
docker/                    # Dockerfile & docker-compose.yml
```


## 4) Data Model (Prisma)

- Role(id, name)
- User(id, username, email, password, roleId)
- Product(id, name, description, price, stock, category, userId)
- Order(id, userId, description?, totalPrice, status, createdAt)
- OrderItem(id, orderId, productId, quantity, unitPrice)

All IDs are UUIDs. Prisma generates the client from `schema.prisma`. Seeding inserts roles: ADMIN, USER.


## 5) End‑to‑End Request Flow

Example: Create Product (Admin only)
1. Route: `POST /api/products` → middlewares:
   - `authMiddleware` verifies the JWT access token (Authorization: Bearer …).
   - `roleMiddleware(['ADMIN'])` ensures the user’s role is ADMIN.
   - `validateMiddleware(zodSchema)` validates request body.
2. Controller calls use‑case `createProduct` with `ProductRepository` dependency injected.
3. Use‑case executes domain rules only; returns DTO to controller.
4. Controller sends standardized success response; Redis cache for list/search gets invalidated.


## 6) Authentication and Authorization

- Login (POST `/auth/login`): validates credentials, issues accessToken (short‑lived) and sets refreshToken as httpOnly cookie.
- Me (GET `/auth/me`): requires valid accessToken; returns identity.
- Refresh (POST `/auth/refresh`): verifies refresh cookie and issues fresh accessToken.
- Logout (POST `/auth/logout`): clears refresh cookie.
- RBAC: `roleMiddleware` loads user + role and enforces ADMIN paths (create/update/delete product).

Why JWT?
- Interoperable, stateless, easy to authorize other services later. Refresh tokens mitigate short access token lifetimes.


## 7) Validation, Errors, Responses

- Validation: Zod schemas on routes; `validateMiddleware` returns 400 with granular messages.
- Errors: centralized `errorMiddleware` produces consistent body (no stack in production).
- Responses: `BaseResponse<T>` and `PaginatedResponse<T>` helpers enforce uniform shape.


## 8) Products API – Pagination and Search

- Public list/search: `GET /api/products?page&pageSize&search`.
- `page` default 1, `pageSize` default 10.
- Case‑insensitive substring search on name when `search` is provided.
- Response keys: `currentPage, pageSize, totalPages, totalProducts, products[]` (id, name, price, stock, category).
- Redis cache: transparent caching for GET list/search; mutation endpoints invalidate relevant keys.

Why Redis?
- Product browsing is a read‑heavy path; caching saves DB cost and improves latency.


## 9) Orders – Transactional Business Logic

- `POST /api/orders` (User role): places order for multiple items.
- Implemented as a single Prisma transaction:
  - Load all products → validate existence and stock.
  - Compute `totalPrice` on the server.
  - Create order + items.
  - Update product stock.
  - Any failure → automatic rollback.
- `GET /api/orders`: returns only the authenticated user’s orders.

Why a DB transaction?
- Strong consistency: avoid partial orders or inconsistent stock if any step fails.


## 10) Security Posture

- JWT access + refresh tokens; refresh stored as httpOnly cookie.
- CSRF protection: double submit cookie pattern for state‑changing routes (orders).
- Helmet: standard security headers.
- CORS: allow configured origins for Swagger/UI and apps.
- Password hashing: bcrypt with 10 rounds.
- Input validation: Zod guards all inputs.
- RBAC: ADMIN vs USER enforced in middleware.


## 11) Tooling Choices

- TypeScript: type safety and dev ergonomics.
- Express: minimal, battle‑tested HTTP framework.
- Prisma: fast, type‑safe ORM with migrations.
- PostgreSQL: reliable relational store.
- ioredis: robust Redis client.
- Zod: runtime validation with strong TS inference.
- Swagger UI: discoverable API documentation.
- Docker & Compose: reproducible local/dev environment.


## 12) How the Layers Interact (Dependency Rule)

- `interfaces/http` → calls `application/use-cases` → depends on `domain/repositories` → implemented by `infrastructure/database/prisma`.
- Direction always points inward (outer layers depend on inner ones); inner layers never import Express/Prisma.


## 13) Notable Files to Read

- `src/domain/entities/*`: shape of core business objects.
- `src/domain/repositories/*`: contracts the infra must implement.
- `src/application/use-cases/*`: business rules (auth, products, orders).
- `src/infrastructure/database/prisma/*Repository.ts`: Prisma adapters.
- `src/infrastructure/services/*`: JWT, bcrypt, Redis, CSRF abstractions.
- `src/interfaces/http/controllers/*`: thin orchestration; no business logic.
- `src/interfaces/http/middlewares/*`: auth, role, zod validation, cache, error, csrf.
- `src/infrastructure/server/expressServer.ts`: bootstraps services, repos, controllers, routes, Swagger.


## 14) Swagger (OpenAPI)

- Served at `/api-docs`. Documents:
  - Auth: `/auth/register`, `/auth/login`, `/auth/me`, `/auth/refresh`, `/auth/logout`
  - Products: `/api/products` (list/search), `/api/products/{id}` (get/put/delete), create product
  - Orders: `/api/orders` (post, get mine)
- Includes request/response examples and error cases.


## 15) Caching Strategy (Redis)

- Keys are derived from request URL (e.g., `cache:/api/products?search=mouse&page=1&pageSize=10`).
- TTL (e.g., 300s) configurable in `cacheMiddleware` usage.
- Mutations (create/update/delete product) invalidate relevant keys.

Trade‑offs:
- Simple key strategy; for larger surfaces one could use tag‑based or fine‑grained invalidation.


## 16) Environment & Configuration

- `.env` variables validated by Zod in `infrastructure/config/env.ts`:
  - `DATABASE_URL`, `REDIS_URL`
  - `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
  - `CSRF_SECRET`, `PORT`, `NODE_ENV`
- Fail‑fast if any required env is missing.


## 17) Docker & Compose

- `docker-compose.yml` starts app, Postgres, Redis.
- App builds with Node 20, runs migrations, and starts server.
- Prisma Client is generated inside image after all files are copied to avoid stale clients.


## 18) Testing & Observability (Guidance)

- Unit tests: mock repository interfaces to test use‑cases in isolation (no HTTP/DB).
- Integration tests: spin up Postgres & Redis (or use Testcontainers), run endpoints via supertest.
- Add rate limiting (bonus): e.g., `express-rate-limit` on auth & write routes.
- Add request logging (pino) and traces (OpenTelemetry) as next steps.


## 19) Common Operational Scenarios

- “Invalid or expired token” on `/auth/me`:
  - Ensure `Authorization: Bearer <accessToken>`; secrets in the running server match those used at login; re‑login if secrets changed.
- Prisma “table does not exist”:
  - Run `npm run prisma:migrate` and `npm run prisma:seed`. Rebuild Docker if needed.
- Swagger “Failed to fetch”:
  - Verify CORS origin is set, server runs at `http://localhost:3000`, no mixed http/https.


## 20) Extending the System

- Add a new data store (e.g., S3 for images): define `StorageService` interface in domain or infra boundary; implement in infra; inject into controllers/use‑cases.
- Add categories/filters: extend repositories with typed filter methods; keep searching logic in repositories; use‑cases remain orchestrators.
- Switch caches: replace `RedisCacheService` implementation; no changes to use‑cases.


## 21) Key Interview Talking Points

- Clean Architecture boundary clarity and why it improves testability and change tolerance.
- Prisma transactions for atomic order placement and stock management.
- JWT + refresh tokens + httpOnly cookie → secure, scalable auth.
- Validation & standardized error responses → predictable client integration.
- Caching strategy and invalidation for product browsing → performance vs freshness.
- Swagger as living contract & onboarding tool.
- Zod‑validated envs → fail fast, safer deployments.


## 22) Quick Start Commands

Local:
```
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Docker:
```
cd docker
docker-compose up -d --build
```

Swagger UI: `http://localhost:3000/api-docs`

Health: `http://localhost:3000/health`


---
This document should equip you to explain the codebase and its trade‑offs in interviews, and to operate/extend it in production settings.
*** End Patch

