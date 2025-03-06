
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, UserIcon, ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const ConsultantDashboard = () => {
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

  if (consultationsLoading || embryoLoading) {
    return <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Consultant Dashboard</h1>
      
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

        <TabsContent value="embryo" className="mt-6">
          <div className="grid gap-4">
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
                </CardContent>
              </Card>
            ))}
            {embryoAnalyses?.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No embryo analyses yet
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="patients" className="mt-6">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Patient management coming soon
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
