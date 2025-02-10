
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import type { CommunityPost } from "@/types/community";
import { CommentsList } from "./comments/CommentsList";
import { CommentForm } from "./comments/CommentForm";

interface CommentsDialogProps {
  post: CommunityPost | null;
  onOpenChange: (open: boolean) => void;
}

export const CommentsDialog = ({ post, onOpenChange }: CommentsDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
      toast({ title: "Success", description: "Your comment has been added" });
    },
  });

  const handleSubmit = () => {
    if (post) {
      addCommentMutation.mutate({
        postId: post.id,
        content: newComment.content,
        anonymous: newComment.anonymous,
      });
    }
  };

  return (
    <Dialog open={!!post} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <CommentsList 
            comments={comments} 
            isLoading={isLoadingComments} 
          />
          <CommentForm
            content={newComment.content}
            anonymous={newComment.anonymous}
            onContentChange={(content) => setNewComment(prev => ({ ...prev, content }))}
            onAnonymousChange={(checked) => setNewComment(prev => ({ ...prev, anonymous: checked }))}
            onSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

