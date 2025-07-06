#!/bin/bash

# ABUSLEMAN POS System - Quick Start Script
# نظام أبوسليمان لنقاط البيع - سكريبت البدء السريع

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "All prerequisites are met!"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p data logs backups ssl
    
    print_success "Directories created successfully!"
}

# Build and start the application
start_application() {
    print_status "Building and starting ABUSLEMAN POS System..."
    
    # Stop any existing containers
    docker-compose down 2>/dev/null || true
    
    # Build and start the application
    docker-compose up -d --build
    
    print_success "Application started successfully!"
}

# Wait for application to be ready
wait_for_application() {
    print_status "Waiting for application to be ready..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:8080/health >/dev/null 2>&1; then
            print_success "Application is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - waiting for application..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_warning "Application may not be fully ready yet. Please check manually."
}

# Display access information
show_access_info() {
    echo ""
    echo "🎉 ABUSLEMAN POS System is now running!"
    echo "نظام أبوسليمان لنقاط البيع يعمل الآن!"
    echo ""
    echo "📍 Access URLs:"
    echo "   • Main Application: http://localhost:8080"
    echo "   • Health Check: http://localhost:8080/health"
    echo ""
    echo "🔑 Default Login:"
    echo "   • Username: admin"
    echo "   • Password: 123"
    echo ""
    echo "📚 Documentation:"
    echo "   • README: ./README.md"
    echo "   • Docker Guide: ./DOCKER_DEPLOYMENT.md"
    echo "   • Requirements: ./requirments.md"
    echo ""
    echo "🛠️ Useful Commands:"
    echo "   • View logs: docker-compose logs -f"
    echo "   • Stop system: docker-compose down"
    echo "   • Restart: docker-compose restart"
    echo "   • Update: git pull && docker-compose up -d --build"
    echo ""
}

# Main execution
main() {
    echo "🏪 ABUSLEMAN POS System - Quick Start"
    echo "نظام أبوسليمان لنقاط البيع - البدء السريع"
    echo "========================================"
    echo ""
    
    check_prerequisites
    create_directories
    start_application
    wait_for_application
    show_access_info
    
    print_success "Setup completed successfully! Enjoy using ABUSLEMAN POS System!"
}

# Run main function
main "$@"
