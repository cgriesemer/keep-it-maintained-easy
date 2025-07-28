
import { Clock, Calendar, AlertCircle, CheckCircle, Edit, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface MaintenanceTask {
  id: string;
  name: string;
  category: string;
  intervalDays: number;
  lastCompleted: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface MaintenanceCardProps {
  task: MaintenanceTask;
  onComplete: (taskId: string) => void;
  onViewHistory: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onDuplicate: (taskId: string) => void;
}

export const MaintenanceCard = ({ task, onComplete, onViewHistory, onEdit, onDuplicate }: MaintenanceCardProps) => {
  const getDaysRemaining = () => {
    const lastCompleted = new Date(task.lastCompleted);
    const nextDue = new Date(lastCompleted);
    nextDue.setDate(nextDue.getDate() + task.intervalDays);
    const today = new Date();
    const diffTime = nextDue.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDate = () => {
    const lastCompleted = new Date(task.lastCompleted);
    const nextDue = new Date(lastCompleted);
    nextDue.setDate(nextDue.getDate() + task.intervalDays);
    return nextDue.toLocaleDateString();
  };

  const getStatusInfo = () => {
    const daysRemaining = getDaysRemaining();
    if (daysRemaining < 0) {
      return {
        status: 'overdue',
        color: 'destructive',
        icon: AlertCircle,
        text: `${Math.abs(daysRemaining)} days overdue`
      };
    } else if (daysRemaining <= 7) {
      return {
        status: 'due-soon',
        color: 'secondary',
        icon: Clock,
        text: daysRemaining === 0 ? 'Due today' : `${daysRemaining} days remaining`
      };
    } else {
      return {
        status: 'good',
        color: 'default',
        icon: CheckCircle,
        text: `${daysRemaining} days remaining`
      };
    }
  };

  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      'Auto': 'bg-blue-500/10 text-blue-700 border-blue-200',
      'HVAC': 'bg-green-500/10 text-green-700 border-green-200',
      'Plumbing': 'bg-purple-500/10 text-purple-700 border-purple-200',
      'Home': 'bg-orange-500/10 text-orange-700 border-orange-200',
      'Garden': 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
    };
    return colors[task.category] || 'bg-gray-500/10 text-gray-700 border-gray-200';
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{task.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getCategoryColor()}>
                {task.category}
              </Badge>
              <Badge variant={statusInfo.color as any}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.text}
              </Badge>
            </div>
          </div>
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Every {task.intervalDays} days</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Last: {new Date(task.lastCompleted).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Due: {getDueDate()}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => onComplete(task.id)} className="flex-1">
            Mark Complete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onDuplicate(task.id)} className="flex-1 sm:flex-none">
              <Copy className="w-3 h-3" />
            </Button>
            <Button variant="outline" onClick={() => onEdit(task.id)} className="flex-1 sm:flex-none">
              <Edit className="w-3 h-3" />
            </Button>
            <Button variant="outline" onClick={() => onViewHistory(task.id)} className="flex-1 sm:flex-none">
              History
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
