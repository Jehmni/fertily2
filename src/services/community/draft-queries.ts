
import { supabase } from "@/lib/supabase";

export const draftQueries = {
  saveDraft: async (title: string, content: string, category: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    return supabase
      .from('post_drafts')
      .upsert({
        title,
        content,
        category,
        user_id: session.user.id
      })
      .select()
      .single();
  },

  getLatestDraft: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    return supabase
      .from('post_drafts')
      .select('title, content, category')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })
      .limit(1);
  }
};
