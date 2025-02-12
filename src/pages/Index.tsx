
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
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";

const Index = () => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSkeleton rows={3} className="w-96" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 py-4 md:py-6">
        <nav className="flex justify-between items-center mb-6">
          <div className="flex-1">
            {isMobile ? (
              <MobileNav
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                activeView={activeView}
                onNavigate={handleNavigate}
                isAdmin={isAdmin}
              />
            ) : (
              <DesktopNav
                activeView={activeView}
                onNavigate={handleNavigate}
                isAdmin={isAdmin}
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="transition-all duration-200 hover:scale-105"
            >
              Sign Out
            </Button>
          </div>
        </nav>
        
        <Header />

        <main className="mt-6">
          {activeView === "profile" && <ProfileSection />}
          {activeView === "resources" && <EducationalResources />}
          {activeView === "favorites" && <UserFavorites />}
          {activeView === "chat" && <ChatWindow />}
          {activeView === "messages" && <Messages />}
          {activeView === "community" && <Community />}
          {activeView === "admin" && isAdmin && <AdminAnalyticsDashboard />}
          {activeView === "home" && (
            <div className="space-y-6">
              <FertilityDashboard />
              <FertilityCalendar />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
