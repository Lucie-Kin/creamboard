// Mock data generator for factory dashboard
// todo: replace with real backend API calls

export interface ProductionBatch {
  id: string;
  batchNumber: string;
  productName: string;
  productsInBatch: number;
  productsCompleted: number;
  currentStation: string;
  status: "green" | "yellow" | "red";
  startTime: Date;
  stationHistory: {
    station: string;
    enteredAt: Date;
    exitedAt?: Date;
    duration?: number;
    status: "green" | "yellow" | "red";
  }[];
}

export interface FactoryStation {
  id: string;
  name: string;
  type: string;
  order: number;
  avgProcessingTime: number; // in seconds
  currentBatches: string[];
}

// Factory production line configuration
export const factoryStations: FactoryStation[] = [
  { id: "s1", name: "Arrival Dock", type: "arrival_dock", order: 1, avgProcessingTime: 30, currentBatches: [] },
  { id: "s2", name: "Storage Tank 1", type: "storage_tank", order: 2, avgProcessingTime: 120, currentBatches: [] },
  { id: "s3", name: "Lab Testing", type: "laboratory", order: 3, avgProcessingTime: 180, currentBatches: [] },
  { id: "s4", name: "Mixing Room", type: "mixing_room", order: 4, avgProcessingTime: 240, currentBatches: [] },
  { id: "s5", name: "Heating Room", type: "heating_room", order: 5, avgProcessingTime: 300, currentBatches: [] },
  { id: "s6", name: "Cooling Room", type: "cooling_room", order: 6, avgProcessingTime: 600, currentBatches: [] },
  { id: "s7", name: "Quality Check", type: "laboratory", order: 7, avgProcessingTime: 120, currentBatches: [] },
  { id: "s8", name: "Packaging", type: "packaging", order: 8, avgProcessingTime: 180, currentBatches: [] },
  { id: "s9", name: "Storage", type: "storage", order: 9, avgProcessingTime: 60, currentBatches: [] },
  { id: "s10", name: "Delivery Dock", type: "delivery_dock", order: 10, avgProcessingTime: 30, currentBatches: [] },
];

const productTypes = [
  "Vanilla Classic",
  "Chocolate Delight",
  "Strawberry Dream",
  "Mint Chocolate Chip",
  "Cookies & Cream",
  "Caramel Swirl",
  "Mango Sorbet",
  "Pistachio Premium"
];

let batchCounter = 1000;
let activeBatches: ProductionBatch[] = [];

export function generateBatch(): ProductionBatch {
  const batchNumber = `MK${batchCounter++}`;
  const productsInBatch = Math.floor(Math.random() * 300) + 200; // 200-500 products per batch
  
  const batch: ProductionBatch = {
    id: `batch-${Date.now()}-${Math.random()}`,
    batchNumber,
    productName: productTypes[Math.floor(Math.random() * productTypes.length)],
    productsInBatch,
    productsCompleted: 0,
    currentStation: factoryStations[0].id,
    status: "green",
    startTime: new Date(),
    stationHistory: [{
      station: factoryStations[0].id,
      enteredAt: new Date(),
      status: "green"
    }]
  };

  return batch;
}

// Simulate batch progression through stations
export function progressBatch(batch: ProductionBatch): ProductionBatch {
  const currentStationIndex = factoryStations.findIndex(s => s.id === batch.currentStation);
  if (currentStationIndex === -1 || currentStationIndex >= factoryStations.length - 1) {
    // Batch completed
    return batch;
  }

  const currentStation = factoryStations[currentStationIndex];
  const currentHistory = batch.stationHistory[batch.stationHistory.length - 1];
  
  // Check if enough time has passed
  const timeInStation = (Date.now() - currentHistory.enteredAt.getTime()) / 1000;
  if (timeInStation < currentStation.avgProcessingTime) {
    // Still processing
    const progress = Math.min(timeInStation / currentStation.avgProcessingTime, 1);
    return {
      ...batch,
      productsCompleted: Math.floor(batch.productsInBatch * progress * (currentStationIndex + 1) / factoryStations.length)
    };
  }

  // Move to next station
  const nextStation = factoryStations[currentStationIndex + 1];
  const exitTime = new Date();
  const duration = (exitTime.getTime() - currentHistory.enteredAt.getTime()) / 1000;

  // Randomly assign status
  const statusRandom = Math.random();
  const status = statusRandom > 0.85 ? "red" : statusRandom > 0.7 ? "yellow" : "green";

  return {
    ...batch,
    currentStation: nextStation.id,
    status,
    productsCompleted: Math.floor(batch.productsInBatch * (currentStationIndex + 1) / factoryStations.length),
    stationHistory: [
      ...batch.stationHistory.slice(0, -1),
      { ...currentHistory, exitedAt: exitTime, duration, status },
      { station: nextStation.id, enteredAt: exitTime, status }
    ]
  };
}

export function getAllActiveBatches(): ProductionBatch[] {
  return activeBatches;
}

export function addBatchToProduction(): ProductionBatch {
  const batch = generateBatch();
  activeBatches.push(batch);
  return batch;
}

export function updateAllBatches(): ProductionBatch[] {
  activeBatches = activeBatches
    .map(progressBatch)
    .filter(batch => {
      // Remove completed batches after they've been in storage for a while
      if (batch.currentStation === factoryStations[factoryStations.length - 1].id) {
        const lastHistory = batch.stationHistory[batch.stationHistory.length - 1];
        const timeInFinalStation = (Date.now() - lastHistory.enteredAt.getTime()) / 1000;
        return timeInFinalStation < 300; // Keep for 5 minutes after completion
      }
      return true;
    });

  return activeBatches;
}

// Generate initial batches at different stages
export function initializeProduction(): void {
  activeBatches = [];
  
  // Create batches at various stages
  for (let i = 0; i < 15; i++) {
    const batch = generateBatch();
    const targetStation = Math.floor(Math.random() * factoryStations.length);
    
    // Fast-forward batch to target station
    batch.currentStation = factoryStations[targetStation].id;
    batch.stationHistory = [];
    
    for (let j = 0; j <= targetStation; j++) {
      const stationTime = new Date(Date.now() - (targetStation - j) * 60000); // Minutes ago
      batch.stationHistory.push({
        station: factoryStations[j].id,
        enteredAt: stationTime,
        exitedAt: j < targetStation ? new Date(stationTime.getTime() + factoryStations[j].avgProcessingTime * 1000) : undefined,
        duration: j < targetStation ? factoryStations[j].avgProcessingTime : undefined,
        status: Math.random() > 0.8 ? "yellow" : "green"
      });
    }
    
    batch.productsCompleted = Math.floor(batch.productsInBatch * targetStation / factoryStations.length);
    activeBatches.push(batch);
  }
}

// Ticket generation for operator issues
export interface Ticket {
  id: string;
  operatorName: string;
  operatorRole: string;
  station: string;
  issue: string;
  priority: "low" | "medium" | "high";
  timestamp: Date;
  status: "open" | "assigned" | "resolved";
  assignedTo?: string;
  managerResponse?: string;
}

const operatorNames = ["Jean Dupont", "Marie Claire", "Pierre Martin", "Sophie Laurent", "Lucas Bernard"];
const operatorRoles = ["Cooling Room", "Quality Control", "Packaging", "Mixing Room", "Heating Room"];
const issueTemplates = [
  "Temperature reading outside normal range",
  "Equipment vibration detected",
  "Unusual product consistency",
  "Cleaning supplies running low",
  "Minor leak detected in tank",
  "Sensor calibration needed",
  "Product color variation noticed",
  "Packaging material shortage",
];

let ticketCounter = 1;

export function generateRandomTicket(): Ticket {
  const priorityRandom = Math.random();
  const priority = priorityRandom > 0.7 ? "high" : priorityRandom > 0.4 ? "medium" : "low";
  
  return {
    id: `ticket-${ticketCounter++}`,
    operatorName: operatorNames[Math.floor(Math.random() * operatorNames.length)],
    operatorRole: operatorRoles[Math.floor(Math.random() * operatorRoles.length)],
    station: factoryStations[Math.floor(Math.random() * factoryStations.length)].name,
    issue: issueTemplates[Math.floor(Math.random() * issueTemplates.length)],
    priority,
    timestamp: new Date(),
    status: "open"
  };
}
