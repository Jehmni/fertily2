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
  const [isLoading, setIsLoading] = useState(false);
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
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to send messages",
          variant: "destructive",
        });
        return;
      }

      // Add user message to chat
      setMessages((prev) => [...prev, { text: message, isBot: false }]);

      // Get AI response
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message }
      });

      if (error) throw error;

      const aiResponse = data.response;

      // Add AI response to chat
      setMessages((prev) => [...prev, { text: aiResponse, isBot: true }]);
      
      // Store conversation in database
      const { error: chatError } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          message: message,
          response: aiResponse,
        });

      if (chatError) throw chatError;

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      // Add error message to chat
      setMessages((prev) => [...prev, { 
        text: "I apologize, but I encountered an error processing your message. Please try again.",
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
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
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </Card>
  );
};