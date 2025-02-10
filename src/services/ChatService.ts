
import { supabase } from "@/lib/supabase";

export interface ChatMessage {
  text: string;
  isBot: boolean;
  wasSpoken?: boolean;
}

export const ChatService = {
  async loadChatHistory(): Promise<ChatMessage[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const { data, error } = await supabase
      .from('chat_history')
      .select('message, response, is_bot, was_spoken')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading chat history:', error);
      throw error;
    }

    return data.map(msg => ({
      text: msg.is_bot ? (msg.response || '') : (msg.message || ''),
      isBot: msg.is_bot,
      wasSpoken: msg.was_spoken
    }));
  },

  async sendMessage(message: string, wasSpoken: boolean = false): Promise<string> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message, wasSpoken },
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

  async saveChatMessage(message: string, response: string, wasSpoken: boolean = false): Promise<void> {
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
        is_bot: false,
        was_spoken: wasSpoken
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
        is_bot: true,
        was_spoken: wasSpoken
      }]);

    if (botResponseError) {
      console.error('Error saving bot response:', botResponseError);
      throw botResponseError;
    }
  }
};
