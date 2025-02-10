
import type { PostComment } from "@/types/community";
import { CommentItem } from "./CommentItem";

interface CommentsListProps {
  comments: PostComment[];
  isLoading: boolean;
}

export const CommentsList = ({ comments, isLoading }: CommentsListProps) => {
  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment: PostComment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

