
import { supabase } from "@/lib/supabase";

export interface ChatMessage {
  text: string;
  isBot: boolean;
}

export const ChatService = {
  async loadChatHistory(): Promise<ChatMessage[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading chat history:', error);
      throw error;
    }

    return data.map(msg => ({
      text: msg.message || msg.response,
      isBot: msg.is_bot
    }));
  },

  async sendMessage(message: string): Promise<string> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      if (!data?.response) throw new Error('No response received from chat function');

      return data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async saveChatMessage(message: string, response: string): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    // First, save the user's message
    const { error: userMessageError } = await supabase
      .from('chat_history')
      .insert([{ 
        message,
        user_id: session.user.id,
        is_bot: false
      }]);

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError);
      throw userMessageError;
    }

    // Then, save the AI's response
    const { error: botResponseError } = await supabase
      .from('chat_history')
      .insert([{ 
        response,
        user_id: session.user.id,
        is_bot: true
      }]);

    if (botResponseError) {
      console.error('Error saving bot response:', botResponseError);
      throw botResponseError;
    }
  }
};
