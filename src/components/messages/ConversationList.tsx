
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Message, Conversation } from "../Messages";

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId: string | null;
  onSelectConversation: (userId: string) => void;
}

export const ConversationList = ({ 
  conversations, 
  selectedUserId, 
  onSelectConversation 
}: ConversationListProps) => {
  return (
    <div className="w-1/3 border-r overflow-y-auto">
      {conversations.map((conv) => (
        <div
          key={conv.user_id}
          className={`p-4 cursor-pointer hover:bg-secondary/50 ${
            selectedUserId === conv.user_id ? "bg-secondary" : ""
          }`}
          onClick={() => onSelectConversation(conv.user_id)}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8" style={{ backgroundColor: conv.avatar_color || '#E2E8F0' }}>
              <AvatarImage src={conv.avatar_url || undefined} />
              <AvatarFallback>
                {`${conv.first_name?.[0] || ''}${conv.last_name?.[0] || ''}`}
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
  );
};
