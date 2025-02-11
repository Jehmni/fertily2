
import { supabase } from "@/lib/supabase";

export const commentQueries = {
  getComments: (postId: string) =>
    supabase
      .from('post_comments')
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true }),

  addComment: async (postId: string, content: string, anonymous: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    return supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        content,
        anonymous,
        user_id: session.user.id
      })
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .single();
  },

  deleteComment: async (commentId: string) => {
    return supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);
  }
};
