import { useState } from "react";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Map, 
  Settings, 
  Bell,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import SearchBar from "./SearchBar";
import ProductionGrid from "./ProductionGrid";
import FactoryFloorPlan from "./FactoryFloorPlan";
import AlertCard from "./AlertCard";
import TrafficLightIndicator from "./TrafficLightIndicator";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { title: "Floor Plan", icon: Map, id: "floor-plan" },
  { title: "Settings", icon: Settings, id: "settings" },
];

export default function ManagerDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);

  // todo: remove mock functionality
  const mockBatches = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      id: `batch-${i}`,
      batchNumber: `MK${1000 + i}`,
      productName: i % 3 === 0 ? 'Vanilla' : i % 3 === 1 ? 'Chocolate' : 'Strawberry',
      status: (i % 5 === 0 ? 'red' : i % 3 === 0 ? 'yellow' : 'green') as "green" | "yellow" | "red",
      timestamp: date,
      station: 'Cooling Room'
    };
  });

  const mockAlerts = [
    {
      id: '1',
      type: 'Threshold Exceeded',
      message: '4 stations reporting non-green status',
      priority: 'high' as const,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: '2',
      type: 'Maintenance Due',
      message: 'Tank 4 maintenance overdue by 2 days',
      priority: 'medium' as const,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    }
  ];

  const [alerts, setAlerts] = useState(mockAlerts);

  const filteredBatches = mockBatches.filter(batch => {
    const matchesSearch = searchQuery === "" || 
      batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.productName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = filters.length === 0 || 
      filters.some(f => batch.productName.toLowerCase().includes(f.toLowerCase()));

    return matchesSearch && matchesFilters;
  });

  const statusCounts = {
    green: mockBatches.filter(b => b.status === 'green').length,
    yellow: mockBatches.filter(b => b.status === 'yellow').length,
    red: mockBatches.filter(b => b.status === 'red').length,
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Miko Factory</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActivePage(item.id)}
                          isActive={activePage === item.id}
                          data-testid={`nav-${item.id}`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-xl font-semibold">
                {menuItems.find(i => i.id === activePage)?.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="gap-1">
                <Bell className="h-3 w-3" />
                {alerts.length}
              </Badge>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 space-y-6">
            {activePage === "dashboard" && (
              <>
                {/* Search Bar */}
                <SearchBar
                  onSearch={setSearchQuery}
                  filters={filters}
                  onFilterRemove={(filter) => setFilters(filters.filter(f => f !== filter))}
                  onClearAll={() => setFilters([])}
                />

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Green Status</p>
                        <p className="text-3xl font-bold text-success">{statusCounts.green}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-success" />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Yellow Status</p>
                        <p className="text-3xl font-bold text-warning-foreground">{statusCounts.yellow}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-warning-foreground" />
                    </div>
                  </Card>
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Red Status</p>
                        <p className="text-3xl font-bold text-destructive">{statusCounts.red}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                  </Card>
                </div>

                {/* Alerts */}
                {alerts.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold">Active Alerts</h2>
                    {alerts.map(alert => (
                      <AlertCard
                        key={alert.id}
                        {...alert}
                        onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))}
                      />
                    ))}
                  </div>
                )}

                {/* Production Grid */}
                <ProductionGrid batches={filteredBatches} />

                {/* Recent Batches */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Batches</h3>
                  <div className="space-y-2">
                    {filteredBatches.slice(-5).reverse().map(batch => (
                      <div 
                        key={batch.id} 
                        className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                        data-testid={`batch-${batch.id}`}
                      >
                        <div>
                          <p className="font-mono font-medium">{batch.batchNumber}</p>
                          <p className="text-sm text-muted-foreground">{batch.productName}</p>
                        </div>
                        <TrafficLightIndicator 
                          status={batch.status} 
                          label="" 
                          size="sm"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {activePage === "floor-plan" && (
              <FactoryFloorPlan />
            )}

            {activePage === "settings" && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Alert Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Alert Threshold (number of red statuses)
                    </label>
                    <input
                      type="number"
                      defaultValue={3}
                      className="mt-2 w-full max-w-xs px-3 py-2 border rounded-lg"
                      data-testid="input-threshold"
                    />
                  </div>
                  <Button data-testid="button-save-settings">Save Settings</Button>
                </div>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
