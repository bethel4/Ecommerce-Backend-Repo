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
              example: 'johndoe',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              format: 'password',
              example: 'securePassword123',
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
      '/api/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description: 'Register a new user account. Upon successful registration, returns a 201 Created status code. Sensitive information like passwords are never returned in the response.',
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
                      username: 'johndoe',
                      email: 'john.doe@example.com',
                      password: 'securePassword123',
                    },
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
                      username: 'johndoe',
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
                        errors: ['body.email: Invalid email', 'body.password: String must contain at least 6 character(s)'],
                      },
                    },
                    emailExists: {
                      value: {
                        success: false,
                        message: 'User with this email already exists',
                        object: null,
                        errors: ['User with this email already exists'],
                      },
                    },
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
          summary: 'List all products',
          description: 'Retrieve a paginated list of all products',
          operationId: 'listProducts',
          parameters: [
            {
              name: 'pageNumber',
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
              description: 'Number of items per page (default: 50)',
              required: false,
              schema: {
                type: 'integer',
                minimum: 1,
                maximum: 100,
                default: 50,
              },
            },
          ],
          responses: {
            '200': {
              description: 'Products retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PaginatedResponse',
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

