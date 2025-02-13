
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    console.log('Processing request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    // Get and validate the API key
    const apiKey = req.headers.get('apikey') || req.headers.get('Authorization')?.split(' ')[1];
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    console.log('API key status:', {
      hasApiKey: !!apiKey,
      matchesServiceRole: apiKey === serviceRoleKey,
      matchesAnonKey: apiKey === anonKey
    });

    if (!apiKey || (apiKey !== serviceRoleKey && apiKey !== anonKey)) {
      console.error('Authentication error: Invalid API key');
      throw new Error('Invalid API key');
    }

    // Parse request body
    const requestBody = await req.json();
    console.log('Received request body:', requestBody);

    const { message, sessionId } = requestBody;

    if (!message) {
      throw new Error('Message is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch OpenAI response
    console.log('Fetching OpenAI response...');
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

    console.log('OpenAI response status:', openAIResponse.status);
    
    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI error:', errorData);
      throw new Error('Failed to get AI response');
    }

    const data = await openAIResponse.json();
    console.log('OpenAI response received');

    const aiResponse = data.choices[0].message.content;

    // Store the message in database
    console.log('Storing message in database...');
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

    console.log('Successfully processed request');
    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: corsHeaders,
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in widget-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message.includes('Invalid API key') ? 401 : 500,
        headers: corsHeaders
      }
    )
  }
})
