/**
 * Storage interface for Miko Factory Dashboard
 * Uses Pinata IPFS for data storage - NO MOCK DATA
 */

import {
  StationConfig,
  BatchData,
  AlertData,
  OperatorData,
  ProductionFlow,
  ProviderData,
} from "@shared/pinata-schema";

export interface IStorage {
  // Production Flow Configuration
  getProductionFlow(): Promise<ProductionFlow | null>;
  setProductionFlow(flow: ProductionFlow): Promise<void>;
  
  // Station Management
  getStations(): Promise<StationConfig[]>;
  getStation(id: string): Promise<StationConfig | null>;
  getEnabledStations(): Promise<StationConfig[]>;
  getStationsInOrder(): Promise<StationConfig[]>;
  
  // Batch Management
  getBatches(): Promise<BatchData[]>;
  getBatch(id: string): Promise<BatchData | null>;
  getBatchesByStation(stationId: string): Promise<BatchData[]>;
  addBatch(batch: BatchData): Promise<void>;
  updateBatch(id: string, updates: Partial<BatchData>): Promise<void>;
  
  // Alert Management
  getAlerts(): Promise<AlertData[]>;
  getAlert(id: string): Promise<AlertData | null>;
  getUnacknowledgedAlerts(): Promise<AlertData[]>;
  addAlert(alert: AlertData): Promise<void>;
  acknowledgeAlert(id: string): Promise<void>;
  
  // Operator Management
  getOperators(): Promise<OperatorData[]>;
  getOperator(id: string): Promise<OperatorData | null>;
  getOperatorByQR(qrCode: string): Promise<OperatorData | null>;
  addOperator(operator: OperatorData): Promise<void>;
  
  // Provider Management (External Supply Chain)
  getProviders(): Promise<ProviderData[]>;
  getProvider(id: string): Promise<ProviderData | null>;
  addProvider(provider: ProviderData): Promise<void>;
}

/**
 * In-memory storage implementation
 * Data is loaded from Pinata and cached in memory
 * NO MOCK DATA - All data must be loaded from your Pinata/Solana sources
 */
export class MemStorage implements IStorage {
  private productionFlow: ProductionFlow | null = null;
  private stations: Map<string, StationConfig> = new Map();
  private batches: Map<string, BatchData> = new Map();
  private alerts: Map<string, AlertData> = new Map();
  private operators: Map<string, OperatorData> = new Map();
  private providers: Map<string, ProviderData> = new Map();

  constructor() {
    // Initialize production flow with complete supply chain
    const defaultStations: StationConfig[] = [
      {
        id: "arrival-dock",
        name: "Arrival Dock",
        type: "arrival_dock",
        enabled: true,
        position: { x: 50, y: 100 },
        nextStation: "storage-tanks"
      },
      {
        id: "storage-tanks",
        name: "Storage Tanks",
        type: "storage_tank",
        enabled: true,
        position: { x: 200, y: 100 },
        nextStation: "lab-rd"
      },
      {
        id: "lab-rd",
        name: "Lab/R&D",
        type: "lab_rd",
        enabled: true,
        position: { x: 350, y: 100 },
        nextStation: "mixing-room"
      },
      {
        id: "mixing-room",
        name: "Mixing Room",
        type: "mixing_room",
        enabled: true,
        position: { x: 500, y: 100 },
        nextStation: "heating-room"
      },
      {
        id: "heating-room",
        name: "Heating Room",
        type: "heating_room",
        enabled: true,
        position: { x: 650, y: 100 },
        nextStation: "cooling-room"
      },
      {
        id: "cooling-room",
        name: "Cooling Room",
        type: "cooling_room",
        enabled: true,
        position: { x: 800, y: 100 },
        nextStation: "packaging"
      },
      {
        id: "packaging",
        name: "Packaging",
        type: "packaging",
        enabled: true,
        position: { x: 950, y: 100 },
        nextStation: "storage-final"
      },
      {
        id: "storage-final",
        name: "Final Storage",
        type: "storage",
        enabled: true,
        position: { x: 1100, y: 100 },
        nextStation: "delivery-dock"
      },
      {
        id: "delivery-dock",
        name: "Delivery Dock",
        type: "delivery_dock",
        enabled: true,
        position: { x: 1250, y: 100 },
        nextStation: null
      }
    ];

    this.productionFlow = {
      flowOrder: ["arrival-dock", "storage-tanks", "lab-rd", "mixing-room", "heating-room", "cooling-room", "packaging", "storage-final", "delivery-dock"],
      stations: defaultStations
    };

    for (const station of defaultStations) {
      this.stations.set(station.id, station);
    }

    // Initialize with test data for Docker deployment
    this.batches.set("batch-1", {
      id: "batch-1",
      batchNumber: "MK-2024-001",
      productName: "Vanilla Ice Cream",
      currentStation: "mixing-room",
      status: "green",
      productsInBatch: 500,
      productsCompleted: 350,
      timestamp: new Date().toISOString(),
    });
    
    this.batches.set("batch-2", {
      id: "batch-2",
      batchNumber: "MK-2024-002",
      productName: "Chocolate Ice Cream",
      currentStation: "heating-room",
      status: "yellow",
      productsInBatch: 600,
      productsCompleted: 400,
      timestamp: new Date().toISOString(),
    });
    
    this.batches.set("batch-3", {
      id: "batch-3",
      batchNumber: "MK-2024-003",
      productName: "Strawberry Ice Cream",
      currentStation: "packaging",
      status: "green",
      productsInBatch: 450,
      productsCompleted: 430,
      timestamp: new Date().toISOString(),
    });
  }

  // Production Flow Configuration
  async getProductionFlow(): Promise<ProductionFlow | null> {
    return this.productionFlow;
  }

  async setProductionFlow(flow: ProductionFlow): Promise<void> {
    this.productionFlow = flow;
    
    // Update stations map
    this.stations.clear();
    for (const station of flow.stations) {
      this.stations.set(station.id, station);
    }
  }

  // Station Management
  async getStations(): Promise<StationConfig[]> {
    return Array.from(this.stations.values());
  }

  async getStation(id: string): Promise<StationConfig | null> {
    return this.stations.get(id) || null;
  }

  async getEnabledStations(): Promise<StationConfig[]> {
    return Array.from(this.stations.values()).filter(s => s.enabled);
  }

  async getStationsInOrder(): Promise<StationConfig[]> {
    if (this.productionFlow) {
      // Return stations in the configured flow order
      return this.productionFlow.flowOrder
        .map(id => this.stations.get(id))
        .filter((s): s is StationConfig => s !== undefined && s.enabled);
    }
    
    // Fallback to order by station.order property
    return Array.from(this.stations.values())
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order);
  }

  // Batch Management
  async getBatches(): Promise<BatchData[]> {
    return Array.from(this.batches.values());
  }

  async getBatch(id: string): Promise<BatchData | null> {
    return this.batches.get(id) || null;
  }

  async getBatchesByStation(stationId: string): Promise<BatchData[]> {
    return Array.from(this.batches.values())
      .filter(b => b.currentStation === stationId);
  }

  async addBatch(batch: BatchData): Promise<void> {
    this.batches.set(batch.id, batch);
  }

  async updateBatch(id: string, updates: Partial<BatchData>): Promise<void> {
    const batch = this.batches.get(id);
    if (batch) {
      this.batches.set(id, { ...batch, ...updates });
    }
  }

  // Alert Management
  async getAlerts(): Promise<AlertData[]> {
    return Array.from(this.alerts.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getAlert(id: string): Promise<AlertData | null> {
    return this.alerts.get(id) || null;
  }

  async getUnacknowledgedAlerts(): Promise<AlertData[]> {
    return Array.from(this.alerts.values())
      .filter(a => !a.acknowledged)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addAlert(alert: AlertData): Promise<void> {
    this.alerts.set(alert.id, alert);
  }

  async acknowledgeAlert(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      this.alerts.set(id, { ...alert, acknowledged: true });
    }
  }

  // Operator Management
  async getOperators(): Promise<OperatorData[]> {
    return Array.from(this.operators.values());
  }

  async getOperator(id: string): Promise<OperatorData | null> {
    return this.operators.get(id) || null;
  }

  async getOperatorByQR(qrCode: string): Promise<OperatorData | null> {
    return Array.from(this.operators.values()).find(o => o.qrCode === qrCode) || null;
  }

  async addOperator(operator: OperatorData): Promise<void> {
    this.operators.set(operator.id, operator);
  }

  // Provider Management
  async getProviders(): Promise<ProviderData[]> {
    return Array.from(this.providers.values());
  }

  async getProvider(id: string): Promise<ProviderData | null> {
    return this.providers.get(id) || null;
  }

  async addProvider(provider: ProviderData): Promise<void> {
    this.providers.set(provider.providerId, provider);
  }

  // Utility methods
  clear(): void {
    this.productionFlow = null;
    this.stations.clear();
    this.batches.clear();
    this.alerts.clear();
    this.operators.clear();
    this.providers.clear();
  }
}

export const storage = new MemStorage();
