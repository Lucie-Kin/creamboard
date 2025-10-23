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

  // todo: remove mock functionality
  const mockAlerts = [
    {
      id: '1',
      type: 'Maintenance Required',
      message: 'Last check-up more than 2 days ago on Tank 4',
      priority: 'high' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      stationName: 'Storage Tank 4'
    },
    {
      id: '2',
      type: 'Material Change',
      message: 'Cleaning brand has been changed - please provide input',
      priority: 'medium' as const,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      stationName: 'Your Station'
    }
  ];

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

  const [alerts, setAlerts] = useState(mockAlerts);
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

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
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

        {/* Previous Station Status - Small at top */}
        <div className="px-4 pb-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Previous Stations</p>
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-xs">Mixing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-xs">Heating</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-warning rounded-full" />
              <span className="text-xs">Quality</span>
            </div>
          </div>
        </div>
      </header>

      {/* Page Navigation */}
      <div className="flex items-center justify-between border-b bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleSwipe("right")}
          disabled={!canGoBack}
          data-testid="button-prev-page"
          className={cn(!canGoBack && "invisible")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex gap-2 py-3">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <button
                key={page.id}
                onClick={() => setCurrentPage(page.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  currentPage === page.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                data-testid={`nav-${page.id}`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{page.title}</span>
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleSwipe("left")}
          disabled={!canGoForward}
          data-testid="button-next-page"
          className={cn(!canGoForward && "invisible")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content - Swipeable */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Alerts Page */}
          {currentPage === "alerts" && (
            <div className="space-y-3" data-testid="page-alerts">
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
                    onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))}
                    onAcknowledge={(id) => console.log('Acknowledged:', id)}
                  />
                ))
              )}
            </div>
          )}

          {/* Tasks Page */}
          {currentPage === "tasks" && (
            <div className="space-y-3" data-testid="page-tasks">
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
                      placeholder="Add any observations or issues..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      data-testid="textarea-notes"
                    />
                  </div>

                  <Button 
                    className="w-full"
                    onClick={handleSubmitDiagnosis}
                    data-testid="button-submit-diagnosis"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Status
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Scan Page */}
          {currentPage === "scan" && (
            <div className="space-y-4" data-testid="page-scan">
              <h2 className="text-lg font-semibold">Scan Product</h2>
              <Card className="p-8">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-32 h-32 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click the button below to activate your camera and scan QR codes
                  </p>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setShowScanner(true)}
                    data-testid="button-activate-scanner"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Activate Camera
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Camera access is required for scanning. We respect your privacy.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {showScanner && (
        <QRScanner
          title="Scan Product Batch"
          onScan={(code) => {
            console.log('Scanned product:', code);
            setShowScanner(false);
            // todo: Connect to backend to fetch product details
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
