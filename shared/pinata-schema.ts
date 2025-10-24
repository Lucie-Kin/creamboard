import { z } from "zod";

/**
 * Pinata/IPFS-based data schema for Miko Factory Dashboard
 * Data is stored as chained JSON tokens on Solana blockchain
 */

// Solana token metadata attribute
export const attributeSchema = z.object({
  trait_type: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

// File reference in token metadata
export const fileSchema = z.object({
  uri: z.string().url(),
  type: z.string(),
});

// Token creator info
export const creatorSchema = z.object({
  address: z.string(),
  verified: z.boolean(),
  share: z.number(),
});

// Base Solana token metadata structure
export const tokenMetadataSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  description: z.string(),
  seller_fee_basis_points: z.number().optional(),
  image: z.string().url(),
  attributes: z.array(attributeSchema),
  properties: z.object({
    category: z.string(),
    files: z.array(fileSchema),
  }),
  creators: z.array(creatorSchema).optional(),
  prev: z.string().optional(), // Previous token address in chain
});

export type TokenMetadata = z.infer<typeof tokenMetadataSchema>;
export type Attribute = z.infer<typeof attributeSchema>;
export type FileReference = z.infer<typeof fileSchema>;
export type Creator = z.infer<typeof creatorSchema>;

// Factory-specific data structures built on top of token metadata

// ==================== EXTERNAL ENTITIES ====================

// Provider (Farm/Supplier) data
export const providerSchema = z.object({
  providerId: z.string(),
  name: z.string(),
  address: z.string(),
  owner: z.string().optional(),
  type: z.string(), // milk_supplier, sugar_supplier, etc.
  productionCapacity: z.string().optional(),
  distanceKm: z.number().optional(),
  certifications: z.array(z.string()).default([]),
  conditions: z.object({
    lastAudit: z.string().optional(),
    score: z.number().optional(),
  }).optional(),
  status: z.enum(["verified", "pending", "suspended"]).default("verified"),
});

export type ProviderData = z.infer<typeof providerSchema>;

// Transporter data
export const transporterSchema = z.object({
  transporterId: z.string(),
  company: z.string(),
  driver: z.object({
    name: z.string(),
    license: z.string(),
    rating: z.number().optional(),
  }).optional(),
  vehicle: z.object({
    plate: z.string(),
    refrigerated: z.boolean().default(false),
  }).optional(),
  destination: z.string(),
  routeDistanceKm: z.number().optional(),
  hoursDriven: z.number().optional(),
  temperatureLog: z.array(z.string()).default([]),
  status: z.enum(["pending", "en route", "delivered", "delayed"]).default("pending"),
});

export type TransporterData = z.infer<typeof transporterSchema>;

// Distributor/Reseller data
export const distributorSchema = z.object({
  distributorId: z.string(),
  name: z.string(),
  location: z.string(),
  type: z.enum(["supermarket", "convenience_store", "restaurant", "wholesaler"]),
  capacity: z.string().optional(),
  contactPerson: z.string().optional(),
  receivedBatches: z.array(z.string()).default([]), // Batch IDs
  status: z.enum(["active", "inactive", "pending"]).default("active"),
});

export type DistributorData = z.infer<typeof distributorSchema>;

// ==================== STATION CONFIGURATION ====================

// Station configuration from token metadata
export const stationConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    "arrival_dock",
    "storage_tank",
    "lab_rd",          // Updated from "laboratory"
    "mixing_room",
    "heating_room",
    "cooling_room",
    "packaging",
    "waste_management",
    "storage",
    "delivery_dock"
  ]),
  order: z.number(),
  enabled: z.boolean().default(true),
  nextStation: z.string().optional(), // ID of next station in flow
  avgProcessingTime: z.number().optional(), // seconds
  positionX: z.number().optional(),
  positionY: z.number().optional(),
});

export type StationConfig = z.infer<typeof stationConfigSchema>;

// ==================== DETAILED STATION DATA ====================

// Arrival Dock detailed data
export const arrivalDockDataSchema = z.object({
  providerDeliveries: z.array(z.object({
    providerId: z.string(),
    material: z.string(),
    quantity: z.string(),
    temperature: z.string().optional(),
    arrivalTime: z.string().datetime(),
    condition: z.string(),
    deliveryNoteId: z.string().optional(),
  })).default([]),
  operatorId: z.string().optional(),
  qualityChecks: z.array(z.string()).default([]),
  incomingProviders: z.number().optional(),
  timestamp: z.string().datetime().optional(),
  status: z.enum(["green", "yellow", "red"]).default("green"),
});

export type ArrivalDockData = z.infer<typeof arrivalDockDataSchema>;

// Storage Tank detailed data
export const storageTankDataSchema = z.object({
  tanks: z.array(z.object({
    tankId: z.string(),
    temp: z.string(),
    fillLevel: z.string(),
    lastCleaned: z.string().datetime(),
  })).default([]),
  operatorId: z.string().optional(),
  alerts: z.array(z.string()).default([]),
  capacity: z.string().optional(),
  temperatureSetpoint: z.string().optional(),
  status: z.enum(["green", "yellow", "red"]).default("green"),
});

export type StorageTankData = z.infer<typeof storageTankDataSchema>;

// Lab/R&D detailed data
export const labRdDataSchema = z.object({
  samples: z.array(z.object({
    batch: z.string(),
    pH: z.number().optional(),
    microbial: z.string().optional(),
    viscosity: z.string().optional(),
  })).default([]),
  analyst: z.string().optional(),
  testsPerformed: z.array(z.string()).default([]),
  status: z.enum(["green", "yellow", "red"]).default("green"),
});

export type LabRdData = z.infer<typeof labRdDataSchema>;

// Mixing Room detailed data
export const mixingRoomDataSchema = z.object({
  currentBatch: z.string().optional(),
  mixingSpeedRPM: z.number().optional(),
  durationMinutes: z.number().optional(),
  temperature: z.string().optional(),
  operatorId: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.string(),
  })).default([]),
  status: z.enum(["green", "yellow", "red"]).default("green"),
});

export type MixingRoomData = z.infer<typeof mixingRoomDataSchema>;

// Heating Room detailed data
export const heatingRoomDataSchema = z.object({
  batchId: z.string().optional(),
  actualTemp: z.string().optional(),
  holdTime: z.string().optional(),
  deviation: z.string().optional(),
  temperatureSetpoint: z.string().optional(),
  duration: z.string().optional(),
  status: z.enum(["green", "yellow", "red"]).default("green"),
});

export type HeatingRoomData = z.infer<typeof heatingRoomDataSchema>;

// Cooling Room detailed data
export const coolingRoomDataSchema = z.object({
  batchId: z.string().optional(),
  coolStart: z.string().datetime().optional(),
  coolEnd: z.string().datetime().optional(),
  actualTemp: z.string().optional(),
  temperatureSetpoint: z.string().optional(),
  status: z.enum(["green", "yellow", "red"]).default("green"),
});

export type CoolingRoomData = z.infer<typeof coolingRoomDataSchema>;

// Packaging detailed data
export const packagingDataSchema = z.object({
  batchId: z.string().optional(),
  unitsProduced: z.number().optional(),
  defectiveUnits: z.number().optional(),
  machineId: z.string().optional(),
  operatorId: z.string().optional(),
  labels: z.array(z.string()).default([]),
  status: z.enum(["green", "yellow", "red"]).default("green"),
});

export type PackagingData = z.infer<typeof packagingDataSchema>;

// Final Storage detailed data
export const storageFinalDataSchema = z.object({
  batchId: z.string().optional(),
  freezerLocation: z.string().optional(),
  temperature: z.string().optional(),
  durationStoredHours: z.number().optional(),
  temperatureSetpoint: z.string().optional(),
  status: z.enum(["green", "yellow", "red"]).default("green"),
});

export type StorageFinalData = z.infer<typeof storageFinalDataSchema>;

// Delivery Dock detailed data
export const deliveryDockDataSchema = z.object({
  batchId: z.string().optional(),
  transporterId: z.string().optional(),
  loadingTime: z.string().datetime().optional(),
  destination: z.string().optional(),
  temperatureDuringLoad: z.string().optional(),
  status: z.enum(["green", "yellow", "red"]).default("green"),
});

export type DeliveryDockData = z.infer<typeof deliveryDockDataSchema>;

// ==================== PRODUCTION BATCH ====================

// Production batch from token metadata
export const batchDataSchema = z.object({
  id: z.string(),
  batchNumber: z.string(),
  productName: z.string(),
  currentStation: z.string().optional(),
  status: z.enum(["green", "yellow", "red"]),
  timestamp: z.string().datetime(),
  productsInBatch: z.number().default(0),
  productsCompleted: z.number().default(0),
  metadata: tokenMetadataSchema.optional(), // Full token metadata
});

export type BatchData = z.infer<typeof batchDataSchema>;

// Alert/Issue from token metadata
export const alertDataSchema = z.object({
  id: z.string(),
  type: z.string(),
  message: z.string(),
  priority: z.enum(["low", "medium", "high"]),
  stationId: z.string().optional(),
  acknowledged: z.boolean().default(false),
  timestamp: z.string().datetime(),
});

export type AlertData = z.infer<typeof alertDataSchema>;

// Operator info from token metadata
export const operatorDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  qrCode: z.string(),
  role: z.string(),
  assignedStation: z.string().optional(),
});

export type OperatorData = z.infer<typeof operatorDataSchema>;

// Production flow configuration
export const productionFlowSchema = z.object({
  stations: z.array(stationConfigSchema),
  startStation: z.string(), // ID of first station
  flowOrder: z.array(z.string()), // Ordered array of station IDs
});

export type ProductionFlow = z.infer<typeof productionFlowSchema>;

// Pinata gateway configuration
export const pinataConfigSchema = z.object({
  gatewayUrl: z.string().url().default("https://gateway.pinata.cloud"),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
});

export type PinataConfig = z.infer<typeof pinataConfigSchema>;

// Helper function to extract station data from token metadata
export function tokenToStationConfig(token: TokenMetadata): StationConfig | null {
  try {
    const typeAttr = token.attributes.find(attr => attr.trait_type === "type");
    const orderAttr = token.attributes.find(attr => attr.trait_type === "order");
    const enabledAttr = token.attributes.find(attr => attr.trait_type === "enabled");
    const nextStationAttr = token.attributes.find(attr => attr.trait_type === "nextStation");
    
    if (!typeAttr || !orderAttr) return null;
    
    return {
      id: token.symbol, // Use token symbol as station ID
      name: token.name,
      type: typeAttr.value as StationConfig['type'],
      order: Number(orderAttr.value),
      enabled: enabledAttr ? Boolean(enabledAttr.value) : true,
      nextStation: nextStationAttr ? String(nextStationAttr.value) : undefined,
    };
  } catch (error) {
    return null;
  }
}

// Helper function to extract batch data from token metadata
export function tokenToBatchData(token: TokenMetadata): BatchData | null {
  try {
    const batchAttr = token.attributes.find(attr => attr.trait_type === "batchNumber");
    const productAttr = token.attributes.find(attr => attr.trait_type === "productName");
    const stationAttr = token.attributes.find(attr => attr.trait_type === "currentStation");
    const statusAttr = token.attributes.find(attr => attr.trait_type === "status");
    const productsInBatchAttr = token.attributes.find(attr => attr.trait_type === "productsInBatch");
    const productsCompletedAttr = token.attributes.find(attr => attr.trait_type === "productsCompleted");
    
    if (!batchAttr) return null;
    
    return {
      id: token.symbol,
      batchNumber: String(batchAttr.value),
      productName: productAttr ? String(productAttr.value) : token.name,
      currentStation: stationAttr ? String(stationAttr.value) : undefined,
      status: (statusAttr?.value as BatchData['status']) || "green",
      timestamp: new Date().toISOString(),
      productsInBatch: productsInBatchAttr ? Number(productsInBatchAttr.value) : 0,
      productsCompleted: productsCompletedAttr ? Number(productsCompletedAttr.value) : 0,
      metadata: token,
    };
  } catch (error) {
    return null;
  }
}

// Helper function to extract provider data from token metadata (from top-level fields)
export function tokenToProviderData(tokenData: any): ProviderData | null {
  try {
    if (!tokenData.providerId) return null;
    
    return {
      providerId: tokenData.providerId,
      name: tokenData.name || "",
      address: tokenData.address || "",
      owner: tokenData.owner,
      type: tokenData.type || "supplier",
      productionCapacity: tokenData.productionCapacity,
      distanceKm: tokenData.distanceKm,
      certifications: tokenData.certifications || [],
      conditions: tokenData.conditions,
      status: tokenData.status || "verified",
    };
  } catch (error) {
    return null;
  }
}

// Helper function to extract transporter data from token metadata (from top-level fields)
export function tokenToTransporterData(tokenData: any): TransporterData | null {
  try {
    if (!tokenData.transporterId) return null;
    
    return {
      transporterId: tokenData.transporterId,
      company: tokenData.company || "",
      driver: tokenData.driver,
      vehicle: tokenData.vehicle,
      destination: tokenData.destination || "",
      routeDistanceKm: tokenData.routeDistanceKm,
      hoursDriven: tokenData.hoursDriven,
      temperatureLog: tokenData.temperatureLog || [],
      status: tokenData.status || "pending",
    };
  } catch (error) {
    return null;
  }
}

// Helper function to extract distributor data from token metadata (from top-level fields)
export function tokenToDistributorData(tokenData: any): DistributorData | null {
  try {
    if (!tokenData.distributorId) return null;
    
    return {
      distributorId: tokenData.distributorId,
      name: tokenData.name || "",
      location: tokenData.location || "",
      type: tokenData.type || "wholesaler",
      capacity: tokenData.capacity,
      contactPerson: tokenData.contactPerson,
      receivedBatches: tokenData.receivedBatches || [],
      status: tokenData.status || "active",
    };
  } catch (error) {
    return null;
  }
}
