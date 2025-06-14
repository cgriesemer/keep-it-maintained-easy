
import { Settings } from 'lucide-react';
import { AddTaskForm } from '@/components/AddTaskForm';
import { MaintenanceTask } from '@/components/MaintenanceCard';

interface EmptyStateProps {
  onAddTask: (task: Omit<MaintenanceTask, 'id'>) => void;
}

export const EmptyState = ({ onAddTask }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
      <h3 className="text-xl font-semibold mb-2">No maintenance tasks yet</h3>
      <p className="text-muted-foreground mb-4">
        Get started by adding your first maintenance task
      </p>
      <AddTaskForm onAddTask={onAddTask} />
    </div>
  );
};
