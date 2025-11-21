# Multi-stage Docker build for Quiz Management System Frontend

# Development stage
FROM node:18-alpine AS development
WORKDIR /app

# Install git (needed for some npm packages)
RUN apk add --no-cache git

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies with better error handling
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install; fi

# Copy source code
COPY . .

# Expose development port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Install git (needed for some npm packages)
RUN apk add --no-cache git

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with error handling
RUN npm ci --only=production=false --silent || npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]