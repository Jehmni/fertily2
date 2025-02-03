import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { addDays, format, isSameDay, isWithinInterval } from "date-fns";

interface CycleData {
  cycle_start_date: string;
  cycle_length: number;
}

export const FertilityCalendar = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [fertileWindow, setFertileWindow] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    loadCycleData();
  }, []);

  const loadCycleData = async () => {
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
        setCycleData({
          cycle_start_date: profileData.last_period_date,
          cycle_length: profileData.cycle_length,
        });

        // Calculate fertile window (typically 5 days before ovulation and ovulation day)
        const cycleStart = new Date(profileData.last_period_date);
        const ovulationDay = addDays(cycleStart, Math.floor(profileData.cycle_length / 2) - 14);
        const fertileStart = addDays(ovulationDay, -5);
        const fertileEnd = ovulationDay;

        setFertileWindow({ start: fertileStart, end: fertileEnd });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load cycle data",
        variant: "destructive",
      });
    }
  };

  const modifiers = {
    fertile: (date: Date) => {
      if (!fertileWindow) return false;
      return isWithinInterval(date, {
        start: fertileWindow.start,
        end: fertileWindow.end,
      });
    },
    periodStart: (date: Date) => {
      if (!cycleData?.cycle_start_date) return false;
      return isSameDay(date, new Date(cycleData.cycle_start_date));
    },
  };

  const modifiersStyles = {
    fertile: {
      backgroundColor: 'rgba(255, 182, 193, 0.2)',
      borderRadius: '100%',
    },
    periodStart: {
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      borderRadius: '100%',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fertility Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
          />
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-200"></div>
              <span>Period Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-200"></div>
              <span>Fertile Window</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};