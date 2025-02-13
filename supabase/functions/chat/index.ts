
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { calculateFertileWindow } from '../_shared/fertility.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()
    console.log('Received message:', message)

    // Get user ID from authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Initialize Supabase client with environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Failed to get user information')
    }

    // Fetch user's profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Don't throw error if profile not found, just proceed with basic chat
    let systemMessage = `You are a knowledgeable fertility assistant. `
    
    if (profile && !profileError) {
      // Calculate next fertile window if profile data exists
      let fertileWindow = null
      if (profile.last_period_date && profile.cycle_length) {
        const lastPeriodDate = new Date(profile.last_period_date)
        fertileWindow = calculateFertileWindow(lastPeriodDate, profile.cycle_length)
      }

      // Create system message with user context and fertile window
      systemMessage += `Use the following user information to provide personalized responses:
      - Cycle Length: ${profile.cycle_length || 'Not provided'} days
      - Last Period Date: ${profile.last_period_date || 'Not provided'}
      - Medical Conditions: ${profile.medical_conditions?.join(', ') || 'None reported'}
      - Medications: ${profile.medications?.join(', ') || 'None reported'}
      - Fertility Goals: ${profile.fertility_goals || 'Not specified'}
      ${fertileWindow ? `
      - Next Fertile Window: ${fertileWindow.start.toLocaleDateString()} to ${fertileWindow.end.toLocaleDateString()}` : ''}
      
      When asked about fertile windows or ovulation, use the calculated dates above. Always provide accurate, empathetic, and helpful responses based on this information.`
    }

    console.log('Sending request to OpenAI')
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(errorData.error?.message || 'Failed to get AI response')
    }

    const data = await response.json()
    console.log('OpenAI response received')

    const aiResponse = data.choices[0].message.content

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in chat function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'If this error persists, please contact support.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
