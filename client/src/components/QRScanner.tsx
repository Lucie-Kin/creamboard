import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Camera } from "lucide-react";
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

  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          (decodedText) => {
            onScan(decodedText);
            scanner.stop();
          },
          () => {
            // Error callback - ignore scan errors
          }
        );
        setIsScanning(true);
      } catch (err) {
        console.error("Scanner error:", err);
      }
    };

    startScanner();

    return () => {
      if (scanner.isScanning) {
        scanner.stop().catch(console.error);
      }
    };
  }, [onScan]);

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex flex-col" data-testid="qr-scanner">
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
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <Card className="w-full max-w-sm overflow-hidden">
          <div id="qr-reader" className="w-full" />
        </Card>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Camera className="h-4 w-4" />
          <span>Position QR code within the frame</span>
        </div>

        <div className="w-full max-w-sm space-y-2">
          <p className="text-sm text-muted-foreground text-center">Or enter manually:</p>
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
