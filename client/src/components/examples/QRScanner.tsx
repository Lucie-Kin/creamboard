import { useState } from 'react';
import QRScanner from '../QRScanner';
import { Button } from '@/components/ui/button';

export default function QRScannerExample() {
  const [showScanner, setShowScanner] = useState(false);
  const [result, setResult] = useState('');

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="max-w-md mx-auto space-y-4">
        <Button onClick={() => setShowScanner(true)} data-testid="button-open-scanner">
          Open QR Scanner
        </Button>
        {result && (
          <div className="p-4 bg-card rounded-lg">
            <p className="text-sm text-muted-foreground">Scanned Result:</p>
            <p className="font-mono">{result}</p>
          </div>
        )}
      </div>
      {showScanner && (
        <QRScanner
          onScan={(code) => {
            setResult(code);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
