/**
 * Database storage implementation using Drizzle ORM + PostgreSQL
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc } from "drizzle-orm";
import * as schema from "@shared/schema";
import { IStorage } from "./storage";
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

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

/**
 * Database storage implementation
 * Uses PostgreSQL for persistent storage
 */
export class DbStorage implements IStorage {
  // In-memory cache for Pinata data (stations, batches, providers, etc.)
  private productionFlow: ProductionFlow | null = null;
  private stations: Map<string, StationConfig> = new Map();
  private batches: Map<string, BatchData> = new Map();
  private alerts: Map<string, AlertData> = new Map();
  private operators: Map<string, OperatorData> = new Map();
  private providers: Map<string, ProviderData> = new Map();
  private transporters: Map<string, TransporterData> = new Map();
  private distributors: Map<string, DistributorData> = new Map();

  // Production Flow (in-memory cache)
  async getProductionFlow(): Promise<ProductionFlow | null> {
    return this.productionFlow;
  }

  async setProductionFlow(flow: ProductionFlow): Promise<void> {
    this.productionFlow = flow;
    
    // Update stations map (critical for station endpoints to work)
    this.stations.clear();
    for (const station of flow.stations) {
      this.stations.set(station.id, station);
    }
  }

  // Floor Plan (database-backed)
  async getFloorPlan(): Promise<any | null> {
    try {
      const result = await db
        .select()
        .from(schema.floorPlans)
        .orderBy(desc(schema.floorPlans.savedAt))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const floorPlan = result[0];
      return JSON.parse(floorPlan.data);
    } catch (error) {
      console.error("Error fetching floor plan from database:", error);
      return null;
    }
  }

  async saveFloorPlan(floorPlan: any): Promise<void> {
    try {
      await db.insert(schema.floorPlans).values({
        data: JSON.stringify(floorPlan),
      });
      console.log("✅ Floor plan saved to database");
    } catch (error) {
      console.error("❌ Error saving floor plan to database:", error);
      throw error;
    }
  }

  // Stations (in-memory from Pinata)
  async getStations(): Promise<StationConfig[]> {
    return Array.from(this.stations.values());
  }

  async getStation(id: string): Promise<StationConfig | null> {
    return this.stations.get(id) || null;
  }

  async getEnabledStations(): Promise<StationConfig[]> {
    return Array.from(this.stations.values()).filter((s) => s.enabled);
  }

  async getStationsInOrder(): Promise<StationConfig[]> {
    return Array.from(this.stations.values()).sort((a, b) => a.order - b.order);
  }

  // Batches (in-memory from Pinata)
  async getBatches(): Promise<BatchData[]> {
    return Array.from(this.batches.values());
  }

  async getBatch(id: string): Promise<BatchData | null> {
    return this.batches.get(id) || null;
  }

  async getBatchesByStation(stationId: string): Promise<BatchData[]> {
    return Array.from(this.batches.values()).filter(
      (b) => b.currentStation === stationId
    );
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

  // Alerts (in-memory)
  async getAlerts(): Promise<AlertData[]> {
    return Array.from(this.alerts.values());
  }

  async getAlert(id: string): Promise<AlertData | null> {
    return this.alerts.get(id) || null;
  }

  async getUnacknowledgedAlerts(): Promise<AlertData[]> {
    return Array.from(this.alerts.values()).filter((a) => !a.acknowledged);
  }

  async addAlert(alert: AlertData): Promise<void> {
    this.alerts.set(alert.id, alert);
  }

  async acknowledgeAlert(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  // Operators (in-memory)
  async getOperators(): Promise<OperatorData[]> {
    return Array.from(this.operators.values());
  }

  async getOperator(id: string): Promise<OperatorData | null> {
    return this.operators.get(id) || null;
  }

  async getOperatorByQR(qrCode: string): Promise<OperatorData | null> {
    return (
      Array.from(this.operators.values()).find((o) => o.qrCode === qrCode) ||
      null
    );
  }

  async addOperator(operator: OperatorData): Promise<void> {
    this.operators.set(operator.id, operator);
  }

  // Providers (in-memory from Pinata)
  async getProviders(): Promise<ProviderData[]> {
    return Array.from(this.providers.values());
  }

  async getProvider(id: string): Promise<ProviderData | null> {
    return this.providers.get(id) || null;
  }

  async addProvider(provider: ProviderData): Promise<void> {
    this.providers.set(provider.providerId, provider);
  }

  // Transporters (in-memory from Pinata)
  async getTransporters(): Promise<TransporterData[]> {
    return Array.from(this.transporters.values());
  }

  async getTransporter(id: string): Promise<TransporterData | null> {
    return this.transporters.get(id) || null;
  }

  async addTransporter(transporter: TransporterData): Promise<void> {
    this.transporters.set(transporter.transporterId, transporter);
  }

  // Distributors (in-memory from Pinata)
  async getDistributors(): Promise<DistributorData[]> {
    return Array.from(this.distributors.values());
  }

  async getDistributor(id: string): Promise<DistributorData | null> {
    return this.distributors.get(id) || null;
  }

  async addDistributor(distributor: DistributorData): Promise<void> {
    this.distributors.set(distributor.distributorId, distributor);
  }
}
