
import type { CommunityPost, PostComment } from "@/types/community";

export const transformPostData = (post: any): CommunityPost => ({
  ...post,
  profile: post.profiles,
  profiles: undefined,
});

export const transformCommentData = (comment: any): PostComment => ({
  ...comment,
  profile: comment.profiles,
  profiles: undefined,
});
