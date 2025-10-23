import { useState, useEffect } from "react";
import Draggable from "react-draggable";
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
  AlertTriangle,
  GripVertical
} from "lucide-react";
import SearchBar from "./SearchBar";
import FactoryFloorPlan from "./FactoryFloorPlan";
import AlertCard from "./AlertCard";
import TrafficLightIndicator from "./TrafficLightIndicator";
import NotificationPanel from "./NotificationPanel";
import ProductionFlowVisualization from "./ProductionFlowVisualization";
import ProductionTimeline from "./ProductionTimeline";
import {
  initializeProduction,
  updateAllBatches,
  addBatchToProduction,
  getAllActiveBatches,
  generateRandomTicket,
  type Ticket,
  type ProductionBatch
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { title: "Floor Plan", icon: Map, id: "floor-plan" },
  { title: "Settings", icon: Settings, id: "settings" },
];

type DashboardCard = {
  id: string;
  component: JSX.Element;
  order: number;
};

export default function ManagerDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [cardOrder, setCardOrder] = useState<string[]>([
    "stats",
    "alerts",
    "production-timeline",
    "production-flow",
    "recent-batches"
  ]);
  const [viewMode, setViewMode] = useState<"timeline" | "flow">("timeline");

  // Initialize production data
  useEffect(() => {
    initializeProduction();
    setBatches(getAllActiveBatches());

    // Generate initial tickets
    const initialTickets: Ticket[] = [];
    for (let i = 0; i < 3; i++) {
      initialTickets.push(generateRandomTicket());
    }
    setTickets(initialTickets);

    // Update batches every 2 seconds (simulating 0.5 batches/second = 40 products/second with avg 80 products/batch)
    const batchInterval = setInterval(() => {
      setBatches(updateAllBatches());
    }, 2000);

    // Add new batch every 10 seconds
    const addBatchInterval = setInterval(() => {
      addBatchToProduction();
      setBatches(getAllActiveBatches());
    }, 10000);

    // Randomly generate new tickets
    const ticketInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setTickets(prev => [...prev, generateRandomTicket()]);
      }
    }, 30000);

    return () => {
      clearInterval(batchInterval);
      clearInterval(addBatchInterval);
      clearInterval(ticketInterval);
    };
  }, []);

  const handleAssignTicket = (ticketId: string, operatorId: string, response: string) => {
    setTickets(prev => prev.map(t => 
      t.id === ticketId 
        ? { ...t, status: "assigned", assignedTo: operatorId, managerResponse: response }
        : t
    ));
    console.log('Assigned ticket', ticketId, 'to', operatorId);
  };

  const handleResolveTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: "resolved" } : t
    ));
  };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = searchQuery === "" || 
      batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.productName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = filters.length === 0 || 
      filters.some(f => batch.productName.toLowerCase().includes(f.toLowerCase()));

    return matchesSearch && matchesFilters;
  });

  const statusCounts = {
    green: batches.filter(b => b.status === 'green').length,
    yellow: batches.filter(b => b.status === 'yellow').length,
    red: batches.filter(b => b.status === 'red').length,
  };

  const recentAlerts = tickets.filter(t => t.status === 'open').slice(0, 3);
  const openTicketsCount = tickets.filter(t => t.status === 'open').length;

  const swapCards = (index1: number, index2: number) => {
    const newOrder = [...cardOrder];
    [newOrder[index1], newOrder[index2]] = [newOrder[index2], newOrder[index1]];
    setCardOrder(newOrder);
  };

  const dashboardCards: Record<string, JSX.Element> = {
    "stats": (
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
    ),
    "alerts": recentAlerts.length > 0 ? (
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Alerts</h2>
        {recentAlerts.map(alert => (
          <AlertCard
            key={alert.id}
            id={alert.id}
            type={alert.issue}
            message={`From ${alert.operatorName} at ${alert.station}`}
            priority={alert.priority}
            timestamp={alert.timestamp}
            stationName={alert.station}
            onDismiss={() => handleResolveTicket(alert.id)}
          />
        ))}
      </div>
    ) : <div />,
    "production-timeline": <ProductionTimeline batches={filteredBatches} />,
    "production-flow": <ProductionFlowVisualization batches={filteredBatches} />,
    "recent-batches": (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Batches</h3>
        <div className="space-y-2 max-h-96 overflow-auto">
          {filteredBatches.slice(-10).reverse().map(batch => (
            <div 
              key={batch.id} 
              className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
              data-testid={`batch-${batch.id}`}
            >
              <div className="flex-1">
                <p className="font-mono font-medium">{batch.batchNumber}</p>
                <p className="text-sm text-muted-foreground">{batch.productName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {batch.productsCompleted} / {batch.productsInBatch} products
                </p>
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
    )
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
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowNotifications(!showNotifications)}
                data-testid="button-notifications"
              >
                <Bell className="h-5 w-5" />
                {openTicketsCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {openTicketsCount}
                  </Badge>
                )}
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
              {activePage === "dashboard" && (
                <>
                  {/* Search Bar */}
                  <SearchBar
                    onSearch={setSearchQuery}
                    filters={filters}
                    onFilterRemove={(filter) => setFilters(filters.filter(f => f !== filter))}
                    onClearAll={() => setFilters([])}
                  />

                  {/* Draggable Dashboard Cards */}
                  <div className="space-y-6">
                    {cardOrder.map((cardId, index) => (
                      <div key={cardId} className="relative group">
                        {/* Drag Handle */}
                        <div className="absolute -left-8 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex flex-col gap-1">
                            {index > 0 && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => swapCards(index, index - 1)}
                                data-testid={`button-move-up-${cardId}`}
                              >
                                ▲
                              </Button>
                            )}
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                            {index < cardOrder.length - 1 && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => swapCards(index, index + 1)}
                                data-testid={`button-move-down-${cardId}`}
                              >
                                ▼
                              </Button>
                            )}
                          </div>
                        </div>
                        {dashboardCards[cardId]}
                      </div>
                    ))}
                  </div>
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
                    <div>
                      <label className="text-sm font-medium">
                        Products per Batch (average)
                      </label>
                      <input
                        type="number"
                        defaultValue={300}
                        className="mt-2 w-full max-w-xs px-3 py-2 border rounded-lg"
                        data-testid="input-batch-size"
                      />
                    </div>
                    <Button data-testid="button-save-settings">Save Settings</Button>
                  </div>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel
          tickets={tickets}
          onClose={() => setShowNotifications(false)}
          onAssignTicket={handleAssignTicket}
          onResolveTicket={handleResolveTicket}
        />
      )}
    </SidebarProvider>
  );
}
