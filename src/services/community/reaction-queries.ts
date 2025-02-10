
import { supabase } from "@/lib/supabase";

export const reactionQueries = {
  toggleReaction: async (postId: string, emojiType: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const { data: existingReaction } = await supabase
      .from('post_reactions')
      .select()
      .eq('post_id', postId)
      .eq('user_id', session.user.id)
      .eq('emoji_type', emojiType)
      .maybeSingle();

    if (existingReaction) {
      return supabase
        .from('post_reactions')
        .delete()
        .eq('id', existingReaction.id)
        .eq('user_id', session.user.id);
    } else {
      return supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          emoji_type: emojiType,
          user_id: session.user.id
        })
        .select()
        .single();
    }
  },

  getUserReactions: async (postId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { data: [] };

    return supabase
      .from('post_reactions')
      .select('emoji_type')
      .eq('post_id', postId)
      .eq('user_id', session.user.id);
  }
};
