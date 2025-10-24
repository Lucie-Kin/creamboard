import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Camera, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  title?: string;
}

export default function QRScanner({ onScan, onClose, title = "Scan QR Code" }: QRScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    if (cameraStarted) return;
    
    try {
      setError(null);
      setCameraStarted(true);
      
      // Wait for next tick to ensure DOM element exists
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          onScan(decodedText);
          scanner.stop().catch(console.error);
        },
        () => {
          // Error callback - ignore scan errors
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Scanner error:", err);
      setError("Camera access denied or not available. Please use manual entry below.");
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col" data-testid="qr-scanner">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
          data-testid="button-close-scanner"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6 overflow-y-auto">
        {/* Camera Preview or Activation Button */}
        <Card className="w-full max-w-sm overflow-hidden">
          {!cameraStarted ? (
            <div className="p-8 text-center space-y-4">
              <div 
                className="mx-auto w-32 h-32 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border hover-elevate active-elevate-2 cursor-pointer"
                onClick={startCamera}
                data-testid="button-start-camera"
              >
                <Camera className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Click to activate camera</p>
                <p className="text-xs text-muted-foreground">
                  Your browser will ask for camera permission
                </p>
              </div>
              <Button 
                onClick={startCamera} 
                className="w-full"
                data-testid="button-activate-camera"
              >
                <Camera className="h-4 w-4 mr-2" />
                Activate Camera
              </Button>
            </div>
          ) : (
            <div id="qr-reader" className="w-full" />
          )}
        </Card>

        {error && (
          <div className="w-full max-w-sm p-3 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        {cameraStarted && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Camera className="h-4 w-4" />
            <span>Position QR code within the frame</span>
          </div>
        )}

        {/* Manual Input */}
        <div className="w-full max-w-sm space-y-2">
          <p className="text-sm text-muted-foreground text-center">Or enter code manually:</p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter code manually"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
              data-testid="input-manual-code"
            />
            <Button 
              onClick={handleManualSubmit}
              data-testid="button-submit-manual"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
