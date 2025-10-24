import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, Package } from "lucide-react";
import { useStations } from "@/lib/api-hooks";
import type { BatchData, StationConfig } from "@shared/pinata-schema";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProductionFlowVisualizationProps {
  batches: BatchData[];
}

export default function ProductionFlowVisualization({ batches }: ProductionFlowVisualizationProps) {
  // Fetch stations from API (NO MOCK DATA)
  const { data: stations = [], isLoading } = useStations();

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Loading production flow...</p>
      </Card>
    );
  }

  if (stations.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No production flow configured. Load stations from Pinata to see production flow.
        </p>
      </Card>
    );
  }

  // Group batches by current station (using configured stations from Pinata)
  const batchesByStation = stations.map(station => ({
    station: {
      id: station.id,
      name: station.name,
      type: station.type,
      order: station.order,
      avgProcessingTime: station.avgProcessingTime || 0,
    },
    batches: batches.filter(b => b.currentStation === station.id),
    avgTime: station.avgProcessingTime || 0,
    totalProcessed: 0
  }));

  // Calculate statistics for each station
  batchesByStation.forEach(stationData => {
    stationData.totalProcessed = stationData.batches.length;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green":
        return "bg-success";
      case "yellow":
        return "bg-warning";
      case "red":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Production Flow</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-muted-foreground">Green</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-warning rounded-full" />
              <span className="text-muted-foreground">Yellow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-destructive rounded-full" />
              <span className="text-muted-foreground">Red</span>
            </div>
          </div>
        </div>

        {/* Production line visualization */}
        <div className="space-y-3">
          {batchesByStation.map((stationData, index) => (
            <div key={stationData.station.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium w-40 truncate">
                    {stationData.station.name}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {stationData.batches.length} batches
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Avg: {formatTime(stationData.avgTime || stationData.station.avgProcessingTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>{stationData.totalProcessed} products</span>
                  </div>
                </div>
              </div>

              {/* Batch visualization - each square = 100 products */}
              <div className="relative bg-muted/30 rounded-lg p-3 min-h-[60px]">
                {stationData.batches.length === 0 ? (
                  <div className="flex items-center justify-center h-10 text-xs text-muted-foreground">
                    No active batches
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {stationData.batches.map(batch => {
                      // Each square represents 100 products
                      const squares = Math.ceil(batch.productsInBatch / 100);
                      const completedSquares = Math.floor(batch.productsCompleted / 100);

                      return (
                        <Tooltip key={batch.id}>
                          <TooltipTrigger asChild>
                            <div className="flex gap-0.5">
                              {Array.from({ length: squares }).map((_, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "w-2 h-2 rounded-sm cursor-pointer transition-all hover:scale-125",
                                    i < completedSquares 
                                      ? getStatusColor(batch.status)
                                      : "bg-muted border border-border"
                                  )}
                                  data-testid={`batch-square-${batch.id}-${i}`}
                                />
                              ))}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 text-xs">
                              <p className="font-semibold">{batch.batchNumber}</p>
                              <p>{batch.productName}</p>
                              <p>{batch.productsCompleted} / {batch.productsInBatch} products</p>
                              <p className="text-muted-foreground">
                                Status: <span className={cn(
                                  "font-medium",
                                  batch.status === "green" && "text-success",
                                  batch.status === "yellow" && "text-warning-foreground",
                                  batch.status === "red" && "text-destructive"
                                )}>{batch.status.toUpperCase()}</span>
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}

                {/* Connection line to next station */}
                {index < batchesByStation.length - 1 && (
                  <div className="absolute left-1/2 -bottom-3 w-0.5 h-6 bg-border -translate-x-1/2" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Statistics summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{batches.length}</p>
              <p className="text-xs text-muted-foreground">Active Batches</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {batches.reduce((sum, b) => sum + b.productsInBatch, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {batches.reduce((sum, b) => sum + b.productsCompleted, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Completed Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {batches.filter(b => b.status === "green").length}
              </p>
              <p className="text-xs text-muted-foreground">Green Status</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
