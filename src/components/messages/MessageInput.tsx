
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
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSendMessage(); }} className="p-4 border-t">
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-md"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
};
