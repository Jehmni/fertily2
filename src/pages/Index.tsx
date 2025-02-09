
import { ChatWindow } from "@/components/ChatWindow";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Book, Heart, User, Home, Users, Menu, X } from "lucide-react";
import { ProfileSection } from "@/components/ProfileSection";
import { useState } from "react";
import { EducationalResources } from "@/components/EducationalResources";
import { UserFavorites } from "@/components/UserFavorites";
import { FertilityCalendar } from "@/components/FertilityCalendar";
import { FertilityDashboard } from "@/components/FertilityDashboard";
import { NotificationBell } from "@/components/NotificationBell";
import { Community } from "@/components/Community";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { toast } = useToast();
  const [showProfile, setShowProfile] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
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

  const resetView = () => {
    setShowProfile(false);
    setShowEducation(false);
    setShowFavorites(false);
    setShowChat(false);
    setShowCommunity(false);
    setIsMenuOpen(false);
  };

  const renderContent = () => {
    if (showProfile) return <ProfileSection />;
    if (showEducation) return <EducationalResources />;
    if (showFavorites) return <UserFavorites />;
    if (showChat) return <ChatWindow />;
    if (showCommunity) return <Community />;
    return (
      <div className="space-y-6">
        <FertilityDashboard />
        <FertilityCalendar />
      </div>
    );
  };

  const navigationItems = [
    {
      icon: <Home className="w-4 h-4 mr-2" />,
      label: "Home",
      action: resetView,
      active: !showProfile && !showEducation && !showFavorites && !showChat && !showCommunity,
    },
    {
      icon: <User className="w-4 h-4 mr-2" />,
      label: "Profile",
      action: () => {
        setShowProfile(true);
        setShowEducation(false);
        setShowFavorites(false);
        setShowChat(false);
        setShowCommunity(false);
        setIsMenuOpen(false);
      },
      active: showProfile,
    },
    {
      icon: <Book className="w-4 h-4 mr-2" />,
      label: "Resources",
      action: () => {
        setShowProfile(false);
        setShowEducation(true);
        setShowFavorites(false);
        setShowChat(false);
        setShowCommunity(false);
        setIsMenuOpen(false);
      },
      active: showEducation,
    },
    {
      icon: <Heart className="w-4 h-4 mr-2" />,
      label: "Favorites",
      action: () => {
        setShowProfile(false);
        setShowEducation(false);
        setShowFavorites(true);
        setShowChat(false);
        setShowCommunity(false);
        setIsMenuOpen(false);
      },
      active: showFavorites,
    },
    {
      label: "Chat",
      action: () => {
        setShowProfile(false);
        setShowEducation(false);
        setShowFavorites(false);
        setShowChat(true);
        setShowCommunity(false);
        setIsMenuOpen(false);
      },
      active: showChat,
    },
    {
      icon: <Users className="w-4 h-4 mr-2" />,
      label: "Community",
      action: () => {
        setShowProfile(false);
        setShowEducation(false);
        setShowFavorites(false);
        setShowChat(false);
        setShowCommunity(true);
        setIsMenuOpen(false);
      },
      active: showCommunity,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          {isMobile ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative z-50"
              >
                {isMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </Button>
              {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
                  <div className="fixed inset-y-0 left-0 w-3/4 bg-white p-6 shadow-lg z-50">
                    <div className="flex flex-col space-y-2">
                      {navigationItems.map((item, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={item.action}
                          className={`justify-start ${item.active ? "bg-primary/10" : ""}`}
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
          ) : (
            <div className="flex gap-2">
              {navigationItems.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={item.action}
                  className={item.active ? "bg-primary/10" : ""}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="outline" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
        <div className="text-center mb-8 animate-fadeIn">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Stethoscope className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold text-primary">
              Fertily
            </h1>
          </div>
          <h2 className="text-3xl font-semibold text-primary/80 mb-4">
            Your Personal Fertility Assistant
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized insights and support on your fertility journey
          </p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
