# 🧪 Swagger API Testing Guide

## 📍 Accessing Swagger UI

1. Start your server:
   ```bash
   npm run dev
   ```

2. Open Swagger UI in your browser:
   ```
   http://localhost:3000/api-docs
   ```

## 🔐 Testing Authentication Endpoints

### Step 1: Register a New User

1. **Navigate to** `POST /auth/register` endpoint
2. **Click "Try it out"**
3. **Use the example request** or enter:
   ```json
   {
     "username": "johndoe123",
     "email": "john.doe@example.com",
     "password": "SecurePass123!"
   }
   ```
4. **Click "Execute"**
5. **Expected Response (201 Created):**
   ```json
   {
     "success": true,
     "message": "User registered successfully",
     "object": {
       "id": "uuid-here",
       "username": "johndoe123",
       "email": "john.doe@example.com",
       "roleId": "uuid-here"
     },
     "errors": null
   }
   ```
   ⚠️ **Note:** Password is never returned in the response

### Step 2: Login

1. **Navigate to** `POST /auth/login` endpoint
2. **Click "Try it out"**
3. **Enter credentials:**
   ```json
   {
     "email": "john.doe@example.com",
     "password": "SecurePass123!"
   }
   ```
4. **Click "Execute"**
5. **Expected Response (200 OK):**
   ```json
   {
     "success": true,
     "message": "Login successful",
     "object": {
       "user": {
         "id": "uuid-here",
         "username": "johndoe123",
         "email": "john.doe@example.com",
         "roleId": "uuid-here"
       },
       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     },
     "errors": null
   }
   ```
6. **Copy the `accessToken`** from the response

### Step 3: Authorize in Swagger

1. **Click the "Authorize" button** (🔒) at the top right of Swagger UI
2. **In the "bearerAuth" field**, paste your `accessToken`:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Click "Authorize"**
4. **Click "Close"**

Now all protected endpoints will automatically include your JWT token!

## 🛡️ Testing Protected Endpoints

### Testing Admin-Only Endpoints (e.g., Create Product)

1. **Make sure you're authorized** (see Step 3 above)
2. **Navigate to** `POST /api/products`
3. **Click "Try it out"**
4. **Enter product data:**
   ```json
   {
     "name": "Wireless Mouse",
     "description": "Ergonomic wireless mouse with 2.4GHz connectivity and long battery life",
     "price": 29.99,
     "stock": 50,
     "category": "Electronics"
   }
   ```
5. **Click "Execute"**

**Note:** If you get a 403 Forbidden error, your user doesn't have ADMIN role. You need to:
- Register a new user (they get USER role by default)
- Or manually update the user's role in the database to ADMIN

## 🔍 Testing Validation Errors

### Test Invalid Registration

1. **Try registering with invalid data:**
   ```json
   {
     "username": "john doe",  // ❌ Contains space
     "email": "invalid-email",  // ❌ Invalid format
     "password": "weak"  // ❌ Too short, missing requirements
   }
   ```
2. **Expected Response (400 Bad Request):**
   ```json
   {
     "success": false,
     "message": "Validation failed",
     "object": null,
     "errors": [
       "body.username: Username must be alphanumeric only...",
       "body.email: Invalid email",
       "body.password: Password must be at least 8 characters long",
       "body.password: Password must include at least one uppercase letter (A-Z)"
     ]
   }
   ```

### Test Invalid Login

1. **Try logging in with wrong credentials:**
   ```json
   {
     "email": "wrong@example.com",
     "password": "WrongPass123!"
   }
   ```
2. **Expected Response (401 Unauthorized):**
   ```json
   {
     "success": false,
     "message": "Invalid email or password",
     "object": null,
     "errors": ["Invalid email or password"]
   }
   ```

## 🎭 Role-Based Access Control (RBAC)

### How Roles Work

- **USER Role:** Default role for all new registrations
- **ADMIN Role:** Can access admin-only endpoints (e.g., Create/Delete Products)

### Checking Your Role

1. **After logging in**, check the `roleId` in the response
2. **Or call** `GET /auth/me` (requires authorization)
3. **The response includes your `roleId`**

### Testing Admin Access

**To test admin endpoints, you need a user with ADMIN role:**

1. **Register a new user** (gets USER role)
2. **Update the user's role in database:**
   ```sql
   -- Find USER role ID
   SELECT id FROM "Role" WHERE name = 'USER';
   
   -- Find ADMIN role ID
   SELECT id FROM "Role" WHERE name = 'ADMIN';
   
   -- Update user to ADMIN
   UPDATE "User" SET "roleId" = '<ADMIN_ROLE_ID>' WHERE email = 'your-email@example.com';
   ```
3. **Login again** to get a new JWT with ADMIN role
4. **Now you can access admin endpoints**

## 📝 Quick Testing Checklist

- [ ] Register a new user (`POST /auth/register`)
- [ ] Test validation errors (invalid username, email, password)
- [ ] Login with valid credentials (`POST /auth/login`)
- [ ] Copy the accessToken
- [ ] Authorize in Swagger with the token
- [ ] Test protected endpoint (e.g., `GET /auth/me`)
- [ ] Test admin-only endpoint (requires ADMIN role)
- [ ] Test invalid login credentials

## 🔗 API Endpoints Summary

### Authentication (No Auth Required)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Authentication (Auth Required)
- `GET /auth/me` - Get current user info
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Products (Public)
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search` - Search products

### Products (Auth Required)
- `POST /api/products` - Create product (ADMIN only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product (ADMIN only)

### Orders (Auth Required)
- `POST /api/orders` - Place order
- `GET /api/orders` - List user orders

## 💡 Tips

1. **Token Expiration:** JWT tokens expire after 15 minutes. Use `/auth/refresh` to get a new token.

2. **Error Messages:** All errors follow the standardized format:
   ```json
   {
     "success": false,
     "message": "Error message",
     "object": null,
     "errors": ["Detailed error 1", "Detailed error 2"]
   }
   ```

3. **Password Requirements:** Always use a password that meets all requirements:
   - At least 8 characters
   - One uppercase letter (A-Z)
   - One lowercase letter (a-z)
   - One number (0-9)
   - One special character (!@#$%^&*)

4. **Swagger Examples:** Use the pre-filled examples in Swagger by clicking on them in the request body section.

