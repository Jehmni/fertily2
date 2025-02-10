
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  existingImages?: string[];
}

export const ImageUpload = ({ onImagesUploaded, existingImages = [] }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(existingImages);
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      const newImages = [...images, publicUrl];
      setImages(newImages);
      onImagesUploaded(newImages);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {images.map((url, index) => (
          <div key={url} className="relative">
            <img 
              src={url} 
              alt={`Uploaded ${index + 1}`} 
              className="w-24 h-24 object-cover rounded"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                await uploadImage(file);
              }
            };
            input.click();
          }}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Add Image'}
        </Button>
      </div>
    </div>
  );
};
