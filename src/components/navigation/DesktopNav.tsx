
import { Button } from "@/components/ui/button";
import { getNavigationItems } from "./NavigationItems";

interface DesktopNavProps {
  activeView: string;
  onNavigate: (key: string) => void;
  isAdmin: boolean;
}

export const DesktopNav = ({ activeView, onNavigate, isAdmin }: DesktopNavProps) => {
  const items = getNavigationItems(isAdmin);
  
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
