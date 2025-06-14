
import { MaintenanceTask } from '@/components/MaintenanceCard';

export const getDaysRemaining = (task: MaintenanceTask): number => {
  const lastCompleted = new Date(task.lastCompleted);
  const nextDue = new Date(lastCompleted);
  nextDue.setDate(nextDue.getDate() + task.intervalDays);
  const today = new Date();
  const diffTime = nextDue.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const sortTasksByUrgency = (tasks: MaintenanceTask[]): MaintenanceTask[] => {
  return [...tasks].sort((a, b) => {
    const aDays = getDaysRemaining(a);
    const bDays = getDaysRemaining(b);
    return aDays - bDays;
  });
};

export const getTaskStats = (tasks: MaintenanceTask[]) => {
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
