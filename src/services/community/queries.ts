
import { supabase } from "@/lib/supabase";

export const postQueries = {
  getPosts: () => 
    supabase
      .from('community_posts')
      .select(`
        *,
        profiles (first_name, last_name),
        reactions_count:post_reactions(count),
        comments_count:post_comments(count)
      `)
      .order('created_at', { ascending: false }),

  createPost: async (title: string, content: string, category: string, anonymous: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');
    
    return supabase
      .from('community_posts')
      .insert({
        title,
        content,
        category,
        anonymous,
        user_id: session.user.id  // Add the user_id from the session
      })
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .single();
  },

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
        user_id: session.user.id  // Add the user_id from the session
      })
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .single();
  },

  toggleReaction: async (postId: string, reactionType: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const { data: existingReaction } = await supabase
      .from('post_reactions')
      .select()
      .eq('post_id', postId)
      .eq('user_id', session.user.id)  // Check for the current user's reaction
      .eq('reaction_type', reactionType)
      .single();

    if (existingReaction) {
      return supabase
        .from('post_reactions')
        .delete()
        .eq('id', existingReaction.id)
        .eq('user_id', session.user.id);  // Ensure user can only delete their own reaction
    } else {
      return supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          reaction_type: reactionType,
          user_id: session.user.id  // Add the user_id from the session
        })
        .select()
        .single();
    }
  },
};
