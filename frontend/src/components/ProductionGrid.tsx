import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BatchData {
  id: string;
  batchNumber: string;
  productName: string;
  status: "green" | "yellow" | "red" | "none";
  timestamp: Date;
  station?: string;
}

interface ProductionGridProps {
  batches: BatchData[];
  daysToShow?: number;
}

export default function ProductionGrid({ batches, daysToShow = 30 }: ProductionGridProps) {
  // Create a grid of days (like GitHub contributions)
  const days = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (daysToShow - 1 - i));
    return date;
  });

  const getBatchesForDay = (day: Date) => {
    return batches.filter((batch) => {
      const batchDate = new Date(batch.timestamp);
      return (
        batchDate.getDate() === day.getDate() &&
        batchDate.getMonth() === day.getMonth() &&
        batchDate.getFullYear() === day.getFullYear()
      );
    });
  };

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

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Production Traffic</h3>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-sm" />
              <span className="text-muted-foreground">Green</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-warning rounded-sm" />
              <span className="text-muted-foreground">Yellow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-sm" />
              <span className="text-muted-foreground">Red</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-flex gap-1 min-w-full">
            {days.map((day, idx) => {
              const dayBatches = getBatchesForDay(day);
              const avgStatus = dayBatches.length > 0
                ? dayBatches[0].status
                : "none";

              return (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "w-3 h-3 rounded-sm cursor-pointer hover-elevate transition-transform hover:scale-110",
                        getStatusColor(avgStatus)
                      )}
                      data-testid={`grid-cell-${idx}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-1">
                      <p className="font-semibold">
                        {day.toLocaleDateString("en-US", { 
                          month: "short", 
                          day: "numeric" 
                        })}
                      </p>
                      <p>{dayBatches.length} batches</p>
                      {dayBatches.length > 0 && (
                        <p className="text-muted-foreground">
                          {dayBatches[0].productName}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm text-muted-foreground">
            Last {daysToShow} days of production
          </p>
        </div>
      </div>
    </Card>
  );
}
