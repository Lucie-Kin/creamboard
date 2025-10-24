import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import TrafficLightIndicator from "./TrafficLightIndicator";
import { ChevronRight } from "lucide-react";

interface TaskItemProps {
  id: string;
  title: string;
  description: string;
  previousStatus: "green" | "yellow" | "red";
  completed: boolean;
  onToggle: (id: string) => void;
  onDetails: (id: string) => void;
}

export default function TaskItem({
  id,
  title,
  description,
  previousStatus,
  completed,
  onToggle,
  onDetails
}: TaskItemProps) {
  return (
    <Card className="p-4" data-testid={`task-${id}`}>
      <div className="flex items-start gap-4">
        <Checkbox
          checked={completed}
          onCheckedChange={() => onToggle(id)}
          className="mt-1"
          data-testid={`checkbox-task-${id}`}
        />

        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium">{title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            <TrafficLightIndicator 
              status={previousStatus} 
              label="Previous" 
              size="sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <Badge variant={completed ? "default" : "secondary"} className="text-xs">
              {completed ? "Completed" : "Pending"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDetails(id)}
              data-testid={`button-task-details-${id}`}
            >
              Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
