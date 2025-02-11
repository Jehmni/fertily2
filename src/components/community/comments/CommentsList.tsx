
import type { PostComment } from "@/types/community";
import { CommentItem } from "./CommentItem";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";

interface CommentsListProps {
  comments: PostComment[];
  isLoading: boolean;
}

export const CommentsList = ({ comments, isLoading }: CommentsListProps) => {
  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  if (comments.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No comments yet"
        description="Be the first one to share your thoughts"
      />
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment: PostComment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};
