
import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import type { PostComment } from "@/types/community";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface CommentItemProps {
  comment: PostComment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteCommentMutation = useMutation({
    mutationFn: async () => {
      await CommunityService.deleteComment(comment.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments"] });
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  const getCommentDisplayName = (comment: PostComment) => {
    const isOwnComment = user?.id === comment.user_id;
    if (comment.anonymous) {
      return isOwnComment 
        ? `${comment.anonymous_alias} (You)` 
        : comment.anonymous_alias;
    }
    return `${comment.profile?.first_name} ${comment.profile?.last_name}`;
  };

  const isOwnComment = user?.id === comment.user_id;

  return (
    <>
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
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium">
              {getCommentDisplayName(comment)}
            </p>
            {isOwnComment && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive/90"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="mt-1">{comment.content}</p>
        </div>
      </div>

      <ConfirmationDialog
        icon={Trash2}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => deleteCommentMutation.mutate()}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </>
  );
};
