
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import type { PostCategory } from "@/types/community";

interface CreatePostDialogProps {
  categories: PostCategory[];
}

type NewPost = {
  title: string;
  content: string;
  category: string;
  anonymous: boolean;
};

const initialPostState: NewPost = {
  title: "",
  content: "",
  category: "seeking-support",
  anonymous: false,
};

export const CreatePostDialog = ({ categories }: CreatePostDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState<NewPost>(initialPostState);
  const [isOpen, setIsOpen] = useState(false);

  const createPostMutation = useMutation({
    mutationFn: (post: NewPost) => 
      CommunityService.createPost(post.title, post.content, post.category, post.anonymous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast({ title: "Success", description: "Your post has been shared with the community" });
      setNewPost(initialPostState);
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create post. Please try again.", 
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = () => {
    if (!newPost.title || !newPost.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
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
            onClick={handleSubmit}
            disabled={!newPost.title || !newPost.content || createPostMutation.isPending}
          >
            {createPostMutation.isPending ? "Sharing..." : "Share"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
