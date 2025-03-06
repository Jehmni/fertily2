import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { EmbryoCamera } from "./EmbryoCamera";
import { EmbryoImagePreview } from "./EmbryoImagePreview";

export const EmbryoSubmissionForm = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error: any) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(async (blob) => {
        if (blob) {
          await handleImageFile(blob);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const handleImageFile = async (file: Blob) => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create file name with timestamp
      const timestamp = Date.now();
      const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
      const fileName = `${user.id}-${timestamp}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('embryo-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('embryo-images')
        .getPublicUrl(fileName);

      setImageUrl(publicUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

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
              onImageRemove={() => setImageUrl(null)}
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
