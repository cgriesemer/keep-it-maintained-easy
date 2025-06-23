
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MaintenanceTask {
  id: string;
  name: string;
  category: string;
  interval_days: number;
  last_completed: string;
  description?: string;
}

const getDaysRemaining = (task: MaintenanceTask): number => {
  const lastCompleted = new Date(task.last_completed);
  const nextDue = new Date(lastCompleted);
  nextDue.setDate(nextDue.getDate() + task.interval_days);
  const today = new Date();
  const diffTime = nextDue.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authentication token from request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Set the auth token for the client
    supabaseClient.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: ''
    });

    // Fetch maintenance tasks
    const { data: tasks, error } = await supabaseClient
      .from('maintenance_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tasks' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Process tasks to find urgent ones
    const processedTasks = tasks?.map(task => {
      const daysRemaining = getDaysRemaining({
        id: task.id,
        name: task.name,
        category: task.category,
        interval_days: task.interval_days,
        last_completed: task.last_completed,
        description: task.description
      });

      return {
        id: task.id,
        name: task.name,
        category: task.category,
        daysRemaining,
        isUrgent: daysRemaining <= 1 && daysRemaining >= 0,
        isOverdue: daysRemaining < 0,
        nextDueDate: new Date(new Date(task.last_completed).getTime() + (task.interval_days * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      };
    }) || [];

    // Filter for tasks that need attention (due today, tomorrow, or overdue)
    const urgentTasks = processedTasks.filter(task => task.daysRemaining <= 1);
    const overdueTasks = processedTasks.filter(task => task.isOverdue);

    const response = {
      totalTasks: processedTasks.length,
      urgentTasks: urgentTasks.length,
      overdueTasks: overdueTasks.length,
      tasks: urgentTasks.length > 0 ? urgentTasks : processedTasks.slice(0, 5), // Return urgent tasks or first 5 tasks
      summary: urgentTasks.length > 0 
        ? `You have ${urgentTasks.length} urgent maintenance task(s) due soon!`
        : overdueTasks.length > 0
        ? `You have ${overdueTasks.length} overdue maintenance task(s).`
        : 'All your maintenance tasks are up to date!'
    };

    console.log('Webhook response:', response);

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
    console.error('Error in maintenance webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
