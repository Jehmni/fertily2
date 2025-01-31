import { useState, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export const ChatWindow = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([
    {
      text: "Hello! I'm your fertility assistant. How can I help you today?",
      isBot: true,
    },
  ]);
  const { toast } = useToast();

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view chat history",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedMessages = data.map(chat => ([
          { text: chat.message, isBot: false },
          { text: chat.response, isBot: true }
        ])).flat();
        setMessages([messages[0], ...formattedMessages]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  const handleSend = async (message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to send messages",
          variant: "destructive",
        });
        return;
      }

      setMessages((prev) => [...prev, { text: message, isBot: false }]);
      
      // Store user message in Supabase
      const { error: chatError } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          message: message,
          response: "I understand you have a question about fertility. Let me help you with that.", // This will be replaced with actual AI response
        });

      if (chatError) throw chatError;

      // Add bot response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "I understand you have a question about fertility. Let me help you with that.",
            isBot: true,
          },
        ]);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
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