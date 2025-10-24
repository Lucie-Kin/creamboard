# Extended Supply Chain Model - Miko Factory Dashboard

## Overview
The Miko Factory Dashboard now supports a **complete end-to-end supply chain visualization**, extending beyond internal factory stations to include:

```
PROVIDERS → ARRIVAL DOCK → [PRODUCTION STATIONS] → DELIVERY DOCK → TRANSPORTERS → DISTRIBUTORS
```

---

## 🔗 Supply Chain Flow

### Complete Production Journey

```
┌─────────────┐
│  Providers  │ (Farms, Suppliers)
│  Deliveries │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Arrival Dock│ (Quality checks, receiving)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│Storage Tanks│ (Refrigerated storage)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Lab / R&D  │ (Quality testing)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│Mixing Room  │ (Ingredient mixing)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│Heating Room │ (Pasteurization)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│Cooling Room │ (Temperature control)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Packaging  │ (Product packaging)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│Cold Storage │ (Final storage)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│Delivery Dock│ (Loading for transport)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│Transporters │ (Refrigerated logistics)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│Distributors │ (Supermarkets, Retailers)
└─────────────┘
```

---

## 📊 Data Structures by Entity

### 1. **Providers (Farms/Suppliers)**

**Purpose**: Source of raw materials (milk, sugar, flavorings)

**Data Structure**:
```json
{
  "providerId": "PROV_FARM_001",
  "name": "DairyFarm MontBlanc",
  "address": "Chemin des Prés, 74120 Megève, France",
  "owner": "Jean-Luc Dupont",
  "type": "milk_supplier",
  "productionCapacity": "12000L/day",
  "distanceKm": 42,
  "certifications": ["BIO-FR-09", "ISO22000"],
  "conditions": {
    "lastAudit": "2025-09-15",
    "score": 95
  },
  "status": "verified"
}
```

**Key Fields**:
- `providerId`: Unique identifier
- `type`: milk_supplier, sugar_supplier, flavoring_supplier, etc.
- `certifications`: Quality certifications (organic, ISO, etc.)
- `status`: verified | pending | suspended

**Where Used**:
- Arrival Dock station (tracks deliveries from providers)
- Manager Dashboard > Supply Chain view
- Focus Panel: Provider details and delivery history

---

### 2. **Arrival Dock Station**

**Purpose**: Receiving station for all incoming materials

**Data Structure**:
```json
{
  "stationId": "ARRIVAL_DOCK_01",
  "name": "Arrival Dock Station",
  "data": {
    "providerDeliveries": [
      {
        "providerId": "PROV_FARM_001",
        "material": "Whole Milk",
        "quantity": "2500L",
        "temperature": "4°C",
        "arrivalTime": "2025-10-23T08:20:00Z",
        "condition": "OK",
        "deliveryNoteId": "DLV-001-2025"
      }
    ],
    "operatorId": "OPR_JEAN_01",
    "qualityChecks": ["temperature", "sanitation", "weight"],
    "incomingProviders": 3,
    "timestamp": "2025-10-23T09:10:00Z",
    "status": "green"
  }
}
```

**Key Fields**:
- `providerDeliveries`: Array of incoming deliveries today
- `qualityChecks`: Types of checks performed
- `status`: Traffic light status (green/yellow/red)

**Where Used**:
- Production Timeline (first internal station)
- Focus Panel: Delivery details, quality check results
- Manager Dashboard: Today's deliveries

---

### 3. **Storage Tanks Station**

**Purpose**: Refrigerated storage of milk and base ingredients

**Data Structure**:
```json
{
  "stationId": "STORAGE_TANKS_01",
  "data": {
    "tanks": [
      {
        "tankId": "T1",
        "temp": "3.9°C",
        "fillLevel": "85%",
        "lastCleaned": "2025-10-22T12:00:00Z"
      },
      {
        "tankId": "T2",
        "temp": "4.1°C",
        "fillLevel": "40%",
        "lastCleaned": "2025-10-21T10:00:00Z"
      }
    ],
    "operatorId": "OPR_LISA_02",
    "alerts": ["Tank 2 cleaning overdue by 1 day"],
    "capacity": "5000L",
    "temperatureSetpoint": "4°C",
    "status": "yellow"
  }
}
```

**Key Fields**:
- `tanks`: Array of individual tank status
- `alerts`: Maintenance or temperature alerts
- `status`: Overall station status

**Where Used**:
- Production Timeline
- Focus Panel: Tank-by-tank view, temperature monitoring
- Alerts Dashboard: Overdue cleaning warnings

---

### 4. **Lab / R&D Station**

**Purpose**: Quality testing and formulation adjustments

**Data Structure**:
```json
{
  "stationId": "LAB_RD_01",
  "data": {
    "samples": [
      {
        "batch": "BATCH-001",
        "pH": 6.8,
        "microbial": "within limit",
        "viscosity": "normal"
      },
      {
        "batch": "BATCH-002",
        "pH": 6.5,
        "microbial": "alert",
        "viscosity": "low"
      }
    ],
    "analyst": "OPR_MAYA_03",
    "testsPerformed": ["pH", "viscosity", "microbial_count"],
    "status": "yellow"
  }
}
```

**Key Fields**:
- `samples`: Test results for batches
- `testsPerformed`: Types of quality tests
- `status`: Yellow if any batch has alerts

**Where Used**:
- Production Timeline
- Focus Panel: Sample test results, analyst info
- Quality Control Dashboard

---

### 5. **Mixing Room Station**

**Purpose**: Blending ingredients to create ice cream base

**Data Structure**:
```json
{
  "stationId": "MIX_ROOM_01",
  "data": {
    "currentBatch": "BATCH-001",
    "mixingSpeedRPM": 1200,
    "durationMinutes": 30,
    "temperature": "25°C",
    "operatorId": "OPR_MATT_04",
    "ingredients": [
      {"name": "Milk", "quantity": "200L"},
      {"name": "Sugar", "quantity": "25kg"},
      {"name": "Vanilla Flavor", "quantity": "5L"}
    ],
    "status": "green"
  }
}
```

**Key Fields**:
- `ingredients`: Recipe components and quantities
- `mixingSpeedRPM`: Equipment parameter
- `currentBatch`: Active batch ID

**Where Used**:
- Production Timeline
- Focus Panel: Recipe view, mixing parameters
- Batch Traceability

---

### 6. **Heating Room Station**

**Purpose**: Pasteurization process (kill bacteria)

**Data Structure**:
```json
{
  "stationId": "HEAT_ROOM_01",
  "data": {
    "batchId": "BATCH-001",
    "actualTemp": "84.7°C",
    "holdTime": "20min",
    "deviation": "none",
    "temperatureSetpoint": "85°C",
    "duration": "20min",
    "status": "green"
  }
}
```

**Key Fields**:
- `actualTemp`: Current measured temperature
- `deviation`: Any deviation from setpoint
- `holdTime`: Duration at target temperature

**Where Used**:
- Production Timeline
- Focus Panel: Temperature chart, compliance view
- Quality Assurance Reports

---

### 7. **Cooling Room Station**

**Purpose**: Rapid cooling after pasteurization

**Data Structure**:
```json
{
  "stationId": "COOL_ROOM_01",
  "data": {
    "batchId": "BATCH-001",
    "coolStart": "2025-10-23T11:00:00Z",
    "coolEnd": "2025-10-23T11:45:00Z",
    "actualTemp": "3.8°C",
    "temperatureSetpoint": "4°C",
    "status": "green"
  }
}
```

**Key Fields**:
- `coolStart/coolEnd`: Cooling duration
- `actualTemp`: Current batch temperature

**Where Used**:
- Production Timeline
- Focus Panel: Cooling curve visualization
- Process Monitoring

---

### 8. **Packaging Station**

**Purpose**: Product packaging and labeling

**Data Structure**:
```json
{
  "stationId": "PACKAGING_01",
  "data": {
    "batchId": "BATCH-001",
    "unitsProduced": 450,
    "defectiveUnits": 5,
    "machineId": "PKG-LINE-3",
    "operatorId": "OPR_SARA_06",
    "labels": ["Vanilla 500ml", "Expiry: 2025-12-10"],
    "status": "green"
  }
}
```

**Key Fields**:
- `unitsProduced`: Total packaged units
- `defectiveUnits`: Quality rejects
- `labels`: Product labeling info

**Where Used**:
- Production Timeline (this determines productsCompleted)
- Focus Panel: Packaging efficiency, defect rate
- Production Reports

---

### 9. **Cold Storage (Final) Station**

**Purpose**: Frozen storage before distribution

**Data Structure**:
```json
{
  "stationId": "STORAGE_FINAL_01",
  "data": {
    "batchId": "BATCH-001",
    "freezerLocation": "Zone A / Shelf 3",
    "temperature": "-19.7°C",
    "durationStoredHours": 36,
    "temperatureSetpoint": "-20°C",
    "status": "green"
  }
}
```

**Key Fields**:
- `freezerLocation`: Physical storage location
- `durationStoredHours`: How long stored
- `temperature`: Cold chain monitoring

**Where Used**:
- Production Timeline
- Focus Panel: Storage location map
- Inventory Dashboard

---

### 10. **Delivery Dock Station**

**Purpose**: Loading finished products for transport

**Data Structure**:
```json
{
  "stationId": "DELIVERY_DOCK_01",
  "data": {
    "batchId": "BATCH-001",
    "transporterId": "TRANS_003",
    "loadingTime": "2025-10-24T07:30:00Z",
    "destination": "Paris Distribution Center",
    "temperatureDuringLoad": "-18.9°C",
    "status": "green"
  }
}
```

**Key Fields**:
- `transporterId`: Link to transporter entity
- `destination`: Delivery endpoint
- `temperatureDuringLoad`: Cold chain continuity

**Where Used**:
- Production Timeline (last internal station)
- Focus Panel: Loading schedule, transporter details
- Dispatch Dashboard

---

### 11. **Transporters**

**Purpose**: Logistics companies moving finished products

**Data Structure**:
```json
{
  "transporterId": "TRANS_003",
  "company": "FroidLogix Transport",
  "driver": {
    "name": "Paul Martin",
    "license": "BTR-9483",
    "rating": 4.8
  },
  "vehicle": {
    "plate": "AB-125-CD",
    "refrigerated": true
  },
  "destination": "Paris Distribution Center",
  "routeDistanceKm": 550,
  "hoursDriven": 7.2,
  "temperatureLog": ["-19.0", "-18.8", "-19.1", "-18.9"],
  "status": "en route"
}
```

**Key Fields**:
- `temperatureLog`: Temperature monitoring during transit
- `driver`: Driver info and rating
- `status`: pending | en route | delivered | delayed

**Where Used**:
- Extended Production Timeline (after delivery dock)
- Logistics Dashboard
- Real-time Tracking Map (future)

---

### 12. **Distributors (Resellers)**

**Purpose**: Final distribution points (supermarkets, retailers)

**Data Structure**:
```json
{
  "distributorId": "DIST_CARREFOUR_01",
  "name": "Carrefour Paris 15e",
  "location": "15 Rue de Vaugirard, 75015 Paris",
  "type": "supermarket",
  "capacity": "500 units/day",
  "contactPerson": "Marie Dubois",
  "receivedBatches": ["BATCH-001", "BATCH-003"],
  "status": "active"
}
```

**Key Fields**:
- `type`: supermarket | convenience_store | restaurant | wholesaler
- `receivedBatches`: Historical batch deliveries
- `status`: active | inactive | pending

**Where Used**:
- Extended Production Timeline (final destination)
- Distribution Network Map
- Sales Analytics Dashboard

---

## 🎯 Where Each Data Type Is Used

### Production Timeline Module
**Shows**: Complete journey from provider to distributor
- Each batch row extends beyond internal stations
- External entities shown as additional columns
- Color coding shows status at each stage

### Station Focus Panel
**Shows**: Deep dive into selected station
- All station-specific data displayed
- Related entities (providers, operators, transporters) linked
- Real-time metrics and alerts

### Manager Dashboard
**Different views show different data**:
- **Supply Chain View**: Providers → Arrival Dock connections
- **Production View**: Internal stations only
- **Distribution View**: Delivery Dock → Transporters → Distributors

---

## 📥 How to Input This Data

### Method 1: Pinata Tokens (Current)
Each entity is stored as a Pinata JSON file with your structure

### Method 2: Manager UI (Future)
Forms to add/edit:
- Providers
- Transporters  
- Distributors
- Station data

### Method 3: API Integration (Future)
Direct API endpoints:
```bash
POST /api/providers
POST /api/transporters
POST /api/distributors
```

---

## 🔄 Data Relationships

```
Provider ──delivers to──> Arrival Dock
Arrival Dock ──feeds into──> Storage Tanks
...
Delivery Dock ──assigns to──> Transporter
Transporter ──delivers to──> Distributor
Distributor ──sells──> End Customer
```

All entities are **chained** via Pinata's `prev` field for complete traceability.

---

## 📚 Related Files

- **Schema**: `shared/pinata-schema.ts`
- **Timeline Component**: `frontend/src/components/ProductionTimeline.tsx`
- **Focus Panel**: `frontend/src/components/StationFocusPanel.tsx`
- **API Endpoints**: `backend/src/routes.ts`
- **This Guide**: `EXTENDED_SUPPLY_CHAIN_GUIDE.md`
