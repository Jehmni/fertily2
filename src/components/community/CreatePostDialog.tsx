
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

export const CreatePostDialog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState<NewPost>(initialPostState);

  const createPostMutation = useMutation({
    mutationFn: (post: NewPost) => 
      CommunityService.createPost(post.title, post.content, post.category, post.anonymous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast({ title: "Success", description: "Your post has been shared with the community" });
      setNewPost(initialPostState);
    },
  });

  return (
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
              <option value="motivation">Motivation & Encouragement</option>
              <option value="general">General Discussion</option>
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
  );
};
