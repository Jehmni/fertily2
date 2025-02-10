
import { Bookmark, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostControlsProps {
  sortBy: 'newest' | 'popular';
  showBookmarked: boolean;
  onSortChange: (sort: 'newest' | 'popular') => void;
  onBookmarkToggle: () => void;
}

export const PostControls = ({
  sortBy,
  showBookmarked,
  onSortChange,
  onBookmarkToggle,
}: PostControlsProps) => {
  return (
    <div className="flex space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            {sortBy === 'newest' ? 'Newest' : 'Most Popular'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onSortChange('newest')}>
            Newest
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange('popular')}>
            Most Popular
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant={showBookmarked ? "default" : "outline"}
        onClick={onBookmarkToggle}
      >
        <Bookmark className="h-4 w-4 mr-2" />
        Bookmarked
      </Button>
    </div>
  );
};
