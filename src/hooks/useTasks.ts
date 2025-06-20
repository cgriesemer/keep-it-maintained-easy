
import { useState, useEffect } from 'react';
import { MaintenanceTask } from '@/components/MaintenanceCard';
import { getTasks, saveTask, updateTask, addHistoryEntry, deleteTask } from '@/utils/supabaseStorage';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from './useNotifications';

export const useTasks = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { scheduleTaskNotifications, cancelNotificationForTask } = useNotifications(tasks);

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

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    try {
      await deleteTask(taskId);
      await cancelNotificationForTask(taskId);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
      toast({
        title: "Task Deleted",
        description: `${taskToDelete.name} has been deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
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
        await cancelNotificationForTask(taskId);
        
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

  return {
    tasks,
    loading,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    handleDuplicateTask,
    handleCompleteTask
  };
};
