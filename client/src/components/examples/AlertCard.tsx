import { useState } from 'react';
import AlertCard from '../AlertCard';

export default function AlertCardExample() {
  const [alerts, setAlerts] = useState([
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
      stationName: 'Mixing Room'
    },
    {
      id: '3',
      type: 'Information',
      message: 'New batch ready for inspection',
      priority: 'low' as const,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      stationName: 'Laboratory'
    }
  ]);

  return (
    <div className="p-8 bg-background space-y-4">
      <div className="max-w-2xl mx-auto space-y-3">
        {alerts.map(alert => (
          <AlertCard
            key={alert.id}
            {...alert}
            onDismiss={(id) => setAlerts(alerts.filter(a => a.id !== id))}
            onAcknowledge={(id) => console.log('Acknowledged:', id)}
          />
        ))}
      </div>
    </div>
  );
}
