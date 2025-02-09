
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import type { PostCategory } from "@/types/community";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState<NewPost>(initialPostState);
  const [isOpen, setIsOpen] = useState(false);
  const [autosaveTimeout, setAutosaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Query to fetch existing draft
  const { data: draft } = useQuery({
    queryKey: ["post-draft"],
    queryFn: CommunityService.getLatestDraft,
    enabled: !!user
  });

  // Load draft if it exists
  useEffect(() => {
    if (draft) {
      setNewPost({
        title: draft.title || "",
        content: draft.content || "",
        category: draft.category || "seeking-support",
        anonymous: false
      });
    }
  }, [draft]);

  // Autosave mutation
  const saveDraftMutation = useMutation({
    mutationFn: (draft: Partial<NewPost>) => 
      CommunityService.saveDraft(draft.title || "", draft.content || "", draft.category || ""),
    onError: (error: Error) => {
      console.error("Failed to save draft:", error);
    },
  });

  // Handle auto-saving
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));

    // Clear existing timeout
    if (autosaveTimeout) {
      clearTimeout(autosaveTimeout);
    }

    // Set new timeout for autosave
    const timeout = setTimeout(() => {
      saveDraftMutation.mutate({
        title: name === 'title' ? value : newPost.title,
        content: name === 'content' ? value : newPost.content,
        category: newPost.category
      });
    }, 1500); // Autosave after 1.5 seconds of no typing

    setAutosaveTimeout(timeout);
  };

  const createPostMutation = useMutation({
    mutationFn: (post: NewPost) => 
      CommunityService.createPost(post.title, post.content, post.category, post.anonymous),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      // Clear draft after successful post
      saveDraftMutation.mutate({ title: "", content: "", category: "" });
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
              name="title"
              value={newPost.title}
              onChange={handleContentChange}
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
              name="content"
              value={newPost.content}
              onChange={handleContentChange}
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
