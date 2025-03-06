
import React from 'react';
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface EmbryoCameraProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onCapture: () => void;
  onClose: () => void;
}

export const EmbryoCamera = ({ videoRef, onCapture, onClose }: EmbryoCameraProps) => {
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
