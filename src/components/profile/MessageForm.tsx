
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CommunityService } from "@/services/CommunityService";

interface MessageFormProps {
  recipientId: string;
  onSuccess: () => void;
}

export const MessageForm = ({ recipientId, onSuccess }: MessageFormProps) => {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await CommunityService.sendPrivateMessage(recipientId, newMessage.trim());
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
      setNewMessage("");
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="Write a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="min-h-[100px]"
      />
      <Button 
        onClick={handleSendMessage}
        disabled={!newMessage.trim()}
        className="w-full"
      >
        <Send className="w-4 h-4 mr-2" />
        Send Message
      </Button>
    </div>
  );
};
