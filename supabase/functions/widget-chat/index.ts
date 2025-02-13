
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders 
    })
  }

  try {
    // Parse request body
    const requestBody = await req.json();
    console.log('Received request body:', requestBody);

    const { message, sessionId } = requestBody;

    if (!message) {
      throw new Error('Message is required');
    }

    // Initialize Supabase client with anon key for public access
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnYmh4dXZkb2Jta3FvamZtYm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNzE4NzIsImV4cCI6MjA1Mzg0Nzg3Mn0.1oCLHiM1UcC0qn2eif1tv54r_TBGyoqbC6y2pqC_dkk';

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch OpenAI response
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'You are a knowledgeable fertility assistant. Provide accurate, helpful, and empathetic responses.'
          },
          { role: 'user', content: message }
        ],
      }),
    });

    // Log OpenAI response status
    console.log('OpenAI response status:', openAIResponse.status);

    const data = await openAIResponse.json();
    console.log('OpenAI response data:', data);

    const aiResponse = data.choices[0].message.content;

    // Store the message and response in the database using anon access
    const { error: dbError } = await supabase
      .from('widget_chat_history')
      .insert({
        message,
        response: aiResponse,
        session_id: sessionId || 'anonymous',
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in widget-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
