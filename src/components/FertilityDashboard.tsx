import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { format, addDays } from "date-fns";

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
      } else {
        setInsights({
          nextPeriod: null,
          fertileWindow: null,
          cycleLength: null,
          lastPeriod: null,
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

  // Load insights on mount and set up real-time subscription
  useEffect(() => {
    loadInsights();

    // Subscribe to changes in the profiles table
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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Next Period</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{insights.nextPeriod || 'Not available'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fertile Window</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            {insights.fertileWindow
              ? `${insights.fertileWindow.start} - ${insights.fertileWindow.end}`
              : 'Not available'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cycle Length</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">
            {insights.cycleLength ? `${insights.cycleLength} days` : 'Not set'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last Period</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{insights.lastPeriod || 'Not recorded'}</p>
        </CardContent>
      </Card>
    </div>
  );
};