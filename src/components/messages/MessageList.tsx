
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "../Messages";

interface MessageListProps {
  messages: Message[];
  selectedUserId: string;
}

export const MessageList = ({ messages, selectedUserId }: MessageListProps) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-3 ${
            message.sender_id === selectedUserId ? "justify-start" : "justify-end"
          }`}
        >
          {message.sender_id === selectedUserId && (
            <Avatar className="h-8 w-8" style={{ backgroundColor: message.sender.avatar_color || '#E2E8F0' }}>
              <AvatarImage src={message.sender.avatar_url || undefined} />
              <AvatarFallback>
                {`${message.sender.first_name?.[0] || ''}${message.sender.last_name?.[0] || ''}`}
              </AvatarFallback>
            </Avatar>
          )}
          <div
            className={`max-w-[70%] p-3 rounded-lg ${
              message.sender_id === selectedUserId
                ? "bg-secondary"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {message.content}
          </div>
          {message.sender_id !== selectedUserId && (
            <Avatar className="h-8 w-8" style={{ backgroundColor: message.sender.avatar_color || '#E2E8F0' }}>
              <AvatarImage src={message.sender.avatar_url || undefined} />
              <AvatarFallback>
                {`${message.sender.first_name?.[0] || ''}${message.sender.last_name?.[0] || ''}`}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
    </div>
  );
};
