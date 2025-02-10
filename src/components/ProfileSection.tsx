
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PersonalInfoForm } from "./profile/PersonalInfoForm";
import { CycleInfoForm } from "./profile/CycleInfoForm";
import { MedicalInfoForm } from "./profile/MedicalInfoForm";
import { AvatarForm } from "./profile/AvatarForm";
import { useProfile } from "@/hooks/useProfile";

export const ProfileSection = () => {
  const { 
    profile, 
    setProfile, 
    loading, 
    isUpdate, 
    loadProfile, 
    handleSubmit 
  } = useProfile();

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
      
      <AvatarForm
        avatarUrl={profile.avatarUrl}
        avatarColor={profile.avatarColor}
        firstName={profile.firstName}
        lastName={profile.lastName}
        onAvatarUrlChange={(url) => setProfile(p => ({ ...p, avatarUrl: url }))}
        onAvatarColorChange={(color) => setProfile(p => ({ ...p, avatarColor: color }))}
      />

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
