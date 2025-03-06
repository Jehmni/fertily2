
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, Camera } from "lucide-react";

interface EmbryoImagePreviewProps {
  imageUrl: string | null;
  onImageRemove: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCameraStart: () => void;
}

export const EmbryoImagePreview = ({ 
  imageUrl, 
  onImageRemove, 
  onImageUpload, 
  onCameraStart 
}: EmbryoImagePreviewProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {imageUrl ? (
        <div className="relative w-full max-w-md">
          <img 
            src={imageUrl} 
            alt="Uploaded embryo" 
            className="w-full rounded-lg border"
          />
          <Button
            type="button"
            variant="outline"
            className="absolute top-2 right-2"
            onClick={onImageRemove}
          >
            Remove
          </Button>
        </div>
      ) : (
        <div className="flex gap-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image')?.click()}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Choose Image
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCameraStart}
          >
            <Camera className="w-4 h-4 mr-2" />
            Take Picture
          </Button>
        </div>
      )}
    </div>
  );
};
