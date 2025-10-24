import { useState } from "react";
import Draggable from "react-draggable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Warehouse, 
  FlaskConical, 
  Snowflake, 
  Flame, 
  Package, 
  Trash2,
  Droplets,
  RotateCcw,
  Plus,
  Link as LinkIcon,
  Unlink,
  Tractor,
  Truck,
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

interface Station {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

const stationTypes = [
  { type: "provider", label: "Provider (Farm/Supplier)", icon: Tractor, color: "bg-lime-600" },
  { type: "arrival_dock", label: "Arrival Dock", icon: Warehouse, color: "bg-blue-500" },
  { type: "storage_tank", label: "Storage Tank", icon: Droplets, color: "bg-cyan-500" },
  { type: "lab_rd", label: "Lab & R&D", icon: FlaskConical, color: "bg-purple-500" },
  { type: "mixing_room", label: "Mixing Room", icon: Droplets, color: "bg-indigo-500" },
  { type: "heating_room", label: "Heating Room", icon: Flame, color: "bg-orange-500" },
  { type: "cooling_room", label: "Cooling Room", icon: Snowflake, color: "bg-blue-400" },
  { type: "packaging", label: "Packaging", icon: Package, color: "bg-green-500" },
  { type: "waste_management", label: "Waste Management", icon: Trash2, color: "bg-gray-500" },
  { type: "storage", label: "Final Storage", icon: Warehouse, color: "bg-amber-500" },
  { type: "delivery_dock", label: "Delivery Dock", icon: Warehouse, color: "bg-emerald-500" },
  { type: "transporter", label: "Transporter (Logistics)", icon: Truck, color: "bg-rose-600" },
];

export default function FactoryFloorPlan() {
  const [stations, setStations] = useState<Station[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [linkingMode, setLinkingMode] = useState(false);
  const [linkFrom, setLinkFrom] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleAddStation = (type: string) => {
    const stationType = stationTypes.find(s => s.type === type);
    if (!stationType) return;

    const newStation: Station = {
      id: `${type}-${Date.now()}`,
      type,
      name: stationType.label,
      x: 100 + stations.length * 20,
      y: 100 + stations.length * 20,
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
    // Remove associated connections
    setConnections(connections.filter(c => c.from !== id && c.to !== id));
  };

  const handleStationClick = (stationId: string) => {
    if (!linkingMode) return;

    if (linkFrom === null) {
      // Start linking
      setLinkFrom(stationId);
    } else if (linkFrom === stationId) {
      // Cancel linking
      setLinkFrom(null);
    } else {
      // Complete linking
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: linkFrom,
        to: stationId
      };
      setConnections([...connections, newConnection]);
      setLinkFrom(null);
    }
  };

  const handleRemoveConnection = (connectionId: string) => {
    setConnections(connections.filter(c => c.id !== connectionId));
  };

  const handleReset = () => {
    setStations([]);
    setConnections([]);
    setLinkingMode(false);
    setLinkFrom(null);
  };

  const handleSaveFloorPlan = async () => {
    if (stations.length === 0) {
      toast({
        title: "No stations to save",
        description: "Please add at least one station to the floor plan before saving.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const floorPlanData = {
        stations,
        connections,
        savedAt: new Date().toISOString()
      };

      await apiRequest("/api/floor-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(floorPlanData)
      });

      toast({
        title: "Floor plan saved!",
        description: `Saved ${stations.length} stations and ${connections.length} connections.`
      });
    } catch (error) {
      console.error("Failed to save floor plan:", error);
      toast({
        title: "Failed to save floor plan",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStationCenter = (stationId: string) => {
    const station = stations.find(s => s.id === stationId);
    if (!station) return { x: 0, y: 0 };
    return {
      x: station.x + 75, // Half of card width
      y: station.y + 25  // Half of card height
    };
  };

  const drawConnection = (conn: Connection) => {
    const from = getStationCenter(conn.from);
    const to = getStationCenter(conn.to);
    
    // Calculate arrow path
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowSize = 8;
    const arrowX = to.x - Math.cos(angle) * 20;
    const arrowY = to.y - Math.sin(angle) * 20;

    return (
      <g key={conn.id}>
        {/* Connection line */}
        <line
          x1={from.x}
          y1={from.y}
          x2={arrowX}
          y2={arrowY}
          stroke="hsl(var(--accent))"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
        {/* Delete button for connection */}
        <g
          className="cursor-pointer hover:opacity-75"
          onClick={() => handleRemoveConnection(conn.id)}
        >
          <circle
            cx={(from.x + to.x) / 2}
            cy={(from.y + to.y) / 2}
            r="10"
            fill="hsl(var(--destructive))"
          />
          <text
            x={(from.x + to.x) / 2}
            y={(from.y + to.y) / 2}
            textAnchor="middle"
            dy="4"
            fontSize="12"
            fill="white"
            fontWeight="bold"
          >
            ×
          </text>
        </g>
      </g>
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Factory Floor Plan</h3>
          <div className="flex gap-2">
            <Button
              variant={linkingMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setLinkingMode(!linkingMode);
                setLinkFrom(null);
              }}
              data-testid="button-link-mode"
            >
              {linkingMode ? <Unlink className="h-4 w-4 mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
              {linkingMode ? "Exit Link Mode" : "Link Stations"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              data-testid="button-reset-floor"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveFloorPlan}
              disabled={isSaving || stations.length === 0}
              data-testid="button-save-floor-plan"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Floor Plan"}
            </Button>
          </div>
        </div>

        {linkingMode && (
          <div className="p-3 bg-accent/10 border border-accent rounded-lg">
            <p className="text-sm">
              {linkFrom 
                ? "Click on another station to create a connection, or click the same station to cancel"
                : "Click on a station to start creating a connection"}
            </p>
          </div>
        )}

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
          className="relative bg-muted/30 rounded-lg border-2 border-dashed border-border min-h-[500px] overflow-hidden"
          style={{ 
            backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
          data-testid="factory-canvas"
        >
          {stations.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <p className="text-sm text-center max-w-md">
                Click station buttons above to add them to your floor plan.<br />
                Use "Link Stations" to create production flow connections.
              </p>
            </div>
          )}

          {/* SVG for connections */}
          {connections.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill="hsl(var(--accent))"
                  />
                </marker>
              </defs>
              {connections.map(drawConnection)}
            </svg>
          )}

          {/* Stations */}
          {stations.map((station) => {
            const stationType = stationTypes.find(s => s.type === station.type);
            if (!stationType) return null;
            const Icon = stationType.icon;

            const isLinkSource = linkFrom === station.id;
            const canLinkTo = linkingMode && linkFrom !== null && linkFrom !== station.id;

            return (
              <Draggable
                key={station.id}
                position={{ x: station.x, y: station.y }}
                onStop={(_, data) => handleDrag(station.id, data)}
                bounds="parent"
                disabled={linkingMode}
              >
                <div 
                  className={cn(
                    "absolute cursor-move group",
                    linkingMode && "cursor-pointer",
                    isLinkSource && "ring-4 ring-accent"
                  )}
                  onClick={() => handleStationClick(station.id)}
                  data-testid={`station-${station.id}`}
                >
                  <Card className={cn(
                    "p-3 hover-elevate",
                    canLinkTo && "ring-2 ring-accent/50"
                  )}>
                    <div className="flex items-center gap-2 w-36">
                      <div className={cn("p-2 rounded", stationType.color)}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{station.name}</p>
                      </div>
                      {!linkingMode && (
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
                      )}
                    </div>
                  </Card>
                </div>
              </Draggable>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>{stations.length} station{stations.length !== 1 ? 's' : ''} placed</p>
          <p>{connections.length} connection{connections.length !== 1 ? 's' : ''} created</p>
        </div>
      </div>
    </Card>
  );
}
