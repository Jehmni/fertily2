
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No auth header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw userError || new Error('No user found')
    }

    // Fetch user data from various tables
    const [
      profileData,
      cycleData,
      fertilityInsights,
      chatHistory,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('cycle_tracking').select('*').eq('user_id', user.id),
      supabase.from('fertility_insights').select('*').eq('user_id', user.id),
      supabase.from('chat_history').select('*').eq('user_id', user.id),
    ])

    const exportData = {
      profile: profileData.data,
      cycleTracking: cycleData.data,
      fertilityInsights: fertilityInsights.data,
      chatHistory: chatHistory.data,
      exportDate: new Date().toISOString(),
    }

    return new Response(
      JSON.stringify(exportData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename=fertility-data-export.json'
        },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
