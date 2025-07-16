
-- Fix 1: Add missing RLS policies for profiles table
CREATE POLICY "Users can insert their own profile during signup" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Fix 2: Create a more secure approach for the cron job
-- First, let's unschedule the existing cron job with hardcoded token
SELECT cron.unschedule('send-maintenance-emails-hourly');

-- Create a new cron job that uses the service role key instead of anon key
-- This will be handled through a more secure server-side approach
SELECT cron.schedule(
  'send-maintenance-emails-secure',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
      url := 'https://uhwiwovoasjoirgwetke.supabase.co/functions/v1/send-maintenance-emails',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key', true) || '"}'::jsonb,
      body := '{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);

-- Fix 3: Add input validation constraints
ALTER TABLE public.maintenance_tasks 
ADD CONSTRAINT check_name_length CHECK (char_length(name) <= 200);

ALTER TABLE public.maintenance_tasks 
ADD CONSTRAINT check_category_length CHECK (char_length(category) <= 100);

ALTER TABLE public.maintenance_tasks 
ADD CONSTRAINT check_description_length CHECK (char_length(description) <= 1000);

ALTER TABLE public.maintenance_tasks 
ADD CONSTRAINT check_interval_days_positive CHECK (interval_days > 0 AND interval_days <= 3650);

ALTER TABLE public.maintenance_history 
ADD CONSTRAINT check_notes_length CHECK (char_length(notes) <= 1000);

-- Fix 4: Add constraints for notification settings validation
ALTER TABLE public.profiles 
ADD CONSTRAINT check_notification_frequency_valid 
CHECK (notification_frequency IN ('daily', 'weekly', 'disabled'));

ALTER TABLE public.profiles 
ADD CONSTRAINT check_notification_time_valid 
CHECK (notification_time >= 0 AND notification_time <= 23);
