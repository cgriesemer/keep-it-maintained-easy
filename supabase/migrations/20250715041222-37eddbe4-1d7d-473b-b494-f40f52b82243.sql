
-- Add email notification preferences to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('daily', 'weekly', 'disabled'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notification_time INTEGER DEFAULT 9 CHECK (notification_time >= 0 AND notification_time <= 23);

-- Update the existing cron job to run hourly so we can check user preferences
SELECT cron.unschedule('send-maintenance-emails-daily');

-- Create new hourly cron job
SELECT cron.schedule(
  'send-maintenance-emails-hourly',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url := 'https://uhwiwovoasjoirgwetke.supabase.co/functions/v1/send-maintenance-emails',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVod2l3b3ZvYXNqb2lyZ3dldGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU3NjQsImV4cCI6MjA2NTMxMTc2NH0.XQpFcHYAmn5rqe--ZWaXhsw5kExlpWCiWGLEAlOMmqI"}'::jsonb,
      body := '{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
