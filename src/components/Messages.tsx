import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ConversationList } from "./messages/ConversationList";
import { MessageList } from "./messages/MessageList";
import { MessageInput } from "./messages/MessageInput";

export interface Profile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  avatar_color: string | null;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  sender: Profile;
  recipient: Profile;
}

export interface Conversation {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  avatar_color: string | null;
  last_message?: Message;
}

export const Messages = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load conversations
  useEffect(() => {
    loadConversations();
    subscribeToMessages();
  }, []);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
    }
  }, [selectedUserId]);

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('private_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          loadConversations(); // Refresh conversation list to update latest message
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get all messages
      const { data, error } = await supabase
        .from('private_messages')
        .select(`
          *,
          sender:profiles!private_messages_sender_id_fkey(
            first_name,
            last_name,
            avatar_url,
            avatar_color
          ),
          recipient:profiles!private_messages_recipient_id_fkey(
            first_name,
            last_name,
            avatar_url,
            avatar_color
          )
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process conversations
      const conversationsMap = new Map<string, Conversation>();
      
      data?.forEach(msg => {
        const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        const otherUserProfile = msg.sender_id === user.id ? msg.recipient : msg.sender;
        
        if (!conversationsMap.has(otherUserId) && otherUserProfile) {
          conversationsMap.set(otherUserId, {
            user_id: otherUserId,
            first_name: otherUserProfile.first_name,
            last_name: otherUserProfile.last_name,
            avatar_url: otherUserProfile.avatar_url,
            avatar_color: otherUserProfile.avatar_color,
            last_message: {
              id: msg.id,
              content: msg.content,
              created_at: msg.created_at,
              sender_id: msg.sender_id,
              recipient_id: msg.recipient_id,
              sender: msg.sender,
              recipient: msg.recipient
            }
          });
        }
      });

      setConversations(Array.from(conversationsMap.values()));
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('private_messages')
        .select(`
          *,
          sender:profiles!private_messages_sender_id_fkey(
            first_name,
            last_name,
            avatar_url,
            avatar_color
          ),
          recipient:profiles!private_messages_recipient_id_fkey(
            first_name,
            last_name,
            avatar_url,
            avatar_color
          )
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${userId}),and(sender_id.eq.${userId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUserId || !newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedUserId,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto h-[600px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex">
      <ConversationList
        conversations={conversations}
        selectedUserId={selectedUserId}
        onSelectConversation={setSelectedUserId}
      />

      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            <MessageList messages={messages} selectedUserId={selectedUserId} />
            <MessageInput
              newMessage={newMessage}
              onMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </Card>
  );
};
