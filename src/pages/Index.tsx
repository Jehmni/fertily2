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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const onboardingSlides = [
  {
    title: "Welcome to Your Fertility Journey! 👋",
    description: "Track your fertility cycle with personalized insights and support.",
    image: "/photo-1649972904349-6e44c42644a7",
  },
  {
    title: "Personal AI Assistant",
    description: "Chat with our AI assistant for 24/7 support and guidance.",
    image: "/photo-1581091226825-a6a2a5aee158",
  },
  {
    title: "Join Our Community",
    description: "Connect with others and share experiences in a supportive environment.",
    image: "/photo-1519389950473-47ba0277781c",
  },
];

const Index = () => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

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

  const handleNextSlide = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setShowOnboarding(false);
      // Navigate to auth page when onboarding is complete
      navigate("/auth");
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-accent via-background to-secondary/30">
      <Dialog 
        open={showOnboarding} 
        onOpenChange={(open) => {
          setShowOnboarding(open);
          if (!open) {
            // Also navigate to auth when dialog is closed
            navigate("/auth");
          }
        }}
      >
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-gradient-to-b from-accent via-background to-secondary/30">
          <div className="relative">
            <img 
              src={onboardingSlides[currentSlide].image}
              alt="Onboarding"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold">
              {onboardingSlides[currentSlide].title}
            </h2>
            <p className="text-muted-foreground">
              {onboardingSlides[currentSlide].description}
            </p>
            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-2">
                {onboardingSlides.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <Button 
                onClick={handleNextSlide}
                className="min-w-[100px]"
              >
                {currentSlide === onboardingSlides.length - 1 ? "Get Started" : "Next"}
              </Button>
            </div>
          </div>
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
