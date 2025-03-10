import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, UserIcon, ImageIcon, Settings } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { EmbryoSubmissionForm } from "./EmbryoSubmissionForm";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export const ConsultantDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: expertProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['expertProfile'],
    queryFn: async () => {
      console.log('Fetching expert profile...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching expert profile:', error);
        throw error;
      }
      
      console.log('Expert profile data:', data);
      return data;
    }
  });

  const { data: consultations, isLoading: consultationsLoading } = useQuery({
    queryKey: ['consultantConsultations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          patient:patient_id (
            first_name,
            last_name
          )
        `)
        .eq('expert_id', user.id)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const { data: embryoAnalyses, isLoading: embryoLoading } = useQuery({
    queryKey: ['consultantEmbryoAnalyses'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('embryo_data')
        .select('*')
        .eq('expert_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (profileLoading) {
    return <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>;
  }

  const handleImageError = () => {
    console.error('Error loading profile image');
    toast({
      title: "Image Error",
      description: "Failed to load profile image",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            {expertProfile?.profile_image ? (
              <AvatarImage 
                src={expertProfile.profile_image}
                alt={`${expertProfile.first_name} ${expertProfile.last_name}`}
                onError={handleImageError}
              />
            ) : null}
            <AvatarFallback>
              {expertProfile?.first_name?.[0]}{expertProfile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Consultant Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {expertProfile?.first_name} {expertProfile?.last_name}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate("/expert/profile")}>
          <Settings className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList>
          <TabsTrigger value="appointments">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="patients">
            <UserIcon className="w-4 h-4 mr-2" />
            Patients
          </TabsTrigger>
          <TabsTrigger value="embryo">
            <ImageIcon className="w-4 h-4 mr-2" />
            Embryo Analyses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="mt-6">
          <div className="grid gap-4">
            {consultations?.map((consultation) => (
              <Card key={consultation.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>
                      {consultation.patient?.first_name} {consultation.patient?.last_name}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(consultation.scheduled_for).toLocaleDateString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Status: {consultation.status}</p>
                  {consultation.notes && <p className="mt-2">{consultation.notes}</p>}
                </CardContent>
              </Card>
            ))}
            {consultations?.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No appointments scheduled
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="patients" className="mt-6">
          <div className="grid gap-4">
            {consultations?.map((consultation) => (
              <Card key={consultation.id}>
                <CardHeader>
                  <CardTitle>
                    {consultation.patient?.first_name} {consultation.patient?.last_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Last Visit: {new Date(consultation.scheduled_for).toLocaleDateString()}</p>
                  <Button 
                    className="mt-4"
                    onClick={() => navigate(`/patient/${consultation.patient_id}`)}
                  >
                    View Patient History
                  </Button>
                </CardContent>
              </Card>
            ))}
            {!consultations?.length && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No patients yet
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="embryo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit New Embryo Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <EmbryoSubmissionForm />
            </CardContent>
          </Card>

          <div className="grid gap-4 mt-6">
            {embryoAnalyses?.map((analysis) => (
              <Card key={analysis.id}>
                <CardHeader>
                  <CardTitle>Embryo Analysis #{analysis.id.slice(0, 8)}</CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.image_url && (
                    <img 
                      src={analysis.image_url} 
                      alt="Embryo" 
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <p>Grade: {analysis.grade}</p>
                  <p>AI Score: {analysis.ai_score}</p>
                  {analysis.notes && <p className="mt-2">{analysis.notes}</p>}
                  <Button 
                    className="mt-4"
                    onClick={() => navigate(`/embryo-analysis/${analysis.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
            {embryoAnalyses?.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No embryo analyses yet. Submit your first analysis above.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
