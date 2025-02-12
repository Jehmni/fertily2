
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { calculateFertileWindow } from '../_shared/fertility.ts'
import { getEmbedding, buildPromptWithContext } from '../_shared/embeddings.ts'

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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!supabaseUrl || !supabaseKey || !openAIKey) {
      throw new Error('Missing configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Failed to get user information')
    }

    // Get user's profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Generate embedding for the user's message
    console.log('Generating embedding for query...')
    const queryEmbedding = await getEmbedding(message, openAIKey)

    // Search for relevant context using the embedding
    console.log('Searching for relevant context...')
    const { data: relevantDocs, error: searchError } = await supabase
      .rpc('match_embeddings', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 3
      })

    if (searchError) {
      console.error('Error searching embeddings:', searchError)
    }

    // Extract relevant context texts
    const relevantContext = (relevantDocs || []).map(doc => doc.content)

    // Create system message with user context
    let systemMessage = `You are a knowledgeable fertility assistant. `
    
    if (profile && !profileError) {
      let fertileWindow = null
      if (profile.last_period_date && profile.cycle_length) {
        const lastPeriodDate = new Date(profile.last_period_date)
        fertileWindow = calculateFertileWindow(lastPeriodDate, profile.cycle_length)
      }

      systemMessage += `Use the following user information to provide personalized responses:
      - Cycle Length: ${profile.cycle_length || 'Not provided'} days
      - Last Period Date: ${profile.last_period_date || 'Not provided'}
      - Medical Conditions: ${profile.medical_conditions?.join(', ') || 'None reported'}
      - Medications: ${profile.medications?.join(', ') || 'None reported'}
      - Fertility Goals: ${profile.fertility_goals || 'Not specified'}
      ${fertileWindow ? `
      - Next Fertile Window: ${fertileWindow.start.toLocaleDateString()} to ${fertileWindow.end.toLocaleDateString()}` : ''}`
    }

    // Build final prompt with context
    const prompt = buildPromptWithContext(message, relevantContext, systemMessage)
    console.log('Sending request to OpenAI')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: prompt.messages,
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

    // Store message embedding for future context
    try {
      const { error: insertError } = await supabase
        .from('embeddings')
        .insert({
          content: message,
          embedding: queryEmbedding,
          metadata: { 
            type: 'user_message',
            user_id: user.id,
            timestamp: new Date().toISOString()
          }
        })

      if (insertError) {
        console.error('Error storing message embedding:', insertError)
      }

      // Store response embedding
      const responseEmbedding = await getEmbedding(aiResponse, openAIKey)
      const { error: responseInsertError } = await supabase
        .from('embeddings')
        .insert({
          content: aiResponse,
          embedding: responseEmbedding,
          metadata: {
            type: 'ai_response',
            user_id: user.id,
            timestamp: new Date().toISOString()
          }
        })

      if (responseInsertError) {
        console.error('Error storing response embedding:', responseInsertError)
      }
    } catch (error) {
      console.error('Error handling embeddings:', error)
    }

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
