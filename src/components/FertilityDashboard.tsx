
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { ChatWindow } from "./ChatWindow";
import { Community } from "./Community";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, UserIcon, ImageIcon } from "lucide-react";

export const FertilityDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chat");

  const { data: consultants } = useQuery({
    queryKey: ['consultants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select(`
          *,
          user:user_id (
            id,
            email
          )
        `);
      if (error) throw error;
      return data;
    }
  });

  const { data: myConsultations } = useQuery({
    queryKey: ['myConsultations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          expert:expert_id (
            id,
            email
          )
        `)
        .eq('patient_id', user.id)
        .order('scheduled_for', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: myEmbryoAnalyses } = useQuery({
    queryKey: ['myEmbryoAnalyses'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('embryo_data')
        .select('*')
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="chat">
            <UserIcon className="w-4 h-4 mr-2" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="community">
            <UserIcon className="w-4 h-4 mr-2" />
            Community
          </TabsTrigger>
          <TabsTrigger value="consultants">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Find Consultants
          </TabsTrigger>
          <TabsTrigger value="consultations">
            <CalendarIcon className="w-4 h-4 mr-2" />
            My Consultations
          </TabsTrigger>
          <TabsTrigger value="embryo">
            <ImageIcon className="w-4 h-4 mr-2" />
            Embryo Analyses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <ChatWindow />
        </TabsContent>

        <TabsContent value="community">
          <Community />
        </TabsContent>

        <TabsContent value="consultants">
          <div className="grid gap-4">
            {consultants?.map((consultant) => (
              <Card key={consultant.id}>
                <CardHeader>
                  <CardTitle>{consultant.firstName} {consultant.lastName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{consultant.specialization}</p>
                  <p>{consultant.years_of_experience} years of experience</p>
                  <p className="mt-2">{consultant.bio}</p>
                  <Button 
                    className="mt-4"
                    onClick={() => navigate(`/book-consultation/${consultant.user_id}`)}
                  >
                    Book Consultation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="consultations">
          <div className="grid gap-4">
            {myConsultations?.map((consultation) => (
              <Card key={consultation.id}>
                <CardHeader>
                  <CardTitle>
                    Consultation on {new Date(consultation.scheduled_for).toLocaleDateString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Status: {consultation.status}</p>
                  {consultation.notes && <p className="mt-2">{consultation.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="embryo">
          <div className="grid gap-4">
            {myEmbryoAnalyses?.map((analysis) => (
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
