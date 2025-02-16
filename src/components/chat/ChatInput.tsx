import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { a11yMessages, focusStyles } from "@/lib/a11y";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex gap-2"
      aria-label="Chat message form"
    >
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className={focusStyles.base}
        aria-label="Message input"
        disabled={disabled}
      />
      <Button 
        type="submit" 
        disabled={disabled || !message.trim()}
        className={focusStyles.base}
        aria-label={a11yMessages.actions.send}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}; 