.PHONY: help install dev build start stop clean docker-build docker-up docker-down docker-logs

help:
	@echo "Miko Factory Dashboard - Make Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install       - Install all dependencies (backend + frontend)"
	@echo "  make dev           - Run development servers (backend + frontend)"
	@echo "  make dev-backend   - Run backend development server only"
	@echo "  make dev-frontend  - Run frontend development server only"
	@echo ""
	@echo "Production:"
	@echo "  make build         - Build both backend and frontend for production"
	@echo "  make start         - Start production servers"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build  - Build Docker images"
	@echo "  make docker-up     - Start Docker containers"
	@echo "  make docker-down   - Stop Docker containers"
	@echo "  make docker-logs   - View Docker logs"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean         - Clean node_modules and build artifacts"

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✓ All dependencies installed"

# Development mode
dev:
	@echo "Starting development servers..."
	@make -j2 dev-backend dev-frontend

dev-backend:
	@echo "Starting backend on port 3001..."
	cd backend && npm run dev

dev-frontend:
	@echo "Starting frontend on port 5173..."
	cd frontend && npm run dev

# Build for production
build:
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "✓ Build complete"

# Start production servers
start:
	@echo "Starting production servers..."
	@make -j2 start-backend start-frontend

start-backend:
	cd backend && npm start

start-frontend:
	cd frontend && npm run preview

# Docker commands
docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "✓ Containers started"
	@echo "  Frontend: http://localhost:8080"
	@echo "  Backend:  http://localhost:3001"

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down --rmi local

docker-logs:
	docker-compose logs -f

# Clean
clean:
	@echo "Cleaning build artifacts and dependencies..."
	rm -rf backend/node_modules backend/dist
	rm -rf frontend/node_modules frontend/dist
	@echo "✓ Clean complete"
