
import { supabase } from "@/lib/supabase";
import type { CommunityPost, PostComment, PostReaction } from "@/types/community";

const transformPostData = (post: any): CommunityPost => ({
  ...post,
  profile: post.profiles,
  profiles: undefined
});

const transformCommentData = (comment: any): PostComment => ({
  ...comment,
  profile: comment.profiles,
  profiles: undefined
});

export const CommunityService = {
  async getPosts(): Promise<CommunityPost[]> {
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
    return posts.map(transformPostData);
  },

  async createPost(
    title: string,
    content: string,
    category: string,
    anonymous: boolean
  ): Promise<CommunityPost> {
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
    return transformPostData(data);
  },

  async getComments(postId: string): Promise<PostComment[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles (first_name, last_name)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data.map(transformCommentData);
  },

  async addComment(
    postId: string,
    content: string,
    anonymous: boolean
  ): Promise<PostComment> {
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
    return transformCommentData(data);
  },

  async toggleReaction(
    postId: string,
    reactionType: string
  ): Promise<PostReaction | null> {
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
