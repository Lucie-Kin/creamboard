/**
 * API Routes for Miko Factory Dashboard
 * Integrates with Pinata IPFS for data storage
 */

import type { Express } from "express";
import type { Server } from "http";
import { MemStorage } from "./storage";
import { DbStorage } from "./db";
import { getPinataService } from "./services/pinata";

// Use database storage if DATABASE_URL is available, otherwise use in-memory
const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
import {
  tokenToStationConfig,
  tokenToBatchData,
  tokenToProviderData,
  tokenToTransporterData,
  tokenToDistributorData,
  type ProductionFlow,
  type StationConfig,
  type BatchData,
  type AlertData,
  type OperatorData,
  type ProviderData,
  type TransporterData,
  type DistributorData,
} from "@shared/pinata-schema";

export async function registerRoutes(app: Express, server: Server): Promise<void> {
  const pinataService = getPinataService();

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ==================== PRODUCTION FLOW CONFIGURATION ====================
  
  /**
   * Load production flow configuration from Pinata
   * POST /api/config/production-flow
   * Body: { tokenCid: "bafkrei..." }
   */
  app.post("/api/config/production-flow", async (req, res) => {
    try {
      const { tokenCid } = req.body;
      
      if (!tokenCid) {
        return res.status(400).json({ error: "tokenCid is required" });
      }

      // Fetch token chain from Pinata
      const tokens = await pinataService.fetchTokenChain(tokenCid);
      
      // Convert tokens to station configs
      const stations: StationConfig[] = tokens
        .map(token => tokenToStationConfig(token))
        .filter((station): station is StationConfig => station !== null);

      if (stations.length === 0) {
        return res.status(400).json({ error: "No valid stations found in token chain" });
      }

      // Sort by order and create flow
      stations.sort((a, b) => a.order - b.order);
      
      const flow: ProductionFlow = {
        stations,
        startStation: stations[0].id,
        flowOrder: stations.map(s => s.id),
      };

      await storage.setProductionFlow(flow);
      
      res.json({ 
        success: true, 
        flow,
        message: `Production flow configured with ${stations.length} stations`
      });
    } catch (error) {
      console.error("Error loading production flow:", error);
      res.status(500).json({ error: "Failed to load production flow from Pinata" });
    }
  });

  /**
   * Get current production flow configuration
   * GET /api/config/production-flow
   */
  app.get("/api/config/production-flow", async (_req, res) => {
    try {
      const flow = await storage.getProductionFlow();
      res.json(flow);
    } catch (error) {
      console.error("Error getting production flow:", error);
      res.status(500).json({ error: "Failed to get production flow" });
    }
  });

  // ==================== FLOOR PLAN ====================
  
  /**
   * Save floor plan configuration
   * POST /api/floor-plan
   * Body: { stations: [...], connections: [...] }
   */
  app.post("/api/floor-plan", async (req, res) => {
    try {
      const floorPlan = req.body;
      await storage.saveFloorPlan(floorPlan);
      res.json({ success: true, message: "Floor plan saved successfully" });
    } catch (error) {
      console.error("Error saving floor plan:", error);
      res.status(500).json({ error: "Failed to save floor plan" });
    }
  });

  /**
   * Get saved floor plan configuration
   * GET /api/floor-plan
   */
  app.get("/api/floor-plan", async (_req, res) => {
    try {
      const floorPlan = await storage.getFloorPlan();
      res.json(floorPlan);
    } catch (error) {
      console.error("Error getting floor plan:", error);
      res.status(500).json({ error: "Failed to get floor plan" });
    }
  });

  // ==================== STATIONS ====================
  
  /**
   * Get all stations (only enabled ones in production flow order)
   * GET /api/stations
   */
  app.get("/api/stations", async (_req, res) => {
    try {
      const stations = await storage.getStationsInOrder();
      res.json(stations);
    } catch (error) {
      console.error("Error getting stations:", error);
      res.status(500).json({ error: "Failed to get stations" });
    }
  });

  /**
   * Get single station
   * GET /api/stations/:id
   */
  app.get("/api/stations/:id", async (req, res) => {
    try {
      const station = await storage.getStation(req.params.id);
      if (!station) {
        return res.status(404).json({ error: "Station not found" });
      }
      res.json(station);
    } catch (error) {
      console.error("Error getting station:", error);
      res.status(500).json({ error: "Failed to get station" });
    }
  });

  // ==================== BATCHES ====================
  
  /**
   * Load batch data from Pinata token
   * POST /api/batches/load
   * Body: { tokenCid: "bafkrei..." }
   */
  app.post("/api/batches/load", async (req, res) => {
    try {
      const { tokenCid } = req.body;
      
      if (!tokenCid) {
        return res.status(400).json({ error: "tokenCid is required" });
      }

      const token = await pinataService.fetchToken(tokenCid);
      
      if (!token) {
        return res.status(404).json({ error: "Token not found on Pinata" });
      }

      const batch = tokenToBatchData(token);
      
      if (!batch) {
        return res.status(400).json({ error: "Invalid batch data in token" });
      }

      await storage.addBatch(batch);
      
      res.json({ success: true, batch });
    } catch (error) {
      console.error("Error loading batch:", error);
      res.status(500).json({ error: "Failed to load batch from Pinata" });
    }
  });

  /**
   * Get all batches
   * GET /api/batches
   */
  app.get("/api/batches", async (_req, res) => {
    try {
      const batches = await storage.getBatches();
      res.json(batches);
    } catch (error) {
      console.error("Error getting batches:", error);
      res.status(500).json({ error: "Failed to get batches" });
    }
  });

  /**
   * Get single batch
   * GET /api/batches/:id
   */
  app.get("/api/batches/:id", async (req, res) => {
    try {
      const batch = await storage.getBatch(req.params.id);
      if (!batch) {
        return res.status(404).json({ error: "Batch not found" });
      }
      res.json(batch);
    } catch (error) {
      console.error("Error getting batch:", error);
      res.status(500).json({ error: "Failed to get batch" });
    }
  });

  /**
   * Update batch
   * PATCH /api/batches/:id
   */
  app.patch("/api/batches/:id", async (req, res) => {
    try {
      await storage.updateBatch(req.params.id, req.body);
      const updated = await storage.getBatch(req.params.id);
      res.json(updated);
    } catch (error) {
      console.error("Error updating batch:", error);
      res.status(500).json({ error: "Failed to update batch" });
    }
  });

  // ==================== ALERTS/TICKETS ====================
  
  /**
   * Get all alerts
   * GET /api/alerts
   */
  app.get("/api/alerts", async (_req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error getting alerts:", error);
      res.status(500).json({ error: "Failed to get alerts" });
    }
  });

  /**
   * Get unacknowledged alerts
   * GET /api/alerts/unacknowledged
   */
  app.get("/api/alerts/unacknowledged", async (_req, res) => {
    try {
      const alerts = await storage.getUnacknowledgedAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error getting unacknowledged alerts:", error);
      res.status(500).json({ error: "Failed to get unacknowledged alerts" });
    }
  });

  /**
   * Create new alert
   * POST /api/alerts
   */
  app.post("/api/alerts", async (req, res) => {
    try {
      const alert: AlertData = {
        id: `alert-${Date.now()}`,
        type: req.body.type,
        message: req.body.message,
        priority: req.body.priority || "medium",
        stationId: req.body.stationId,
        acknowledged: false,
        timestamp: new Date().toISOString(),
      };
      
      await storage.addAlert(alert);
      res.json(alert);
    } catch (error) {
      console.error("Error creating alert:", error);
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  /**
   * Acknowledge alert
   * POST /api/alerts/:id/acknowledge
   */
  app.post("/api/alerts/:id/acknowledge", async (req, res) => {
    try {
      await storage.acknowledgeAlert(req.params.id);
      const alert = await storage.getAlert(req.params.id);
      res.json(alert);
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  });

  // Legacy /api/tickets endpoints (alias to alerts)
  app.get("/api/tickets", async (_req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get tickets" });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const alert: AlertData = {
        id: `ticket-${Date.now()}`,
        type: "operator_issue",
        message: req.body.issue || req.body.message,
        priority: req.body.priority || "medium",
        stationId: req.body.stationId,
        acknowledged: false,
        timestamp: new Date().toISOString(),
      };
      
      await storage.addAlert(alert);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ticket" });
    }
  });

  // ==================== OPERATORS ====================
  
  /**
   * Get operator by QR code
   * POST /api/operators/scan
   * Body: { qrCode: "..." }
   */
  app.post("/api/operators/scan", async (req, res) => {
    try {
      const { qrCode } = req.body;
      
      if (!qrCode) {
        return res.status(400).json({ error: "qrCode is required" });
      }

      const operator = await storage.getOperatorByQR(qrCode);
      
      if (!operator) {
        return res.status(404).json({ error: "Operator not found" });
      }

      res.json(operator);
    } catch (error) {
      console.error("Error scanning operator:", error);
      res.status(500).json({ error: "Failed to scan operator" });
    }
  });

  /**
   * Add operator
   * POST /api/operators
   */
  app.post("/api/operators", async (req, res) => {
    try {
      const operator: OperatorData = {
        id: `op-${Date.now()}`,
        name: req.body.name,
        qrCode: req.body.qrCode,
        role: req.body.role,
        assignedStation: req.body.assignedStation,
      };
      
      await storage.addOperator(operator);
      res.json(operator);
    } catch (error) {
      console.error("Error adding operator:", error);
      res.status(500).json({ error: "Failed to add operator" });
    }
  });

  // ==================== PROVIDERS (EXTERNAL SUPPLY CHAIN) ====================
  
  /**
   * Get all providers
   * GET /api/providers
   */
  app.get("/api/providers", async (_req, res) => {
    try {
      const providers = await storage.getProviders();
      res.json(providers);
    } catch (error) {
      console.error("Error getting providers:", error);
      res.status(500).json({ error: "Failed to get providers" });
    }
  });

  /**
   * Get single provider
   * GET /api/providers/:id
   */
  app.get("/api/providers/:id", async (req, res) => {
    try {
      const provider = await storage.getProvider(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.json(provider);
    } catch (error) {
      console.error("Error getting provider:", error);
      res.status(500).json({ error: "Failed to get provider" });
    }
  });

  /**
   * Load provider from Pinata
   * POST /api/providers/load
   * Body: { tokenCid: "bafkrei..." }
   */
  app.post("/api/providers/load", async (req, res) => {
    try {
      const { tokenCid } = req.body;
      
      if (!tokenCid) {
        return res.status(400).json({ error: "tokenCid is required" });
      }

      const tokenData = await pinataService.fetchTokenMetadata(tokenCid);
      
      if (!tokenData) {
        return res.status(502).json({ error: "Failed to fetch data from Pinata" });
      }

      const provider = tokenToProviderData(tokenData);
      
      if (!provider) {
        return res.status(400).json({ error: "Invalid provider data in token" });
      }

      await storage.addProvider(provider);
      res.json({ success: true, provider });
    } catch (error) {
      console.error("Error loading provider:", error);
      res.status(500).json({ error: "Failed to load provider from Pinata" });
    }
  });

  /**
   * Add provider directly
   * POST /api/providers
   */
  app.post("/api/providers", async (req, res) => {
    try {
      const provider: ProviderData = {
        providerId: req.body.providerId || `prov-${Date.now()}`,
        name: req.body.name,
        address: req.body.address,
        owner: req.body.owner,
        type: req.body.type,
        productionCapacity: req.body.productionCapacity,
        distanceKm: req.body.distanceKm,
        certifications: req.body.certifications || [],
        conditions: req.body.conditions,
        status: req.body.status || "verified",
      };
      
      await storage.addProvider(provider);
      res.json(provider);
    } catch (error) {
      console.error("Error adding provider:", error);
      res.status(500).json({ error: "Failed to add provider" });
    }
  });

  // ==================== TRANSPORTERS (EXTERNAL SUPPLY CHAIN) ====================
  
  /**
   * Get all transporters
   * GET /api/transporters
   */
  app.get("/api/transporters", async (_req, res) => {
    try {
      const transporters = await storage.getTransporters();
      res.json(transporters);
    } catch (error) {
      console.error("Error getting transporters:", error);
      res.status(500).json({ error: "Failed to get transporters" });
    }
  });

  /**
   * Get single transporter
   * GET /api/transporters/:id
   */
  app.get("/api/transporters/:id", async (req, res) => {
    try {
      const transporter = await storage.getTransporter(req.params.id);
      if (!transporter) {
        return res.status(404).json({ error: "Transporter not found" });
      }
      res.json(transporter);
    } catch (error) {
      console.error("Error getting transporter:", error);
      res.status(500).json({ error: "Failed to get transporter" });
    }
  });

  /**
   * Load transporter from Pinata
   * POST /api/transporters/load
   * Body: { tokenCid: "bafkrei..." }
   */
  app.post("/api/transporters/load", async (req, res) => {
    try {
      const { tokenCid } = req.body;
      
      if (!tokenCid) {
        return res.status(400).json({ error: "tokenCid is required" });
      }

      const tokenData = await pinataService.fetchTokenMetadata(tokenCid);
      
      if (!tokenData) {
        return res.status(502).json({ error: "Failed to fetch data from Pinata" });
      }

      const transporter = tokenToTransporterData(tokenData);
      
      if (!transporter) {
        return res.status(400).json({ error: "Invalid transporter data in token" });
      }

      await storage.addTransporter(transporter);
      res.json({ success: true, transporter });
    } catch (error) {
      console.error("Error loading transporter:", error);
      res.status(500).json({ error: "Failed to load transporter from Pinata" });
    }
  });

  /**
   * Add transporter directly
   * POST /api/transporters
   */
  app.post("/api/transporters", async (req, res) => {
    try {
      const transporter: TransporterData = {
        transporterId: req.body.transporterId || `trans-${Date.now()}`,
        company: req.body.company,
        driver: req.body.driver,
        vehicle: req.body.vehicle,
        destination: req.body.destination,
        routeDistanceKm: req.body.routeDistanceKm,
        hoursDriven: req.body.hoursDriven,
        temperatureLog: req.body.temperatureLog || [],
        status: req.body.status || "pending",
      };
      
      await storage.addTransporter(transporter);
      res.json(transporter);
    } catch (error) {
      console.error("Error adding transporter:", error);
      res.status(500).json({ error: "Failed to add transporter" });
    }
  });

  // ==================== DISTRIBUTORS (EXTERNAL SUPPLY CHAIN) ====================
  
  /**
   * Get all distributors
   * GET /api/distributors
   */
  app.get("/api/distributors", async (_req, res) => {
    try {
      const distributors = await storage.getDistributors();
      res.json(distributors);
    } catch (error) {
      console.error("Error getting distributors:", error);
      res.status(500).json({ error: "Failed to get distributors" });
    }
  });

  /**
   * Get single distributor
   * GET /api/distributors/:id
   */
  app.get("/api/distributors/:id", async (req, res) => {
    try {
      const distributor = await storage.getDistributor(req.params.id);
      if (!distributor) {
        return res.status(404).json({ error: "Distributor not found" });
      }
      res.json(distributor);
    } catch (error) {
      console.error("Error getting distributor:", error);
      res.status(500).json({ error: "Failed to get distributor" });
    }
  });

  /**
   * Load distributor from Pinata
   * POST /api/distributors/load
   * Body: { tokenCid: "bafkrei..." }
   */
  app.post("/api/distributors/load", async (req, res) => {
    try {
      const { tokenCid } = req.body;
      
      if (!tokenCid) {
        return res.status(400).json({ error: "tokenCid is required" });
      }

      const tokenData = await pinataService.fetchTokenMetadata(tokenCid);
      
      if (!tokenData) {
        return res.status(502).json({ error: "Failed to fetch data from Pinata" });
      }

      const distributor = tokenToDistributorData(tokenData);
      
      if (!distributor) {
        return res.status(400).json({ error: "Invalid distributor data in token" });
      }

      await storage.addDistributor(distributor);
      res.json({ success: true, distributor });
    } catch (error) {
      console.error("Error loading distributor:", error);
      res.status(500).json({ error: "Failed to load distributor from Pinata" });
    }
  });

  /**
   * Add distributor directly
   * POST /api/distributors
   */
  app.post("/api/distributors", async (req, res) => {
    try {
      const distributor: DistributorData = {
        distributorId: req.body.distributorId || `dist-${Date.now()}`,
        name: req.body.name,
        location: req.body.location,
        type: req.body.type,
        capacity: req.body.capacity,
        contactPerson: req.body.contactPerson,
        receivedBatches: req.body.receivedBatches || [],
        status: req.body.status || "active",
      };
      
      await storage.addDistributor(distributor);
      res.json(distributor);
    } catch (error) {
      console.error("Error adding distributor:", error);
      res.status(500).json({ error: "Failed to add distributor" });
    }
  });

  // ==================== STARTUP INITIALIZATION ====================
  
  /**
   * Auto-load data from Pinata NFT on startup
   * Extracts Provider data from the THIRD file in the NFT wrapper
   */
  async function initializeData() {
    console.log("🔄 Loading data from Pinata NFT...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    try {
      // Hardcoded Pinata NFT URL (Solana metadata wrapper)
      const nftUrl = "https://gateway.pinata.cloud/ipfs/bafkreib2sr2lsaqtsxsxkgpgcajxh5henxuc7v7uffo7eplnf3vvqxpwem";
      
      console.log("📥 Step 1: Fetching NFT wrapper metadata...");
      console.log(`   URL: ${nftUrl}`);
      const nftResponse = await fetch(nftUrl);
      
      if (!nftResponse.ok) {
        console.error(`❌ Failed to fetch NFT metadata: ${nftResponse.statusText}`);
        return;
      }
      
      console.log("✅ Step 2: NFT wrapper fetched successfully");
      const nftData = await nftResponse.json() as any;
      
      console.log("📦 Step 3: Parsing NFT wrapper structure...");
      console.log("   Wrapper contains:");
      console.log(`   - name: ${nftData.name || 'N/A'}`);
      console.log(`   - symbol: ${nftData.symbol || 'N/A'}`);
      console.log(`   - description: ${nftData.description || 'N/A'}`);
      
      // Print the full wrapper structure for debugging
      if (nftData.properties) {
        console.log("   - properties object found ✓");
        if (Array.isArray(nftData.properties.files)) {
          console.log(`   - properties.files array found with ${nftData.properties.files.length} files ✓`);
          nftData.properties.files.forEach((file: any, index: number) => {
            console.log(`     [${index}] ${file.uri || file.url || 'Unknown URI'} (${file.type || 'unknown type'})`);
          });
        } else {
          console.log("   - properties.files is NOT an array ✗");
        }
      } else {
        console.log("   - properties object NOT found ✗");
      }
      
      // Extract provider data from properties.files[2] (THIRD element)
      if (nftData.properties && Array.isArray(nftData.properties.files) && nftData.properties.files.length > 2) {
        const providerFileUrl = nftData.properties.files[2].uri as string;
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📥 Step 4: Accessing properties.files[2].uri");
        console.log(`   Extracted URI: ${providerFileUrl}`);
        console.log("   Fetching provider data...");
        
        const providerResponse = await fetch(providerFileUrl);
        
        if (!providerResponse.ok) {
          console.error(`❌ Failed to fetch provider data: ${providerResponse.statusText}`);
          return;
        }
        
        console.log("✅ Step 5: Provider data fetched successfully");
        const providerJsonData = await providerResponse.json() as any;
        
        console.log("📋 Step 6: Provider data content:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log(JSON.stringify(providerJsonData, null, 2));
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        console.log(`📋 Provider name: ${providerJsonData.name || 'Unknown'}`);
        
        // Parse as provider data
        const provider = tokenToProviderData(providerJsonData);
        if (provider) {
          await storage.addProvider(provider);
          console.log(`✅ Step 7: Provider loaded successfully: ${provider.name}`);
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        } else {
          console.log("⚠️  Data does not match provider schema");
        }
      } else {
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("⚠️  NFT does not contain provider data in properties.files[2]");
        console.log(`   Files array length: ${nftData.properties?.files?.length || 0}`);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      }
      
    } catch (error) {
      console.error("❌ Error loading data from Pinata:", error);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
  }

  // Run initialization
  await initializeData();
}
