
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageUrl, description } = await req.json()

    // Initialize OpenAI for image analysis if image is provided
    if (imageUrl) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert in embryo analysis. Analyze the embryo image and provide a detailed assessment including morphology, development stage, and quality score.'
            },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Please analyze this embryo image:' },
                { type: 'image_url', url: imageUrl }
              ]
            }
          ]
        })
      })

      const analysisResult = await response.json()
      
      return new Response(
        JSON.stringify({
          success: true,
          analysis: analysisResult.choices[0].message.content,
          confidenceScore: 0.85 // Example score
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Text-based analysis
    const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert in embryo analysis. Based on the provided description, assess the embryo quality and provide a success probability score.'
          },
          {
            role: 'user',
            content: description
          }
        ]
      })
    })

    const textAnalysis = await textResponse.json()

    return new Response(
      JSON.stringify({
        success: true,
        analysis: textAnalysis.choices[0].message.content,
        confidenceScore: 0.75 // Example score
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
