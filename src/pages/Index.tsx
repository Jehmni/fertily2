import { ChatWindow } from "@/components/ChatWindow";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Heading2 } from "lucide-react";

const Index = () => {
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
          <Button variant="outline" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Fertily
          </h1>
          <h2 className="text-4xl font-bold text-primary mb-4">
            Your Personal Fertility Assistant
          </h2>
          <p className="text-lg text-gray-600">
            Get personalized insights and support on your fertility journey
          </p>
        </div>
        <ChatWindow />
      </div>
    </div>
  );
};

export default Index;