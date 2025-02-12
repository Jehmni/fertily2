
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
import { Messages } from "@/components/Messages";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AdminAnalyticsDashboard } from "@/components/admin/AdminAnalyticsDashboard";

const Index = () => {
  console.log("Index component rendering"); // Debug log
  const { toast } = useToast();
  const [activeView, setActiveView] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  console.log("Auth state:", { user, isAdmin, loading }); // Debug log

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

  // Show loading state
  if (loading) {
    console.log("Showing loading state"); // Debug log
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSkeleton rows={3} className="w-96" />
      </div>
    );
  }

  // Redirect if no user
  if (!user) {
    console.log("No user, redirecting to auth"); // Debug log
    navigate("/auth");
    return null;
  }

  console.log("Rendering main content"); // Debug log

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent via-background to-secondary/30">
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <div className="flex justify-between items-center mb-6 relative">
          <div className="animate-fade-in">
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

        <main className="mt-6">
          {activeView === "profile" && <ProfileSection />}
          {activeView === "resources" && <EducationalResources />}
          {activeView === "favorites" && <UserFavorites />}
          {activeView === "chat" && <ChatWindow />}
          {activeView === "messages" && <Messages />}
          {activeView === "community" && <Community />}
          {activeView === "admin" && isAdmin && <AdminAnalyticsDashboard />}
          {activeView === "home" && (
            <div className="space-y-6 animate-fade-in">
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
