/**
 * API Routes for Miko Factory Dashboard
 * Integrates with Pinata IPFS for data storage
 */

import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { getPinataService } from "./services/pinata";
import {
  tokenToStationConfig,
  tokenToBatchData,
  type ProductionFlow,
  type StationConfig,
  type BatchData,
  type AlertData,
  type OperatorData,
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
}
