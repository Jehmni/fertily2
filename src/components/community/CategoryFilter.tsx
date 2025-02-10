
import { Button } from "@/components/ui/button";
import type { PostCategory } from "@/types/community";

interface CategoryFilterProps {
  categories: PostCategory[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export const CategoryFilter = ({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === "" ? "default" : "outline"}
        onClick={() => onCategorySelect("")}
      >
        All
      </Button>
      {categories.map((category: PostCategory) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.name ? "default" : "outline"}
          onClick={() => onCategorySelect(category.name)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
