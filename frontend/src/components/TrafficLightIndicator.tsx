import { cn } from "@/lib/utils";

interface TrafficLightIndicatorProps {
  status: "green" | "yellow" | "red";
  label: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

export default function TrafficLightIndicator({ 
  status, 
  label, 
  size = "md",
  pulse = false 
}: TrafficLightIndicatorProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const statusColors = {
    green: "bg-success",
    yellow: "bg-warning",
    red: "bg-destructive",
  };

  return (
    <div className="flex flex-col items-center gap-2" data-testid={`status-${status}`}>
      <div 
        className={cn(
          "rounded-full flex items-center justify-center",
          sizeClasses[size],
          statusColors[status],
          pulse && status === "red" && "animate-pulse"
        )}
        aria-label={`${label}: ${status}`}
      />
      <span className="text-sm text-muted-foreground text-center">{label}</span>
    </div>
  );
}
