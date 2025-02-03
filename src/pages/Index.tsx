import { ChatWindow } from "@/components/ChatWindow";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Book, Heart, User, Home } from "lucide-react";
import { ProfileSection } from "@/components/ProfileSection";
import { useState } from "react";
import { EducationalResources } from "@/components/EducationalResources";
import { UserFavorites } from "@/components/UserFavorites";
import { FertilityCalendar } from "@/components/FertilityCalendar";
import { FertilityDashboard } from "@/components/FertilityDashboard";
import { NotificationBell } from "@/components/NotificationBell";

const Index = () => {
  const { toast } = useToast();
  const [showProfile, setShowProfile] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showChat, setShowChat] = useState(false);

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
  };

  const renderContent = () => {
    if (showProfile) return <ProfileSection />;
    if (showEducation) return <EducationalResources />;
    if (showFavorites) return <UserFavorites />;
    if (showChat) return <ChatWindow />;
    return (
      <div className="space-y-6">
        <FertilityDashboard />
        <FertilityCalendar />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={resetView}
              className={!showProfile && !showEducation && !showFavorites && !showChat ? "bg-primary/10" : ""}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowProfile(true);
                setShowEducation(false);
                setShowFavorites(false);
                setShowChat(false);
              }}
              className={showProfile ? "bg-primary/10" : ""}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowProfile(false);
                setShowEducation(true);
                setShowFavorites(false);
                setShowChat(false);
              }}
              className={showEducation ? "bg-primary/10" : ""}
            >
              <Book className="w-4 h-4 mr-2" />
              Resources
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowProfile(false);
                setShowEducation(false);
                setShowFavorites(true);
                setShowChat(false);
              }}
              className={showFavorites ? "bg-primary/10" : ""}
            >
              <Heart className="w-4 h-4 mr-2" />
              Favorites
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowProfile(false);
                setShowEducation(false);
                setShowFavorites(false);
                setShowChat(true);
              }}
              className={showChat ? "bg-primary/10" : ""}
            >
              Chat
            </Button>
          </div>
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