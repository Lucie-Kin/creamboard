import { useState } from 'react';
import TaskItem from '../TaskItem';

export default function TaskItemExample() {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Temperature Check',
      description: 'Verify cooling room temperature is between 2-4°C',
      previousStatus: 'green' as const,
      completed: true
    },
    {
      id: '2',
      title: 'Quality Inspection',
      description: 'Check batch MK1234 for consistency and color',
      previousStatus: 'yellow' as const,
      completed: false
    },
    {
      id: '3',
      title: 'Equipment Cleaning',
      description: 'Clean mixing equipment after batch completion',
      previousStatus: 'red' as const,
      completed: false
    }
  ]);

  return (
    <div className="p-8 bg-background space-y-3">
      <div className="max-w-2xl mx-auto space-y-3">
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
    </div>
  );
}
