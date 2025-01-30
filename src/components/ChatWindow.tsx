import { useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Card } from "@/components/ui/card";

export const ChatWindow = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>(
    [
      {
        text: "Hello! I'm your fertility assistant. How can I help you today?",
        isBot: true,
      },
    ]
  );

  const handleSend = async (message: string) => {
    setMessages((prev) => [...prev, { text: message, isBot: false }]);
    
    // Simulate bot response (replace with actual AI integration later)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: "I understand you have a question about fertility. Let me help you with that.",
          isBot: true,
        },
      ]);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg.text} isBot={msg.isBot} />
        ))}
      </div>
      <div className="p-4 border-t">
        <ChatInput onSend={handleSend} />
      </div>
    </Card>
  );
};