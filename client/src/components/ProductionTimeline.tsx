import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductionBatch } from "@/lib/mockData";

interface ProductionTimelineProps {
  batches: ProductionBatch[];
  stationSequence?: string[]; // From floor plan connections
}

const SQUARES_PER_STATION = 9; // Each station shows 9 squares (900 products max)
const PRODUCTS_PER_SQUARE = 100;

export default function ProductionTimeline({ batches, stationSequence }: ProductionTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(() => {
    const saved = localStorage.getItem('timeline-cursor-position');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Default station sequence if not provided from floor plan
  const stations = stationSequence || [
    "arrival dock",
    "storage tanks",
    "lab/R&D",
    "mixing room",
    "heating room",
    "cooling room",
    "packaging",
    "storage",
    "delivery dock"
  ];

  const totalStations = stations.length;

  // Save cursor position to localStorage
  useEffect(() => {
    localStorage.setItem('timeline-cursor-position', cursorPosition.toString());
  }, [cursorPosition]);

  // Auto-scroll to cursor position on mount
  useEffect(() => {
    if (scrollContainerRef.current && cursorPosition > 0) {
      const columnWidth = 120; // Approximate width per station
      scrollContainerRef.current.scrollLeft = cursorPosition * columnWidth - 200;
    }
  }, []);

  const handleSetCursor = (stationIndex: number) => {
    setCursorPosition(stationIndex);
    if (scrollContainerRef.current) {
      const columnWidth = 120;
      scrollContainerRef.current.scrollTo({
        left: stationIndex * columnWidth - 200,
        behavior: 'smooth'
      });
    }
  };

  const handleResetCursor = () => {
    setCursorPosition(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const renderBatchRow = (batch: ProductionBatch) => {
    const stationIndex = stations.findIndex(s => 
      s.toLowerCase() === batch.currentStation.toLowerCase()
    );
    
    const squares: JSX.Element[] = [];
    
    for (let i = 0; i < totalStations; i++) {
      const stationSquares: JSX.Element[] = [];
      
      for (let j = 0; j < SQUARES_PER_STATION; j++) {
        const productsAtThisSquare = j * PRODUCTS_PER_SQUARE;
        let isFilled = false;
        
        if (i < stationIndex) {
          // Past stations - all filled
          isFilled = true;
        } else if (i === stationIndex) {
          // Current station - partially filled based on progress
          isFilled = productsAtThisSquare < batch.productsCompleted;
        }
        // Future stations - empty
        
        stationSquares.push(
          <div
            key={`${i}-${j}`}
            className={cn(
              "w-2 h-2 rounded-sm transition-colors",
              isFilled 
                ? batch.status === 'green' 
                  ? "bg-success" 
                  : batch.status === 'yellow' 
                    ? "bg-warning-foreground" 
                    : "bg-destructive"
                : "bg-muted border border-border"
            )}
            data-testid={`square-${batch.id}-${i}-${j}`}
          />
        );
      }
      
      squares.push(
        <div
          key={i}
          className={cn(
            "flex gap-0.5 px-2 border-r border-border relative",
            i === cursorPosition && "bg-accent/20"
          )}
        >
          {stationSquares}
          {i === cursorPosition && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <Flag className="h-3 w-3 text-accent" fill="currentColor" />
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div 
        key={batch.id} 
        className="flex items-center border-b border-border hover-elevate"
        data-testid={`timeline-row-${batch.id}`}
      >
        <div className="flex-1 flex items-center min-w-0">
          {squares}
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-background sticky right-0 border-l border-border min-w-[120px]">
          <Badge 
            variant={
              batch.status === 'green' 
                ? "default" 
                : batch.status === 'yellow' 
                  ? "secondary" 
                  : "destructive"
            }
            className="text-xs font-mono"
          >
            {batch.batchNumber}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Production Timeline</h3>
            <p className="text-sm text-muted-foreground">
              Each square = {PRODUCTS_PER_SQUARE} products • Click station headers to set focus cursor
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetCursor}
            data-testid="button-reset-cursor"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Cursor
          </Button>
        </div>

        {/* Timeline Container */}
        <div className="border rounded-lg overflow-hidden">
          {/* Station Headers */}
          <div className="flex items-center bg-muted/50 sticky top-0 z-10 border-b border-border">
            <div className="flex-1 flex min-w-0">
              {stations.map((station, index) => (
                <button
                  key={index}
                  className={cn(
                    "flex-shrink-0 px-2 py-2 text-xs font-medium border-r border-border hover-elevate active-elevate-2 transition-colors",
                    index === cursorPosition && "bg-accent text-accent-foreground"
                  )}
                  style={{ width: `${SQUARES_PER_STATION * 8 + 16}px` }}
                  onClick={() => handleSetCursor(index)}
                  data-testid={`header-${index}`}
                >
                  <div className="truncate text-left">
                    {station}
                    {index === cursorPosition && (
                      <Flag className="inline h-3 w-3 ml-1" fill="currentColor" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="px-3 py-2 text-xs font-medium bg-muted/50 sticky right-0 border-l border-border min-w-[120px]">
              Batch #
            </div>
          </div>

          {/* Batch Rows - Scrollable */}
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-auto max-h-[500px]"
            data-testid="timeline-container"
          >
            {batches.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No active batches
              </div>
            ) : (
              <div>
                {batches
                  .slice()
                  .reverse()
                  .map(renderBatchRow)}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>{batches.length} active batch{batches.length !== 1 ? 'es' : ''}</p>
          <p>
            Focus: <span className="font-medium">{stations[cursorPosition]}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
