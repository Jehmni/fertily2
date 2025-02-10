
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import type { PostCategory } from "@/types/community";
import { PostDialogTitle } from "./post-dialog/PostDialogTitle";
import { PostDialogForm } from "./post-dialog/PostDialogForm";
import { useDraftAutosave } from "./post-dialog/useDraftAutosave";

interface CreatePostDialogProps {
  categories: PostCategory[];
}

type NewPost = {
  title: string;
  content: string;
  category: string;
  anonymous: boolean;
  image_urls: string[];
  content_format: "plain" | "rich";
};

const initialPostState: NewPost = {
  title: "",
  content: "",
  category: "seeking-support",
  anonymous: false,
  image_urls: [],
  content_format: "rich",
};

export const CreatePostDialog = ({ categories }: CreatePostDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState<NewPost>(initialPostState);
  const [isOpen, setIsOpen] = useState(false);

  const { data: draft } = useQuery({
    queryKey: ["post-draft"],
    queryFn: CommunityService.getLatestDraft,
  });

  const { autosave } = useDraftAutosave({
    title: newPost.title,
    content: newPost.content,
    category: newPost.category,
  });

  useEffect(() => {
    if (draft) {
      setNewPost((prev) => ({
        ...prev,
        title: draft.title || "",
        content: draft.content || "",
        category: draft.category || "seeking-support",
      }));
    }
  }, [draft]);

  const createPostMutation = useMutation({
    mutationFn: (post: NewPost) =>
      CommunityService.createPost(
        post.title,
        post.content,
        post.category,
        post.anonymous,
        post.image_urls
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast({
        title: "Success",
        description: "Your post has been shared with the community",
      });
      setNewPost(initialPostState);
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDataChange = (data: Partial<NewPost>) => {
    setNewPost((prev) => ({ ...prev, ...data }));
    autosave(data);
  };

  const handleSubmit = () => {
    if (!newPost.title || !newPost.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
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
      <DialogContent className="max-w-2xl">
        <PostDialogTitle />
        <PostDialogForm
          categories={categories}
          initialData={newPost}
          onSubmit={handleSubmit}
          isSubmitting={createPostMutation.isPending}
          onDataChange={handleDataChange}
        />
      </DialogContent>
    </Dialog>
  );
};
