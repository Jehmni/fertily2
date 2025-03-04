
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { EmbryoAnalysis } from "./EmbryoAnalysis";
import { supabase } from "@/lib/supabase";
import type { Consultation } from "@/types/user";

export const ExpertDashboard = () => {
  const { data: consultations } = useQuery({
    queryKey: ['expert-consultations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('consultations')
        .select('*, patients:profiles(*)')
        .eq('expertId', user.id)
        .order('scheduledFor', { ascending: true });

      if (error) throw error;
      return data as Consultation[];
    }
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Consultations</TabsTrigger>
          <TabsTrigger value="past">Past Consultations</TabsTrigger>
          <TabsTrigger value="embryos">Embryo Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="grid gap-4">
            {consultations?.filter(c => c.status === 'scheduled')
              .map(consultation => (
                <Card key={consultation.id} className="p-4">
                  <h3 className="font-semibold">
                    Consultation with {consultation.patientId}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(consultation.scheduledFor).toLocaleString()}
                  </p>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="past">
          <div className="grid gap-4">
            {consultations?.filter(c => c.status === 'completed')
              .map(consultation => (
                <Card key={consultation.id} className="p-4">
                  <h3 className="font-semibold">
                    Consultation with {consultation.patientId}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(consultation.scheduledFor).toLocaleString()}
                  </p>
                  {consultation.notes && (
                    <p className="mt-2 text-sm">{consultation.notes}</p>
                  )}
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="embryos">
          <EmbryoAnalysis consultationId="current-consultation-id" />
        </TabsContent>
      </Tabs>
    </div>
  );
};
