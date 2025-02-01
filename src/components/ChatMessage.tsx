import { cn } from "@/lib/utils";
import { VolumeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { VoiceService } from "@/services/VoiceService";
import { useToast } from "@/components/ui/use-toast";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

export const ChatMessage = ({ message, isBot }: ChatMessageProps) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);

  const playMessage = async () => {
    try {
      setIsPlaying(true);
      const base64Audio = await VoiceService.textToSpeech(message);
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        toast({
          title: "Error",
          description: "Failed to play audio. Please try again.",
          variant: "destructive",
        });
      };
      
      await audio.play();
    } catch (error) {
      console.error('Text to speech error:', error);
      setIsPlaying(false);
      toast({
        title: "Error",
        description: "Failed to convert text to speech. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-fadeIn",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-4 flex items-start gap-2",
          isBot
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        <div className="flex-1">{message}</div>
        {isBot && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={playMessage}
            disabled={isPlaying}
          >
            <VolumeIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};