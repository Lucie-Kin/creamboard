import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, Briefcase, QrCode } from "lucide-react";
import QRScanner from "@/components/QRScanner";

export default function ModeSelection() {
  const [, setLocation] = useLocation();
  const [showScanner, setShowScanner] = useState(false);

  const handleOperatorScan = (code: string) => {
    console.log('Operator scanned:', code);
    // todo: Validate operator QR code with backend
    // For now, just navigate to operator dashboard
    setLocation("/operator");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Miko Factory Dashboard</h1>
          <p className="text-muted-foreground">
            Ice Cream Production Monitoring by Unilever
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Manager Mode */}
          <Card className="p-8 hover-elevate cursor-pointer" data-testid="card-manager-mode">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-6 bg-primary/10 rounded-full">
                  <Briefcase className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Manager Mode</h2>
                <p className="text-sm text-muted-foreground">
                  Monitor production, manage floor plan, view analytics and alerts
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => setLocation("/manager")}
                data-testid="button-manager-mode"
              >
                <Briefcase className="h-5 w-5 mr-2" />
                Enter as Manager
              </Button>
            </div>
          </Card>

          {/* Operator Mode */}
          <Card className="p-8 hover-elevate cursor-pointer" data-testid="card-operator-mode">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-6 bg-accent/10 rounded-full">
                  <UserCog className="h-12 w-12 text-accent" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Operator Mode</h2>
                <p className="text-sm text-muted-foreground">
                  Scan your ID card to access tasks, alerts, and status reporting
                </p>
              </div>
              <Button
                className="w-full"
                size="lg"
                variant="outline"
                onClick={() => setShowScanner(true)}
                data-testid="button-operator-scan"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Scan Operator ID
              </Button>
            </div>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © 2025 Unilever - Miko Factory Management System
        </p>
      </div>

      {showScanner && (
        <QRScanner
          title="Scan Operator ID Card"
          onScan={handleOperatorScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
