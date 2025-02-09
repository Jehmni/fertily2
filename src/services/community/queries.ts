
import { supabase } from "@/lib/supabase";

export const postQueries = {
  getPosts: (filters?: { category?: string; query?: string }) => {
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        profiles (first_name, last_name),
        reactions_count:post_reactions(count),
        comments_count:post_comments(count)
      `)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.query) {
      query = query.or(`title.ilike.%${filters.query}%,content.ilike.%${filters.query}%`);
    }

    return query;
  },

  getCategories: () =>
    supabase
      .from('post_categories')
      .select('*')
      .order('name', { ascending: true }),

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
        user_id: session.user.id
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
        user_id: session.user.id
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
      .eq('user_id', session.user.id)
      .eq('reaction_type', reactionType)
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
          reaction_type: reactionType,
          user_id: session.user.id
        })
        .select()
        .single();
    }
  },

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
  },

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
