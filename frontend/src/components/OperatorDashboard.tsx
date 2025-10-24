import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  QrCode, 
  LogOut, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  ListTodo,
  Stethoscope,
  Camera
} from "lucide-react";
import TrafficLightIndicator from "./TrafficLightIndicator";
import AlertCard from "./AlertCard";
import TaskItem from "./TaskItem";
import QRScanner from "./QRScanner";
import { cn } from "@/lib/utils";
import { useUnacknowledgedAlerts, useAcknowledgeAlert } from "@/lib/api-hooks";

interface OperatorDashboardProps {
  operatorName: string;
  operatorRole: string;
  onLogout: () => void;
}

type PageType = "alerts" | "tasks" | "diagnosis" | "scan";

const pages: { id: PageType; title: string; icon: any }[] = [
  { id: "alerts", title: "Alerts", icon: AlertCircle },
  { id: "tasks", title: "Tasks", icon: ListTodo },
  { id: "diagnosis", title: "Self-Diagnosis", icon: Stethoscope },
  { id: "scan", title: "Scan", icon: QrCode },
];

export default function OperatorDashboard({ 
  operatorName, 
  operatorRole,
  onLogout 
}: OperatorDashboardProps) {
  const [currentPage, setCurrentPage] = useState<PageType>("alerts");
  const [showScanner, setShowScanner] = useState(false);
  const [selfDiagnosisStatus, setSelfDiagnosisStatus] = useState<string>("green");
  const [notes, setNotes] = useState("");

  // Fetch real alerts from Pinata-backed API (NO MOCK DATA)
  const { data: apiAlerts = [], isLoading: alertsLoading } = useUnacknowledgedAlerts();
  const acknowledgeMutation = useAcknowledgeAlert();

  // Convert API alerts to display format
  const alerts = apiAlerts.map(alert => ({
    id: alert.id,
    type: alert.type,
    message: alert.message,
    priority: alert.priority,
    timestamp: new Date(alert.timestamp),
    stationName: alert.stationId || "Unknown Station"
  }));

  // Placeholder for tasks - TODO: Load from backend
  const mockTasks = [
    {
      id: '1',
      title: 'Temperature Check',
      description: 'Verify cooling room temperature is between 2-4°C',
      previousStatus: 'green' as const,
      completed: false
    },
    {
      id: '2',
      title: 'Quality Inspection',
      description: 'Check batch consistency and color',
      previousStatus: 'yellow' as const,
      completed: false
    }
  ];

  const [tasks, setTasks] = useState(mockTasks);

  const handleSubmitDiagnosis = () => {
    console.log('Submitting diagnosis:', { status: selfDiagnosisStatus, notes });
    // todo: Connect to backend API
    alert(`Status submitted: ${selfDiagnosisStatus}`);
  };

  const currentPageIndex = pages.findIndex(p => p.id === currentPage);
  const canGoBack = currentPageIndex > 0;
  const canGoForward = currentPageIndex < pages.length - 1;

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left" && canGoForward) {
      setCurrentPage(pages[currentPageIndex + 1].id);
    } else if (direction === "right" && canGoBack) {
      setCurrentPage(pages[currentPageIndex - 1].id);
    }
  };

  if (alertsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading operator dashboard...</p>
          <p className="text-sm text-muted-foreground mt-2">Fetching alerts from Pinata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header - Compact */}
      <header className="sticky top-0 z-10 bg-card border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-semibold">{operatorName}</h1>
            <p className="text-sm text-muted-foreground">{operatorRole}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Bell className="h-3 w-3" />
              {alerts.length}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Swipeable */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-4">
          {/* Alerts Page */}
          {currentPage === "alerts" && (
            <div className="space-y-4" data-testid="page-alerts">
              {/* Big Previous Station Status - Only in Alerts */}
              <Card className="p-4 bg-muted/30">
                <h3 className="text-sm font-medium mb-3">Previous Stations</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                    <div className="w-3 h-3 bg-success rounded-full" />
                    <span className="text-sm font-medium">Mixing</span>
                    <span className="text-xs text-muted-foreground">Normal</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                    <div className="w-3 h-3 bg-success rounded-full" />
                    <span className="text-sm font-medium">Heating</span>
                    <span className="text-xs text-muted-foreground">Normal</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-card">
                    <div className="w-3 h-3 bg-warning rounded-full" />
                    <span className="text-sm font-medium">Quality</span>
                    <span className="text-xs text-muted-foreground">Attention</span>
                  </div>
                </div>
              </Card>

              <h2 className="text-lg font-semibold">Your Alerts</h2>
              {alerts.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active alerts</p>
                </Card>
              ) : (
                alerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    {...alert}
                    onDismiss={(id) => acknowledgeMutation.mutate(id)}
                    onAcknowledge={(id) => acknowledgeMutation.mutate(id)}
                  />
                ))
              )}
            </div>
          )}

          {/* Tasks Page */}
          {currentPage === "tasks" && (
            <div className="space-y-4" data-testid="page-tasks">
              {/* Smaller Previous Station Status - Reminder in Tasks */}
              <div className="p-3 rounded-lg bg-muted/20 border">
                <p className="text-xs text-muted-foreground mb-2">Previous Stations</p>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-xs">Mixing</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-success rounded-full" />
                    <span className="text-xs">Heating</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-warning rounded-full" />
                    <span className="text-xs">Quality</span>
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-semibold">Your Tasks</h2>
              {tasks.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <ListTodo className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No pending tasks</p>
                </Card>
              ) : (
                tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    {...task}
                    onToggle={(id) => setTasks(tasks.map(t => 
                      t.id === id ? { ...t, completed: !t.completed } : t
                    ))}
                    onDetails={(id) => console.log('View details for', id)}
                  />
                ))
              )}
            </div>
          )}

          {/* Self-Diagnosis Page */}
          {currentPage === "diagnosis" && (
            <div data-testid="page-diagnosis">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Self-Diagnosis</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      How would you rate your station status?
                    </Label>
                    <RadioGroup 
                      value={selfDiagnosisStatus} 
                      onValueChange={setSelfDiagnosisStatus}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover-elevate">
                        <RadioGroupItem value="green" id="green" data-testid="radio-green" />
                        <Label htmlFor="green" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-success rounded-full" />
                            <span className="font-medium">Green - All Good</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover-elevate">
                        <RadioGroupItem value="yellow" id="yellow" data-testid="radio-yellow" />
                        <Label htmlFor="yellow" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-warning rounded-full" />
                            <span className="font-medium">Yellow - Minor Issues</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover-elevate">
                        <RadioGroupItem value="red" id="red" data-testid="radio-red" />
                        <Label htmlFor="red" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-destructive rounded-full" />
                            <span className="font-medium">Red - Critical Issues</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Describe any issues or observations..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      data-testid="textarea-notes"
                    />
                  </div>

                  <Button 
                    onClick={handleSubmitDiagnosis} 
                    className="w-full"
                    data-testid="button-submit-diagnosis"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Diagnosis
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Scan Page */}
          {currentPage === "scan" && (
            <div data-testid="page-scan">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">QR Code Scanner</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan batch QR codes or equipment tags to log information
                </p>
                <Button 
                  onClick={() => setShowScanner(true)} 
                  className="w-full"
                  data-testid="button-open-scanner"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Open Scanner
                </Button>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Thumb Reachable */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-20 max-w-md mx-auto">
        <div className="flex items-center justify-around py-2 px-2">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <button
                key={page.id}
                onClick={() => setCurrentPage(page.id)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]",
                  currentPage === page.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover-elevate"
                )}
                data-testid={`nav-${page.id}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{page.title}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          title="Scan Batch QR Code"
          onScan={(code) => {
            console.log('Scanned code:', code);
            setShowScanner(false);
            alert(`Scanned: ${code}`);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
