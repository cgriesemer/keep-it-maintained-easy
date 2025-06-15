import { supabase } from '@/integrations/supabase/client';

export interface MaintenanceTask {
  id: string;
  name: string;
  category: string;
  intervalDays: number;
  lastCompleted: string;
  description?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HistoryEntry {
  id: string;
  task_id: string;
  completed_at: string;
  notes?: string;
  user_id?: string;
}

export const getTasks = async (): Promise<MaintenanceTask[]> => {
  const { data, error } = await supabase
    .from('maintenance_tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  return data?.map(task => ({
    id: task.id,
    name: task.name,
    category: task.category,
    intervalDays: task.interval_days,
    lastCompleted: task.last_completed,
    description: task.description,
    user_id: task.user_id,
    created_at: task.created_at,
    updated_at: task.updated_at
  })) || [];
};

export const saveTask = async (task: Omit<MaintenanceTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<MaintenanceTask | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('maintenance_tasks')
    .insert({
      name: task.name,
      category: task.category,
      interval_days: task.intervalDays,
      last_completed: task.lastCompleted,
      description: task.description,
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving task:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    intervalDays: data.interval_days,
    lastCompleted: data.last_completed,
    description: data.description,
    user_id: data.user_id,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const updateTask = async (taskId: string, updates: Partial<Omit<MaintenanceTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<MaintenanceTask | null> => {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.intervalDays !== undefined) updateData.interval_days = updates.intervalDays;
  if (updates.lastCompleted !== undefined) updateData.last_completed = updates.lastCompleted;
  if (updates.description !== undefined) updateData.description = updates.description;
  
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('maintenance_tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    category: data.category,
    intervalDays: data.interval_days,
    lastCompleted: data.last_completed,
    description: data.description,
    user_id: data.user_id,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const { error } = await supabase
    .from('maintenance_tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const addHistoryEntry = async (taskId: string, completedAt: string, notes?: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('maintenance_history')
    .insert({
      task_id: taskId,
      completed_at: completedAt,
      notes,
      user_id: user.id
    });

  if (error) {
    console.error('Error adding history entry:', error);
    throw error;
  }
};

export const getTaskHistory = async (taskId: string): Promise<HistoryEntry[]> => {
  const { data, error } = await supabase
    .from('maintenance_history')
    .select('*')
    .eq('task_id', taskId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching task history:', error);
    return [];
  }

  return data?.map(entry => ({
    id: entry.id,
    task_id: entry.task_id,
    completed_at: entry.completed_at,
    notes: entry.notes,
    user_id: entry.user_id
  })) || [];
};
