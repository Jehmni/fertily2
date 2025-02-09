
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import type { CommunityPost, PostCategory } from "@/types/community";
import { CreatePostDialog } from "./community/CreatePostDialog";
import { PostCard } from "./community/PostCard";
import { CommentsDialog } from "./community/CommentsDialog";
import { Input } from "./ui/input";
import { Search, Bookmark } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

export const Community = () => {
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showBookmarked, setShowBookmarked] = useState(false);
  const { toast } = useToast();

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["post-categories"],
    queryFn: CommunityService.getCategories,
  });

  const { data: posts = [], isLoading: isPostsLoading } = useQuery({
    queryKey: ["community-posts", selectedCategory, searchQuery],
    queryFn: () => CommunityService.getPosts({ 
      category: selectedCategory,
      query: searchQuery
    }),
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["user-bookmarks"],
    queryFn: CommunityService.getUserBookmarks,
  });

  const filteredPosts = showBookmarked
    ? posts.filter(post => bookmarks.some(b => b.post_id === post.id))
    : posts;

  if (isPostsLoading || isCategoriesLoading) {
    return <div>Loading community...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Community Support</h2>
        <CreatePostDialog categories={categories} />
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <Button
          variant={showBookmarked ? "default" : "outline"}
          onClick={() => setShowBookmarked(!showBookmarked)}
        >
          <Bookmark className="h-4 w-4 mr-2" />
          Bookmarked
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "" ? "default" : "outline"}
          onClick={() => setSelectedCategory("")}
        >
          All
        </Button>
        {categories.map((category: PostCategory) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.name ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.name)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div className="grid gap-6">
        {filteredPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post}
            onCommentClick={setSelectedPost}
            bookmarked={bookmarks.some(b => b.post_id === post.id)}
            onBookmarkToggle={async () => {
              try {
                await CommunityService.toggleBookmark(post.id);
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to update bookmark",
                  variant: "destructive"
                });
              }
            }}
          />
        ))}
      </div>

      <CommentsDialog 
        post={selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      />
    </div>
  );
};
