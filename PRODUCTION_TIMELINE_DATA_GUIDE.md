# Production Timeline - Data Structure Guide

## Overview
The **Production Timeline** is a horizontal GitHub-style visualization showing batch progress through your factory's production stations. Each batch is a row, each station is a column with 9 squares representing product completion (0-900 products per station).

---

## 📊 Data Required by Production Timeline

### Module Inputs

#### **1. Batches Data** (`BatchData[]`)
The timeline displays one row per batch. Each batch contains:

```typescript
{
  id: "BATCH_001",                    // Unique batch identifier
  batchNumber: "BATCH-001",           // Human-readable batch number
  productName: "Vanilla Ice Cream",   // Product being manufactured
  currentStation: "mixing room",      // Current station (lowercase)
  status: "green",                    // Traffic light: "green" | "yellow" | "red"
  timestamp: "2025-10-24T10:30:00Z",  // ISO 8601 datetime
  productsInBatch: 450,               // Total products in this batch
  productsCompleted: 225,             // Products completed so far
}
```

**Where it comes from:**
- **Pinata Cloud (IPFS)** via `/api/batches` endpoint
- Each batch is stored as a Solana token with metadata attributes
- Backend fetches from Pinata using `PinataService`

#### **2. Station Sequence** (`string[]` - Optional)
The order of stations in the timeline (left to right):

```typescript
[
  "arrival dock",
  "storage tanks",
  "lab/R&D",
  "mixing room",
  "heating room",
  "cooling room",
  "packaging",
  "storage",
  "delivery dock"
]
```

**Where it comes from:**
- **Production Flow Configuration** from `/api/config/production-flow`
- Derived from Pinata token chain (linked stations via `nextStation` attribute)
- Falls back to default order if not configured

---

## 🎨 Visual Representation

### GitHub-Style Grid

```
Station:      Arrival  Storage  Lab  Mixing  Heating  Cooling  Packaging  Storage  Delivery
Batch 001:    ■■■■■■■■■ ■■■■■■■■■ ■■■■ □□□□□ □□□□□□□□□ □□□□□□□□□ □□□□□□□□□ □□□□□□□□□ □□□□□□□□□
Batch 002:    ■■■■■■■■■ ■■■■■□□□□ □□□□ □□□□□ □□□□□□□□□ □□□□□□□□□ □□□□□□□□□ □□□□□□□□□ □□□□□□□□□
                          ↑
                     (Cursor position - click station name to focus)
```

- **■ (Filled squares)**: Products completed at this station
- **□ (Empty squares)**: Products not yet completed
- **9 squares per station**: Each represents 100 products (900 max)
- **Color coding**: Green (ok), Yellow (warning), Red (issue)

---

## 📥 Where Do You Input Data?

### Current Implementation (Pinata Cloud)

**You create Pinata tokens with these attributes:**

#### **Batch Token Example:**
```json
{
  "name": "Production Batch 001",
  "symbol": "BATCH_001",
  "description": "Vanilla ice cream production batch",
  "image": "https://gateway.pinata.cloud/ipfs/QmXxx...",
  "attributes": [
    { "trait_type": "batchNumber", "value": "BATCH-001" },
    { "trait_type": "productName", "value": "Vanilla Ice Cream" },
    { "trait_type": "currentStation", "value": "mixing room" },
    { "trait_type": "status", "value": "green" },
    { "trait_type": "productsInBatch", "value": 450 },
    { "trait_type": "productsCompleted", "value": 225 }
  ],
  "properties": {
    "category": "batch",
    "files": []
  },
  "prev": "PREVIOUS_TOKEN_CID"  // Chain reference
}
```

#### **Station Configuration Token Example:**
```json
{
  "name": "Mixing Room Station",
  "symbol": "MIX_ROOM",
  "description": "Ice cream mixing station",
  "image": "https://gateway.pinata.cloud/ipfs/QmYyy...",
  "attributes": [
    { "trait_type": "type", "value": "mixing_room" },
    { "trait_type": "order", "value": 4 },
    { "trait_type": "enabled", "value": true },
    { "trait_type": "nextStation", "value": "HEAT_ROOM" }  // Links to next station
  ],
  "properties": {
    "category": "station",
    "files": []
  },
  "prev": "STORAGE_TANK_CID"  // Previous station in chain
}
```

### Input Methods

1. **Via Pinata Dashboard** (Manual)
   - Upload JSON metadata files to Pinata
   - Get CID (Content Identifier)
   - Load into app via `/api/batches/load` endpoint

2. **Via API** (Programmatic)
   ```bash
   POST /api/batches/load
   Body: { "tokenCid": "QmXxxxxxxxxxxxxxxx" }
   ```

3. **Via Frontend** (Future Enhancement)
   - Manager dashboard could have "Load Batch" button
   - Enter Pinata CID
   - System fetches and displays

---

## 🔄 Data Flow Diagram

```
┌─────────────────┐
│  Pinata Cloud   │ (Your tokens stored here)
│    (IPFS)       │
└────────┬────────┘
         │
         │ 1. Fetch token by CID
         ↓
┌─────────────────┐
│ Backend API     │
│ PinataService   │ 2. Parse metadata → BatchData
└────────┬────────┘
         │
         │ 3. Store in MemStorage cache
         ↓
┌─────────────────┐
│  GET /api/      │
│    batches      │ 4. Return to frontend
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Production      │
│   Timeline      │ 5. Render GitHub-style grid
└─────────────────┘
```

---

## 🎯 What Each Square Represents

### Progress Calculation

Each station has **9 squares** representing 100 products each:

| Square | Products Range | Example (450 total, 225 completed at "mixing room") |
|--------|----------------|-----------------------------------------------------|
| 1      | 0-100         | ■ Filled (completed)                                |
| 2      | 100-200       | ■ Filled                                            |
| 3      | 200-300       | □ Empty (225/300, partially filled logic needed)    |
| 4      | 300-400       | □ Empty                                             |
| 5      | 400-500       | □ Empty                                             |
| 6      | 500-600       | □ Empty                                             |
| 7      | 600-700       | □ Empty                                             |
| 8      | 700-800       | □ Empty                                             |
| 9      | 800-900       | □ Empty                                             |

**Current Logic:**
- Past stations (before currentStation): All 9 squares filled
- Current station: ~5 squares filled (approximate, needs actual calculation)
- Future stations: All squares empty

**Improved Logic (TODO):**
```typescript
const squaresFilled = Math.floor(productsCompleted / PRODUCTS_PER_SQUARE);
// If productsCompleted = 225, then 225/100 = 2.25 → 2 full squares
```

---

## 📝 Example Dataset

Here's what a complete dataset looks like for the timeline:

### Batches
```typescript
const batches = [
  {
    id: "BATCH_001",
    batchNumber: "BATCH-001",
    productName: "Vanilla Ice Cream",
    currentStation: "mixing room",
    status: "green",
    timestamp: "2025-10-24T10:00:00Z",
    productsInBatch: 900,
    productsCompleted: 450,
  },
  {
    id: "BATCH_002",
    batchNumber: "BATCH-002",
    productName: "Chocolate Ice Cream",
    currentStation: "storage tanks",
    status: "yellow",
    timestamp: "2025-10-24T09:30:00Z",
    productsInBatch: 600,
    productsCompleted: 300,
  },
  {
    id: "BATCH_003",
    batchNumber: "BATCH-003",
    productName: "Strawberry Ice Cream",
    currentStation: "packaging",
    status: "green",
    timestamp: "2025-10-24T08:00:00Z",
    productsInBatch: 750,
    productsCompleted: 700,
  }
];
```

### Station Sequence
```typescript
const stationSequence = [
  "arrival dock",
  "storage tanks",
  "lab/R&D",
  "mixing room",
  "heating room",
  "cooling room",
  "packaging",
  "storage",
  "delivery dock"
];
```

---

## 🚀 How to Test with Your Data

### Step 1: Create Pinata Tokens
1. Go to Pinata Dashboard
2. Upload JSON files with batch metadata
3. Note the CID for each token

### Step 2: Load into Application
```bash
# Load a batch
curl -X POST http://localhost:8080/api/batches/load \
  -H "Content-Type: application/json" \
  -d '{"tokenCid": "QmYourBatchCID"}'

# Load production flow
curl -X POST http://localhost:8080/api/config/production-flow \
  -H "Content-Type: application/json" \
  -d '{"tokenCid": "QmYourStationChainStartCID"}'
```

### Step 3: View in Manager Dashboard
1. Navigate to Manager Mode
2. Click "Dashboard" tab
3. Production Timeline should display your batches

---

## 🔧 Future Enhancements

### Planned Features:
1. **Live Updates**: WebSocket connection for real-time batch progress
2. **Detailed Tooltips**: Hover over squares to see exact product counts
3. **Batch Filtering**: Filter by product, status, or date range
4. **Export Reports**: Download CSV/PDF of production timeline
5. **Manager Input Form**: Add/edit batches directly from UI (instead of only Pinata)

---

## 📚 Related Files

- **Frontend**: `frontend/src/components/ProductionTimeline.tsx`
- **Backend**: `backend/src/routes.ts` (batch endpoints)
- **Schema**: `shared/pinata-schema.ts`
- **Service**: `backend/src/services/pinata.service.ts`
- **Guide**: `PINATA_GUIDE.md` (how to create tokens)
