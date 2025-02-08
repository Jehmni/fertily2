
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import type { CommunityPost, PostComment } from "@/types/community";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Heart, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export const Community = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "seeking-support", anonymous: false });
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [newComment, setNewComment] = useState({ content: "", anonymous: false });

  const { data: posts, isLoading } = useQuery({
    queryKey: ["community-posts"],
    queryFn: CommunityService.getPosts,
  });

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["post-comments", selectedPost?.id],
    queryFn: () => selectedPost ? CommunityService.getComments(selectedPost.id) : Promise.resolve([]),
    enabled: !!selectedPost,
  });

  const createPostMutation = useMutation({
    mutationFn: (post: typeof newPost) => 
      CommunityService.createPost(post.title, post.content, post.category, post.anonymous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast({ title: "Success", description: "Your post has been shared with the community" });
      setNewPost({ title: "", content: "", category: "seeking-support", anonymous: false });
    },
  });

  const toggleReactionMutation = useMutation({
    mutationFn: ({ postId, reactionType }: { postId: string; reactionType: string }) =>
      CommunityService.toggleReaction(postId, reactionType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, content, anonymous }: { postId: string; content: string; anonymous: boolean }) =>
      CommunityService.addComment(postId, content, anonymous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", selectedPost?.id] });
      setNewComment({ content: "", anonymous: false });
      toast({ title: "Success", description: "Your comment has been added" });
    },
  });

  if (isLoading) {
    return <div>Loading community...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Community Support</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Share Your Story</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share with the Community</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Give your post a title"
                />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={newPost.category}
                  onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="seeking-support">Seeking Support</option>
                  <option value="success-story">Success Story</option>
                  <option value="ivf-journey">IVF Journey</option>
                </select>
              </div>
              <div>
                <Label>Your Story</Label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Share your experience..."
                  rows={5}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newPost.anonymous}
                  onCheckedChange={(checked) => setNewPost(prev => ({ ...prev, anonymous: checked }))}
                />
                <Label>Post Anonymously</Label>
              </div>
              <Button
                onClick={() => createPostMutation.mutate(newPost)}
                disabled={!newPost.title || !newPost.content}
              >
                Share
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {posts?.map((post) => (
          <Card key={post.id}>
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
                  onClick={() => setSelectedPost(post)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.comments_count || 0}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
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
                      {comment.anonymous ? "Anonymous" : `${comment.profile?.first_name} ${comment.profile?.last_name}`}
                    </p>
                    <p>{comment.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-2">
              <Textarea
                value={newComment.content}
                onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Add a supportive comment..."
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
                    if (selectedPost) {
                      addCommentMutation.mutate({
                        postId: selectedPost.id,
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
    </div>
  );
};
