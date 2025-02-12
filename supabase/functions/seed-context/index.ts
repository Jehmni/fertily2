
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getEmbedding } from '../_shared/embeddings.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initial fertility knowledge base
const initialContext = [
  {
    title: "Understanding Ovulation",
    content: "Ovulation typically occurs about 14 days before your next period starts. During ovulation, an egg is released from one of your ovaries and travels down the fallopian tube. The egg lives for about 24 hours after release.",
    category: "fertility_basics"
  },
  {
    title: "Fertile Window",
    content: "Your fertile window is typically the 6 days leading up to and including ovulation. This is when pregnancy is possible. Sperm can live in the female reproductive tract for up to 5 days.",
    category: "fertility_basics"
  },
  {
    title: "Tracking Basal Body Temperature",
    content: "Basal body temperature (BBT) is your temperature when you first wake up. A slight rise in BBT can indicate ovulation has occurred. Track your temperature daily using a special thermometer for the most accurate results.",
    category: "tracking_methods"
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!supabaseUrl || !supabaseKey || !openAIKey) {
      throw new Error('Missing configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting context seeding...')

    for (const item of initialContext) {
      // Store the context
      const { error: contextError } = await supabase
        .from('context_sources')
        .insert(item)

      if (contextError) {
        console.error('Error storing context:', contextError)
        continue
      }

      // Generate and store embedding
      try {
        const embedding = await getEmbedding(item.content, openAIKey)
        const { error: embeddingError } = await supabase
          .from('embeddings')
          .insert({
            content: item.content,
            embedding,
            metadata: {
              title: item.title,
              category: item.category,
              type: 'knowledge_base'
            }
          })

        if (embeddingError) {
          console.error('Error storing embedding:', embeddingError)
        }
      } catch (error) {
        console.error('Error generating embedding:', error)
      }
    }

    return new Response(
      JSON.stringify({ message: 'Context seeding completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in seed-context function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
