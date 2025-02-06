import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { FertilityHeader } from "./fertility/FertilityHeader";
import { calculateFertileWindow } from "@/utils/fertilityCalculations";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, isSameDay, isWithinInterval } from "date-fns";
import { Check } from "lucide-react";

export const FertilityCalendar = () => {
  const { toast } = useToast();
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [lastPeriodDate, setLastPeriodDate] = useState<Date | null>(null);
  const [fertileWindow, setFertileWindow] = useState<{ start: Date; end: Date } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('cycle_length, last_period_date')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        if (data.cycle_length) setCycleLength(data.cycle_length);
        if (data.last_period_date) {
          const date = new Date(data.last_period_date);
          setLastPeriodDate(date);
          calculateWindow(date, data.cycle_length || 28);
        }
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
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
      backgroundColor: 'rgba(124, 58, 237, 0.4)',
      borderRadius: '100%',
      color: '#4C1D95',
      fontWeight: 'bold',
    },
    periodStart: {
      backgroundColor: 'rgba(239, 68, 68, 0.4)',
      borderRadius: '100%',
      color: '#991B1B',
      fontWeight: 'bold',
    },
  };

  const calculateWindow = (startDate: Date, length: number) => {
    const window = calculateFertileWindow(startDate, length);
    setFertileWindow(window);
    setIsSaved(false);
  };

  const handleLastPeriodDateChange = (newDate: Date | null) => {
    setLastPeriodDate(newDate);
    if (newDate) {
      calculateWindow(newDate, cycleLength);
    }
  };

  const handleCycleLengthChange = (newLength: number) => {
    setCycleLength(newLength);
    if (lastPeriodDate) {
      calculateWindow(lastPeriodDate, newLength);
    }
  };

  const handleSave = async () => {
    if (!lastPeriodDate) {
      toast({
        title: "Error",
        description: "Please select your last period date",
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

      setIsSaved(true);
      toast({
        title: "Success",
        description: "Fertility data saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save fertility data",
        variant: "destructive",
      });
      console.error('Error saving fertility data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <FertilityHeader />
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cycleLength">Cycle Length (days)</Label>
              <Input
                id="cycleLength"
                type="number"
                min="21"
                max="35"
                value={cycleLength}
                onChange={(e) => handleCycleLengthChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span>Period Start</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                  <span>Fertile Window</span>
                </div>
              </div>

              <Calendar
                mode="single"
                selected={lastPeriodDate}
                onSelect={handleLastPeriodDateChange}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md border"
              />
            </div>

            {!isSaved ? (
              <Button 
                onClick={handleSave} 
                className="w-full" 
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="w-full text-green-600" 
                disabled
              >
                <Check className="w-4 h-4 mr-2" />
                Data Saved
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {fertileWindow && (
              <div className="text-sm p-4 bg-violet-50 rounded-lg border border-violet-200 animate-fadeIn">
                <p className="font-semibold text-violet-900 mb-1">Your Fertile Window</p>
                <p className="text-violet-700">
                  {format(fertileWindow.start, 'MMMM d')} to {format(fertileWindow.end, 'MMMM d, yyyy')}
                </p>
                <p className="text-violet-600 text-xs mt-2">
                  These are your most fertile days. Consider tracking additional symptoms during this time.
                </p>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Tips</h3>
              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Regular tracking helps predict future cycles more accurately</li>
                <li>• The fertile window is typically 5 days before ovulation</li>
                <li>• Track any symptoms or changes during this time</li>
                <li>• Your saved data helps personalize AI responses in chat</li>
                <li>• Update your cycle length if it changes over time</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};