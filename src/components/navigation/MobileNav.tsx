
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { navigationItems } from "./NavigationItems";

interface MobileNavProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  activeView: string;
  onNavigate: (key: string) => void;
}

export const MobileNav = ({ isMenuOpen, setIsMenuOpen, activeView, onNavigate }: MobileNavProps) => {
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="relative z-50"
      >
        {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>
      {isMenuOpen && (
        <div className="fixed inset-0 z-40">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-3/4 bg-white p-6 shadow-lg z-50 overflow-y-auto">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.key}
                  variant={activeView === item.key ? "default" : "ghost"}
                  onClick={() => onNavigate(item.key)}
                  className="justify-start w-full"
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
