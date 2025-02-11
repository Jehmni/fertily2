
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const prompts = [
      "A minimalist logo design featuring a heart shape combined with a stethoscope in #FF8FB1 pink color, professional medical branding, clean lines, vector style, white background, minimal design",
      "A minimalist logo featuring a heart shape with a subtle medical cross inside, in #FF8FB1 pink color, professional healthcare branding, clean lines, vector style, white background, minimal design",
      "A modern logo design combining a heart and stethoscope into one unified shape, in #FF8FB1 pink color, professional fertility clinic branding, clean lines, vector style, white background, minimal design"
    ];

    const variations = [];
    
    for (const prompt of prompts) {
      const response = await fetch("https://api.runware.ai/v1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            taskType: "authentication",
            apiKey: Deno.env.get("RUNWARE_API_KEY")
          },
          {
            taskType: "imageInference",
            taskUUID: crypto.randomUUID(),
            positivePrompt: prompt,
            width: 1024,
            height: 1024,
            model: "runware:100@1",
            numberResults: 1
          }
        ])
      });

      const result = await response.json();
      if (result.data) {
        variations.push(result.data[0]);
      }
    }

    return new Response(
      JSON.stringify({ variations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate logos' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
