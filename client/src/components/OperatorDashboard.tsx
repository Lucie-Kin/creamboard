import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Bell, QrCode, LogOut, CheckCircle } from "lucide-react";
import TrafficLightIndicator from "./TrafficLightIndicator";
import AlertCard from "./AlertCard";
import TaskItem from "./TaskItem";
import QRScanner from "./QRScanner";

interface OperatorDashboardProps {
  operatorName: string;
  operatorRole: string;
  onLogout: () => void;
}

export default function OperatorDashboard({ 
  operatorName, 
  operatorRole,
  onLogout 
}: OperatorDashboardProps) {
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

  return (
    <div className="min-h-screen bg-background">
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
      </header>

      <main className="p-4 space-y-6 pb-24">
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Alerts</h2>
            {alerts.map(alert => (
              <AlertCard
                key={alert.id}
                {...alert}
                onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))}
                onAcknowledge={(id) => console.log('Acknowledged:', id)}
              />
            ))}
          </div>
        )}

        {/* Previous Station Status */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Previous Station Status</h3>
          <div className="flex justify-around">
            <TrafficLightIndicator status="green" label="Mixing" />
            <TrafficLightIndicator status="green" label="Heating" />
            <TrafficLightIndicator status="yellow" label="Quality" />
          </div>
        </Card>

        {/* Tasks */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Your Tasks</h2>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              {...task}
              onToggle={(id) => setTasks(tasks.map(t => 
                t.id === id ? { ...t, completed: !t.completed } : t
              ))}
              onDetails={(id) => console.log('View details for', id)}
            />
          ))}
        </div>

        {/* Self-Diagnosis */}
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
      </main>

      {/* Bottom Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button
          className="w-full"
          size="lg"
          onClick={() => setShowScanner(true)}
          data-testid="button-scan-product"
        >
          <QrCode className="h-5 w-5 mr-2" />
          Scan Product
        </Button>
      </div>

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
