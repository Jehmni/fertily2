
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { EmbryoCamera } from "./EmbryoCamera";
import { EmbryoImagePreview } from "./EmbryoImagePreview";
import { useEmbryoImage } from "@/hooks/useEmbryoImage";
import { useEmbryoSubmission } from "@/hooks/useEmbryoSubmission";

export const EmbryoSubmissionForm = () => {
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const {
    imageUrl,
    isLoading: isImageLoading,
    isCameraActive,
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    handleImageUpload,
    handleImageRemove,
  } = useEmbryoImage();

  const resetForm = () => {
    setDescription("");
  };

  const { handleSubmit, isLoading: isSubmitting } = useEmbryoSubmission({
    imageUrl,
    description,
    onSuccess: resetForm,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Embryo Image</Label>
        <div className="space-y-4">
          {isCameraActive ? (
            <EmbryoCamera
              videoRef={videoRef}
              onCapture={captureImage}
              onClose={stopCamera}
            />
          ) : (
            <EmbryoImagePreview
              imageUrl={imageUrl}
              onImageRemove={handleImageRemove}
              onImageUpload={handleImageUpload}
              onCameraStart={startCamera}
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Embryo Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the embryo's characteristics..."
          className="min-h-[100px]"
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || isImageLoading || (!imageUrl && !description)}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4 mr-2" />
            Analyze Embryo
          </>
        )}
      </Button>
    </form>
  );
};
