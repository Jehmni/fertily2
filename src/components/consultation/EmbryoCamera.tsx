
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface EmbryoCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCapture: () => void;
  onClose: () => void;
}

export const EmbryoCamera = ({ videoRef, onCapture, onClose }: EmbryoCameraProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const initCamera = async () => {
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
        }
      } catch (error) {
        console.error('Camera access error:', error);
        toast({
          title: "Camera Error",
          description: "Unable to access camera. Please make sure you've granted camera permissions.",
          variant: "destructive"
        });
        onClose();
      }
    };

    initCamera();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline
        className="w-full max-w-md mx-auto rounded-lg border"
      />
      <div className="flex justify-center gap-4">
        <Button
          type="button"
          onClick={onCapture}
          variant="secondary"
        >
          <Camera className="w-4 h-4 mr-2" />
          Capture
        </Button>
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
