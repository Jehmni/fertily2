
import { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { FertilityInsightCard } from "./fertility/FertilityInsightCard";
import { IVFPredictionDashboard } from "./ivf/IVFPredictionDashboard";
import { Button } from "./ui/button";
import { Calendar, Heart, Droplet, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface InsightData {
  nextPeriod: string | null;
  fertileWindow: {
    start: string;
    end: string;
  } | null;
  cycleLength: number | null;
  lastPeriod: string | null;
}

export const FertilityDashboard = () => {
  const { toast } = useToast();
  const [showIVF, setShowIVF] = useState(false);
  const [insights, setInsights] = useState<InsightData>({
    nextPeriod: null,
    fertileWindow: null,
    cycleLength: null,
    lastPeriod: null,
  });

  const loadInsights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('cycle_length, last_period_date')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profileData?.last_period_date && profileData?.cycle_length) {
        const lastPeriod = new Date(profileData.last_period_date);
        const nextPeriod = addDays(lastPeriod, profileData.cycle_length);
        const ovulationDay = addDays(lastPeriod, profileData.cycle_length - 14);
        const fertileStart = addDays(ovulationDay, -5);
        const fertileEnd = ovulationDay;

        setInsights({
          nextPeriod: format(nextPeriod, 'PPP'),
          fertileWindow: {
            start: format(fertileStart, 'PPP'),
            end: format(fertileEnd, 'PPP'),
          },
          cycleLength: profileData.cycle_length,
          lastPeriod: format(lastPeriod, 'PPP'),
        });
      }
    } catch (error: any) {
      console.error('Error loading insights:', error);
      toast({
        title: "Error",
        description: "Failed to load insights",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadInsights();

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          loadInsights();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (showIVF) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setShowIVF(false)}
          className="mb-4"
        >
          ← Back to Fertility Dashboard
        </Button>
        <IVFPredictionDashboard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FertilityInsightCard 
          title="Next Period" 
          content={insights.nextPeriod || 'Not available'} 
          icon={Calendar}
        />
        <FertilityInsightCard 
          title="Fertile Window" 
          content={
            insights.fertileWindow
              ? `${insights.fertileWindow.start} - ${insights.fertileWindow.end}`
              : 'Not available'
          } 
          icon={Heart}
        />
        <FertilityInsightCard 
          title="Cycle Length" 
          content={insights.cycleLength ? `${insights.cycleLength} days` : 'Not set'} 
          icon={Droplet}
        />
        <FertilityInsightCard 
          title="Last Period" 
          content={insights.lastPeriod || 'Not recorded'} 
          icon={Calendar}
        />
      </div>

      <Card className="bg-accent hover:shadow-md transition-all duration-200">
        <CardHeader className="flex flex-row items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">IVF Success Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">
            Discover your personalized IVF success rates based on your unique profile and medical history.
          </p>
          <Button 
            onClick={() => setShowIVF(true)}
            className="w-full"
          >
            <Activity className="w-4 h-4 mr-2" />
            Explore IVF Prediction
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
