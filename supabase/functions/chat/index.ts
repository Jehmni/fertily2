import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { supabase } from '../_shared/supabase-client.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, userId } = await req.json()
    console.log('Received message:', message)

    // Fetch user's profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    // Create system message with user context
    const systemMessage = `You are a knowledgeable fertility assistant. Use the following user information to provide personalized responses:
    - Cycle Length: ${profile.cycle_length || 'Not provided'}
    - Last Period Date: ${profile.last_period_date || 'Not provided'}
    - Medical Conditions: ${profile.medical_conditions?.join(', ') || 'None reported'}
    - Medications: ${profile.medications?.join(', ') || 'None reported'}
    - Fertility Goals: ${profile.fertility_goals || 'Not specified'}
    
    Provide accurate, empathetic, and helpful responses based on this information.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(errorData.error?.message || 'Failed to get AI response')
    }

    const data = await response.json()
    console.log('OpenAI response:', data)

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