
import { useEffect } from 'react';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
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
      // Request permission for notifications
      const permission = await LocalNotifications.requestPermissions();
      
      if (permission.display !== 'granted') {
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
      // Clear existing notifications first
      await LocalNotifications.cancel({ notifications: [] });

      const notifications: ScheduleOptions[] = [];

      tasks.forEach((task) => {
        const daysRemaining = getDaysRemaining(task);
        
        // Schedule notification for tasks due within 24 hours (0 or 1 day remaining)
        if (daysRemaining <= 1 && daysRemaining >= 0) {
          const lastCompleted = new Date(task.lastCompleted);
          const dueDate = new Date(lastCompleted);
          dueDate.setDate(dueDate.getDate() + task.intervalDays);
          
          // Calculate notification time (8 AM on the due date)
          const notificationTime = new Date(dueDate);
          notificationTime.setHours(8, 0, 0, 0);
          
          // Only schedule if the notification time is in the future
          if (notificationTime > new Date()) {
            notifications.push({
              notifications: [{
                title: 'Maintenance Due',
                body: daysRemaining === 0 
                  ? `${task.name} is due today!`
                  : `${task.name} is due tomorrow`,
                id: parseInt(task.id.replace(/\D/g, '').substring(0, 8)) || Math.floor(Math.random() * 100000),
                schedule: { at: notificationTime },
                sound: undefined,
                attachments: undefined,
                actionTypeId: "",
                extra: {
                  taskId: task.id,
                  taskName: task.name
                }
              }]
            });
          }
        }
      });

      if (notifications.length > 0) {
        for (const notification of notifications) {
          await LocalNotifications.schedule(notification);
        }
        console.log(`Scheduled ${notifications.length} notifications`);
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  const cancelNotificationForTask = async (taskId: string) => {
    try {
      const pending = await LocalNotifications.getPending();
      const notificationToCancel = pending.notifications.find(
        n => n.extra?.taskId === taskId
      );
      
      if (notificationToCancel) {
        await LocalNotifications.cancel({ 
          notifications: [{ id: notificationToCancel.id }] 
        });
        console.log(`Cancelled notification for task: ${taskId}`);
      }
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  };

  return {
    scheduleTaskNotifications,
    cancelNotificationForTask
  };
};
