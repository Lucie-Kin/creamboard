import { randomUUID } from "crypto";

// Define your data types
export interface ProductionBatch {
  id: string;
  batchNumber: string;
  productName: string;
  status: "green" | "yellow" | "red";
  currentStation: string;
  productsCompleted: number;
  productsInBatch: number;
  startTime: Date;
}

export interface Ticket {
  id: string;
  operatorName: string;
  station: string;
  issue: string;
  priority: "low" | "medium" | "high";
  status: "open" | "assigned" | "resolved";
  timestamp: Date;
}

export interface Station {
  id: string;
  name: string;
  type: string;
  status: "green" | "yellow" | "red";
  x?: number;
  y?: number;
}

// Storage interface - modify as needed
export interface IStorage {
  getBatches(): Promise<ProductionBatch[]>;
  getBatch(id: string): Promise<ProductionBatch | undefined>;
  getTickets(): Promise<Ticket[]>;
  createTicket(ticket: Partial<Ticket>): Promise<Ticket>;
  getStations(): Promise<Station[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private batches: Map<string, ProductionBatch>;
  private tickets: Map<string, Ticket>;
  private stations: Map<string, Station>;

  constructor() {
    this.batches = new Map();
    this.tickets = new Map();
    this.stations = new Map();
    
    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock batches
    const mockBatches: ProductionBatch[] = [
      {
        id: "1",
        batchNumber: "B001",
        productName: "Vanilla Ice Cream",
        status: "green",
        currentStation: "Mixing Room",
        productsCompleted: 150,
        productsInBatch: 300,
        startTime: new Date()
      },
      {
        id: "2",
        batchNumber: "B002",
        productName: "Chocolate Ice Cream",
        status: "yellow",
        currentStation: "Cooling Room",
        productsCompleted: 200,
        productsInBatch: 300,
        startTime: new Date()
      }
    ];
    mockBatches.forEach(b => this.batches.set(b.id, b));

    // Mock stations
    const mockStations: Station[] = [
      { id: "1", name: "Arrival Dock", type: "arrival_dock", status: "green" },
      { id: "2", name: "Storage Tank", type: "storage_tank", status: "green" },
      { id: "3", name: "Laboratory", type: "laboratory", status: "yellow" },
      { id: "4", name: "Mixing Room", type: "mixing_room", status: "green" },
      { id: "5", name: "Heating Room", type: "heating_room", status: "green" },
      { id: "6", name: "Cooling Room", type: "cooling_room", status: "yellow" },
      { id: "7", name: "Packaging", type: "packaging", status: "green" },
      { id: "8", name: "Delivery Dock", type: "delivery_dock", status: "green" }
    ];
    mockStations.forEach(s => this.stations.set(s.id, s));
  }

  async getBatches(): Promise<ProductionBatch[]> {
    return Array.from(this.batches.values());
  }

  async getBatch(id: string): Promise<ProductionBatch | undefined> {
    return this.batches.get(id);
  }

  async getTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }

  async createTicket(ticketData: Partial<Ticket>): Promise<Ticket> {
    const id = randomUUID();
    const ticket: Ticket = {
      id,
      operatorName: ticketData.operatorName || "Unknown",
      station: ticketData.station || "Unknown",
      issue: ticketData.issue || "",
      priority: ticketData.priority || "medium",
      status: ticketData.status || "open",
      timestamp: new Date()
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async getStations(): Promise<Station[]> {
    return Array.from(this.stations.values());
  }
}

export const storage = new MemStorage();
