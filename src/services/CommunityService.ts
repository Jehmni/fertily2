
import { postQueries } from "./community/queries";
import { transformPostData, transformCommentData } from "./community/transformers";
import type { CommunityPost, PostComment, PostReaction, PostCategory, PostBookmark } from "@/types/community";

export const CommunityService = {
  async getPosts(filters?: { category?: string; query?: string }): Promise<CommunityPost[]> {
    const { data: posts, error } = await postQueries.getPosts(filters);
    if (error) throw error;
    return posts.map(transformPostData);
  },

  async getCategories(): Promise<PostCategory[]> {
    const { data, error } = await postQueries.getCategories();
    if (error) throw error;
    return data;
  },

  async createPost(
    title: string,
    content: string,
    category: string,
    anonymous: boolean
  ): Promise<CommunityPost> {
    const { data, error } = await postQueries.createPost(title, content, category, anonymous);
    if (error) throw error;
    return transformPostData(data);
  },

  async getComments(postId: string): Promise<PostComment[]> {
    const { data, error } = await postQueries.getComments(postId);
    if (error) throw error;
    return data.map(transformCommentData);
  },

  async addComment(
    postId: string,
    content: string,
    anonymous: boolean
  ): Promise<PostComment> {
    const { data, error } = await postQueries.addComment(postId, content, anonymous);
    if (error) throw error;
    return transformCommentData(data);
  },

  async toggleReaction(
    postId: string,
    reactionType: string
  ): Promise<PostReaction | null> {
    const { data, error } = await postQueries.toggleReaction(postId, reactionType);
    if (error) throw error;
    return data;
  },

  async toggleBookmark(postId: string): Promise<PostBookmark | null> {
    const { data, error } = await postQueries.toggleBookmark(postId);
    if (error) throw error;
    return data;
  },

  async getUserBookmarks(): Promise<{ post_id: string }[]> {
    const { data, error } = await postQueries.getUserBookmarks();
    if (error) throw error;
    return data;
  },

  async saveDraft(
    title: string,
    content: string,
    category: string
  ): Promise<void> {
    const { error } = await postQueries.saveDraft(title, content, category);
    if (error) throw error;
  },

  async getLatestDraft(): Promise<{ title: string | null; content: string | null; category: string | null }> {
    const { data, error } = await postQueries.getLatestDraft();
    if (error) throw error;
    return data?.[0] || { title: null, content: null, category: null };
  },
};
