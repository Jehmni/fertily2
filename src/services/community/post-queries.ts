
import { supabase } from "@/lib/supabase";

export const postQueries = {
  getPosts: (filters?: { 
    category?: string; 
    query?: string;
    sortBy?: 'newest' | 'popular';
  }) => {
    let query = supabase
      .from('community_posts')
      .select(`
        *,
        profiles (first_name, last_name),
        reactions_count:post_reaction_counts(emoji_type, count),
        comments_count:post_comments(count)
      `);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.query) {
      query = query.or(`title.ilike.%${filters.query}%,content.ilike.%${filters.query}%`);
    }

    if (filters?.sortBy === 'popular') {
      query = query.order('reactions_count', { foreignTable: 'post_reaction_counts', ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    return query;
  },

  createPost: async (title: string, content: string, category: string, anonymous: boolean, image_urls?: string[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');
    
    return supabase
      .from('community_posts')
      .insert({
        title,
        content,
        category,
        anonymous,
        image_urls,
        user_id: session.user.id
      })
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .single();
  }
};
