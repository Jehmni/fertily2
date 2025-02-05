import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { FertilityForm } from "./fertility/FertilityForm";
import { FertilityCalendarDisplay } from "./fertility/FertilityCalendarDisplay";
import { FertilityHeader } from "./fertility/FertilityHeader";
import { useFormHandlers } from "./fertility/FertilityFormHandlers";
import { calculateFertileWindow } from "@/utils/fertilityCalculations";

export const FertilityCalendar = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | null>(null);
  const [fertileWindow, setFertileWindow] = useState<{ start: Date; end: Date } | null>(null);
  const [loading, setLoading] = useState(false);
  const { handleLastPeriodDateChange, handleCycleLengthChange } = useFormHandlers();

  const calculateWindow = (startDate: Date, length: number) => {
    const window = calculateFertileWindow(startDate, length);
    setFertileWindow(window);
  };

  const handleLastPeriodDateChangeLocal = async (newDate: Date | null) => {
    setLastPeriodDate(newDate);
    await handleLastPeriodDateChange(newDate, calculateWindow, cycleLength);
  };

  const handleCycleLengthChangeLocal = async (newLength: number) => {
    setCycleLength(newLength);
    await handleCycleLengthChange(newLength, lastPeriodDate, calculateWindow);
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

      calculateWindow(lastPeriodDate, cycleLength);

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
      <FertilityHeader />
      <CardContent className="space-y-6">
        <FertilityForm
          cycleLength={cycleLength}
          lastPeriodDate={lastPeriodDate}
          onCycleLengthChange={handleCycleLengthChangeLocal}
          onLastPeriodDateChange={handleLastPeriodDateChangeLocal}
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