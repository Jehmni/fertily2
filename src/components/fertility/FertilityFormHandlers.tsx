import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export const useFormHandlers = () => {
  const handleLastPeriodDateChange = async (
    newDate: Date | null,
    calculateWindow: (date: Date, length: number) => void,
    cycleLength: number
  ) => {
    if (newDate) {
      calculateWindow(newDate, cycleLength);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            last_period_date: newDate.toISOString().split('T')[0],
          })
          .eq('id', user.id);

        if (updateError) throw updateError;
      } catch (error) {
        console.error('Error saving last period date:', error);
        toast({
          title: "Error",
          description: "Failed to save last period date",
          variant: "destructive",
        });
      }
    }
  };

  const handleCycleLengthChange = async (
    newLength: number,
    lastPeriodDate: Date | null,
    calculateWindow: (date: Date, length: number) => void
  ) => {
    if (newLength < 21 || newLength > 35) {
      toast({
        title: "Invalid Cycle Length",
        description: "Cycle length must be between 21 and 35 days",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          cycle_length: newLength,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (lastPeriodDate) {
        calculateWindow(lastPeriodDate, newLength);
      }
    } catch (error) {
      console.error('Error saving cycle length:', error);
      toast({
        title: "Error",
        description: "Failed to save cycle length",
        variant: "destructive",
      });
    }
  };

  return {
    handleLastPeriodDateChange,
    handleCycleLengthChange,
  };
};