
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import type { CommunityPost } from "@/types/community";
import { CreatePostDialog } from "./community/CreatePostDialog";
import { PostCard } from "./community/PostCard";
import { CommentsDialog } from "./community/CommentsDialog";

export const Community = () => {
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: CommunityService.getPosts,
  });

  if (isLoading) {
    return <div>Loading community...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Community Support</h2>
        <CreatePostDialog />
      </div>

      <div className="grid gap-6">
        {posts?.map((post) => (
          <PostCard 
            key={post.id} 
            post={post}
            onCommentClick={setSelectedPost}
          />
        ))}
      </div>

      <CommentsDialog 
        post={selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      />
    </div>
  );
};
