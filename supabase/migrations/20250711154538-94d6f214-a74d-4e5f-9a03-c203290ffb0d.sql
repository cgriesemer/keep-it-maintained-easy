
-- Enable the pg_cron extension for scheduling tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable the pg_net extension for making HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job that runs daily at 9:00 AM UTC to send maintenance emails
SELECT cron.schedule(
  'send-maintenance-emails-daily',
  '0 9 * * *', -- Daily at 9:00 AM UTC
  $$
  SELECT
    net.http_post(
      url := 'https://uhwiwovoasjoirgwetke.supabase.co/functions/v1/send-maintenance-emails',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVod2l3b3ZvYXNqb2lyZ3dldGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MzU3NjQsImV4cCI6MjA2NTMxMTc2NH0.XQpFcHYAmn5rqe--ZWaXhsw5kExlpWCiWGLEAlOMmqI"}'::jsonb,
      body := '{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
