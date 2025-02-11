
import { Button } from "@/components/ui/button";
import { PostCard } from "./PostCard";
import type { CommunityPost } from "@/types/community";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { CommunityService } from "@/services/CommunityService";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { FileText } from "lucide-react";

interface PostListProps {
  posts: CommunityPost[];
  bookmarks: { post_id: string }[];
  onCommentClick: (post: CommunityPost) => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export const PostList = ({
  posts,
  bookmarks,
  onCommentClick,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: PostListProps) => {
  const { toast } = useToast();
  
  const loadMoreRef = useIntersectionObserver<HTMLDivElement>({
    onChange: (isIntersecting) => {
      if (isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No posts yet"
        description="Be the first one to share your story with the community"
        actionLabel="Share Your Story"
        onAction={() => {
          // This will trigger the create post dialog from the parent
          document.dispatchEvent(new CustomEvent('openCreatePostDialog'));
        }}
      />
    );
  }

  return (
    <div className="grid gap-6">
      {posts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post}
          onCommentClick={onCommentClick}
          bookmarked={bookmarks.some(b => b.post_id === post.id)}
          onBookmarkToggle={async () => {
            try {
              await CommunityService.toggleBookmark(post.id);
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to update bookmark",
                variant: "destructive"
              });
            }
          }}
        />
      ))}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center p-4">
          {isFetchingNextPage ? (
            <div>Loading more posts...</div>
          ) : (
            <Button variant="ghost" onClick={() => fetchNextPage()}>
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
