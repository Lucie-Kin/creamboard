# Miko Factory Dashboard - Separated Architecture Setup

This project has been restructured into a **separated client-server architecture** optimized for Docker deployment and Solana blockchain integration.

## 🎯 What Changed

Your application now has:
- ✅ **Separate `backend/` and `frontend/` directories** - Independent services
- ✅ **Docker support** - Ready for containerized deployment  
- ✅ **CORS configured** - Backend accepts requests from frontend
- ✅ **Environment variables** - Configurable API URLs and settings
- ✅ **Makefile** - Simple commands for development and production
- ✅ **Ready for Solana** - Structure prepared for your blockchain integration

## 📁 New Project Structure

```
.
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── index.ts           # Server entry point with CORS
│   │   ├── routes.ts          # API endpoints (add your Solana routes here)
│   │   └── storage.ts         # Data storage layer
│   ├── Dockerfile             # Backend container config
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                   # Backend environment variables
│
├── frontend/                   # React/Vite client
│   ├── src/
│   │   ├── components/        # All your UI components (unchanged)
│   │   ├── lib/
│   │   │   └── queryClient.ts # Updated to use API_URL
│   │   ├── pages/             # All your pages (unchanged)
│   │   └── main.tsx
│   ├── Dockerfile             # Frontend container config
│   ├── nginx.conf             # Production web server config
│   ├── package.json
│   ├── vite.config.ts
│   └── .env                   # Frontend environment variables
│
├── shared/                     # Shared TypeScript types
│   └── schema.ts
│
├── solana/                     # Your Solana files go here
│
├── docker-compose.yml          # Orchestrate both services
├── Makefile                    # Easy development commands
└── README.docker.md            # Detailed Docker guide
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
make install
```

This installs all dependencies for both backend and frontend.

### 2. Configure Environment

The `.env` files are already created with defaults:

**Backend** (`backend/.env`):
```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
```

### 3. Run Development Servers

```bash
make dev
```

This starts:
- **Backend** on http://localhost:3001 (with API at `/api/*`)
- **Frontend** on http://localhost:5173

Or run them separately:
```bash
make dev-backend   # Backend only
make dev-frontend  # Frontend only
```

## 🐳 Docker Deployment

### Build and Run

```bash
make docker-build  # Build images
make docker-up     # Start containers
```

Access:
- **Frontend**: http://localhost:80
- **Backend**: http://localhost:3001

### Stop Containers

```bash
make docker-down
```

## 🔗 Integrating Your Solana Backend

### 1. Add Solana Dependencies

```bash
cd backend
npm install @solana/web3.js @project-serum/anchor
```

### 2. Place Your Solana Files

```
solana/
  └── your-solana-program-files-here
```

### 3. Update Backend Routes

Edit `backend/src/routes.ts`:

```typescript
import { Connection, PublicKey } from "@solana/web3.js";

export async function registerRoutes(app: Express, server: Server) {
  // Your existing routes...

  // Add Solana endpoints
  app.post("/api/solana/transaction", async (req, res) => {
    try {
      const connection = new Connection(
        process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com"
      );
      
      // Your Solana transaction logic here
      // Import and use your client.ts logic
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Transaction failed" });
    }
  });
}
```

### 4. Configure Solana Environment

Add to `backend/.env`:
```env
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=your-program-id
SOLANA_WALLET_SECRET=your-wallet-secret
```

## 📡 API Endpoints

Current endpoints in `backend/src/routes.ts`:

- `GET /health` - Health check
- `GET /api/batches` - Get all production batches
- `GET /api/batches/:id` - Get batch by ID
- `GET /api/tickets` - Get operator tickets
- `POST /api/tickets` - Create ticket
- `GET /api/stations` - Get factory stations

**Add your Solana endpoints here!**

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `make install` | Install all dependencies |
| `make dev` | Run development servers |
| `make dev-backend` | Run backend only |
| `make dev-frontend` | Run frontend only |
| `make build` | Build for production |
| `make docker-build` | Build Docker images |
| `make docker-up` | Start Docker containers |
| `make docker-down` | Stop containers |
| `make docker-logs` | View container logs |
| `make clean` | Remove build artifacts |

## 🔍 Testing the Setup

1. **Start development servers**:
   ```bash
   make dev
   ```

2. **Test backend** (in another terminal):
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok","timestamp":"..."}
   
   curl http://localhost:3001/api/batches
   # Should return mock batch data
   ```

3. **Access frontend**: http://localhost:5173
   - Should load the Miko Factory Dashboard
   - All existing functionality works the same

## 🎨 Frontend - No Changes Needed!

Your React components work exactly the same. The only change is:
- API requests now go to `http://localhost:3001` (backend)
- This is handled automatically by `queryClient.ts`

## 🐛 Troubleshooting

### CORS Errors

Make sure `CORS_ORIGIN` in `backend/.env` matches your frontend URL:
```env
CORS_ORIGIN=http://localhost:5173  # Development
CORS_ORIGIN=http://localhost:80    # Docker
```

### Backend Not Starting

Check if port 3001 is available:
```bash
lsof -i :3001
```

### Frontend Can't Connect to Backend

Verify `VITE_API_URL` in `frontend/.env`:
```env
VITE_API_URL=http://localhost:3001
```

## 📦 Production Deployment

### Build Production Bundles

```bash
make build
```

This creates:
- `backend/dist/` - Compiled backend server
- `frontend/dist/` - Static frontend assets

### Deploy with Docker

```bash
make docker-up
```

Frontend served via Nginx, backend as Node.js server.

## 🚧 Next Steps

1. ✅ Test the separated architecture works
2. ✅ Add your Solana integration to `backend/src/routes.ts`
3. ✅ Place your Solana files in `solana/` or `backend/`
4. ✅ Update environment variables with your Solana config
5. ✅ Test Solana endpoints locally
6. ✅ Deploy with Docker

## 📚 Additional Resources

- **Docker Guide**: See `README.docker.md`
- **Backend Code**: `backend/src/`
- **Frontend Code**: `frontend/src/` (unchanged from before)

## 💡 Key Benefits

- ✅ **Independent scaling** - Scale backend and frontend separately
- ✅ **Docker ready** - One command deployment
- ✅ **Solana integration** - Easy to add your blockchain logic
- ✅ **Clean separation** - Backend doesn't serve frontend files
- ✅ **Production optimized** - Nginx for static files, Node for API

---

**Need help?** Check the logs:
```bash
make docker-logs  # Docker logs
npm run dev       # Development logs
```
