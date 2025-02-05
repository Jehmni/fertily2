import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { type ChatMessage as ChatMessageType } from "@/services/ChatService";

interface ChatHistoryProps {
  messages: ChatMessageType[];
}

export const ChatHistory = ({ messages }: ChatHistoryProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
      {messages.map((msg, idx) => (
        <ChatMessage key={idx} message={msg.text} isBot={msg.isBot} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};