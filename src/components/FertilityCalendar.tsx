import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { addDays, format, isSameDay, isWithinInterval, subDays } from "date-fns";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface CycleData {
  cycle_start_date: string;
  cycle_length: number;
}

export const FertilityCalendar = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [fertileWindow, setFertileWindow] = useState<{ start: Date; end: Date } | null>(null);
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | null>(null);

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
        setCycleLength(profileData.cycle_length);
        setLastPeriodDate(new Date(profileData.last_period_date));
        calculateFertileWindow(new Date(profileData.last_period_date), profileData.cycle_length);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load cycle data",
        variant: "destructive",
      });
    }
  };

  const calculateFertileWindow = (startDate: Date, length: number) => {
    // Ovulation typically occurs 14 days before the next period
    const ovulationDay = addDays(startDate, length - 14);
    // Fertile window is typically 5 days before ovulation and the day of ovulation
    const fertileStart = subDays(ovulationDay, 5);
    const fertileEnd = ovulationDay;

    setFertileWindow({ start: fertileStart, end: fertileEnd });
  };

  const handleCalculate = async () => {
    if (!lastPeriodDate) {
      toast({
        title: "Error",
        description: "Please enter your last period date",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update profile with new cycle data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          cycle_length: cycleLength,
          last_period_date: format(lastPeriodDate, 'yyyy-MM-dd'),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      calculateFertileWindow(lastPeriodDate, cycleLength);

      toast({
        title: "Success",
        description: "Fertility window calculated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save cycle data",
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
      if (!lastPeriodDate) return false;
      return isSameDay(date, lastPeriodDate);
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cycleLength">Cycle Length (days)</Label>
              <Input
                id="cycleLength"
                type="number"
                min="21"
                max="35"
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Last Period Start Date</Label>
              <Calendar
                mode="single"
                selected={lastPeriodDate}
                onSelect={(newDate) => newDate && setLastPeriodDate(newDate)}
                className="rounded-md border"
              />
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            Calculate Fertility Window
          </Button>

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

          {fertileWindow && (
            <div className="text-sm text-muted-foreground">
              <p>Your fertile window: {format(fertileWindow.start, 'PPP')} to {format(fertileWindow.end, 'PPP')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};