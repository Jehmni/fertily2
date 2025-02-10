import { useState } from "react";
import { format } from "date-fns";
import { Heart, MessageCircle, Bookmark, PartyPopper, ThumbsUp, Lightbulb, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { CommunityPost } from "@/types/community";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { RichTextEditor } from "./RichTextEditor";
import { UserProfile } from "./UserProfile";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

interface PostCardProps {
  post: CommunityPost;
  onCommentClick: (post: CommunityPost) => void;
  bookmarked: boolean;
  onBookmarkToggle: () => Promise<void>;
}

const emojiIcons = {
  heart: Heart,
  celebrate: PartyPopper,
  support: ThumbsUp,
  insightful: Lightbulb,
  thanks: Star,
};

export const PostCard = ({ post, onCommentClick, bookmarked, onBookmarkToggle }: PostCardProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const { data: followerCounts } = useQuery({
    queryKey: ["follower-counts", post.user_id],
    queryFn: () => CommunityService.getFollowerCounts(post.user_id),
    enabled: !post.anonymous,
  });

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
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Avatar 
                className="h-10 w-10" 
                style={{ 
                  backgroundColor: post.profile?.avatar_color || '#E2E8F0'
                }}
              >
                <AvatarImage src={post.profile?.avatar_url || undefined} />
                <AvatarFallback>
                  {post.anonymous 
                    ? post.anonymous_alias[0]
                    : `${post.profile?.first_name?.[0] || ''}${post.profile?.last_name?.[0] || ''}`}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle>{post.title}</CardTitle>
                <div className="flex items-center space-x-2">
                  <button 
                    className={`text-sm ${!post.anonymous ? "text-primary hover:underline cursor-pointer" : "text-muted-foreground cursor-default"}`}
                    onClick={() => !post.anonymous && setShowProfile(true)}
                    disabled={post.anonymous}
                  >
                    Posted by {postLabel}
                  </button>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(post.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
            <span className="px-2 py-1 bg-primary/10 rounded text-sm">
              {post.category}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {post.content_format === 'rich' ? (
            <RichTextEditor 
              content={post.content} 
              onChange={() => {}} 
              editable={false} 
            />
          ) : (
            <p className="whitespace-pre-wrap">{post.content}</p>
          )}
          
          {post.image_urls && post.image_urls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
              {post.image_urls.map((url, index) => (
                <img
                  key={url}
                  src={url}
                  alt={`Post image ${index + 1}`}
                  className="rounded-lg w-full h-48 object-cover"
                />
              ))}
            </div>
          )}
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

      {!post.anonymous && (
        <UserProfile
          userId={post.user_id}
          isOpen={showProfile}
          onOpenChange={setShowProfile}
        />
      )}
    </>
  );
};
