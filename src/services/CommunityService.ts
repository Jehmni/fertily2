
import { postQueries } from "./community/queries";
import { transformPostData, transformCommentData } from "./community/transformers";
import type { CommunityPost, PostComment, PostReaction } from "@/types/community";

export const CommunityService = {
  async getPosts(): Promise<CommunityPost[]> {
    const { data: posts, error } = await postQueries.getPosts();
    if (error) throw error;
    return posts.map(transformPostData);
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
  }
};
