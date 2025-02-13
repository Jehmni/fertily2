
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Vary': 'Origin'
}

serve(async (req) => {
  // Log all incoming requests
  console.log('New request received');
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

    // Log request body
    const body = await req.json();
    console.log('Request body:', body);

    // Simple echo response for testing
    const responseData = {
      response: "Hello! This is a test response. Your message was: " + body.message,
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
