
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "../ImageUpload";
import { MentionsInput } from "../MentionsInput";
import type { PostCategory } from "@/types/community";

interface PostDialogFormProps {
  categories: PostCategory[];
  initialData: {
    title: string;
    content: string;
    category: string;
    anonymous: boolean;
    image_urls: string[];
  };
  onSubmit: () => void;
  isSubmitting: boolean;
  onDataChange: (data: {
    title?: string;
    content?: string;
    category?: string;
    anonymous?: boolean;
    image_urls?: string[];
  }) => void;
}

export const PostDialogForm = ({
  categories,
  initialData,
  onSubmit,
  isSubmitting,
  onDataChange,
}: PostDialogFormProps) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          name="title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Give your post a title"
        />
      </div>

      <div>
        <Label>Category</Label>
        <select
          className="w-full p-2 border rounded"
          value={formData.category}
          onChange={(e) => handleChange("category", e.target.value)}
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
        <MentionsInput
          value={formData.content}
          onChange={(content) => handleChange("content", content)}
          placeholder="Share your story... Use @ to mention others"
        />
      </div>

      <div>
        <Label>Images</Label>
        <ImageUpload
          onImagesUploaded={(urls) => handleChange("image_urls", urls)}
          existingImages={formData.image_urls}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.anonymous}
          onCheckedChange={(checked) => handleChange("anonymous", checked)}
        />
        <Label>Post Anonymously</Label>
      </div>

      <Button
        onClick={onSubmit}
        disabled={!formData.title || !formData.content || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Sharing..." : "Share"}
      </Button>
    </div>
  );
};

