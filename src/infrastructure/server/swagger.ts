import { getEnv } from '../config/env';

export function getSwaggerDocument() {
  const env = getEnv();
  const port = env.PORT || 3000;

  return {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'Clean Architecture E-commerce Backend API with JWT Authentication',
      contact: {
        name: 'API Support',
      },
      '/api/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product details',
          description: 'Retrieve full details for a specific product by id.',
          operationId: 'getProduct',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Product found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BaseResponse' },
                },
              },
            },
            '404': {
              description: 'Product not found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        put: {
          tags: ['Products'],
          summary: 'Update product (Admin only)',
          description: 'Update any subset of fields for a product. Requires Admin role.',
          operationId: 'updateProduct',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number', minimum: 0.01 },
                    stock: { type: 'integer', minimum: 0 },
                    category: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Product updated successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BaseResponse' },
                },
              },
            },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Products'],
          summary: 'Delete product (Admin only)',
          description: 'Permanently delete a product. Requires Admin role.',
          operationId: 'deleteProduct',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          responses: {
            '200': {
              description: 'Product deleted successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BaseResponse' },
                },
              },
            },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            '404': { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
      schemas: {
        BaseResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            object: {
              type: 'object',
              nullable: true,
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
              nullable: true,
              example: null,
            },
          },
          required: ['success', 'message', 'object', 'errors'],
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Data retrieved successfully',
            },
            object: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            pageNumber: {
              type: 'integer',
              example: 1,
            },
            pageSize: {
              type: 'integer',
              example: 50,
            },
            totalSize: {
              type: 'integer',
              example: 100,
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
              nullable: true,
              example: null,
            },
          },
          required: ['success', 'message', 'object', 'pageNumber', 'pageSize', 'totalSize', 'errors'],
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              pattern: '^[a-zA-Z0-9]+$',
              example: 'johndoe123',
              description: 'Username must be alphanumeric only (letters and numbers, no special characters or spaces)',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
              description: 'Must be a valid email address format (e.g., user@example.com). Must be unique.',
            },
            password: {
              type: 'string',
              minLength: 8,
              format: 'password',
              example: 'SecurePass123!',
              description: 'Password must be at least 8 characters long and include: at least one uppercase letter (A-Z), at least one lowercase letter (a-z), at least one number (0-9), and at least one special character (e.g., !@#$%^&*)',
            },
          },
        },
        RegisterResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'User registered successfully',
            },
            object: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174000',
                },
                username: {
                  type: 'string',
                  example: 'johndoe',
                },
                email: {
                  type: 'string',
                  example: 'john.doe@example.com',
                },
                roleId: {
                  type: 'string',
                  format: 'uuid',
                  example: '123e4567-e89b-12d3-a456-426614174001',
                },
              },
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
              nullable: true,
              example: null,
            },
          },
        },
        CreateProductRequest: {
          type: 'object',
          required: ['name', 'description', 'price', 'stock'],
          properties: {
            name: {
              type: 'string',
              minLength: 3,
              maxLength: 100,
              example: 'Wireless Mouse',
              description: 'Product name (3-100 characters)',
            },
            description: {
              type: 'string',
              minLength: 10,
              example: 'Ergonomic wireless mouse with 2.4GHz connectivity and long battery life',
              description: 'Product description (minimum 10 characters)',
            },
            price: {
              type: 'number',
              minimum: 0.01,
              example: 29.99,
              description: 'Product price (must be greater than 0)',
            },
            stock: {
              type: 'integer',
              minimum: 0,
              example: 50,
              description: 'Available stock quantity (non-negative integer)',
            },
            category: {
              type: 'string',
              example: 'Electronics',
              description: 'Product category (optional)',
            },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            name: {
              type: 'string',
              example: 'Wireless Mouse',
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Ergonomic wireless mouse with 2.4GHz connectivity',
            },
            price: {
              type: 'number',
              example: 29.99,
            },
            stock: {
              type: 'integer',
              example: 50,
            },
            category: {
              type: 'string',
              nullable: true,
              example: 'Electronics',
            },
            userId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174001',
            },
          },
        },
        CreateProductResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Product created successfully',
            },
            object: {
              $ref: '#/components/schemas/Product',
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
              nullable: true,
              example: null,
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Validation failed',
            },
            object: {
              type: 'object',
              nullable: true,
              example: null,
            },
            errors: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['body.name: Name must be at least 3 characters'],
            },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description: 'Register a new user account. Rate limited (100 requests / 15 minutes per IP). Upon success returns 201. Passwords are never returned.',
          operationId: 'registerUser',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisterRequest',
                },
                examples: {
                  valid: {
                    value: {
                      username: 'johndoe123',
                      email: 'john.doe@example.com',
                      password: 'SecurePass123!',
                    },
                    summary: 'Valid registration request',
                  },
                  invalidUsername: {
                    value: {
                      username: 'john doe',
                      email: 'john.doe@example.com',
                      password: 'SecurePass123!',
                    },
                    summary: 'Invalid username (contains space)',
                  },
                  invalidPassword: {
                    value: {
                      username: 'johndoe123',
                      email: 'john.doe@example.com',
                      password: 'weak',
                    },
                    summary: 'Invalid password (too short, missing requirements)',
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/RegisterResponse',
                  },
                  example: {
                    success: true,
                    message: 'User registered successfully',
                    object: {
                      id: '123e4567-e89b-12d3-a456-426614174000',
                      username: 'johndoe123',
                      email: 'john.doe@example.com',
                      roleId: '123e4567-e89b-12d3-a456-426614174001',
                    },
                    errors: null,
                  },
                },
              },
            },
            '400': {
              description: 'Bad Request - Validation failed or email already exists',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                  examples: {
                    validationError: {
                      value: {
                        success: false,
                        message: 'Validation failed',
                        object: null,
                        errors: [
                          'body.username: Username must be alphanumeric only (letters and numbers, no special characters or spaces)',
                          'body.password: Password must be at least 8 characters long',
                          'body.password: Password must include at least one uppercase letter (A-Z)',
                        ],
                      },
                      summary: 'Multiple validation errors',
                    },
                    emailExists: {
                      value: {
                        success: false,
                        message: 'User with this email already exists',
                        object: null,
                        errors: ['User with this email already exists'],
                      },
                      summary: 'Email already registered',
                    },
                    usernameTaken: {
                      value: {
                        success: false,
                        message: 'Username already taken',
                        object: null,
                        errors: ['Username already taken'],
                      },
                      summary: 'Username already taken',
                    },
                    weakPassword: {
                      value: {
                        success: false,
                        message: 'Validation failed',
                        object: null,
                        errors: [
                          'body.password: Password must be at least 8 characters long',
                          'body.password: Password must include at least one uppercase letter (A-Z)',
                          'body.password: Password must include at least one special character (e.g., !@#$%^&*)',
                        ],
                      },
                      summary: 'Password does not meet requirements',
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          description: 'Authenticate a user with email and password (rate limited to 100 requests / 15 minutes per IP). Upon success returns a JWT access token for subsequent requests.',
          operationId: 'loginUser',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'john.doe@example.com',
                      description: 'The email address used during registration',
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                      example: 'SecurePass123!',
                      description: 'The user account password',
                    },
                  },
                },
                examples: {
                  valid: {
                    value: {
                      email: 'john.doe@example.com',
                      password: 'SecurePass123!',
                    },
                    summary: 'Valid login credentials',
                  },
                  invalidEmail: {
                    value: {
                      email: 'invalid-email',
                      password: 'SecurePass123!',
                    },
                    summary: 'Invalid email format',
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful - JWT token returned',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/BaseResponse',
                  },
                  example: {
                    success: true,
                    message: 'Login successful',
                    object: {
                      user: {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        username: 'johndoe123',
                        email: 'john.doe@example.com',
                        roleId: '123e4567-e89b-12d3-a456-426614174001',
                      },
                      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    },
                    errors: null,
                  },
                },
              },
            },
            '400': {
              description: 'Bad Request - Invalid input format',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                  example: {
                    success: false,
                    message: 'Validation failed',
                    object: null,
                    errors: ['body.email: Invalid email'],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized - Invalid credentials (user does not exist or password is incorrect)',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                  examples: {
                    invalidCredentials: {
                      value: {
                        success: false,
                        message: 'Invalid email or password',
                        object: null,
                        errors: ['Invalid email or password'],
                      },
                      summary: 'Invalid credentials',
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current user',
          description: 'Returns the current authenticated user. Requires Bearer JWT in Authorization header.',
          operationId: 'getCurrentUser',
          security: [
            {
              bearerAuth: [],
            },
          ],
          responses: {
            '200': {
              description: 'Current user returned',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/BaseResponse',
                  },
                  example: {
                    success: true,
                    message: 'User retrieved successfully',
                    object: {
                      id: '123e4567-e89b-12d3-a456-426614174000',
                      username: 'johndoe123',
                      email: 'john.doe@example.com',
                      roleId: '123e4567-e89b-12d3-a456-426614174001',
                    },
                    errors: null,
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized - Missing/invalid token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh access token',
          description: 'Generate a new access token using a valid refresh token cookie.',
          operationId: 'refreshToken',
          responses: {
            '200': {
              description: 'New access token issued',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BaseResponse' },
                  example: {
                    success: true,
                    message: 'Token refreshed successfully',
                    object: { accessToken: 'eyJhbGciOi...' },
                    errors: null,
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized - Missing/invalid refresh token',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'Logout',
          description: 'Clears refresh token cookie.',
          operationId: 'logout',
          responses: {
            '200': {
              description: 'Logged out successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BaseResponse' },
                  example: {
                    success: true,
                    message: 'Logout successful',
                    object: null,
                    errors: null,
                  },
                },
              },
            },
          },
        },
      },
      '/api/products': {
        post: {
          tags: ['Products'],
          summary: 'Create a new product',
          description: 'Create a new product in the catalog. This endpoint is protected and accessible only by authenticated users with Admin role.',
          operationId: 'createProduct',
          security: [
            {
              bearerAuth: [],
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateProductRequest',
                },
                examples: {
                  valid: {
                    value: {
                      name: 'Wireless Mouse',
                      description: 'Ergonomic wireless mouse with 2.4GHz connectivity and long battery life',
                      price: 29.99,
                      stock: 50,
                      category: 'Electronics',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Product created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/CreateProductResponse',
                  },
                  example: {
                    success: true,
                    message: 'Product created successfully',
                    object: {
                      id: '123e4567-e89b-12d3-a456-426614174000',
                      name: 'Wireless Mouse',
                      description: 'Ergonomic wireless mouse with 2.4GHz connectivity and long battery life',
                      price: 29.99,
                      stock: 50,
                      category: 'Electronics',
                      userId: '123e4567-e89b-12d3-a456-426614174001',
                    },
                    errors: null,
                  },
                },
              },
            },
            '400': {
              description: 'Bad Request - Validation failed',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                  examples: {
                    validationError: {
                      value: {
                        success: false,
                        message: 'Validation failed',
                        object: null,
                        errors: [
                          'body.name: Name must be at least 3 characters',
                          'body.description: Description must be at least 10 characters long',
                          'body.price: Price must be a positive number greater than 0',
                        ],
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                  example: {
                    success: false,
                    message: 'No token provided',
                    object: null,
                    errors: ['No token provided'],
                  },
                },
              },
            },
            '403': {
              description: 'Forbidden - User does not have Admin role',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                  example: {
                    success: false,
                    message: 'Forbidden: Insufficient permissions',
                    object: null,
                    errors: ['Forbidden: Insufficient permissions'],
                  },
                },
              },
            },
          },
        },
        get: {
          tags: ['Products'],
          summary: 'List/search products',
          description: 'Retrieve a paginated list of products. Supports optional case-insensitive substring search by name using the "search" query param.',
          operationId: 'listProducts',
          parameters: [
            {
              name: 'page',
              in: 'query',
              description: 'Page number (default: 1)',
              required: false,
              schema: {
                type: 'integer',
                minimum: 1,
                default: 1,
              },
            },
            {
              name: 'pageSize',
              in: 'query',
              description: 'Number of items per page (default: 10)',
              required: false,
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 10,
              },
            },
            {
              name: 'search',
              in: 'query',
              description: 'Optional search term for product name (case-insensitive, substring match)',
              required: false,
              schema: { type: 'string' },
            },
            {
              name: 'category',
              in: 'query',
              description: 'Filter by category (exact match)',
              required: false,
              schema: { type: 'string' },
            },
            {
              name: 'minPrice',
              in: 'query',
              description: 'Filter products with price >= value',
              required: false,
              schema: { type: 'number', minimum: 0 },
            },
            {
              name: 'maxPrice',
              in: 'query',
              description: 'Filter products with price <= value',
              required: false,
              schema: { type: 'number', minimum: 0 },
            },
            {
              name: 'minStock',
              in: 'query',
              description: 'Filter products with stock >= value',
              required: false,
              schema: { type: 'integer', minimum: 0 },
            },
          ],
          responses: {
            '200': {
              description: 'Products retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      currentPage: { type: 'integer', example: 1 },
                      pageSize: { type: 'integer', example: 10 },
                      totalPages: { type: 'integer', example: 5 },
                      totalProducts: { type: 'integer', example: 42 },
                      products: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            name: { type: 'string' },
                            price: { type: 'number' },
                            stock: { type: 'integer' },
                            category: { type: 'string', nullable: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/products/{id}/image': {
        post: {
          tags: ['Products'],
          summary: 'Upload product image (Admin only)',
          description: 'Uploads a product image. Requires multipart/form-data with field `image`. Subject to write rate limiting.',
          operationId: 'uploadProductImage',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['image'],
                  properties: {
                    image: {
                      type: 'string',
                      format: 'binary',
                      description: 'Image file to upload',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Image uploaded successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BaseResponse' },
                },
              },
            },
            '400': {
              description: 'Bad Request - validation failure',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '401': {
              description: 'Unauthorized',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '403': {
              description: 'Forbidden',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '404': {
              description: 'Product not found',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },
    },
  };
}

