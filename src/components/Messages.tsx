
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  sender_profile?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    avatar_color: string | null;
  };
}

interface Conversation {
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

      const { data, error } = await supabase
        .from('private_messages')
        .select(`
          sender_id,
          recipient_id,
          content,
          created_at,
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
        
        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            user_id: otherUserId,
            first_name: otherUserProfile.first_name,
            last_name: otherUserProfile.last_name,
            avatar_url: otherUserProfile.avatar_url,
            avatar_color: otherUserProfile.avatar_color,
            last_message: {
              id: crypto.randomUUID(),
              content: msg.content,
              created_at: msg.created_at,
              sender_id: msg.sender_id,
              recipient_id: msg.recipient_id
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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
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
      {/* Conversations List */}
      <div className="w-1/3 border-r overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.user_id}
            className={`p-4 cursor-pointer hover:bg-secondary/50 ${
              selectedUserId === conv.user_id ? "bg-secondary" : ""
            }`}
            onClick={() => setSelectedUserId(conv.user_id)}
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={conv.avatar_url || undefined} />
                <AvatarFallback style={{ backgroundColor: conv.avatar_color || undefined }}>
                  {conv.first_name?.[0] || ''}{conv.last_name?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium">
                  {conv.first_name} {conv.last_name}
                </div>
                {conv.last_message && (
                  <div className="text-sm text-muted-foreground truncate">
                    {conv.last_message.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === selectedUserId ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender_id === selectedUserId
                        ? "bg-secondary"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-md"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
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
