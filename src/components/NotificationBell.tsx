
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";

interface Notification {
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    subscribeToNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.read).length || 0);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show different toast messages based on notification type
          if (newNotification.type === 'follow') {
            toast({
              title: "New Follower",
              description: newNotification.message,
            });
          } else {
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read first
      await markAsRead(notification.id);

      // Navigate based on notification type
      switch (notification.type) {
        case 'follow':
          if (location.pathname !== '/community') {
            navigate('/community');
          }
          break;
        case 'message':
          if (notification.sender_id) {
            if (location.pathname === '/') {
              // If already on home, just update state
              navigate('/', { 
                state: { 
                  activeView: 'messages', 
                  userId: notification.sender_id 
                },
                replace: true 
              });
            } else {
              // Navigate to home with messages view
              navigate('/', { 
                state: { 
                  activeView: 'messages', 
                  userId: notification.sender_id 
                }
              });
            }
          }
          break;
        case 'comment':
        case 'reaction':
          if (notification.post_id) {
            if (location.pathname === '/community') {
              // If already on community, just update state
              navigate('/community', { 
                state: { postId: notification.post_id },
                replace: true 
              });
            } else {
              // Navigate to community with post ID
              navigate('/community', { 
                state: { postId: notification.post_id }
              });
            }
          }
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      toast({
        title: "Error",
        description: "Failed to process notification",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
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
        {notifications.length === 0 ? (
          <DropdownMenuItem>No notifications</DropdownMenuItem>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-4 cursor-pointer ${
                !notification.read ? 'bg-muted/50' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="font-semibold">{notification.title}</div>
              <div className="text-sm text-muted-foreground">{notification.message}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(notification.created_at).toLocaleDateString()}
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
