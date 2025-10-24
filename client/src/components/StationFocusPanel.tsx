import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Thermometer, 
  Zap, 
  Clock, 
  TrendingDown, 
  TrendingUp,
  Activity,
  Droplets,
  Gauge,
  X,
  MapPin,
  Award,
  TrendingUp as TrendingUpIcon,
  Tractor
} from "lucide-react";
import ProductionFlowVisualization from "./ProductionFlowVisualization";
import { useProviders } from "@/lib/api-hooks";
import type { BatchData } from "@shared/pinata-schema";

interface StationFocusPanelProps {
  stationName: string;
  batches: BatchData[];
  onClose: () => void;
}

// Mock station-specific metrics based on station type
const getStationMetrics = (stationName: string) => {
  const station = stationName.toLowerCase();
  
  if (station.includes("heating")) {
    return [
      { 
        icon: Thermometer, 
        label: "Temperature", 
        value: "82.4°C", 
        trend: "down",
        insight: "0.3% cooler than last month average"
      },
      { 
        icon: Zap, 
        label: "Energy Usage", 
        value: "245 kWh", 
        trend: "up",
        insight: "0.2% more costly vs. last period"
      },
      { 
        icon: Clock, 
        label: "Avg Processing Time", 
        value: "12.3 min", 
        trend: "down",
        insight: "2.1% faster than baseline"
      },
    ];
  }
  
  if (station.includes("cooling")) {
    return [
      { 
        icon: Thermometer, 
        label: "Temperature", 
        value: "-4.2°C", 
        trend: "stable",
        insight: "Within optimal range"
      },
      { 
        icon: Zap, 
        label: "Compressor Load", 
        value: "78%", 
        trend: "up",
        insight: "Factory B reduced by 5% with new system"
      },
      { 
        icon: Clock, 
        label: "Cool Down Time", 
        value: "8.7 min", 
        trend: "up",
        insight: "Consider maintenance check"
      },
    ];
  }
  
  if (station.includes("mixing")) {
    return [
      { 
        icon: Activity, 
        label: "Mixer Speed", 
        value: "450 RPM", 
        trend: "stable",
        insight: "Optimal for current batch size"
      },
      { 
        icon: Droplets, 
        label: "Viscosity", 
        value: "2400 cP", 
        trend: "stable",
        insight: "Perfect consistency achieved"
      },
      { 
        icon: Clock, 
        label: "Mix Duration", 
        value: "15.2 min", 
        trend: "down",
        insight: "1.8% improvement this week"
      },
    ];
  }
  
  if (station.includes("packaging")) {
    return [
      { 
        icon: Gauge, 
        label: "Line Speed", 
        value: "420 units/min", 
        trend: "up",
        insight: "Running above target +5%"
      },
      { 
        icon: Activity, 
        label: "Quality Pass Rate", 
        value: "99.4%", 
        trend: "up",
        insight: "Best performance this quarter"
      },
      { 
        icon: Clock, 
        label: "Downtime", 
        value: "0.8%", 
        trend: "down",
        insight: "Factory C has 0.3% with new sealer"
      },
    ];
  }
  
  // Default metrics for other stations
  return [
    { 
      icon: Activity, 
      label: "Throughput", 
      value: "380 units/hr", 
      trend: "stable",
      insight: "Meeting production targets"
    },
    { 
      icon: Clock, 
      label: "Avg Processing", 
      value: "9.5 min", 
      trend: "stable",
      insight: "On track with schedule"
    },
    { 
      icon: Gauge, 
      label: "Efficiency", 
      value: "94.2%", 
      trend: "up",
      insight: "Above industry average"
    },
  ];
};

export default function StationFocusPanel({ 
  stationName, 
  batches, 
  onClose 
}: StationFocusPanelProps) {
  // Fetch provider data from Pinata
  const { data: providers = [] } = useProviders();
  
  const stationBatches = batches.filter(b => 
    b.currentStation?.toLowerCase() === stationName.toLowerCase()
  );

  // Check if this station is a provider
  const isProvider = stationName.toLowerCase().includes("provider") || 
                     stationName.toLowerCase().includes("farm") ||
                     stationName.toLowerCase().includes("supplier");
  
  // Find matching provider data
  const providerData = isProvider 
    ? providers.find(p => stationName.toLowerCase().includes(p.name.toLowerCase()))
    : null;

  const metrics = getStationMetrics(stationName);

  return (
    <Card className="p-6 border-accent">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-base px-3 py-1">
              Focus
            </Badge>
            <h3 className="text-lg font-semibold">{stationName}</h3>
            <Badge variant="outline">
              {stationBatches.length} active batch{stationBatches.length !== 1 ? 'es' : ''}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            data-testid="button-close-focus"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Provider Details (if this station is a provider) */}
        {providerData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-accent/5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </div>
                <p className="text-lg font-semibold">{providerData.address}</p>
                <p className="text-xs text-muted-foreground italic">
                  {providerData.distanceKm} km from factory
                </p>
              </div>
            </Card>

            <Card className="p-4 bg-accent/5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>Certifications</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(providerData.certifications ?? []).map((cert: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                  {(!providerData.certifications || providerData.certifications.length === 0) && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      No certifications on file
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Verified quality standards
                </p>
              </div>
            </Card>

            <Card className="p-4 bg-accent/5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUpIcon className="h-4 w-4" />
                  <span>Audit Score</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-success">{providerData.conditions?.score ?? 'N/A'}</p>
                  {providerData.conditions?.score && <span className="text-sm text-muted-foreground">/100</span>}
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Last audit: {providerData.conditions?.lastAudit ? new Date(providerData.conditions?.lastAudit).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Station Metrics Grid (for factory stations) */}
        {!providerData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const trendIcon = metric.trend === "up" 
              ? TrendingUp 
              : metric.trend === "down" 
                ? TrendingDown 
                : Activity;
            const TrendIcon = trendIcon;
            const trendColor = metric.trend === "up" 
              ? "text-success" 
              : metric.trend === "down" 
                ? "text-destructive" 
                : "text-muted-foreground";

            return (
              <Card key={index} className="p-4 bg-accent/5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    <span>{metric.label}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {metric.insight}
                  </p>
                </div>
              </Card>
            );
            })}
          </div>
        )}

        {/* AI Insight Banner */}
        <div className="p-4 bg-accent/10 border border-accent rounded-lg">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                <Activity className="h-4 w-4 text-accent-foreground" />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">AI Performance Analysis</p>
              <p className="text-sm text-muted-foreground">
                {isProvider && providerData && 
                  `${providerData.name} maintains excellent quality standards${providerData.conditions?.score ? ` with a ${providerData.conditions.score}/100 audit score` : ''}. Certifications ${providerData.certifications?.join(', ') ?? 'pending'} ensure compliance. Production capacity of ${providerData.productionCapacity ?? 'not specified'} meets current demand efficiently.`}
                {!isProvider && stationName.toLowerCase().includes("heating") && 
                  "Temperature stability has improved 2.3% this month. Factory D implemented automated climate control with 15% energy savings - worth exploring for Q2."}
                {!isProvider && stationName.toLowerCase().includes("cooling") && 
                  "Compressor efficiency declining slightly. Factory B upgraded to variable-speed compressors last quarter, achieving 12% energy reduction and faster cool-down times."}
                {!isProvider && stationName.toLowerCase().includes("mixing") && 
                  "Mixing consistency is excellent. Current batch times align with best-in-class performance. No optimization recommendations at this time."}
                {!isProvider && stationName.toLowerCase().includes("packaging") && 
                  "Line running exceptionally well. Factory C recently installed new heat-sealing equipment reducing downtime by 40%. Consider for next equipment refresh cycle."}
                {!isProvider && !stationName.toLowerCase().includes("heating") && 
                 !stationName.toLowerCase().includes("cooling") && 
                 !stationName.toLowerCase().includes("mixing") && 
                 !stationName.toLowerCase().includes("packaging") &&
                  "Station performance is within normal parameters. Cross-factory data indicates no immediate optimization opportunities in this area."}
              </p>
            </div>
          </div>
        </div>

        {/* Batches at this station - Using existing flow visualization */}
        {stationBatches.length > 0 && (
          <div>
            <ProductionFlowVisualization batches={stationBatches} />
          </div>
        )}
      </div>
    </Card>
  );
}
