
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NotificationList } from "./notifications/NotificationList";
import { useNotifications } from "./notifications/useNotifications";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  type: string;
  sender_id?: string;
  post_id?: string;
}

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await markAsRead(notification.id);

      switch (notification.type) {
        case 'follow':
          navigate('/community');
          break;
        case 'message':
          if (notification.sender_id) {
            navigate('/', {
              state: {
                activeView: 'messages',
                selectedUserId: notification.sender_id
              }
            });
          }
          break;
        case 'comment':
        case 'reaction':
          if (notification.post_id) {
            navigate('/community', {
              state: { postId: notification.post_id }
            });
          }
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <NotificationList 
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
