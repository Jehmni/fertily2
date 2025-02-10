
import { supabase } from "@/lib/supabase";
import type { MentionSuggestion, UserMention } from "@/types/community";

export const mentionQueries = {
  searchUsers: async (query: string): Promise<MentionSuggestion[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(5);

    if (error) throw error;

    return data.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      display_name: `${user.first_name} ${user.last_name}`,
    }));
  },

  createMention: async (
    mentionedUserId: string,
    postId?: string,
    commentId?: string
  ): Promise<UserMention> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No active session');

    const { data, error } = await supabase
      .from('user_mentions')
      .insert({
        mentioned_user_id: mentionedUserId,
        post_id: postId,
        comment_id: commentId,
        mentioning_user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
