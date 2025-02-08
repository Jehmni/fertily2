
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

  createPost: (title: string, content: string, category: string, anonymous: boolean) =>
    supabase
      .from('community_posts')
      .insert({
        title,
        content,
        category,
        anonymous,
      })
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .single(),

  getComments: (postId: string) =>
    supabase
      .from('post_comments')
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true }),

  addComment: (postId: string, content: string, anonymous: boolean) =>
    supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        content,
        anonymous,
      })
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .single(),

  toggleReaction: async (postId: string, reactionType: string) => {
    const { data: existingReaction } = await supabase
      .from('post_reactions')
      .select()
      .eq('post_id', postId)
      .eq('reaction_type', reactionType)
      .single();

    if (existingReaction) {
      return supabase
        .from('post_reactions')
        .delete()
        .eq('id', existingReaction.id);
    } else {
      return supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          reaction_type: reactionType,
        })
        .select()
        .single();
    }
  },
};
