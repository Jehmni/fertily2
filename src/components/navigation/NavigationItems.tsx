
import { Home, User, Book, Heart, Stethoscope, Users, MessageSquare, LayoutDashboard } from "lucide-react";

export const getNavigationItems = (isAdmin: boolean) => {
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

  if (isAdmin) {
    return [
      ...baseItems,
      {
        icon: <LayoutDashboard className="w-4 h-4 mr-2" />,
        label: "Admin",
        key: "admin"
      }
    ];
  }

  return baseItems;
};

export const navigationItems = getNavigationItems(false);
