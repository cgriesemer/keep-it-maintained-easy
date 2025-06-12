
import { MaintenanceTask } from '@/components/MaintenanceCard';

interface HistoryEntry {
  id: string;
  taskId: string;
  completedDate: string;
  notes?: string;
}

const TASKS_KEY = 'maintenance-tasks';
const HISTORY_KEY = 'maintenance-history';

export const getTasks = (): MaintenanceTask[] => {
  const stored = localStorage.getItem(TASKS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveTasks = (tasks: MaintenanceTask[]): void => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

export const getHistory = (): HistoryEntry[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveHistory = (history: HistoryEntry[]): void => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const addHistoryEntry = (taskId: string, completedDate: string, notes?: string): void => {
  const history = getHistory();
  const newEntry: HistoryEntry = {
    id: Date.now().toString(),
    taskId,
    completedDate,
    notes
  };
  history.push(newEntry);
  saveHistory(history);
};

export const getTaskHistory = (taskId: string): HistoryEntry[] => {
  const history = getHistory();
  return history.filter(entry => entry.taskId === taskId);
};
