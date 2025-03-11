
import { ProfileSection } from "@/components/ProfileSection";
import { ExpertDashboard } from "@/components/consultation/ExpertDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

const Index = () => {
  const { user } = useAuth();

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

  // Show expert dashboard for consultants, existing ProfileSection for patients
  return userRole === 'consultant' ? <ExpertDashboard /> : <ProfileSection />;
};

export default Index;
