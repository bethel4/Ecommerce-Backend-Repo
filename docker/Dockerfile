# Debian-based image – fully compatible with Prisma binaries
FROM node:20-bullseye-slim

WORKDIR /app

# Copy dependency files first
COPY package*.json ./
COPY prisma ./prisma/

# Install system deps Prisma needs (OpenSSL etc.)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install Node dependencies
RUN npm ci

# Copy all source code
COPY . .

# Generate Prisma client inside the same environment
RUN npx prisma generate

# Build TypeScript to dist/
RUN npm run build

EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]
