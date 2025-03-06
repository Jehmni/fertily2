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

export const EmbryoSubmissionForm = () => {
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const {
    imageUrl,
    isLoading,
    isCameraActive,
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    handleImageUpload,
    handleImageRemove,
  } = useEmbryoImage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Call the analyze-embryo function
      const { data: analysis, error: analysisError } = await supabase.functions
        .invoke('analyze-embryo', {
          body: { imageUrl, description }
        });

      if (analysisError) throw analysisError;

      // Store the analysis result
      const { error: dbError } = await supabase
        .from('embryo_data')
        .insert({
          expert_id: user.id,
          image_url: imageUrl,
          text_description: description,
          ai_score: analysis.confidenceScore,
          grade: analysis.analysis,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Embryo analysis completed successfully",
      });

      // Reset form
      setImageUrl(null);
      setDescription("");
    } catch (error: any) {
      toast({
        title: "Error analyzing embryo",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

      <Button type="submit" disabled={isLoading || (!imageUrl && !description)}>
        {isLoading ? (
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
