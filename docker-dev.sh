#!/bin/bash

# Quiz Management System Frontend - Docker Development Scripts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create network if it doesn't exist
create_network() {
    if ! docker network ls | grep -q "quiz-network"; then
        print_status "Creating quiz-network..."
        docker network create quiz-network
    else
        print_status "quiz-network already exists"
    fi
}

# Development environment
dev() {
    print_status "Starting development environment..."
    create_network
    docker-compose -f docker-compose.dev.yml up --build
}

# Production environment
prod() {
    print_status "Starting production environment..."
    create_network
    docker-compose -f docker-compose.prod.yml up --build -d
}

# Stop all containers
stop() {
    print_status "Stopping all containers..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.prod.yml down
}

# Clean up containers and images
clean() {
    print_status "Cleaning up containers and images..."
    docker-compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans
    docker-compose -f docker-compose.prod.yml down --rmi all --volumes --remove-orphans
    docker system prune -f
}

# Build only
build() {
    print_status "Building images..."
    docker-compose -f docker-compose.dev.yml build
    docker-compose -f docker-compose.prod.yml build
}

# Show logs
logs() {
    if [ "$1" = "prod" ]; then
        docker-compose -f docker-compose.prod.yml logs -f
    else
        docker-compose -f docker-compose.dev.yml logs -f
    fi
}

# Show help
help() {
    echo "Quiz Management System Frontend - Docker Helper"
    echo ""
    echo "Usage: ./docker-dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev     Start development environment"
    echo "  prod    Start production environment"
    echo "  stop    Stop all containers"
    echo "  clean   Clean up containers and images"
    echo "  build   Build all images"
    echo "  logs    Show logs (use 'logs prod' for production)"
    echo "  help    Show this help message"
}

# Main script logic
case "$1" in
    dev)
        dev
        ;;
    prod)
        prod
        ;;
    stop)
        stop
        ;;
    clean)
        clean
        ;;
    build)
        build
        ;;
    logs)
        logs "$2"
        ;;
    help|*)
        help
        ;;
esac