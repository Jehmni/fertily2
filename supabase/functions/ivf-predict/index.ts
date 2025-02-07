
import "https://deno.land/x/xhr@0.1.0/mod.ts"
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
    // Get user ID from authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Initialize Supabase client
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

    const { medicalData } = await req.json()

    // Create system message with medical expertise
    const systemMessage = `You are an AI medical assistant specializing in IVF success prediction. 
    Analyze the following patient data and provide:
    1. A predicted success probability (0-100%)
    2. Key factors affecting the prediction
    3. Personalized recommendations
    
    Base your analysis on established medical research and statistical patterns in IVF outcomes.
    Always maintain a professional and empathetic tone.`

    // Format medical data for the AI
    const patientProfile = `
    Patient Profile:
    - Age: ${medicalData.age}
    - BMI: ${medicalData.bmi}
    - Smoking Status: ${medicalData.smoking_status ? 'Yes' : 'No'}
    - Alcohol Consumption: ${medicalData.alcohol_consumption}
    - Medical History: ${JSON.stringify(medicalData.medical_history)}
    - AMH Level: ${medicalData.amh_level}
    - FSH Level: ${medicalData.fsh_level}
    - LH Level: ${medicalData.lh_level}
    - Estradiol Level: ${medicalData.estradiol_level}
    - Antral Follicle Count: ${medicalData.antral_follicle_count}
    - Previous IVF Cycles: ${medicalData.previous_ivf_cycles}
    - Previous Outcomes: ${JSON.stringify(medicalData.previous_ivf_outcomes)}
    - Uterine Conditions: ${medicalData.uterine_conditions?.join(', ')}
    - Embryo Quality: ${medicalData.embryo_quality}
    `

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
          { role: 'user', content: `Please analyze this IVF patient data and provide a prediction:\n${patientProfile}` }
        ],
        temperature: 0.7
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(errorData.error?.message || 'Failed to get AI response')
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // Parse AI response to extract structured data
    // You would need to implement proper parsing based on the AI response format
    const prediction = {
      success_probability: 65.5, // This should be parsed from AI response
      key_factors: {
        age_factor: "Favorable age range",
        amh_impact: "Normal AMH levels indicate good ovarian reserve",
        medical_history_impact: "No significant negative factors"
      },
      recommendations: [
        "Consider lifestyle modifications to optimize BMI",
        "Maintain regular hormone monitoring",
        "Follow recommended supplement regime"
      ]
    }

    // Store the prediction in the database
    const { data: predictionData, error: predictionError } = await supabase
      .from('ivf_predictions')
      .insert({
        user_id: user.id,
        medical_data_id: medicalData.id,
        success_probability: prediction.success_probability,
        key_factors: prediction.key_factors,
        recommendations: prediction.recommendations
      })
      .select()
      .single()

    if (predictionError) {
      throw new Error('Failed to store prediction')
    }

    return new Response(
      JSON.stringify({ 
        prediction: predictionData,
        analysis: aiResponse 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in ivf-predict function:', error)
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
