import { 
  postQueries, 
  categoryQueries, 
  commentQueries, 
  reactionQueries, 
  bookmarkQueries, 
  draftQueries,
  mentionQueries
} from "./community/queries";
import { followQueries } from "./community/follow-queries";
import { transformPostData, transformCommentData } from "./community/transformers";
import type { CommunityPost, PostComment, PostReaction, PostCategory, PostBookmark, MentionSuggestion, UserMention } from "@/types/community";

export const CommunityService = {
  async getPosts(filters?: { 
    category?: string; 
    query?: string;
    sortBy?: 'newest' | 'popular';
    page?: number;
    pageSize?: number;
  }): Promise<CommunityPost[]> {
    const { data: posts, error } = await postQueries.getPosts(filters);
    if (error) throw error;

    // Get user reactions for each post
    const postsWithReactions = await Promise.all(
      posts.map(async (post) => {
        const { data: userReactions } = await reactionQueries.getUserReactions(post.id);
        return {
          ...post,
          user_reactions: userReactions?.map(r => r.emoji_type) || []
        };
      })
    );

    return postsWithReactions.map(transformPostData);
  },

  async getCategories(): Promise<PostCategory[]> {
    const { data, error } = await categoryQueries.getCategories();
    if (error) throw error;
    return data;
  },

  async createPost(
    title: string,
    content: string,
    category: string,
    anonymous: boolean,
    image_urls?: string[]
  ): Promise<CommunityPost> {
    const { data, error } = await postQueries.createPost(title, content, category, anonymous, image_urls);
    if (error) throw error;
    return transformPostData(data);
  },

  async getComments(postId: string): Promise<PostComment[]> {
    const { data, error } = await commentQueries.getComments(postId);
    if (error) throw error;
    return data.map(transformCommentData);
  },

  async addComment(
    postId: string,
    content: string,
    anonymous: boolean
  ): Promise<PostComment> {
    const { data, error } = await commentQueries.addComment(postId, content, anonymous);
    if (error) throw error;
    return transformCommentData(data);
  },

  async toggleReaction(
    postId: string,
    emojiType: string
  ): Promise<PostReaction | null> {
    const { data, error } = await reactionQueries.toggleReaction(postId, emojiType);
    if (error) throw error;
    return data;
  },

  async toggleBookmark(postId: string): Promise<PostBookmark | null> {
    const { data, error } = await bookmarkQueries.toggleBookmark(postId);
    if (error) throw error;
    return data;
  },

  async getUserBookmarks(): Promise<{ post_id: string }[]> {
    const { data, error } = await bookmarkQueries.getUserBookmarks();
    if (error) throw error;
    return data;
  },

  async saveDraft(
    title: string,
    content: string,
    category: string
  ): Promise<void> {
    const { error } = await draftQueries.saveDraft(title, content, category);
    if (error) throw error;
  },

  async getLatestDraft(): Promise<{ title: string | null; content: string | null; category: string | null }> {
    const { data, error } = await draftQueries.getLatestDraft();
    if (error) throw error;
    return data?.[0] || { title: null, content: null, category: null };
  },

  async followUser(userId: string): Promise<void> {
    const { error } = await followQueries.followUser(userId);
    if (error) throw error;
  },

  async unfollowUser(userId: string): Promise<void> {
    const { error } = await followQueries.unfollowUser(userId);
    if (error) throw error;
  },

  async getFollowingStatus(userId: string): Promise<boolean> {
    const { data, error } = await followQueries.getFollowingStatus(userId);
    if (error) throw error;
    return !!data;
  },

  async getFollowerCounts(userId: string): Promise<{ follower_count: number; following_count: number }> {
    const { data, error } = await followQueries.getFollowerCount(userId);
    if (error) throw error;
    return {
      follower_count: data?.follower_count || 0,
      following_count: data?.following_count || 0
    };
  },

  async searchUsers(query: string): Promise<MentionSuggestion[]> {
    return mentionQueries.searchUsers(query);
  },

  async createMention(mentionedUserId: string, postId?: string, commentId?: string): Promise<UserMention> {
    return mentionQueries.createMention(mentionedUserId, postId, commentId);
  }
};
