import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { addDays, subDays } from "date-fns";
import { FertilityForm } from "./fertility/FertilityForm";
import { FertilityCalendarDisplay } from "./fertility/FertilityCalendarDisplay";

export const FertilityCalendar = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | null>(null);
  const [fertileWindow, setFertileWindow] = useState<{ start: Date; end: Date } | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateFertileWindow = (startDate: Date, length: number) => {
    if (!startDate || length < 21 || length > 35) {
      setFertileWindow(null);
      return;
    }
    const ovulationDay = addDays(startDate, length - 14);
    const fertileStart = subDays(ovulationDay, 5);
    const fertileEnd = ovulationDay;
    setFertileWindow({ start: fertileStart, end: fertileEnd });
  };

  const handleLastPeriodDateChange = (newDate: Date | null) => {
    setLastPeriodDate(newDate);
    if (newDate) {
      calculateFertileWindow(newDate, cycleLength);
    } else {
      setFertileWindow(null);
    }
  };

  const handleCycleLengthChange = (newLength: number) => {
    if (newLength < 21 || newLength > 35) {
      toast({
        title: "Invalid Cycle Length",
        description: "Cycle length must be between 21 and 35 days",
        variant: "destructive",
      });
      return;
    }
    setCycleLength(newLength);
    if (lastPeriodDate) {
      calculateFertileWindow(lastPeriodDate, newLength);
    }
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

    if (cycleLength < 21 || cycleLength > 35) {
      toast({
        title: "Error",
        description: "Cycle length must be between 21 and 35 days",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          cycle_length: cycleLength,
          last_period_date: lastPeriodDate.toISOString().split('T')[0],
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      calculateFertileWindow(lastPeriodDate, cycleLength);

      toast({
        title: "Success",
        description: "Fertility window calculated and saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save cycle data",
        variant: "destructive",
      });
      console.error('Error saving cycle data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fertility Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FertilityForm
          cycleLength={cycleLength}
          lastPeriodDate={lastPeriodDate}
          onCycleLengthChange={handleCycleLengthChange}
          onLastPeriodDateChange={handleLastPeriodDateChange}
          onCalculate={handleCalculate}
          isLoading={loading}
        />
        
        <FertilityCalendarDisplay
          selectedDate={date}
          onDateSelect={setDate}
          fertileWindow={fertileWindow}
          lastPeriodDate={lastPeriodDate}
        />
      </CardContent>
    </Card>
  );
};