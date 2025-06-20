
import { useEffect } from 'react';
import { MaintenanceTask } from '@/components/MaintenanceCard';
import { getDaysRemaining } from '@/utils/taskUtils';

export const useNotifications = (tasks: MaintenanceTask[]) => {
  useEffect(() => {
    initializeNotifications();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      scheduleTaskNotifications(tasks);
    }
  }, [tasks]);

  const initializeNotifications = async () => {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
      }

      // Request permission for notifications
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

      console.log('Notification permissions granted');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const scheduleTaskNotifications = async (tasks: MaintenanceTask[]) => {
    try {
      // Check if notifications are supported and permitted
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
      }

      tasks.forEach((task) => {
        const daysRemaining = getDaysRemaining(task);
        
        // Show immediate notification for tasks due within 24 hours (0 or 1 day remaining)
        if (daysRemaining <= 1 && daysRemaining >= 0) {
          const notificationTitle = 'Maintenance Due';
          const notificationBody = daysRemaining === 0 
            ? `${task.name} is due today!`
            : `${task.name} is due tomorrow`;

          // Show notification immediately
          new Notification(notificationTitle, {
            body: notificationBody,
            icon: '/favicon.ico',
            tag: `task-${task.id}`, // Prevents duplicate notifications
            requireInteraction: true
          });
        }
      });

      console.log('Checked tasks for immediate notifications');
    } catch (error) {
      console.error('Error checking notifications:', error);
    }
  };

  const showTaskNotification = (task: MaintenanceTask, message: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    new Notification('Maintenance Tracker', {
      body: message,
      icon: '/favicon.ico',
      tag: `task-action-${task.id}`,
      requireInteraction: false
    });
  };

  return {
    scheduleTaskNotifications,
    showTaskNotification,
    initializeNotifications
  };
};
