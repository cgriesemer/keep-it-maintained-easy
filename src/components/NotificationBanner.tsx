
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';

export const NotificationBanner = () => {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        setShow(true);
      }
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'default') {
        setShow(false);
      }
    }
  };

  if (!show || permission !== 'default') {
    return null;
  }

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Bell className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span>
          Enable notifications to get alerts for maintenance tasks due soon!
        </span>
        <div className="flex items-center gap-2 ml-4">
          <Button 
            onClick={requestPermission}
            size="sm"
            variant="outline"
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            Enable Notifications
          </Button>
          <Button
            onClick={() => setShow(false)}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
