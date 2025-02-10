
import { ChatWindow } from "@/components/ChatWindow";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ProfileSection } from "@/components/ProfileSection";
import { useState } from "react";
import { EducationalResources } from "@/components/EducationalResources";
import { UserFavorites } from "@/components/UserFavorites";
import { FertilityCalendar } from "@/components/FertilityCalendar";
import { FertilityDashboard } from "@/components/FertilityDashboard";
import { NotificationBell } from "@/components/NotificationBell";
import { Community } from "@/components/Community";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileNav } from "@/components/navigation/MobileNav";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { Header } from "@/components/layout/Header";

const Index = () => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleNavigate = (key: string) => {
    setActiveView(key);
    setIsMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case "profile":
        return <ProfileSection />;
      case "resources":
        return <EducationalResources />;
      case "favorites":
        return <UserFavorites />;
      case "chat":
        return <ChatWindow />;
      case "community":
        return <Community />;
      default:
        return (
          <div className="space-y-6">
            <FertilityDashboard />
            <FertilityCalendar />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4 relative">
          {isMobile ? (
            <MobileNav
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              activeView={activeView}
              onNavigate={handleNavigate}
            />
          ) : (
            <DesktopNav
              activeView={activeView}
              onNavigate={handleNavigate}
            />
          )}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
        <Header />
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
