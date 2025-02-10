
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import type { CommunityPost, PostComment } from "@/types/community";
import { useAuth } from "@/hooks/useAuth";
import { MentionsInput } from "./MentionsInput";

interface CommentsDialogProps {
  post: CommunityPost | null;
  onOpenChange: (open: boolean) => void;
}

export const CommentsDialog = ({ post, onOpenChange }: CommentsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState({ content: "", anonymous: false });

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["post-comments", post?.id],
    queryFn: () => post ? CommunityService.getComments(post.id) : Promise.resolve([]),
    enabled: !!post,
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content, anonymous }: { postId: string; content: string; anonymous: boolean }) =>
      CommunityService.addComment(postId, content, anonymous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", post?.id] });
      setNewComment({ content: "", anonymous: false });
      onOpenChange(false); // Close dialog after successful comment
      toast({ title: "Success", description: "Your comment has been added" });
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

  return (
    <Dialog open={!!post} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-4">
            {isLoadingComments ? (
              <div>Loading comments...</div>
            ) : (
              comments.map((comment: PostComment) => (
                <div key={comment.id} className="p-3 bg-muted rounded">
                  <p className="text-sm font-medium">
                    {getCommentDisplayName(comment)}
                  </p>
                  <p>{comment.content}</p>
                </div>
              ))
            )}
          </div>
          <div className="space-y-2">
            <MentionsInput
              value={newComment.content}
              onChange={(content) => setNewComment(prev => ({ ...prev, content }))}
              placeholder="Add a supportive comment... Use @ to mention others"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newComment.anonymous}
                  onCheckedChange={(checked) => setNewComment(prev => ({ ...prev, anonymous: checked }))}
                />
                <Label>Comment Anonymously</Label>
              </div>
              <Button
                onClick={() => {
                  if (post) {
                    addCommentMutation.mutate({
                      postId: post.id,
                      content: newComment.content,
                      anonymous: newComment.anonymous,
                    });
                  }
                }}
                disabled={!newComment.content}
              >
                Add Comment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

