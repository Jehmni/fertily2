
import { ChatWindow } from "@/components/ChatWindow";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ProfileSection } from "@/components/ProfileSection";
import { useState, useEffect } from "react";
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
import { Messages } from "@/components/Messages";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Index = () => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
      localStorage.setItem("hasSeenOnboarding", "true");
    }
    
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
    if (isLoading) {
      return <LoadingSkeleton rows={3} className="mt-6" />;
    }

    switch (activeView) {
      case "profile":
        return <ProfileSection />;
      case "resources":
        return <EducationalResources />;
      case "favorites":
        return <UserFavorites />;
      case "chat":
        return <ChatWindow />;
      case "messages":
        return <Messages />;
      case "community":
        return <Community />;
      default:
        return (
          <div className="space-y-6 animate-fade-in">
            <FertilityDashboard />
            <FertilityCalendar />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to Your Fertility Journey! 👋</DialogTitle>
            <DialogDescription className="space-y-4">
              <p>
                We're here to support you every step of the way. Here's what you can do:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Track your fertility cycle</li>
                <li>Chat with our AI assistant</li>
                <li>Connect with the community</li>
                <li>Access educational resources</li>
              </ul>
              <Button 
                onClick={() => setShowOnboarding(false)}
                className="w-full mt-4"
              >
                Get Started
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <div className="flex justify-between items-center mb-6 relative">
          <div className="animate-fade-in">
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
          </div>
          <div className="flex items-center gap-3 animate-fade-in">
            <NotificationBell />
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="transition-all duration-200 hover:scale-105"
            >
              Sign Out
            </Button>
          </div>
        </div>
        
        <div className="animate-fade-in">
          <Header />
        </div>

        <div className="transition-all duration-300 ease-in-out">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
