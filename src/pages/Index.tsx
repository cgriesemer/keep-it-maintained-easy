
import { useState } from 'react';
import { MaintenanceCard, MaintenanceTask } from '@/components/MaintenanceCard';
import { ListView } from '@/components/ListView';
import { AddTaskForm } from '@/components/AddTaskForm';
import { EditTaskForm } from '@/components/EditTaskForm';
import { TaskHistory } from '@/components/TaskHistory';
import { UserMenu } from '@/components/UserMenu';
import { StatsCard } from '@/components/StatsCard';
import { FilterBar } from '@/components/FilterBar';
import { EmptyState } from '@/components/EmptyState';
import { SortOption } from '@/components/SortDropdown';
import { useTasks } from '@/hooks/useTasks';
import { sortTasks, getTaskStats } from '@/utils/taskUtils';
import { Settings } from 'lucide-react';

const Index = () => {
  const { tasks, loading, handleAddTask, handleEditTask, handleDeleteTask, handleDuplicateTask, handleCompleteTask } = useTasks();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('days-asc');
  const [historyTask, setHistoryTask] = useState<MaintenanceTask | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [editTask, setEditTask] = useState<MaintenanceTask | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

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

  const sortedTasks = sortTasks(filteredTasks, sortBy);
  const stats = getTaskStats(tasks);

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
        <StatsCard overdue={stats.overdue} dueSoon={stats.dueSoon} total={stats.total} />

        {/* Filters, Sort, and View Toggle */}
        <FilterBar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          tasks={tasks}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Tasks Display */}
        {sortedTasks.length === 0 ? (
          <EmptyState onAddTask={handleAddTask} />
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
            onDeleteTask={handleDeleteTask}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
