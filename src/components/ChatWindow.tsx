import { Card } from "@/components/ui/card";
import { ChatInput } from "./ChatInput";
import { ChatHistory } from "./chat/ChatHistory";
import { useChatHistory } from "@/hooks/useChatHistory";

export const ChatWindow = () => {
  const { messages, isLoading, isSending, sendMessage } = useChatHistory();

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto h-[600px] flex items-center justify-center">
        <div className="animate-pulse">Loading chat history...</div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <ChatHistory messages={messages} />
      <div className="p-4 border-t">
        <ChatInput onSend={sendMessage} disabled={isSending} />
      </div>
    </Card>
  );
};