import { useState } from "react";
import Draggable from "react-draggable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Warehouse, 
  FlaskConical, 
  Snowflake, 
  Flame, 
  Package, 
  Trash2,
  Droplets,
  RotateCcw,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Station {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
}

const stationTypes = [
  { type: "arrival_dock", label: "Arrival Dock", icon: Warehouse, color: "bg-blue-500" },
  { type: "storage_tank", label: "Storage Tank", icon: Droplets, color: "bg-cyan-500" },
  { type: "laboratory", label: "Lab & R&D", icon: FlaskConical, color: "bg-purple-500" },
  { type: "mixing_room", label: "Mixing Room", icon: Droplets, color: "bg-indigo-500" },
  { type: "heating_room", label: "Heating Room", icon: Flame, color: "bg-orange-500" },
  { type: "cooling_room", label: "Cooling Room", icon: Snowflake, color: "bg-blue-400" },
  { type: "packaging", label: "Packaging", icon: Package, color: "bg-green-500" },
  { type: "waste_management", label: "Waste Management", icon: Trash2, color: "bg-gray-500" },
  { type: "storage", label: "Storage", icon: Warehouse, color: "bg-amber-500" },
  { type: "delivery_dock", label: "Delivery Dock", icon: Warehouse, color: "bg-emerald-500" },
];

export default function FactoryFloorPlan() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleAddStation = (type: string) => {
    const stationType = stationTypes.find(s => s.type === type);
    if (!stationType) return;

    const newStation: Station = {
      id: `${type}-${Date.now()}`,
      type,
      name: stationType.label,
      x: 100,
      y: 100,
    };
    setStations([...stations, newStation]);
  };

  const handleDrag = (id: string, data: { x: number; y: number }) => {
    setStations(stations.map(s => 
      s.id === id ? { ...s, x: data.x, y: data.y } : s
    ));
  };

  const handleRemoveStation = (id: string) => {
    setStations(stations.filter(s => s.id !== id));
  };

  const handleReset = () => {
    setStations([]);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Factory Floor Plan</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              data-testid="button-reset-floor"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Station palette */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {stationTypes.map((station) => {
            const Icon = station.icon;
            return (
              <Button
                key={station.type}
                variant="outline"
                size="sm"
                onClick={() => handleAddStation(station.type)}
                className="justify-start gap-2"
                data-testid={`button-add-${station.type}`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs truncate">{station.label}</span>
                <Plus className="h-3 w-3 ml-auto" />
              </Button>
            );
          })}
        </div>

        {/* Canvas */}
        <div 
          className="relative bg-muted/30 rounded-lg border-2 border-dashed border-border min-h-[400px] overflow-hidden"
          style={{ 
            backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
          data-testid="factory-canvas"
        >
          {stations.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <p className="text-sm">Click station buttons above to add them to your floor plan</p>
            </div>
          )}

          {stations.map((station) => {
            const stationType = stationTypes.find(s => s.type === station.type);
            if (!stationType) return null;
            const Icon = stationType.icon;

            return (
              <Draggable
                key={station.id}
                position={{ x: station.x, y: station.y }}
                onStop={(_, data) => handleDrag(station.id, data)}
                bounds="parent"
              >
                <div 
                  className="absolute cursor-move group"
                  data-testid={`station-${station.id}`}
                >
                  <Card className="p-3 hover-elevate">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-2 rounded", stationType.color)}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{station.name}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveStation(station.id);
                        }}
                        data-testid={`button-remove-${station.id}`}
                      >
                        <span className="text-destructive">×</span>
                      </Button>
                    </div>
                  </Card>
                </div>
              </Draggable>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          {stations.length} station{stations.length !== 1 ? 's' : ''} placed
        </p>
      </div>
    </Card>
  );
}
