
import { useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "../Messages";
import { format } from "date-fns";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  selectedUserId: string;
}

export const MessageList = ({ messages, selectedUserId }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedUserId) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No conversation selected"
        description="Select a conversation to start messaging"
      />
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages yet"
        description="Start a conversation by sending a message"
      />
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide">
      <div className="flex flex-col space-y-4">
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
            <div className="flex flex-col max-w-[70%]">
              <div
                className={`w-full p-3 rounded-lg ${
                  message.sender_id === selectedUserId
                    ? "bg-secondary"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {message.content}
              </div>
              <span className={`text-xs text-muted-foreground mt-1 ${
                message.sender_id === selectedUserId ? "text-left" : "text-right"
              }`}>
                {format(new Date(message.created_at), "h:mm a")}
              </span>
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
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
