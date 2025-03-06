
import { ProfileSection } from "@/components/ProfileSection";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to continue.</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <ProfileSection />
    </div>
  );
};

export default Index;
