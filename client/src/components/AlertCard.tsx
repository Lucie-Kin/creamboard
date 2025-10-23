import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AlertCardProps {
  id: string;
  type: string;
  message: string;
  priority: "low" | "medium" | "high";
  timestamp: Date;
  stationName?: string;
  onDismiss?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
}

export default function AlertCard({
  id,
  type,
  message,
  priority,
  timestamp,
  stationName,
  onDismiss,
  onAcknowledge
}: AlertCardProps) {
  const priorityColors = {
    low: "bg-muted",
    medium: "bg-warning",
    high: "bg-destructive",
  };

  const priorityIcons = {
    low: Bell,
    medium: AlertTriangle,
    high: AlertTriangle,
  };

  const Icon = priorityIcons[priority];

  return (
    <Card 
      className={cn(
        "p-4 border-l-4",
        priority === "high" && "border-l-destructive",
        priority === "medium" && "border-l-warning",
        priority === "low" && "border-l-muted-foreground"
      )}
      data-testid={`alert-${id}`}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-full",
          priority === "high" && "bg-destructive/10",
          priority === "medium" && "bg-warning/10",
          priority === "low" && "bg-muted"
        )}>
          <Icon className={cn(
            "h-4 w-4",
            priority === "high" && "text-destructive",
            priority === "medium" && "text-warning-foreground",
            priority === "low" && "text-muted-foreground"
          )} />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={priority === "high" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {priority.toUpperCase()}
                </Badge>
                {stationName && (
                  <span className="text-xs text-muted-foreground">{stationName}</span>
                )}
              </div>
              <p className="text-sm font-medium">{type}</p>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>

            {onDismiss && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDismiss(id)}
                className="h-6 w-6"
                data-testid={`button-dismiss-${id}`}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(timestamp, { addSuffix: true })}
            </span>
            {onAcknowledge && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAcknowledge(id)}
                data-testid={`button-acknowledge-${id}`}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Acknowledge
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
