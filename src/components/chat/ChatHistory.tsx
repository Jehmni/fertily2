import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { type ChatMessage as ChatMessageType } from "@/services/ChatService";
import { LoadingMessage } from "./LoadingMessage";
import { VirtualList } from "@/components/ui/virtual-list";
import { performanceMonitor } from "@/lib/performance";

interface ChatHistoryProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
}

export const ChatHistory = ({ messages, isLoading }: ChatHistoryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track component performance
  useEffect(() => {
    performanceMonitor.trackPageLoad('ChatHistory');
  }, []);

  const renderMessage = (message: ChatMessageType, index: number) => (
    <ChatMessage 
      key={index} 
      message={message.text} 
      isBot={message.isBot} 
    />
  );

  return (
    <div className="flex-1 overflow-hidden" ref={containerRef}>
      <VirtualList
        items={messages}
        renderItem={renderMessage}
        height={600}
        estimateSize={100}
      />
      {isLoading && <LoadingMessage />}
    </div>
  );
};