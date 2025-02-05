import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { type ChatMessage as ChatMessageType } from "@/services/ChatService";
import { LoadingMessage } from "./LoadingMessage";

interface ChatHistoryProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
}

export const ChatHistory = ({ messages, isLoading }: ChatHistoryProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg.text} isBot={msg.isBot} />
      ))}
      {isLoading && <LoadingMessage />}
      <div ref={messagesEndRef} />
    </div>
  );
};