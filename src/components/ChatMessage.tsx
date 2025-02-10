
import { cn } from "@/lib/utils";
import { VolumeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { VoiceService } from "@/services/VoiceService";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

export const ChatMessage = ({ message, isBot }: ChatMessageProps) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, avatar_color, first_name, last_name')
        .eq('id', user.id)
        .single();
      
      return data;
    },
    enabled: !isBot
  });

  const playMessage = async () => {
    try {
      setIsPlaying(true);
      const base64Audio = await VoiceService.textToSpeech(message);
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        toast({
          title: "Error",
          description: "Failed to play audio. Please try again.",
          variant: "destructive",
        });
      };
      
      try {
        await audio.play();
      } catch (error) {
        console.error('Audio play error:', error);
        setIsPlaying(false);
        toast({
          title: "Error",
          description: "Failed to play audio. Please try again.",
          variant: "destructive",
        });
      }
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
        "flex w-full mb-4 animate-fadeIn items-start gap-3",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      {isBot && (
        <Avatar className="h-8 w-8 bg-primary">
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
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
      {!isBot && profile && (
        <Avatar className="h-8 w-8" style={{ backgroundColor: profile.avatar_color }}>
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback>
            {`${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
