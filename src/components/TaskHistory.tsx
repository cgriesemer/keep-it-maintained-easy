
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { getTaskHistory } from '@/utils/supabaseStorage';

interface HistoryEntry {
  id: string;
  task_id: string;
  completed_at: string;
  notes?: string;
  user_id?: string;
}

interface TaskHistoryProps {
  taskName: string;
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskHistory = ({ taskName, taskId, open, onOpenChange }: TaskHistoryProps) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && taskId) {
      loadHistory();
    }
  }, [open, taskId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const historyData = await getTaskHistory(taskId);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading task history:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {taskName} - History
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading history...</p>
            </div>
          ) : sortedHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No completion history yet</p>
            </div>
          ) : (
            sortedHistory.map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div>
                    <p className="font-medium">
                      {new Date(entry.completed_at).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    )}
                  </div>
                </div>
                {index === 0 && (
                  <Badge variant="secondary">Latest</Badge>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
