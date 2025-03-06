
import { ProfileSection } from "@/components/ProfileSection";
import { ConsultantDashboard } from "@/components/consultation/ConsultantDashboard";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to continue.</div>;
  }

  const isConsultant = user.user_metadata?.role === 'consultant';

  return (
    <div className="container mx-auto py-6">
      {isConsultant ? <ConsultantDashboard /> : <ProfileSection />}
    </div>
  );
};

export default Index;
