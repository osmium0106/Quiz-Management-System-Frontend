# Quiz Management System Frontend - Docker Setup

This directory contains Docker configuration for the Quiz Management System Frontend built with React, TypeScript, and Vite.

## Quick Start

### Development Environment
```bash
# Using npm scripts
npm run docker:dev

# Or using docker-compose directly
docker-compose -f docker-compose.dev.yml up --build
```

### Production Environment
```bash
# Using npm scripts
npm run docker:prod

# Or using docker-compose directly
docker-compose -f docker-compose.prod.yml up --build -d
```

## Docker Files Overview

- **Dockerfile**: Multi-stage build with development, build, and production stages
- **docker-compose.yml**: Main compose file with both dev and prod services
- **docker-compose.dev.yml**: Development-specific configuration
- **docker-compose.prod.yml**: Production-specific configuration
- **docker-compose.fullstack.yml**: Full-stack setup with backend and database
- **docker/nginx.conf**: Nginx configuration for production
- **.dockerignore**: Files to exclude from Docker context

## Available Scripts

### NPM Scripts
```bash
npm run docker:dev          # Start development environment
npm run docker:prod         # Start production environment
npm run docker:stop         # Stop all containers
npm run docker:clean        # Clean up containers and images
npm run docker:build        # Build all images
npm run docker:logs         # Show development logs
npm run docker:logs:prod    # Show production logs
```

### Helper Scripts
```bash
# Linux/Mac
./docker-dev.sh dev         # Start development
./docker-dev.sh prod        # Start production
./docker-dev.sh stop        # Stop containers
./docker-dev.sh clean       # Clean up
./docker-dev.sh logs        # Show logs

# Windows
docker-dev.bat dev          # Start development
docker-dev.bat prod         # Start production
docker-dev.bat stop         # Stop containers
docker-dev.bat clean        # Clean up
docker-dev.bat logs         # Show logs
```

## Environment Configuration

### Development (.env.development)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_BACKEND_URL=http://localhost:8000
```

### Production (.env.production)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_BACKEND_URL=http://localhost:8000
NODE_ENV=production
```

### Docker with Backend (.env.docker)
```
VITE_API_BASE_URL=http://quiz-backend:8000/api/v1
VITE_BACKEND_URL=http://quiz-backend:8000
NODE_ENV=development
CHOKIDAR_USEPOLLING=true
```

## Docker Stages

### 1. Development Stage
- Based on Node.js 18 Alpine
- Hot reloading enabled
- Source code mounted as volume
- Runs on port 3000

### 2. Build Stage
- Compiles TypeScript
- Builds optimized production bundle
- Creates static assets in `/dist`

### 3. Production Stage
- Based on Nginx Alpine
- Serves static files
- Includes security headers
- Health check endpoint
- Runs on port 80

## Networking

All services use the `quiz-network` bridge network for internal communication.

### Port Mapping
- **Development**: 3000:3000
- **Production**: 80:80
- **Backend**: 8000:8000 (if using fullstack)
- **Database**: 5432:5432 (if using fullstack)
- **Redis**: 6379:6379 (if using fullstack)

## Volume Mounts

### Development
- `.:/app` - Source code hot reloading
- `/app/node_modules` - Prevent node_modules override
- `/app/dist` - Build output

### Production
- Static assets served from Nginx document root

## Health Checks

Production container includes health checks:
- **Endpoint**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Retries**: 3

## Security Features

### Nginx Configuration
- Security headers (XSS protection, CSRF, etc.)
- Gzip compression
- Static asset caching
- Hidden server tokens

### Docker Security
- Non-root user in production
- Minimal attack surface with Alpine images
- Security-focused Nginx configuration

## Full-Stack Development

Use `docker-compose.fullstack.yml` for complete development environment:

```bash
docker-compose -f docker-compose.fullstack.yml up --build
```

This includes:
- Frontend (React/Vite)
- Backend (Django/DRF)
- PostgreSQL Database
- Redis for caching

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 80, 8000 are available
2. **Network issues**: Create network manually: `docker network create quiz-network`
3. **Volume permissions**: Check file permissions in development mode
4. **Build failures**: Clear Docker cache: `docker system prune -f`

### Debugging Commands

```bash
# Check container status
docker ps -a

# View container logs
docker logs quiz-frontend-dev

# Execute commands in container
docker exec -it quiz-frontend-dev sh

# Inspect network
docker network inspect quiz-network
```

## Production Deployment

### Build and Deploy
```bash
# Build production image
docker build --target production -t quiz-frontend:latest .

# Run production container
docker run -d -p 80:80 --name quiz-frontend-prod quiz-frontend:latest
```

### Environment Variables for Production
Update environment variables for your production setup:
- API URLs
- Security configurations
- Database connections (if applicable)

### SSL/TLS Setup
Mount SSL certificates for HTTPS:
```yaml
volumes:
  - ./ssl:/etc/nginx/ssl:ro
```

Update Nginx configuration for SSL termination.

## Monitoring and Logs

### Log Management
```bash
# Follow logs
docker-compose logs -f quiz-frontend

# View specific service logs
docker-compose logs quiz-frontend

# Limit log output
docker-compose logs --tail=100 quiz-frontend
```

### Resource Monitoring
```bash
# Container resource usage
docker stats quiz-frontend-dev

# System-wide Docker usage
docker system df
```