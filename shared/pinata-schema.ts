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

// Station configuration from token metadata
export const stationConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum([
    "arrival_dock",
    "storage_tank",
    "laboratory",
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

// Production batch from token metadata
export const batchDataSchema = z.object({
  id: z.string(),
  batchNumber: z.string(),
  productName: z.string(),
  currentStation: z.string().optional(),
  status: z.enum(["green", "yellow", "red"]),
  timestamp: z.string().datetime(),
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
    
    if (!batchAttr) return null;
    
    return {
      id: token.symbol,
      batchNumber: String(batchAttr.value),
      productName: productAttr ? String(productAttr.value) : token.name,
      currentStation: stationAttr ? String(stationAttr.value) : undefined,
      status: (statusAttr?.value as BatchData['status']) || "green",
      timestamp: new Date().toISOString(),
      metadata: token,
    };
  } catch (error) {
    return null;
  }
}
