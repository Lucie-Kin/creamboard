# Pinata Integration Guide - Miko Factory Dashboard

This dashboard now uses **Pinata Cloud** (IPFS) for data storage instead of PostgreSQL. All data is stored as Solana token metadata JSON files with chained references.

## 📋 Overview

**What Changed:**
- ❌ NO PostgreSQL database
- ❌ NO mock data generation
- ✅ Data loaded from Pinata IPFS
- ✅ Solana token metadata format
- ✅ Chained JSON structure with `prev` field
- ✅ Configurable production flow

## 🔗 Data Structure

### Solana Token Metadata Format

Your data should be stored on Pinata as JSON files following this structure:

```json
{
  "name": "Station Name",
  "symbol": "STATION_ID",
  "description": "Station description",
  "seller_fee_basis_points": 500,
  "image": "https://gateway.pinata.cloud/ipfs/YOUR_IMAGE_CID",
  "attributes": [
    {
      "trait_type": "type",
      "value": "mixing_room"
    },
    {
      "trait_type": "order",
      "value": 4
    },
    {
      "trait_type": "enabled",
      "value": true
    },
    {
      "trait_type": "nextStation",
      "value": "NEXT_STATION_ID"
    }
  ],
  "properties": {
    "category": "station",
    "files": []
  },
  "creators": [
    {
      "address": "YOUR_SOLANA_ADDRESS",
      "verified": true,
      "share": 100
    }
  ],
  "prev": "PREVIOUS_TOKEN_CID"
}
```

### Station Configuration Attributes

For **station** tokens, include these attributes:

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | ✅ | Station type: `arrival_dock`, `storage_tank`, `laboratory`, `mixing_room`, `heating_room`, `cooling_room`, `packaging`, `waste_management`, `storage`, `delivery_dock` |
| `order` | number | ✅ | Position in production flow (1, 2, 3, ...) |
| `enabled` | boolean | ❌ | Whether station is active (default: true) |
| `nextStation` | string | ❌ | ID of next station in flow |
| `avgProcessingTime` | number | ❌ | Average processing time in seconds |

**Example Station Token:**

```json
{
  "name": "Mixing Room",
  "symbol": "MIX01",
  "description": "Ice cream mixing station",
  "image": "https://gateway.pinata.cloud/ipfs/bafkrei...",
  "attributes": [
    { "trait_type": "type", "value": "mixing_room" },
    { "trait_type": "order", "value": 4 },
    { "trait_type": "enabled", "value": true },
    { "trait_type": "nextStation", "value": "HEAT01" },
    { "trait_type": "avgProcessingTime", "value": 240 }
  ],
  "properties": {
    "category": "station",
    "files": []
  },
  "creators": [{
    "address": "5BLB4bV8aL8h7cyRaUWEu6x4FLP4XGCBJ6DSYrXjNZXM",
    "verified": true,
    "share": 100
  }],
  "prev": "DOCK01"
}
```

### Batch/Production Data Attributes

For **batch** tokens, include these attributes:

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `batchNumber` | string | ✅ | Unique batch identifier (e.g., "MK1001") |
| `productName` | string | ❌ | Product being produced |
| `currentStation` | string | ❌ | Current station ID |
| `status` | string | ❌ | Traffic light status: `green`, `yellow`, `red` |

**Example Batch Token:**

```json
{
  "name": "Vanilla Classic Batch 1001",
  "symbol": "MK1001",
  "description": "Production batch for Vanilla Classic ice cream",
  "image": "https://gateway.pinata.cloud/ipfs/bafkrei...",
  "attributes": [
    { "trait_type": "batchNumber", "value": "MK1001" },
    { "trait_type": "productName", "value": "Vanilla Classic" },
    { "trait_type": "currentStation", "value": "MIX01" },
    { "trait_type": "status", "value": "green" }
  ],
  "properties": {
    "category": "batch",
    "files": []
  },
  "creators": [{
    "address": "YOUR_SOLANA_ADDRESS",
    "verified": true,
    "share": 100
  }],
  "prev": "PREVIOUS_BATCH_TOKEN_CID"
}
```

## 🚀 Setting Up Your Production Flow

### Step 1: Upload Station Tokens to Pinata

1. Create JSON files for each station in your production flow
2. Upload them to Pinata in order (first station first)
3. Each token's `prev` field points to the previous station's CID

### Step 2: Get the Chain Head CID

After uploading all stations, you'll have a CID for the **last** station in the chain. This is your "chain head".

### Step 3: Configure the Dashboard

Use the API to load your production flow:

```bash
curl -X POST http://localhost:3001/api/config/production-flow \
  -H "Content-Type: application/json" \
  -d '{
    "tokenCid": "YOUR_CHAIN_HEAD_CID"
  }'
```

The backend will:
1. Fetch the token at the CID
2. Follow the `prev` chain to get all stations
3. Configure the production flow in order
4. Only show **enabled** stations

### Step 4: Verify the Configuration

```bash
curl http://localhost:3001/api/config/production-flow
```

This returns your configured production flow with all stations in order.

## 📊 Loading Batch Data

### Load a Single Batch

```bash
curl -X POST http://localhost:3001/api/batches/load \
  -H "Content-Type: application/json" \
  -d '{
    "tokenCid": "YOUR_BATCH_TOKEN_CID"
  }'
```

### Get All Batches

```bash
curl http://localhost:3001/api/batches
```

## 🔧 API Endpoints

### Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/config/production-flow` | Load production flow from Pinata |
| `GET` | `/api/config/production-flow` | Get current production flow |

### Stations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stations` | Get all enabled stations in flow order |
| `GET` | `/api/stations/:id` | Get single station |

### Batches

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/batches/load` | Load batch from Pinata token |
| `GET` | `/api/batches` | Get all batches |
| `GET` | `/api/batches/:id` | Get single batch |
| `PATCH` | `/api/batches/:id` | Update batch data |

### Alerts/Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/alerts` | Get all alerts |
| `GET` | `/api/alerts/unacknowledged` | Get unacknowledged alerts |
| `POST` | `/api/alerts` | Create new alert |
| `POST` | `/api/alerts/:id/acknowledge` | Acknowledge alert |

### Operators

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/operators/scan` | Scan operator QR code |
| `POST` | `/api/operators` | Add new operator |

## 🎯 Production Flow Example

### Example: 3-Station Flow

**Station 1 - Arrival Dock** (CID: `bafkrei1111...`)
```json
{
  "symbol": "DOCK01",
  "attributes": [
    { "trait_type": "type", "value": "arrival_dock" },
    { "trait_type": "order", "value": 1 },
    { "trait_type": "nextStation", "value": "MIX01" }
  ],
  "prev": null
}
```

**Station 2 - Mixing Room** (CID: `bafkrei2222...`)
```json
{
  "symbol": "MIX01",
  "attributes": [
    { "trait_type": "type", "value": "mixing_room" },
    { "trait_type": "order", "value": 2 },
    { "trait_type": "nextStation", "value": "PACK01" }
  ],
  "prev": "bafkrei1111..."
}
```

**Station 3 - Packaging** (CID: `bafkrei3333...`)
```json
{
  "symbol": "PACK01",
  "attributes": [
    { "trait_type": "type", "value": "packaging" },
    { "trait_type": "order", "value": 3 }
  ],
  "prev": "bafkrei2222..."
}
```

**Configure with the last CID:**
```bash
curl -X POST http://localhost:3001/api/config/production-flow \
  -d '{"tokenCid": "bafkrei3333..."}'
```

The dashboard will now show only these 3 stations in this exact order!

## 🌐 Environment Variables

Add to `backend/.env`:

```env
# Pinata Gateway URL
PINATA_GATEWAY_URL=https://gateway.pinata.cloud

# Optional: Pinata API credentials (if you need to upload via API)
PINATA_API_KEY=your-pinata-api-key
PINATA_API_SECRET=your-pinata-api-secret
```

## 💡 Best Practices

1. **Chain Structure**: Always link stations with `prev` field for proper ordering
2. **Unique IDs**: Use unique `symbol` values for each station/batch
3. **Order Numbers**: Use sequential order numbers (1, 2, 3, ...) 
4. **Enabled Flag**: Set `enabled: false` to temporarily disable stations without removing them
5. **Next Station**: Use `nextStation` attribute to explicitly define flow
6. **Testing**: Test with a small flow first (2-3 stations) before full deployment

## 🔍 Troubleshooting

### No Stations Showing

- Check that your token chain is properly linked with `prev` fields
- Verify the `type` attribute matches one of the valid station types
- Ensure `order` attribute is a number

### Stations Out of Order

- Check the `order` attribute values
- Verify the `prev` chain follows the correct sequence

### Token Not Found

- Verify the CID is correct
- Check that the token is uploaded to Pinata
- Ensure `PINATA_GATEWAY_URL` is correct in `.env`

## 📚 Next Steps

1. Create your station tokens with proper attributes
2. Upload them to Pinata
3. Configure your production flow via the API
4. Load batch data as needed
5. Dashboard will automatically show only your configured stations in order!

---

**Need Help?** Check the `/shared/pinata-schema.ts` file for TypeScript types and validation schemas.
