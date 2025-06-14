import { useState, useEffect } from 'react';
import { MaintenanceCard, MaintenanceTask } from '@/components/MaintenanceCard';
import { ListView } from '@/components/ListView';
import { AddTaskForm } from '@/components/AddTaskForm';
import { EditTaskForm } from '@/components/EditTaskForm';
import { TaskHistory } from '@/components/TaskHistory';
import { UserMenu } from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTasks, saveTask, updateTask, addHistoryEntry } from '@/utils/supabaseStorage';
import { Settings, Filter, BarChart3, LayoutGrid, List } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [historyTask, setHistoryTask] = useState<MaintenanceTask | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [editTask, setEditTask] = useState<MaintenanceTask | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (newTaskData: Omit<MaintenanceTask, 'id'>) => {
    try {
      const newTask = await saveTask(newTaskData);
      if (newTask) {
        setTasks(prevTasks => [newTask, ...prevTasks]);
        toast({
          title: "Task Added",
          description: `${newTask.name} has been added to your maintenance schedule.`,
        });
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditTask = async (taskId: string, updatedTaskData: Omit<MaintenanceTask, 'id'>) => {
    try {
      const updatedTask = await updateTask(taskId, updatedTaskData);
      if (updatedTask) {
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === taskId ? updatedTask : t)
        );
        toast({
          title: "Task Updated",
          description: `${updatedTask.name} has been updated successfully.`,
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDuplicateTask = async (taskId: string) => {
    const taskToDuplicate = tasks.find(t => t.id === taskId);
    if (!taskToDuplicate) return;

    try {
      const duplicatedTaskData = {
        name: `${taskToDuplicate.name} (Copy)`,
        category: taskToDuplicate.category,
        intervalDays: taskToDuplicate.intervalDays,
        lastCompleted: new Date().toISOString(),
        description: taskToDuplicate.description
      };

      const newTask = await saveTask(duplicatedTaskData);
      if (newTask) {
        setTasks(prevTasks => [newTask, ...prevTasks]);
        toast({
          title: "Task Duplicated",
          description: `${newTask.name} has been created based on ${taskToDuplicate.name}.`,
        });
      }
    } catch (error) {
      console.error('Error duplicating task:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const now = new Date().toISOString();
      const updatedTask = await updateTask(taskId, { lastCompleted: now });
      
      if (updatedTask) {
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === taskId ? updatedTask : t)
        );
        
        await addHistoryEntry(taskId, now);
        
        toast({
          title: "Task Completed",
          description: `${task.name} has been marked as complete and the timer has been reset.`,
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewHistory = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setHistoryTask(task);
      setShowHistory(true);
    }
  };

  const handleEditClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setEditTask(task);
      setShowEditForm(true);
    }
  };

  const categories = ['all', ...Array.from(new Set(tasks.map(t => t.category)))];
  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);

  // Sort tasks by urgency (overdue first, then by days remaining)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const getDaysRemaining = (task: MaintenanceTask) => {
      const lastCompleted = new Date(task.lastCompleted);
      const nextDue = new Date(lastCompleted);
      nextDue.setDate(nextDue.getDate() + task.intervalDays);
      const today = new Date();
      const diffTime = nextDue.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const aDays = getDaysRemaining(a);
    const bDays = getDaysRemaining(b);
    
    return aDays - bDays;
  });

  const getStats = () => {
    const overdue = tasks.filter(task => {
      const lastCompleted = new Date(task.lastCompleted);
      const nextDue = new Date(lastCompleted);
      nextDue.setDate(nextDue.getDate() + task.intervalDays);
      return nextDue < new Date();
    }).length;

    const dueSoon = tasks.filter(task => {
      const lastCompleted = new Date(task.lastCompleted);
      const nextDue = new Date(lastCompleted);
      nextDue.setDate(nextDue.getDate() + task.intervalDays);
      const today = new Date();
      const diffTime = nextDue.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;

    return { overdue, dueSoon, total: tasks.length };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading your maintenance tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="w-8 h-8" />
              Maintenance Tracker
            </h1>
            <p className="text-muted-foreground">Stay on top of your maintenance schedule</p>
          </div>
          <div className="flex items-center gap-3">
            <AddTaskForm onAddTask={handleAddTask} />
            <UserMenu />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Tasks</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive rounded-full" />
              <span className="text-2xl font-bold text-destructive">{stats.overdue}</span>
            </div>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-2xl font-bold text-yellow-600">{stats.dueSoon}</span>
            </div>
            <p className="text-sm text-muted-foreground">Due Soon</p>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter by category:</span>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category}
                {category !== 'all' && (
                  <Badge variant="secondary" className="ml-2">
                    {tasks.filter(t => t.category === category).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View:</span>
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="rounded-r-none"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tasks Display */}
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No maintenance tasks yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first maintenance task
            </p>
            <AddTaskForm onAddTask={handleAddTask} />
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTasks.map((task) => (
              <MaintenanceCard
                key={task.id}
                task={task}
                onComplete={handleCompleteTask}
                onViewHistory={handleViewHistory}
                onEdit={handleEditClick}
                onDuplicate={handleDuplicateTask}
              />
            ))}
          </div>
        ) : (
          <ListView
            tasks={sortedTasks}
            onComplete={handleCompleteTask}
            onViewHistory={handleViewHistory}
            onEdit={handleEditClick}
            onDuplicate={handleDuplicateTask}
          />
        )}

        {/* History Dialog */}
        {historyTask && (
          <TaskHistory
            taskName={historyTask.name}
            taskId={historyTask.id}
            open={showHistory}
            onOpenChange={setShowHistory}
          />
        )}

        {/* Edit Task Dialog */}
        {editTask && (
          <EditTaskForm
            task={editTask}
            open={showEditForm}
            onOpenChange={setShowEditForm}
            onEditTask={handleEditTask}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
