# Miko Factory Dashboard - Docker Setup

This project uses a **separated client-server architecture** optimized for Docker deployment.

## 📁 Project Structure

```
.
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── services/    # Pinata IPFS service
│   │   ├── index.ts     # Server entry point
│   │   ├── routes.ts    # API routes (Pinata-backed)
│   │   └── storage.ts   # Data storage layer (Pinata cache)
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # React/Vite client application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
│
├── shared/               # Shared TypeScript types (used by both backend/frontend)
│   ├── pinata-schema.ts # Pinata/Solana token metadata types
│   └── schema.ts        # Legacy database schema
│
├── docker-compose.yml    # Docker orchestration (context: root directory)
└── Makefile
```

**Note**: The Docker build context is set to the root directory (`.`) to allow both backend and frontend to access the `shared/` directory during builds.

## 🚀 Quick Start

### Option 1: Docker (Recommended for Production)

```bash
# Build and start containers
make docker-build
make docker-up

# View logs
make docker-logs

# Stop containers
make docker-down
```

Access:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### Option 2: Local Development

```bash
# Install dependencies
make install

# Run development servers (both backend and frontend)
make dev

# OR run separately:
make dev-backend   # Backend on port 3001
make dev-frontend  # Frontend on port 5173
```

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
SESSION_SECRET=your-secret-key

# Add your Solana configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=your-program-id
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3001
```

## 🔗 Integrating Your Solana Backend

### 1. Add Your Solana Files

Place your Solana program files in the `solana/` directory or `backend/` directory.

### 2. Install Solana Dependencies

```bash
cd backend
npm install @solana/web3.js @project-serum/anchor
```

### 3. Update Backend Routes

Edit `backend/src/routes.ts`:

```typescript
import { Connection, PublicKey } from "@solana/web3.js";

// In registerRoutes():
app.post("/api/solana/transaction", async (req, res) => {
  const connection = new Connection(process.env.SOLANA_RPC_URL!);
  // Your Solana logic here
});
```

### 4. Update Docker Volumes

Edit `docker-compose.yml` to mount your Solana files:

```yaml
services:
  backend:
    volumes:
      - ./solana:/app/solana:ro  # Mount Solana files
```

## 📦 Available Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make install` | Install dependencies |
| `make dev` | Run development servers |
| `make build` | Build for production |
| `make docker-build` | Build Docker images |
| `make docker-up` | Start Docker containers |
| `make docker-down` | Stop Docker containers |
| `make docker-logs` | View container logs |
| `make clean` | Remove build artifacts |

## 🏗️ Production Deployment

### Build Production Images

```bash
make docker-build
```

### Configure Environment

Create `.env` files for production:
- `backend/.env` - Backend configuration
- Update `docker-compose.yml` with production URLs

### Deploy

```bash
docker-compose -f docker-compose.yml up -d
```

## 🔍 API Endpoints

Current endpoints (customize in `backend/src/routes.ts`):

- `GET /health` - Health check
- `GET /api/batches` - Get all production batches
- `GET /api/batches/:id` - Get batch by ID
- `GET /api/tickets` - Get operator tickets/alerts
- `POST /api/tickets` - Create new ticket
- `GET /api/stations` - Get factory stations

Add your Solana endpoints as needed!

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Stop existing containers
make docker-down

# Check what's using the port
lsof -i :3001  # or :80
```

### CORS Issues

Update `CORS_ORIGIN` in `backend/.env` to match your frontend URL.

### Container Won't Start

```bash
# View detailed logs
docker-compose logs backend
docker-compose logs frontend
```

## 📚 Next Steps

1. ✅ Add your Solana program files to `solana/` directory
2. ✅ Update `backend/src/routes.ts` with your Solana integration
3. ✅ Configure environment variables in `.env` files
4. ✅ Test locally with `make dev`
5. ✅ Deploy with `make docker-up`
