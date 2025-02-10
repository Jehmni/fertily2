
import { useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { CommunityService } from "@/services/CommunityService";
import type { CommunityPost } from "@/types/community";
import { CreatePostDialog } from "./community/CreatePostDialog";
import { CommentsDialog } from "./community/CommentsDialog";
import { SearchBar } from "./community/SearchBar";
import { CategoryFilter } from "./community/CategoryFilter";
import { PostControls } from "./community/PostControls";
import { PostList } from "./community/PostList";

const PAGE_SIZE = 10;

export const Community = () => {
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["post-categories"],
    queryFn: CommunityService.getCategories,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPostsLoading,
  } = useInfiniteQuery({
    queryKey: ["community-posts", selectedCategory, searchQuery, sortBy],
    queryFn: ({ pageParam = 1 }) =>
      CommunityService.getPosts({
        category: selectedCategory,
        query: searchQuery,
        sortBy: sortBy,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["user-bookmarks"],
    queryFn: CommunityService.getUserBookmarks,
  });

  const allPosts = data?.pages.flat() || [];
  const filteredPosts = showBookmarked
    ? allPosts.filter(post => bookmarks.some(b => b.post_id === post.id))
    : allPosts;

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
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <PostControls
          sortBy={sortBy}
          showBookmarked={showBookmarked}
          onSortChange={setSortBy}
          onBookmarkToggle={() => setShowBookmarked(!showBookmarked)}
        />
      </div>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      <PostList
        posts={filteredPosts}
        bookmarks={bookmarks}
        onCommentClick={setSelectedPost}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
      />

      <CommentsDialog 
        post={selectedPost}
        onOpenChange={(open) => !open && setSelectedPost(null)}
      />
    </div>
  );
};
