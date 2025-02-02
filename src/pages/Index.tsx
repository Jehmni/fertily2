import { ChatWindow } from "@/components/ChatWindow";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Book, Heart } from "lucide-react";
import { ProfileSection } from "@/components/ProfileSection";
import { useState } from "react";
import { EducationalResources } from "@/components/EducationalResources";
import { UserFavorites } from "@/components/UserFavorites";

const Index = () => {
  const { toast } = useToast();
  const [showProfile, setShowProfile] = useState(false);
  const [showEducation, setShowEducation] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

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

  const renderContent = () => {
    if (showProfile) return <ProfileSection />;
    if (showEducation) return <EducationalResources />;
    if (showFavorites) return <UserFavorites />;
    return <ChatWindow />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowProfile(true);
                setShowEducation(false);
                setShowFavorites(false);
              }}
              className={showProfile ? "bg-primary/10" : ""}
            >
              Profile
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowProfile(false);
                setShowEducation(true);
                setShowFavorites(false);
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
              }}
              className={showFavorites ? "bg-primary/10" : ""}
            >
              <Heart className="w-4 h-4 mr-2" />
              Favorites
            </Button>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
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