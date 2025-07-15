
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaintenanceTask {
  id: string;
  name: string;
  category: string;
  interval_days: number;
  last_completed: string;
  description?: string;
  user_id: string;
}

interface UserProfile {
  id: string;
  email: string;
  email_notifications_enabled: boolean;
  notification_frequency: string;
  notification_time: number;
}

const getDaysRemaining = (task: MaintenanceTask): number => {
  const lastCompleted = new Date(task.last_completed);
  const nextDue = new Date(lastCompleted);
  nextDue.setDate(nextDue.getDate() + task.interval_days);
  const today = new Date();
  const diffTime = nextDue.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatDate = (dateString: string, intervalDays: number): string => {
  const lastCompleted = new Date(dateString);
  const nextDue = new Date(lastCompleted);
  nextDue.setDate(nextDue.getDate() + intervalDays);
  return nextDue.toLocaleDateString();
};

const shouldSendNotification = (profile: UserProfile, currentHour: number): boolean => {
  // Check if notifications are enabled
  if (!profile.email_notifications_enabled) {
    return false;
  }

  // Check if it's the right time to send notifications
  if (currentHour !== profile.notification_time) {
    return false;
  }

  // For weekly notifications, only send on Mondays (day 1)
  if (profile.notification_frequency === 'weekly') {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    return dayOfWeek === 1; // Only send on Mondays
  }

  // For daily notifications, send every day at the specified time
  return profile.notification_frequency === 'daily';
};

const sendTaskEmail = async (userEmail: string, tasks: MaintenanceTask[], emailType: 'due-tomorrow' | 'due-today' | 'overdue') => {
  let subject = '';
  let htmlContent = '';

  switch (emailType) {
    case 'due-tomorrow':
      subject = `🔔 Maintenance Tasks Due Tomorrow (${tasks.length})`;
      htmlContent = `
        <h2>Tasks Due Tomorrow</h2>
        <p>The following maintenance tasks are due tomorrow:</p>
        <ul>
          ${tasks.map(task => `
            <li>
              <strong>${task.name}</strong> (${task.category})
              <br>Due: ${formatDate(task.last_completed, task.interval_days)}
              ${task.description ? `<br><em>${task.description}</em>` : ''}
            </li>
          `).join('')}
        </ul>
        <p>Don't forget to complete these tasks to stay on top of your maintenance schedule!</p>
      `;
      break;
    
    case 'due-today':
      subject = `⚠️ Maintenance Tasks Due Today (${tasks.length})`;
      htmlContent = `
        <h2>Tasks Due Today</h2>
        <p>The following maintenance tasks are due today:</p>
        <ul>
          ${tasks.map(task => `
            <li>
              <strong>${task.name}</strong> (${task.category})
              <br>Due: ${formatDate(task.last_completed, task.interval_days)}
              ${task.description ? `<br><em>${task.description}</em>` : ''}
            </li>
          `).join('')}
        </ul>
        <p><strong>Please complete these tasks today to stay current with your maintenance schedule!</strong></p>
      `;
      break;
    
    case 'overdue':
      subject = `🚨 Overdue Maintenance Tasks (${tasks.length})`;
      htmlContent = `
        <h2>Overdue Maintenance Tasks</h2>
        <p>The following maintenance tasks are overdue and need immediate attention:</p>
        <ul>
          ${tasks.map(task => {
            const daysOverdue = Math.abs(getDaysRemaining(task));
            return `
              <li>
                <strong>${task.name}</strong> (${task.category})
                <br>Was due: ${formatDate(task.last_completed, task.interval_days)}
                <br><span style="color: red;"><strong>${daysOverdue} days overdue</strong></span>
                ${task.description ? `<br><em>${task.description}</em>` : ''}
              </li>
            `;
          }).join('')}
        </ul>
        <p><strong style="color: red;">These tasks require immediate attention to prevent potential issues!</strong></p>
      `;
      break;
  }

  try {
    const emailResponse = await resend.emails.send({
      from: "Maintenance Tracker <onboarding@resend.dev>",
      to: [userEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Maintenance Tracker</h1>
          ${htmlContent}
          <hr style="margin: 30px 0; border: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            This email was sent from your Maintenance Tracker app. 
            You can manage your notification preferences in your account settings.
          </p>
        </div>
      `,
    });

    console.log(`Email sent successfully to ${userEmail}:`, emailResponse);
    return emailResponse;
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error);
    throw error;
  }
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting maintenance email check...');

    const currentHour = new Date().getUTCHours();
    console.log(`Current UTC hour: ${currentHour}`);

    // Get all users with their profiles and notification preferences
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, email, email_notifications_enabled, notification_frequency, notification_time');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profiles' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    let totalEmailsSent = 0;
    const emailResults = [];

    // Process each user
    for (const profile of profiles || []) {
      if (!profile.email) {
        console.log(`Skipping user ${profile.id} - no email address`);
        continue;
      }

      // Check if we should send notifications to this user at this time
      if (!shouldSendNotification(profile, currentHour)) {
        console.log(`Skipping user ${profile.email} - not their notification time or notifications disabled`);
        continue;
      }

      console.log(`Processing tasks for user: ${profile.email}`);

      // Get all tasks for this user
      const { data: tasks, error: tasksError } = await supabaseClient
        .from('maintenance_tasks')
        .select('*')
        .eq('user_id', profile.id);

      if (tasksError) {
        console.error(`Error fetching tasks for user ${profile.id}:`, tasksError);
        continue;
      }

      if (!tasks || tasks.length === 0) {
        console.log(`No tasks found for user ${profile.email}`);
        continue;
      }

      // Categorize tasks by urgency
      const tasksDueTomorrow: MaintenanceTask[] = [];
      const tasksDueToday: MaintenanceTask[] = [];
      const overdueTasks: MaintenanceTask[] = [];

      tasks.forEach(task => {
        const daysRemaining = getDaysRemaining(task);
        
        if (daysRemaining === 1) {
          tasksDueTomorrow.push(task);
        } else if (daysRemaining === 0) {
          tasksDueToday.push(task);
        } else if (daysRemaining < 0) {
          overdueTasks.push(task);
        }
      });

      // Only send emails if there are tasks that need attention
      const hasTasksToNotify = tasksDueTomorrow.length > 0 || tasksDueToday.length > 0 || overdueTasks.length > 0;
      
      if (!hasTasksToNotify) {
        console.log(`No tasks requiring notification for user ${profile.email}`);
        continue;
      }

      // Send emails for each category
      try {
        if (tasksDueTomorrow.length > 0) {
          await sendTaskEmail(profile.email, tasksDueTomorrow, 'due-tomorrow');
          totalEmailsSent++;
          emailResults.push({ user: profile.email, type: 'due-tomorrow', count: tasksDueTomorrow.length });
        }

        if (tasksDueToday.length > 0) {
          await sendTaskEmail(profile.email, tasksDueToday, 'due-today');
          totalEmailsSent++;
          emailResults.push({ user: profile.email, type: 'due-today', count: tasksDueToday.length });
        }

        if (overdueTasks.length > 0) {
          await sendTaskEmail(profile.email, overdueTasks, 'overdue');
          totalEmailsSent++;
          emailResults.push({ user: profile.email, type: 'overdue', count: overdueTasks.length });
        }

        console.log(`Processed ${profile.email}: ${tasksDueTomorrow.length} due tomorrow, ${tasksDueToday.length} due today, ${overdueTasks.length} overdue`);
      } catch (emailError) {
        console.error(`Failed to send emails to ${profile.email}:`, emailError);
        emailResults.push({ user: profile.email, error: emailError.message });
      }
    }

    const response = {
      success: true,
      totalEmailsSent,
      processedUsers: profiles?.length || 0,
      currentHour,
      results: emailResults,
      timestamp: new Date().toISOString()
    };

    console.log('Email processing complete:', response);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Error in send-maintenance-emails function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
