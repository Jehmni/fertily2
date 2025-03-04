
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { consultationId, expertId, patientId, scheduledFor } = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get expert and patient details
    const { data: expert } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', expertId)
      .single()

    const { data: patient } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', patientId)
      .single()

    if (!expert || !patient) {
      throw new Error('User details not found')
    }

    // Send email using your preferred email service
    // Here's an example using a hypothetical email service
    const emailService = {
      to: [expert.email, patient.email],
      subject: 'New Consultation Scheduled',
      html: `
        <h2>New Consultation Scheduled</h2>
        <p>A consultation has been scheduled for ${new Date(scheduledFor).toLocaleString()}</p>
        <p>Details:</p>
        <ul>
          <li>Expert: ${expert.first_name} ${expert.last_name}</li>
          <li>Patient: ${patient.first_name} ${patient.last_name}</li>
          <li>Consultation ID: ${consultationId}</li>
        </ul>
      `,
    }

    // For now, we'll just log the email content
    console.log('Email notification:', emailService)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
