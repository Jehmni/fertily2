import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export const ProfileSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    cycleLength: "",
    lastPeriodDate: undefined as Date | undefined,
    medicalConditions: "",
    medications: "",
    fertilityGoals: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          cycle_length: parseInt(profile.cycleLength),
          last_period_date: profile.lastPeriodDate,
          medical_conditions: profile.medicalConditions.split(',').map(c => c.trim()),
          medications: profile.medications.split(',').map(m => m.trim()),
          fertility_goals: profile.fertilityGoals,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={profile.firstName}
            onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))}
            placeholder="Enter your first name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={profile.lastName}
            onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))}
            placeholder="Enter your last name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cycleLength">Average Cycle Length (days)</Label>
          <Input
            id="cycleLength"
            type="number"
            value={profile.cycleLength}
            onChange={(e) => setProfile(p => ({ ...p, cycleLength: e.target.value }))}
            placeholder="28"
          />
        </div>

        <div className="space-y-2">
          <Label>Last Period Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !profile.lastPeriodDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {profile.lastPeriodDate ? (
                  format(profile.lastPeriodDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={profile.lastPeriodDate}
                onSelect={(date) => setProfile(p => ({ ...p, lastPeriodDate: date ?? undefined }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medicalConditions">Medical Conditions (comma-separated)</Label>
        <Input
          id="medicalConditions"
          value={profile.medicalConditions}
          onChange={(e) => setProfile(p => ({ ...p, medicalConditions: e.target.value }))}
          placeholder="PCOS, Endometriosis, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="medications">Medications (comma-separated)</Label>
        <Input
          id="medications"
          value={profile.medications}
          onChange={(e) => setProfile(p => ({ ...p, medications: e.target.value }))}
          placeholder="Enter any medications you're taking"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fertilityGoals">Fertility Goals</Label>
        <Input
          id="fertilityGoals"
          value={profile.fertilityGoals}
          onChange={(e) => setProfile(p => ({ ...p, fertilityGoals: e.target.value }))}
          placeholder="Describe your fertility goals"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
};