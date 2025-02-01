import { supabase } from "@/lib/supabase";

export interface ChatMessage {
  text: string;
  isBot: boolean;
}

export const ChatService = {
  async loadChatHistory(): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map(msg => ({
      text: msg.isBot ? msg.response : msg.message,
      isBot: !!msg.response,
    }));
  },

  async sendMessage(message: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { message }
    });

    if (error) throw error;
    return data.response;
  },

  async saveChatMessage(message: string, response: string): Promise<void> {
    const { error } = await supabase
      .from('chat_history')
      .insert([{ message, response }]);

    if (error) throw error;
  }
};