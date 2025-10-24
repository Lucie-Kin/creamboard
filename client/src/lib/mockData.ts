/**
 * Data types for Miko Factory Dashboard
 * NO MOCK DATA - All data loaded from Pinata/Solana backend
 */

export interface ProductionBatch {
  id: string;
  batchNumber: string;
  productName: string;
  productsInBatch?: number;
  productsCompleted?: number;
  currentStation: string;
  status: "green" | "yellow" | "red";
  startTime: Date | string;
  stationHistory?: {
    station: string;
    enteredAt: Date | string;
    exitedAt?: Date | string;
    duration?: number;
    status: "green" | "yellow" | "red";
  }[];
}

export interface FactoryStation {
  id: string;
  name: string;
  type: string;
  order: number;
  enabled?: boolean;
  avgProcessingTime?: number; // in seconds
  currentBatches?: string[];
  nextStation?: string; // ID of next station in production flow
  positionX?: number;
  positionY?: number;
}

export interface Ticket {
  id: string;
  operatorName: string;
  operatorRole?: string;
  station: string;
  issue: string;
  priority: "low" | "medium" | "high";
  timestamp: Date | string;
  status: "open" | "assigned" | "resolved";
  notes?: string;
}

// NO MOCK DATA GENERATION
// All data should be fetched from the backend API which loads from Pinata
export const factoryStations: FactoryStation[] = [];
export const activeBatches: ProductionBatch[] = [];
export const activeTickets: Ticket[] = [];
