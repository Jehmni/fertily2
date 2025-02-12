
import { Button } from "@/components/ui/button";
import { Menu, X, Home, User, Book, Heart, Stethoscope, MessageSquare, Users, LayoutDashboard } from "lucide-react";

interface MobileNavProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  activeView: string;
  onNavigate: (key: string) => void;
  isAdmin: boolean;
}

export const MobileNav = ({ isMenuOpen, setIsMenuOpen, activeView, onNavigate, isAdmin }: MobileNavProps) => {
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
    <>
      <Button
        variant="outline"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="relative z-50 transition-all duration-200 hover:scale-105"
      >
        {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 animate-fade-in">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-3/4 bg-white p-6 shadow-lg z-50 overflow-y-auto animate-slide-in-right">
            <div className="flex flex-col space-y-2">
              {items.map((item) => (
                <Button
                  key={item.key}
                  variant={activeView === item.key ? "default" : "ghost"}
                  onClick={() => onNavigate(item.key)}
                  className="justify-start w-full transition-all duration-200 hover:translate-x-1"
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
