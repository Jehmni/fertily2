
import { Button } from "@/components/ui/button";
import { Home, User, Book, Heart, Stethoscope, MessageSquare, Users, LayoutDashboard } from "lucide-react";

interface DesktopNavProps {
  activeView: string;
  onNavigate: (key: string) => void;
  isAdmin: boolean;
}

export const DesktopNav = ({ activeView, onNavigate, isAdmin }: DesktopNavProps) => {
  const baseItems = [
    {
      icon: <Home className="w-4 h-4 mr-2" />,
      label: "Home",
      key: "home"
    },
    {
      icon: <User className="w-4 h-4 mr-2" />,
      label: "Profile",
      key: "profile"
    },
    {
      icon: <Book className="w-4 h-4 mr-2" />,
      label: "Resources",
      key: "resources"
    },
    {
      icon: <Heart className="w-4 h-4 mr-2" />,
      label: "Favorites",
      key: "favorites"
    },
    {
      icon: <Stethoscope className="w-4 h-4 mr-2" />,
      label: "Chat",
      key: "chat"
    },
    {
      icon: <MessageSquare className="w-4 h-4 mr-2" />,
      label: "Messages",
      key: "messages"
    },
    {
      icon: <Users className="w-4 h-4 mr-2" />,
      label: "Community",
      key: "community"
    }
  ];

  const items = isAdmin ? [
    ...baseItems,
    {
      icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
      label: "Admin",
      key: "admin"
    }
  ] : baseItems;
  
  return (
    <div className="flex gap-2">
      {items.map((item) => (
        <Button
          key={item.key}
          variant={activeView === item.key ? "default" : "ghost"}
          onClick={() => onNavigate(item.key)}
          className="transition-all duration-200 hover:scale-105"
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </div>
  );
};
