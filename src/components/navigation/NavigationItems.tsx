
import { Home, User, Book, Heart, Stethoscope, Users, MessageSquare } from "lucide-react";

export const navigationItems = [
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
  },
];
