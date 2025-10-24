/**
 * React Query hooks for Miko Factory Dashboard
 * Uses Pinata-based API endpoints
 */

import { useQuery, useMutation, type UseQueryResult } from "@tanstack/react-query";
import { queryClient, apiRequest } from "./queryClient";
import type { 
  StationConfig, 
  BatchData, 
  AlertData, 
  OperatorData, 
  ProductionFlow,
  ProviderData,
  TransporterData,
  DistributorData
} from "@shared/pinata-schema";

// ==================== PRODUCTION FLOW ====================

/**
 * Get the current production flow configuration
 */
export function useProductionFlow(): UseQueryResult<ProductionFlow | null> {
  return useQuery<ProductionFlow | null>({
    queryKey: ["/api/config/production-flow"],
  });
}

/**
 * Load production flow from Pinata token chain
 */
export function useLoadProductionFlow() {
  return useMutation({
    mutationFn: async (tokenCid: string) => {
      const res = await apiRequest("POST", "/api/config/production-flow", { tokenCid });
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate production flow and stations cache
      queryClient.invalidateQueries({ queryKey: ["/api/config/production-flow"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stations"] });
    },
  });
}

// ==================== STATIONS ====================

/**
 * Get all enabled stations in production flow order
 */
export function useStations(): UseQueryResult<StationConfig[]> {
  return useQuery<StationConfig[]>({
    queryKey: ["/api/stations"],
  });
}

/**
 * Get single station by ID
 */
export function useStation(id: string): UseQueryResult<StationConfig | null> {
  return useQuery<StationConfig | null>({
    queryKey: ["/api/stations", id],
    enabled: !!id,
  });
}

// ==================== BATCHES ====================

/**
 * Get all batches
 */
export function useBatches(): UseQueryResult<BatchData[]> {
  return useQuery<BatchData[]>({
    queryKey: ["/api/batches"],
  });
}

/**
 * Get single batch by ID
 */
export function useBatch(id: string): UseQueryResult<BatchData | null> {
  return useQuery<BatchData | null>({
    queryKey: ["/api/batches", id],
    enabled: !!id,
  });
}

/**
 * Load batch from Pinata token
 */
export function useLoadBatch() {
  return useMutation({
    mutationFn: async (tokenCid: string) => {
      const res = await apiRequest("POST", "/api/batches/load", { tokenCid });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
    },
  });
}

/**
 * Update batch data
 */
export function useUpdateBatch() {
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BatchData> }) => {
      const res = await apiRequest("PATCH", `/api/batches/${id}`, updates);
      return await res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/batches", variables.id] });
    },
  });
}

// ==================== ALERTS/TICKETS ====================

/**
 * Get all alerts
 */
export function useAlerts(): UseQueryResult<AlertData[]> {
  return useQuery<AlertData[]>({
    queryKey: ["/api/alerts"],
  });
}

/**
 * Get unacknowledged alerts only
 */
export function useUnacknowledgedAlerts(): UseQueryResult<AlertData[]> {
  return useQuery<AlertData[]>({
    queryKey: ["/api/alerts/unacknowledged"],
  });
}

/**
 * Create new alert
 */
export function useCreateAlert() {
  return useMutation({
    mutationFn: async (alert: Omit<AlertData, "id" | "timestamp" | "acknowledged">) => {
      const res = await apiRequest("POST", "/api/alerts", alert);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unacknowledged"] });
    },
  });
}

/**
 * Acknowledge an alert
 */
export function useAcknowledgeAlert() {
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/alerts/${id}/acknowledge`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/alerts/unacknowledged"] });
    },
  });
}

// Legacy ticket endpoints (alias to alerts)
export const useTickets = useAlerts;
export const useCreateTicket = useCreateAlert;

// ==================== OPERATORS ====================

/**
 * Scan operator QR code
 */
export function useScanOperator() {
  return useMutation({
    mutationFn: async (qrCode: string) => {
      const res = await apiRequest("POST", "/api/operators/scan", { qrCode });
      return await res.json();
    },
  });
}

/**
 * Add new operator
 */
export function useAddOperator() {
  return useMutation({
    mutationFn: async (operator: Omit<OperatorData, "id">) => {
      const res = await apiRequest("POST", "/api/operators", operator);
      return await res.json();
    },
  });
}

// ==================== PROVIDERS (EXTERNAL SUPPLY CHAIN) ====================

/**
 * Get all providers
 */
export function useProviders(): UseQueryResult<ProviderData[]> {
  return useQuery<ProviderData[]>({
    queryKey: ["/api/providers"],
  });
}

/**
 * Get single provider by ID
 */
export function useProvider(id: string): UseQueryResult<ProviderData | null> {
  return useQuery<ProviderData | null>({
    queryKey: ["/api/providers", id],
    enabled: !!id,
  });
}

/**
 * Load provider from Pinata
 */
export function useLoadProvider() {
  return useMutation({
    mutationFn: async (tokenCid: string) => {
      const res = await apiRequest("POST", "/api/providers/load", { tokenCid });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
    },
  });
}

// ==================== TRANSPORTERS (EXTERNAL SUPPLY CHAIN) ====================

/**
 * Get all transporters
 */
export function useTransporters(): UseQueryResult<TransporterData[]> {
  return useQuery<TransporterData[]>({
    queryKey: ["/api/transporters"],
  });
}

/**
 * Get single transporter by ID
 */
export function useTransporter(id: string): UseQueryResult<TransporterData | null> {
  return useQuery<TransporterData | null>({
    queryKey: ["/api/transporters", id],
    enabled: !!id,
  });
}

/**
 * Load transporter from Pinata
 */
export function useLoadTransporter() {
  return useMutation({
    mutationFn: async (tokenCid: string) => {
      const res = await apiRequest("POST", "/api/transporters/load", { tokenCid });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transporters"] });
    },
  });
}

// ==================== DISTRIBUTORS (EXTERNAL SUPPLY CHAIN) ====================

/**
 * Get all distributors
 */
export function useDistributors(): UseQueryResult<DistributorData[]> {
  return useQuery<DistributorData[]>({
    queryKey: ["/api/distributors"],
  });
}

/**
 * Get single distributor by ID
 */
export function useDistributor(id: string): UseQueryResult<DistributorData | null> {
  return useQuery<DistributorData | null>({
    queryKey: ["/api/distributors", id],
    enabled: !!id,
  });
}

/**
 * Load distributor from Pinata
 */
export function useLoadDistributor() {
  return useMutation({
    mutationFn: async (tokenCid: string) => {
      const res = await apiRequest("POST", "/api/distributors/load", { tokenCid });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/distributors"] });
    },
  });
}
