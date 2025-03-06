
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export interface UseEmbryoImageReturn {
  imageUrl: string | null;
  isLoading: boolean;
  isCameraActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageRemove: () => void;
  reset: () => void;
}

export const useEmbryoImage = (): UseEmbryoImageReturn => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleImageFile = async (file: Blob) => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const timestamp = Date.now();
      const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
      const fileName = `${user.id}-${timestamp}.${fileExt}`;

      // First remove old image if it exists
      if (imageUrl) {
        const oldFileName = imageUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('embryo-images')
            .remove([oldFileName]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('embryo-images')
        .upload(fileName, file, {
          contentType: file instanceof File ? file.type : 'image/jpeg',
          upsert: true
        });

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
      console.error('Image upload error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (error: any) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please ensure you've granted camera permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleImageFile(file);
    }
  };

  const handleImageRemove = async () => {
    if (imageUrl) {
      try {
        setIsLoading(true);
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          const { error } = await supabase.storage
            .from('embryo-images')
            .remove([fileName]);

          if (error) throw error;
        }
        setImageUrl(null);
        toast({
          title: "Success",
          description: "Image removed successfully",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to remove image",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const reset = () => {
    setImageUrl(null);
    stopCamera();
  };

  return {
    imageUrl,
    isLoading,
    isCameraActive,
    videoRef,
    startCamera,
    stopCamera,
    captureImage,
    handleImageUpload,
    handleImageRemove,
    reset,
  };
};
