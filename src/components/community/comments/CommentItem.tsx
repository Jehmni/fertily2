
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import type { PostComment } from "@/types/community";

interface CommentItemProps {
  comment: PostComment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const { user } = useAuth();

  const getCommentDisplayName = (comment: PostComment) => {
    const isOwnComment = user?.id === comment.user_id;
    if (comment.anonymous) {
      return isOwnComment 
        ? `${comment.anonymous_alias} (You)` 
        : comment.anonymous_alias;
    }
    return `${comment.profile?.first_name} ${comment.profile?.last_name}`;
  };

  return (
    <div className="flex items-start gap-3">
      <Avatar 
        className="h-8 w-8" 
        style={{ backgroundColor: comment.profile?.avatar_color || '#E2E8F0' }}
      >
        {!comment.anonymous && (
          <AvatarImage src={comment.profile?.avatar_url || undefined} />
        )}
        <AvatarFallback>
          {comment.anonymous 
            ? comment.anonymous_alias?.[0]
            : `${comment.profile?.first_name?.[0] || ''}${comment.profile?.last_name?.[0] || ''}`}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 p-3 bg-muted rounded">
        <p className="text-sm font-medium">
          {getCommentDisplayName(comment)}
        </p>
        <p>{comment.content}</p>
      </div>
    </div>
  );
};
