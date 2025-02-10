
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { Notification } from "../NotificationBell";

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

export const NotificationList = ({ notifications, onNotificationClick }: NotificationListProps) => {
  return (
    <>
      {notifications.length === 0 ? (
        <DropdownMenuItem>No notifications</DropdownMenuItem>
      ) : (
        notifications.map((notification) => (
          <DropdownMenuItem
            key={notification.id}
            className={`flex flex-col items-start p-4 cursor-pointer ${
              !notification.read ? 'bg-muted/50' : ''
            }`}
            onClick={() => onNotificationClick(notification)}
          >
            <div className="font-semibold">{notification.title}</div>
            <div className="text-sm text-muted-foreground">{notification.message}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(notification.created_at).toLocaleDateString()}
            </div>
          </DropdownMenuItem>
        ))
      )}
    </>
  );
};
