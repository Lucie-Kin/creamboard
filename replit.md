# Miko Factory Dashboard - Unilever

## Overview

The Miko Factory Dashboard is an ice cream production monitoring and quality control system designed for Unilever's manufacturing facilities. The application provides dual-context interfaces optimized for different user roles: a desktop-oriented Manager Dashboard for production oversight and analytics, and a mobile-optimized Operator Dashboard for floor-level workers.

The system uses a traffic light status system (green/yellow/red) for immediate status recognition across production stations, enabling quick decision-making and issue identification throughout the manufacturing process.

**Data Architecture:** Migrated from PostgreSQL to Pinata Cloud (IPFS) storage using Solana token metadata format with chained references. All mock data removed - production data loaded from user's Pinata tokens.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (replacing React Router)
- Component-based architecture with clear separation between pages and reusable components

**UI Component System:**
- shadcn/ui component library (New York style) with Radix UI primitives
- Tailwind CSS for styling with custom design tokens matching Unilever brand guidelines
- Custom color system based on HSL values for consistent theming
- Responsive design with mobile-first considerations for operator interfaces

**State Management:**
- TanStack Query (React Query) for server state management and caching
- Local React state for UI-specific interactions
- Mock data generation utilities (`mockData.ts`) simulating production batches and station activity

**Key Design Decisions:**
- Dual-mode interface (Manager vs Operator) addresses distinct user needs and device contexts
- Traffic light status system provides universal, language-independent status communication
- Component examples directory for isolated development and testing
- Path aliases (`@/`, `@shared/`, `@assets/`) for clean import statements

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for API endpoints
- HTTP server creation via Node's native `http` module
- Session-based architecture preparation (connect-pg-simple dependency present)

**Development Setup:**
- Vite middleware integration for HMR in development
- Custom logging middleware for API request tracking
- Raw body capture for webhook/signature verification scenarios

**Data Layer:**
- Pinata IPFS integration via `PinataService` for fetching Solana token metadata
- In-memory storage (`MemStorage`) caches Pinata data for performance
- Storage interface (`IStorage`) provides CRUD operations over Pinata-sourced data
- NO MOCK DATA - all data must be loaded from user's Pinata tokens

**Current State:**
- Production flow configuration endpoint (`/api/config/production-flow`)
- Station management endpoints (`/api/stations`)
- Batch loading from Pinata tokens (`/api/batches/load`)
- Alert/ticket management endpoints
- Operator QR code authentication endpoints
- Frontend uses React Query to fetch from Pinata-backed APIs

### Database Schema Design

**ORM & Migration Strategy:**
- Drizzle ORM configured for PostgreSQL (@neondatabase/serverless)
- Schema-first approach with TypeScript definitions in `shared/schema.ts`
- Zod integration for runtime validation via drizzle-zod
- Migration files configured to output to `./migrations` directory

**Core Schema Entities:**

1. **Factory Stations** - Physical production line locations
   - Supports 10 station types (arrival dock, storage tank, laboratory, mixing room, heating room, cooling room, packaging, waste management, storage, delivery dock)
   - Position tracking (X/Y coordinates) for floor plan visualization
   - UUID primary keys with PostgreSQL's `gen_random_uuid()`

2. **Operators** - Factory floor workers
   - QR code-based authentication system
   - Role-based access tied to specific stations
   - Unique QR code constraint for security

**Schema Rationale:**
- Separation of station metadata from real-time production data enables flexible scaling
- QR code authentication provides fast, touchless operator identification suitable for factory environments
- Enum-based station types ensure data consistency while remaining extensible

### External Dependencies

**UI & Interaction Libraries:**
- Radix UI primitives for accessible, unstyled component foundations
- react-hook-form with @hookform/resolvers for form validation
- date-fns for date manipulation and formatting
- html5-qrcode for camera-based QR scanning (operator authentication)
- react-draggable for interactive floor plan manipulation
- embla-carousel-react for touch-friendly carousels

**Development Tools:**
- Replit-specific plugins (vite-plugin-runtime-error-modal, cartographer, dev-banner)
- tsx for TypeScript execution in development
- esbuild for production server bundling

**Styling & Design:**
- class-variance-authority for variant-based component styling
- clsx + tailwind-merge for conditional className composition
- Inter font family (Google Fonts) for professional typography

**Database & Backend:**
- @neondatabase/serverless for PostgreSQL connection
- drizzle-orm for type-safe database queries
- connect-pg-simple for PostgreSQL session storage (prepared for future auth implementation)

**Notable Integrations:**
- QR code scanning for operator authentication
- Camera access for self-diagnosis photo capture
- Real-time production monitoring foundation (ready for WebSocket integration)