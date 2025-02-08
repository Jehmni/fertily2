
import { format } from "date-fns";
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { CommunityPost } from "@/types/community";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";

interface PostCardProps {
  post: CommunityPost;
  onCommentClick: (post: CommunityPost) => void;
}

export const PostCard = ({ post, onCommentClick }: PostCardProps) => {
  const queryClient = useQueryClient();

  const toggleReactionMutation = useMutation({
    mutationFn: ({ postId, reactionType }: { postId: string; reactionType: string }) =>
      CommunityService.toggleReaction(postId, reactionType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{post.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Posted by {post.anonymous ? "Anonymous" : `${post.profile?.first_name} ${post.profile?.last_name}`} • 
              {format(new Date(post.created_at), "MMM d, yyyy")}
            </p>
          </div>
          <span className="px-2 py-1 bg-primary/10 rounded text-sm">
            {post.category}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleReactionMutation.mutate({ postId: post.id, reactionType: "heart" })}
          >
            <Heart className={`h-4 w-4 mr-1 ${post.user_reaction === "heart" ? "fill-current text-red-500" : ""}`} />
            {post.reactions_count || 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCommentClick(post)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.comments_count || 0}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
