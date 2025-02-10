
import { supabase } from "@/lib/supabase";

export const bookmarkQueries = {
  toggleBookmark: async (postId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const { data: existingBookmark } = await supabase
      .from('post_bookmarks')
      .select()
      .eq('post_id', postId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (existingBookmark) {
      return supabase
        .from('post_bookmarks')
        .delete()
        .eq('id', existingBookmark.id)
        .eq('user_id', session.user.id);
    } else {
      return supabase
        .from('post_bookmarks')
        .insert({
          post_id: postId,
          user_id: session.user.id
        })
        .select()
        .single();
    }
  },

  getUserBookmarks: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    return supabase
      .from('post_bookmarks')
      .select('post_id')
      .eq('user_id', session.user.id);
  }
};
