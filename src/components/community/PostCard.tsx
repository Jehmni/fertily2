
import { format } from "date-fns";
import { Heart, MessageCircle, Bookmark, Celebrate, ThumbsUp, Lightbulb, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { CommunityPost } from "@/types/community";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface PostCardProps {
  post: CommunityPost;
  onCommentClick: (post: CommunityPost) => void;
  bookmarked: boolean;
  onBookmarkToggle: () => Promise<void>;
}

const emojiIcons = {
  heart: Heart,
  celebrate: Celebrate,
  support: ThumbsUp,
  insightful: Lightbulb,
  thanks: PartyPopper,
};

export const PostCard = ({ post, onCommentClick, bookmarked, onBookmarkToggle }: PostCardProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const toggleReactionMutation = useMutation({
    mutationFn: ({ postId, emojiType }: { postId: string; emojiType: string }) =>
      CommunityService.toggleReaction(postId, emojiType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive",
      });
    },
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: onBookmarkToggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-bookmarks"] });
    },
  });

  const displayName = post.anonymous 
    ? post.anonymous_alias 
    : `${post.profile?.first_name} ${post.profile?.last_name}`;

  const isOwnPost = user?.id === post.user_id;
  const postLabel = isOwnPost && post.anonymous ? `${post.anonymous_alias} (You)` : displayName;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{post.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Posted by {postLabel} • {format(new Date(post.created_at), "MMM d, yyyy")}
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
        <div className="flex space-x-2">
          {Object.entries(emojiIcons).map(([type, Icon]) => {
            const reactionCount = post.reactions_count?.find(r => r.emoji_type === type)?.count || 0;
            const isReacted = post.user_reactions?.includes(type);
            
            return (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => toggleReactionMutation.mutate({ postId: post.id, emojiType: type })}
                className={isReacted ? "text-primary" : ""}
              >
                <Icon className={`h-4 w-4 mr-1 ${isReacted ? "fill-current" : ""}`} />
                {reactionCount}
              </Button>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCommentClick(post)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {post.comments_count?.[0]?.count || 0}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleBookmarkMutation.mutate()}
        >
          <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
        </Button>
      </CardFooter>
    </Card>
  );
};
