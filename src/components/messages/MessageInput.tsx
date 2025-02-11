
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}

export const MessageInput = ({
  newMessage,
  onMessageChange,
  onSendMessage
}: MessageInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim()) {
        onSendMessage();
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onMessageChange(e.target.value);
    // Auto-adjust height
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex gap-2">
        <textarea
          value={newMessage}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyPress}
          placeholder="Type your message... (Shift + Enter for new line)"
          className="flex-1 p-2 border rounded-md resize-none overflow-y-hidden min-h-[40px] max-h-[120px]"
          rows={1}
        />
        <Button
          type="submit"
          disabled={!newMessage.trim()}
        >
          Send
        </Button>
      </div>
    </form>
  );
};
