import { Clock, Calendar, AlertCircle, CheckCircle, History, Edit, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MaintenanceTask } from './MaintenanceCard';
import { useIsMobile } from '@/hooks/use-mobile';

interface ListViewProps {
  tasks: MaintenanceTask[];
  onComplete: (taskId: string) => void;
  onViewHistory: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onDuplicate: (taskId: string) => void;
}

export const ListView = ({ tasks, onComplete, onViewHistory, onEdit, onDuplicate }: ListViewProps) => {
  const isMobile = useIsMobile();

  const getDaysRemaining = (task: MaintenanceTask) => {
    const lastCompleted = new Date(task.lastCompleted);
    const nextDue = new Date(lastCompleted);
    nextDue.setDate(nextDue.getDate() + task.intervalDays);
    const today = new Date();
    const diffTime = nextDue.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusInfo = (task: MaintenanceTask) => {
    const daysRemaining = getDaysRemaining(task);
    if (daysRemaining < 0) {
      return {
        status: 'overdue',
        color: 'destructive',
        icon: AlertCircle,
        text: `${Math.abs(daysRemaining)}d overdue`,
        textColor: 'text-destructive'
      };
    } else if (daysRemaining <= 7) {
      return {
        status: 'due-soon',
        color: 'secondary',
        icon: Clock,
        text: daysRemaining === 0 ? 'Due today' : `${daysRemaining}d left`,
        textColor: 'text-yellow-600'
      };
    } else {
      return {
        status: 'good',
        color: 'default',
        icon: CheckCircle,
        text: `${daysRemaining}d left`,
        textColor: 'text-muted-foreground'
      };
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Auto': 'bg-blue-500/10 text-blue-700 border-blue-200',
      'HVAC': 'bg-green-500/10 text-green-700 border-green-200',
      'Plumbing': 'bg-purple-500/10 text-purple-700 border-purple-200',
      'Home': 'bg-orange-500/10 text-orange-700 border-orange-200',
      'Garden': 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
    };
    return colors[category] || 'bg-gray-500/10 text-gray-700 border-gray-200';
  };

  if (isMobile) {
    return (
      <div className="space-y-3">
        {tasks.map((task) => {
          const statusInfo = getStatusInfo(task);
          const StatusIcon = statusInfo.icon;
          
          return (
            <div
              key={task.id}
              className="bg-card rounded-lg border p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className={`w-4 h-4 ${statusInfo.textColor}`} />
                    <span className={`text-sm font-medium ${statusInfo.textColor}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-medium flex-1 min-w-0">{task.name}</h3>
                    <Badge variant="outline" className={`${getCategoryColor(task.category)} text-xs flex-shrink-0`}>
                      {task.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Every {task.intervalDays}d</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Last: {new Date(task.lastCompleted).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onComplete(task.id)}
                  className="flex-1"
                >
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDuplicate(task.id)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(task.id)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewHistory(task.id)}
                >
                  <History className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop layout (existing code)
  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const statusInfo = getStatusInfo(task);
        const StatusIcon = statusInfo.icon;
        
        return (
          <div
            key={task.id}
            className="flex items-center justify-between p-4 bg-card rounded-lg border hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${statusInfo.textColor}`} />
                <span className={`text-sm font-medium ${statusInfo.textColor}`}>
                  {statusInfo.text}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{task.name}</h3>
                  <Badge variant="outline" className={`${getCategoryColor(task.category)} text-xs`}>
                    {task.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Every {task.intervalDays}d</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Last: {new Date(task.lastCompleted).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              <Button
                size="sm"
                onClick={() => onComplete(task.id)}
                className="whitespace-nowrap"
              >
                Complete
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDuplicate(task.id)}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(task.id)}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewHistory(task.id)}
              >
                <History className="w-3 h-3" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
