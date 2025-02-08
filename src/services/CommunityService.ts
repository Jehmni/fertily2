
import { supabase } from "@/lib/supabase";

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  anonymous: boolean;
  created_at: string;
  updated_at: string;
  profile?: {
    first_name: string;
    last_name: string;
  };
  reactions_count?: number;
  comments_count?: number;
  user_reaction?: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  anonymous: boolean;
  created_at: string;
  profile?: {
    first_name: string;
    last_name: string;
  };
}

export const CommunityService = {
  async getPosts() {
    const { data: posts, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles (first_name, last_name),
        reactions_count:post_reactions(count),
        comments_count:post_comments(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return posts.map(post => ({
      ...post,
      profile: post.profiles,
      profiles: undefined
    }));
  },

  async createPost(title: string, content: string, category: string, anonymous: boolean) {
    const { data, error } = await supabase
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
      .single();

    if (error) throw error;
    return {
      ...data,
      profile: data.profiles,
      profiles: undefined
    };
  },

  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(comment => ({
      ...comment,
      profile: comment.profiles,
      profiles: undefined
    }));
  },

  async addComment(postId: string, content: string, anonymous: boolean) {
    const { data, error } = await supabase
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
      .single();

    if (error) throw error;
    return {
      ...data,
      profile: data.profiles,
      profiles: undefined
    };
  },

  async toggleReaction(postId: string, reactionType: string) {
    const { data: existingReaction } = await supabase
      .from('post_reactions')
      .select()
      .eq('post_id', postId)
      .eq('reaction_type', reactionType)
      .single();

    if (existingReaction) {
      const { error } = await supabase
        .from('post_reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (error) throw error;
      return null;
    } else {
      const { data, error } = await supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          reaction_type: reactionType,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }
};
