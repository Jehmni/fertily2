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

    if (data) {
      return data.map(chat => ([
        { text: chat.message, isBot: false },
        { text: chat.response, isBot: true }
      ])).flat();
    }

    return [];
  },

  async sendMessage(message: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('chat', {
      body: { message }
    });

    if (error) throw error;
    return data.response;
  },

  async saveChatMessage(message: string, response: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error("User must be logged in");

    const { error } = await supabase
      .from('chat_history')
      .insert({
        user_id: user.id,
        message: message,
        response: response,
      });

    if (error) throw error;
  }
};