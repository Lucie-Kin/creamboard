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
  TransporterData,
  DistributorData,
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
  
  // Transporter Management (External Supply Chain)
  getTransporters(): Promise<TransporterData[]>;
  getTransporter(id: string): Promise<TransporterData | null>;
  addTransporter(transporter: TransporterData): Promise<void>;
  
  // Distributor Management (External Supply Chain)
  getDistributors(): Promise<DistributorData[]>;
  getDistributor(id: string): Promise<DistributorData | null>;
  addDistributor(distributor: DistributorData): Promise<void>;
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
  private transporters: Map<string, TransporterData> = new Map();
  private distributors: Map<string, DistributorData> = new Map();

  constructor() {
    // Initialize production flow with complete supply chain for Docker deployment
    const defaultStations: StationConfig[] = [
      {
        id: "arrival-dock",
        name: "Arrival Dock",
        type: "arrival_dock",
        enabled: true,
        positionX: 50,
        positionY: 100,
        nextStation: "storage-tanks",
        order: 1
      },
      {
        id: "storage-tanks",
        name: "Storage Tanks",
        type: "storage_tank",
        enabled: true,
        positionX: 200,
        positionY: 100,
        nextStation: "lab-rd",
        order: 2
      },
      {
        id: "lab-rd",
        name: "Lab/R&D",
        type: "lab_rd",
        enabled: true,
        positionX: 350,
        positionY: 100,
        nextStation: "mixing-room",
        order: 3
      },
      {
        id: "mixing-room",
        name: "Mixing Room",
        type: "mixing_room",
        enabled: true,
        positionX: 500,
        positionY: 100,
        nextStation: "heating-room",
        order: 4
      },
      {
        id: "heating-room",
        name: "Heating Room",
        type: "heating_room",
        enabled: true,
        positionX: 650,
        positionY: 100,
        nextStation: "cooling-room",
        order: 5
      },
      {
        id: "cooling-room",
        name: "Cooling Room",
        type: "cooling_room",
        enabled: true,
        positionX: 800,
        positionY: 100,
        nextStation: "packaging",
        order: 6
      },
      {
        id: "packaging",
        name: "Packaging",
        type: "packaging",
        enabled: true,
        positionX: 950,
        positionY: 100,
        nextStation: "storage-final",
        order: 7
      },
      {
        id: "storage-final",
        name: "Final Storage",
        type: "storage",
        enabled: true,
        positionX: 1100,
        positionY: 100,
        nextStation: "delivery-dock",
        order: 8
      },
      {
        id: "delivery-dock",
        name: "Delivery Dock",
        type: "delivery_dock",
        enabled: true,
        positionX: 1250,
        positionY: 100,
        nextStation: undefined,
        order: 9
      }
    ];

    this.productionFlow = {
      flowOrder: ["arrival-dock", "storage-tanks", "lab-rd", "mixing-room", "heating-room", "cooling-room", "packaging", "storage-final", "delivery-dock"],
      stations: defaultStations,
      startStation: "arrival-dock"
    };

    for (const station of defaultStations) {
      this.stations.set(station.id, station);
    }

    // NO test data - all data loaded from Pinata
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
        .map((id: string) => this.stations.get(id))
        .filter((s: StationConfig | undefined): s is StationConfig => s !== undefined && s.enabled);
    }
    
    // Fallback to order by station.order property
    return Array.from(this.stations.values())
      .filter((s: StationConfig) => s.enabled)
      .sort((a: StationConfig, b: StationConfig) => a.order - b.order);
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

  // Transporter Management
  async getTransporters(): Promise<TransporterData[]> {
    return Array.from(this.transporters.values());
  }

  async getTransporter(id: string): Promise<TransporterData | null> {
    return this.transporters.get(id) || null;
  }

  async addTransporter(transporter: TransporterData): Promise<void> {
    this.transporters.set(transporter.transporterId, transporter);
  }

  // Distributor Management
  async getDistributors(): Promise<DistributorData[]> {
    return Array.from(this.distributors.values());
  }

  async getDistributor(id: string): Promise<DistributorData | null> {
    return this.distributors.get(id) || null;
  }

  async addDistributor(distributor: DistributorData): Promise<void> {
    this.distributors.set(distributor.distributorId, distributor);
  }

  // Utility methods
  clear(): void {
    this.productionFlow = null;
    this.stations.clear();
    this.batches.clear();
    this.alerts.clear();
    this.operators.clear();
    this.providers.clear();
    this.transporters.clear();
    this.distributors.clear();
  }
}

export const storage = new MemStorage();
