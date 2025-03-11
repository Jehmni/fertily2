
import { FertilityDashboard } from "@/components/FertilityDashboard";
import { ExpertDashboard } from "@/components/consultation/ExpertDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: userRole } = useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!user) return null;
      return user.user_metadata?.role || 'patient';
    }
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  // Show expert dashboard for consultants, fertility dashboard for patients
  return userRole === 'consultant' ? <ExpertDashboard /> : <FertilityDashboard />;
};

export default Index;
