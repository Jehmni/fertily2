
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
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
    const url = new URL(req.url);
    console.log('Request details:', {
      method: req.method,
      url: url.toString(),
      headers: Object.fromEntries(req.headers.entries())
    });

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
      { headers: corsHeaders }
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
