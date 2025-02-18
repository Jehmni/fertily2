
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Vary': 'Origin'
}

serve(async (req) => {
  // Log all incoming requests with detailed information
  console.log('New widget chat request received');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    })
  }

  try {
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`);
    }

    // Parse and log request body
    const body = await req.json();
    console.log('Request body:', body);

    const { message, sessionId } = body;
    
    if (!message) {
      throw new Error('Message is required');
    }

    // Store the chat message in Supabase
    const { data, error } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/widget_chat_history`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'apikey': Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        },
        body: JSON.stringify({
          message,
          response: "This is a test response. In production, this would be an AI-generated response.",
          session_id: sessionId || 'anonymous',
        }),
      }
    ).then(r => r.json());

    if (error) throw error;

    // Create response
    const responseData = {
      response: "This is a test response. Your message was: " + message,
      sessionId: sessionId || 'anonymous',
      timestamp: new Date().toISOString()
    };

    console.log('Sending response:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { 
        headers: {
          ...corsHeaders,
          'Cache-Control': 'no-store'
        }
      }
    )
  } catch (error) {
    console.error('Error in widget-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: corsHeaders,
        status: 500
      }
    )
  }
})
