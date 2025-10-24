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

  constructor() {
    // NO MOCK DATA INITIALIZATION
    // Data will be loaded from Pinata via API endpoints
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

  // Utility methods
  clear(): void {
    this.productionFlow = null;
    this.stations.clear();
    this.batches.clear();
    this.alerts.clear();
    this.operators.clear();
  }
}

export const storage = new MemStorage();
