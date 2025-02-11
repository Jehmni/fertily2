
import { Button } from "@/components/ui/button";
import { navigationItems } from "./NavigationItems";

interface DesktopNavProps {
  activeView: string;
  onNavigate: (key: string) => void;
}

export const DesktopNav = ({ activeView, onNavigate }: DesktopNavProps) => {
  return (
    <div className="flex gap-2">
      {navigationItems.map((item) => (
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
