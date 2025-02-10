
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { PersonalInfoForm } from "./profile/PersonalInfoForm";
import { CycleInfoForm } from "./profile/CycleInfoForm";
import { MedicalInfoForm } from "./profile/MedicalInfoForm";

export const ProfileSection = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: undefined as Date | undefined,
    cycleLength: "",
    lastPeriodDate: undefined as Date | undefined,
    medicalConditions: "",
    medications: "",
    fertilityGoals: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth) : undefined,
          cycleLength: data.cycle_length?.toString() || "",
          lastPeriodDate: data.last_period_date ? new Date(data.last_period_date) : undefined,
          medicalConditions: (data.medical_conditions || []).join(', '),
          medications: (data.medications || []).join(', '),
          fertilityGoals: data.fertility_goals || "",
        });
        setIsUpdate(true);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

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
          date_of_birth: profile.dateOfBirth,
          cycle_length: parseInt(profile.cycleLength) || null,
          last_period_date: profile.lastPeriodDate,
          medical_conditions: profile.medicalConditions.split(',').map(c => c.trim()).filter(Boolean),
          medications: profile.medications.split(',').map(m => m.trim()).filter(Boolean),
          fertility_goals: profile.fertilityGoals,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: isUpdate ? "Profile updated successfully" : "Profile saved successfully",
      });
      
      navigate('/');
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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
      
      <PersonalInfoForm
        firstName={profile.firstName}
        lastName={profile.lastName}
        dateOfBirth={profile.dateOfBirth}
        onFirstNameChange={(value) => setProfile(p => ({ ...p, firstName: value }))}
        onLastNameChange={(value) => setProfile(p => ({ ...p, lastName: value }))}
        onDateOfBirthChange={(date) => setProfile(p => ({ ...p, dateOfBirth: date }))}
      />

      <CycleInfoForm
        cycleLength={profile.cycleLength}
        lastPeriodDate={profile.lastPeriodDate}
        onCycleLengthChange={(value) => setProfile(p => ({ ...p, cycleLength: value }))}
        onLastPeriodDateChange={(date) => setProfile(p => ({ ...p, lastPeriodDate: date }))}
      />

      <MedicalInfoForm
        medicalConditions={profile.medicalConditions}
        medications={profile.medications}
        fertilityGoals={profile.fertilityGoals}
        onMedicalConditionsChange={(value) => setProfile(p => ({ ...p, medicalConditions: value }))}
        onMedicationsChange={(value) => setProfile(p => ({ ...p, medications: value }))}
        onFertilityGoalsChange={(value) => setProfile(p => ({ ...p, fertilityGoals: value }))}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : (isUpdate ? "Update Profile" : "Save Profile")}
      </Button>
    </form>
  );
};
