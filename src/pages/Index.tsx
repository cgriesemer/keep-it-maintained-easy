import { useState, useEffect } from 'react';
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

  // Load view mode from localStorage on component mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('maintenance-view-mode');
    if (savedViewMode === 'cards' || savedViewMode === 'list') {
      setViewMode(savedViewMode);
    }
  }, []);

  // Handle view mode change and persist to localStorage
  const handleViewModeChange = (mode: 'cards' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('maintenance-view-mode', mode);
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

  const sortedTasks = sortTasks(filteredTasks, sortBy);
  const stats = getTaskStats(tasks);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your maintenance tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* iOS-style Status Bar Safe Area */}
      <div className="safe-area-inset-top bg-white"></div>
      
      {/* Native-style Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Maintenance</h1>
                <p className="text-sm text-gray-500">Stay on schedule</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <AddTaskForm onAddTask={handleAddTask} />
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats with native styling */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <StatsCard overdue={stats.overdue} dueSoon={stats.dueSoon} total={stats.total} />
        </div>

        {/* Filters with native styling */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            tasks={tasks}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Tasks Display */}
        {sortedTasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <EmptyState onAddTask={handleAddTask} />
          </div>
        ) : viewMode === 'cards' ? (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <MaintenanceCard
                  task={task}
                  onComplete={handleCompleteTask}
                  onViewHistory={handleViewHistory}
                  onEdit={handleEditClick}
                  onDuplicate={handleDuplicateTask}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <ListView
              tasks={sortedTasks}
              onComplete={handleCompleteTask}
              onViewHistory={handleViewHistory}
              onEdit={handleEditClick}
              onDuplicate={handleDuplicateTask}
            />
          </div>
        )}

        {/* Bottom safe area for iOS */}
        <div className="h-8"></div>
      </div>

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
  );
};

export default Index;
