
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Bell, Clock, Calendar } from 'lucide-react';

interface NotificationPreferences {
  email_notifications_enabled: boolean;
  notification_frequency: string;
  notification_time: number;
}

export const NotificationSettings = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications_enabled: true,
    notification_frequency: 'daily',
    notification_time: 9
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_notifications_enabled, notification_frequency, notification_time')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching preferences:', error);
        toast({
          title: "Error",
          description: "Failed to load notification preferences.",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setPreferences({
          email_notifications_enabled: data.email_notifications_enabled ?? true,
          notification_frequency: data.notification_frequency ?? 'daily',
          notification_time: data.notification_time ?? 9
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email_notifications_enabled: preferences.email_notifications_enabled,
          notification_frequency: preferences.notification_frequency,
          notification_time: preferences.notification_time
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving preferences:', error);
        toast({
          title: "Error",
          description: "Failed to save notification preferences.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated."
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Email Notification Settings
        </CardTitle>
        <CardDescription>
          Manage when and how you receive maintenance reminders via email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications" className="text-base">
              Email Notifications
            </Label>
            <div className="text-sm text-muted-foreground">
              Receive email reminders for your maintenance tasks
            </div>
          </div>
          <Switch
            id="email-notifications"
            checked={preferences.email_notifications_enabled}
            onCheckedChange={(checked) =>
              setPreferences(prev => ({ ...prev, email_notifications_enabled: checked }))
            }
          />
        </div>

        {preferences.email_notifications_enabled && (
          <>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4" />
                Notification Frequency
              </Label>
              <Select
                value={preferences.notification_frequency}
                onValueChange={(value) =>
                  setPreferences(prev => ({ ...prev, notification_frequency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly (Mondays)</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                {preferences.notification_frequency === 'daily' && 'Receive notifications every day at your preferred time'}
                {preferences.notification_frequency === 'weekly' && 'Receive notifications once per week on Mondays'}
                {preferences.notification_frequency === 'disabled' && 'No email notifications will be sent'}
              </div>
            </div>

            {preferences.notification_frequency !== 'disabled' && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4" />
                  Preferred Time (UTC)
                </Label>
                <Select
                  value={preferences.notification_time.toString()}
                  onValueChange={(value) =>
                    setPreferences(prev => ({ ...prev, notification_time: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {formatTime(i)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-muted-foreground">
                  Time is in UTC. Current selection: {formatTime(preferences.notification_time)}
                </div>
              </div>
            )}
          </>
        )}

        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};
